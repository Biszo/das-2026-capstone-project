'use strict';

const { WaitlistQueue } = require('./waitlist');

class TicketingError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'TicketingError';
    this.code = code;
  }
}

function validateQuantity(quantity) {
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new TicketingError(
      'VALIDATION',
      'Quantity must be a whole number from 1 to 10.',
    );
  }
}

function validatePersonName(name) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new TicketingError('VALIDATION', 'Attendee name must not be empty.');
  }
}

class TicketingSystem {
  constructor(event) {
    if (!event || !Array.isArray(event.tiers)) {
      throw new TypeError('TicketingSystem requires an event with ticket tiers.');
    }

    this.event = event;
    this.bookingsByReference = new Map();
    this.waitlistsByTier = new Map(
      event.tiers.map((tier) => [tier.name, new WaitlistQueue()]),
    );
    this.nextReferenceNumber = 1;
  }

  getTier(tierName) {
    const tier = this.event.tiers.find((candidate) => candidate.name === tierName);
    if (!tier) {
      throw new TicketingError('NOT_FOUND', `Ticket tier "${tierName}" was not found.`);
    }
    return tier;
  }

  book(attendeeName, tierName, quantity) {
    validatePersonName(attendeeName);
    validateQuantity(quantity);

    const tier = this.getTier(tierName);
    const seatsAvailable = tier.capacity - tier.seatsSold;
    if (quantity > seatsAvailable) {
      throw new TicketingError(
        'SOLD_OUT',
        `Only ${seatsAvailable} seat(s) remain in "${tier.name}"; cannot book ${quantity}.`,
      );
    }

    const reference = `TKT-${String(this.nextReferenceNumber).padStart(6, '0')}`;
    this.nextReferenceNumber += 1;

    const booking = {
      reference,
      attendeeName: attendeeName.trim(),
      tierName: tier.name,
      quantity,
      totalPriceKobo: tier.priceKobo * quantity,
      status: 'booked',
    };

    tier.seatsSold += quantity;
    this.bookingsByReference.set(reference, booking);
    return booking;
  }

  getBooking(reference) {
    return this.bookingsByReference.get(reference);
  }

  joinWaitlist(attendeeName, tierName) {
    validatePersonName(attendeeName);
    const tier = this.getTier(tierName);
    if (tier.seatsSold < tier.capacity) {
      throw new TicketingError(
        'NOT_SOLD_OUT',
        `The "${tier.name}" tier is not sold out yet.`,
      );
    }

    return this.waitlistsByTier.get(tier.name).enqueue({
      attendeeName: attendeeName.trim(),
      tierName: tier.name,
    });
  }

  cancel(reference) {
    const booking = this.getBooking(reference);
    if (!booking) {
      throw new TicketingError('NOT_FOUND', `Booking "${reference}" was not found.`);
    }
    if (booking.status === 'cancelled') {
      throw new TicketingError(
        'ALREADY_CANCELLED',
        `Booking "${reference}" has already been cancelled.`,
      );
    }

    const tier = this.getTier(booking.tierName);
    tier.seatsSold -= booking.quantity;
    booking.status = 'cancelled';

    // Build 1 identifies the next person to contact; it does not reserve a seat.
    const nextInLine = this.waitlistsByTier.get(tier.name).dequeue();
    return {
      booking,
      seatsReleased: booking.quantity,
      nextInLine: nextInLine ? nextInLine.attendeeName : null,
    };
  }
}

module.exports = { TicketingSystem, TicketingError };

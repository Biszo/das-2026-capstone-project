'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createEvent } = require('./event');
const { TicketingSystem, TicketingError } = require('./booking-system');
const { WaitlistQueue } = require('./waitlist');

function createSystem(capacity = 2) {
  const event = createEvent('Test Event', [
    { name: 'General', priceKobo: 25000, capacity },
  ]);
  return { event, ticketing: new TicketingSystem(event) };
}

test('event tiers use whole-kobo prices and track capacity', () => {
  const event = createEvent('Show', [
    { name: 'General', priceKobo: 100, capacity: 3 },
  ]);

  assert.equal(event.tiers[0].priceKobo, 100);
  assert.equal(event.tiers[0].seatsSold, 0);
  assert.throws(
    () => createEvent('Show', [{ name: 'General', priceKobo: 1.5, capacity: 3 }]),
    /whole number/,
  );
});

test('booking tracks sales and can be found by reference in the Map', () => {
  const { event, ticketing } = createSystem(3);
  const booking = ticketing.book('Ada', 'General', 2);

  assert.equal(ticketing.getBooking(booking.reference), booking);
  assert.equal(booking.totalPriceKobo, 50000);
  assert.equal(event.tiers[0].seatsSold, 2);
});

test('rejects bookings that exceed remaining capacity without changing sales', () => {
  const { event, ticketing } = createSystem(2);
  ticketing.book('Ada', 'General', 1);

  assert.throws(
    () => ticketing.book('Tunde', 'General', 2),
    (error) => error instanceof TicketingError && error.code === 'SOLD_OUT',
  );
  assert.equal(event.tiers[0].seatsSold, 1);
});

test('quantity must be a whole number between 1 and 10', () => {
  const { ticketing } = createSystem(20);

  for (const quantity of [0, -1, 1.5, 11, '2']) {
    assert.throws(
      () => ticketing.book('Ada', 'General', quantity),
      (error) => error.code === 'VALIDATION',
    );
  }
});

test('cancelling releases seats once and names the first waitlisted person', () => {
  const { event, ticketing } = createSystem(1);
  const booking = ticketing.book('Ada', 'General', 1);
  ticketing.joinWaitlist('Tunde', 'General');
  ticketing.joinWaitlist('Chika', 'General');

  const result = ticketing.cancel(booking.reference);
  assert.equal(result.seatsReleased, 1);
  assert.equal(result.nextInLine, 'Tunde');
  assert.equal(event.tiers[0].seatsSold, 0);
  assert.equal(booking.status, 'cancelled');

  assert.throws(
    () => ticketing.cancel(booking.reference),
    (error) => error.code === 'ALREADY_CANCELLED',
  );
  assert.equal(event.tiers[0].seatsSold, 0);
});

test('waitlist queue is FIFO and correctly resets after its last item', () => {
  const queue = new WaitlistQueue();
  assert.equal(queue.dequeue(), null);
  queue.enqueue('First');
  queue.enqueue('Second');

  assert.equal(queue.peek(), 'First');
  assert.equal(queue.dequeue(), 'First');
  assert.equal(queue.dequeue(), 'Second');
  assert.equal(queue.isEmpty(), true);

  queue.enqueue('Third');
  assert.equal(queue.dequeue(), 'Third');
});

test('waitlist can only be joined for sold-out tiers', () => {
  const { ticketing } = createSystem(2);

  assert.throws(
    () => ticketing.joinWaitlist('Ada', 'General'),
    (error) => error.code === 'NOT_SOLD_OUT',
  );
});

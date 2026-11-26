'use strict';

const { createEvent } = require('./event');
const { TicketingSystem } = require('./booking-system');

const event = createEvent('Lagos Live', [
  { name: 'General', priceKobo: 500000, capacity: 2 },
]);
const ticketing = new TicketingSystem(event);

console.log(`\n${event.name} ticket desk`);
const firstBooking = ticketing.book('Ada', 'General', 1);
const secondBooking = ticketing.book('Tunde', 'General', 1);
console.log(`Booked ${firstBooking.attendeeName} and ${secondBooking.attendeeName}.`);
console.log(`General is sold out (${event.tiers[0].seatsSold}/${event.tiers[0].capacity}).`);

try {
  ticketing.book('Chika', 'General', 1);
} catch (error) {
  console.log(`Booking refused [${error.code}]: ${error.message}`);
}

ticketing.joinWaitlist('Chika', 'General');
ticketing.joinWaitlist('Bola', 'General');
console.log('Waitlist: Chika is first, followed by Bola.');

const cancellation = ticketing.cancel(firstBooking.reference);
console.log(
  `${cancellation.booking.attendeeName} cancelled; ${cancellation.seatsReleased} seat released.`,
);
console.log(`Next person to contact: ${cancellation.nextInLine}.`);

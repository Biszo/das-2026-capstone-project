'use strict';

const { performance } = require('node:perf_hooks');

const bookingCount = 100000;
const lookupCount = 1000;
const bookings = [];
const bookingsByReference = new Map();

for (let index = 0; index < bookingCount; index += 1) {
  const booking = { reference: `TKT-${String(index).padStart(6, '0')}` };
  bookings.push(booking);
  bookingsByReference.set(booking.reference, booking);
}

// Looking up the last entry makes Array.find do the most work each time.
const targetReference = bookings[bookings.length - 1].reference;
let result;

const arrayStart = performance.now();
for (let index = 0; index < lookupCount; index += 1) {
  result = bookings.find((booking) => booking.reference === targetReference);
}
const arrayMilliseconds = performance.now() - arrayStart;

const mapStart = performance.now();
for (let index = 0; index < lookupCount; index += 1) {
  result = bookingsByReference.get(targetReference);
}
const mapMilliseconds = performance.now() - mapStart;

console.log(`Bookings: ${bookingCount.toLocaleString()}`);
console.log(`Lookups:  ${lookupCount.toLocaleString()}`);
console.log(`Array.find: ${arrayMilliseconds.toFixed(2)} ms`);
console.log(`Map.get:    ${mapMilliseconds.toFixed(2)} ms`);
console.log(`Map was approximately ${(arrayMilliseconds / mapMilliseconds).toFixed(1)}x faster.`);

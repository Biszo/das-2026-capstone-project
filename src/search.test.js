'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createEvent } = require('./event');
const { searchEvents } = require('./search');

function sampleEvents() {
    return [
        createEvent('Lagos Live', [{ name: 'General', priceKobo: 500000, capacity: 100 }], { city: 'Lagos', date: '2026-12-20' }),
        createEvent('Akure Tech Summit', [
            { name: 'General', priceKobo: 200000, capacity: 50 },
            { name: 'VIP', priceKobo: 900000, capacity: 10 },
        ], { city: 'Akure', date: '2026-12-05' }),
        createEvent('Abuja Food Fair', [{ name: 'Entry', priceKobo: 100000, capacity: 200 }], { city: 'Abuja', date: '2027-01-15' }),
    ];
}

const names = (list) => list.map((event) => event.name);

test('no filters returns every event', () => {
    assert.equal(searchEvents(sampleEvents()).length, 3);
});

test('text search ignores case and matches the name', () => {
    assert.deepEqual(names(searchEvents(sampleEvents(), { text: 'LIVE' })), ['Lagos Live']);
});

test('city filter matches exactly, ignoring case', () => {
    assert.deepEqual(names(searchEvents(sampleEvents(), { city: 'akure' })), ['Akure Tech Summit']);
});

test('date range includes both end dates', () => {
    const result = searchEvents(sampleEvents(), { from: '2026-12-05', to: '2026-12-20' });
    assert.deepEqual(names(result), ['Lagos Live', 'Akure Tech Summit']);
});

test('price filter uses the lowest tier price', () => {
    const result = searchEvents(sampleEvents(), { minPriceKobo: 150000, maxPriceKobo: 300000 });
    assert.deepEqual(names(result), ['Akure Tech Summit']);
});

test('filters combine', () => {
    const result = searchEvents(sampleEvents(), { city: 'Lagos', maxPriceKobo: 100000 });
    assert.deepEqual(result, []);
});

test('searching never changes the original list', () => {
    const events = sampleEvents();
    const before = names(events);
    const result = searchEvents(events, { city: 'Lagos' });
    assert.deepEqual(names(events), before);
    assert.notEqual(result, events);
});

test('a bad date throws', () => {
    assert.throws(() => searchEvents(sampleEvents(), { from: 'not a date' }), TypeError);
});
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createEvent } = require('./event');
const { mergeSort, sortEvents } = require('./sort');

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

test('mergeSort sorts numbers and handles empty and single lists', () => {
    assert.deepEqual(mergeSort([5, 2, 9, 1, 5, 6], (a, b) => a - b), [1, 2, 5, 5, 6, 9]);
    assert.deepEqual(mergeSort([], (a, b) => a - b), []);
    assert.deepEqual(mergeSort([7], (a, b) => a - b), [7]);
});

test('mergeSort is stable: equal items keep their original order', () => {
    const items = [{ id: 'a', k: 1 }, { id: 'b', k: 1 }, { id: 'c', k: 0 }, { id: 'd', k: 1 }];
    const sorted = mergeSort(items, (x, y) => x.k - y.k);
    assert.deepEqual(sorted.map((item) => item.id), ['c', 'a', 'b', 'd']);
});

test('mergeSort does not change the original array', () => {
    const original = [3, 1, 2];
    mergeSort(original, (a, b) => a - b);
    assert.deepEqual(original, [3, 1, 2]);
});

test('sort by date, earliest first', () => {
    assert.deepEqual(names(sortEvents(sampleEvents(), 'date')), ['Akure Tech Summit', 'Lagos Live', 'Abuja Food Fair']);
});

test('sort by price uses the lowest tier price', () => {
    assert.deepEqual(names(sortEvents(sampleEvents(), 'price')), ['Abuja Food Fair', 'Akure Tech Summit', 'Lagos Live']);
});

test('sort by availability, fewest seats left first', () => {
    assert.deepEqual(names(sortEvents(sampleEvents(), 'availability')), ['Akure Tech Summit', 'Lagos Live', 'Abuja Food Fair']);
});

test('descending reverses the order', () => {
    assert.deepEqual(names(sortEvents(sampleEvents(), 'price', 'desc')), ['Lagos Live', 'Akure Tech Summit', 'Abuja Food Fair']);
});

test('events with no date are sorted last', () => {
    const events = [createEvent('No date', [{ name: 'A', priceKobo: 1, capacity: 1 }]), ...sampleEvents()];
    assert.equal(sortEvents(events, 'date').at(-1).name, 'No date');
});

test('sorting never changes the original list', () => {
    const events = sampleEvents();
    const before = names(events);
    sortEvents(events, 'price');
    assert.deepEqual(names(events), before);
});

test('an unknown sort key throws', () => {
    assert.throws(() => sortEvents(sampleEvents(), 'colour'), TypeError);
});

test('events with no date are last even when sorting descending', () => {
    const events = [createEvent('No date', [{ name: 'A', priceKobo: 1, capacity: 1 }]), ...sampleEvents()];
    assert.equal(sortEvents(events, 'date', 'desc').at(-1).name, 'No date');
});
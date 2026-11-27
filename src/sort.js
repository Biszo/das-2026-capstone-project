'use strict';

const { lowestPriceKobo, seatsAvailable } = require('./search');

function merge(left, right, compare) {
    const result = [];
    let i = 0;
    let j = 0;
    while (i < left.length && j < right.length) {
        if (compare(left[i], right[j]) <= 0) {
            result.push(left[i]);
            i += 1;
        } else {
            result.push(right[j]);
            j += 1;
        }
    }
    while (i < left.length) result.push(left[i++]);
    while (j < right.length) result.push(right[j++]);
    return result;
}

function mergeSort(items, compare) {
    if (items.length <= 1) return items.slice();
    const middle = Math.floor(items.length / 2);
    const left = mergeSort(items.slice(0, middle), compare);
    const right = mergeSort(items.slice(middle), compare);
    return merge(left, right, compare);
}

function compareDate(a, b) {
    if (a.date === null && b.date === null) return 0;
    if (a.date === null) return 1; // events with no date go last
    if (b.date === null) return -1;
    return Date.parse(a.date) - Date.parse(b.date);
}

function comparePrice(a, b) {
    return lowestPriceKobo(a) - lowestPriceKobo(b);
}

function compareAvailability(a, b) {
    return seatsAvailable(a) - seatsAvailable(b); // ascending = fewest seats left first
}

const comparators = {
    date: compareDate,
    price: comparePrice,
    availability: compareAvailability,
};

function sortEvents(events, key, direction = 'asc') {
    if (!Object.hasOwn(comparators, key)) {
        throw new TypeError(`Cannot sort by "${key}". Use date, price or availability.`);
    }
    if (direction !== 'asc' && direction !== 'desc') {
        throw new TypeError('Direction must be "asc" or "desc".');
    }
    const compare = comparators[key];
    const directed = direction === 'asc' ? compare : (a, b) => compare(b, a);

    if (key === 'date') {
        // Undated events always go last, in either direction.
        const dated = events.filter((event) => event.date !== null);
        const undated = events.filter((event) => event.date === null);
        return [...mergeSort(dated, directed), ...undated];
    }
    return mergeSort(events, directed);
}

module.exports = { mergeSort, sortEvents };
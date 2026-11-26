'use strict';

function lowestPriceKobo(event) {
    return Math.min(...event.tiers.map((tier) => tier.priceKobo));
}

function seatsAvailable(event) {
    return event.tiers.reduce((total, tier) => total + (tier.capacity - tier.seatsSold), 0);
}

function searchEvents(events, filters = {}) {
    const { text, city, from, to, minPriceKobo, maxPriceKobo } = filters;

    const needle = typeof text === 'string' ? text.trim().toLowerCase() : '';
    const wantedCity = typeof city === 'string' ? city.trim().toLowerCase() : '';
    const fromTime = from ? Date.parse(from) : null;
    const toTime = to ? Date.parse(to) : null;
    if (Number.isNaN(fromTime) || Number.isNaN(toTime)) {
        throw new TypeError('from and to must be valid date strings such as 2026-12-20.');
    }

    // filter() builds a NEW array, so the original list is never changed.
    return events.filter((event) => {
        if (needle) {
            const haystack = `${event.name} ${event.city || ''}`.toLowerCase();
            if (!haystack.includes(needle)) return false;
        }
        if (wantedCity && (event.city || '').toLowerCase() !== wantedCity) return false;

        if (fromTime !== null || toTime !== null) {
            if (event.date === null) return false;
            const eventTime = Date.parse(event.date);
            if (fromTime !== null && eventTime < fromTime) return false;
            if (toTime !== null && eventTime > toTime) return false;
        }

        const price = lowestPriceKobo(event);
        if (minPriceKobo !== undefined && price < minPriceKobo) return false;
        if (maxPriceKobo !== undefined && price > maxPriceKobo) return false;

        return true;
    });
}

module.exports = { searchEvents, lowestPriceKobo, seatsAvailable };
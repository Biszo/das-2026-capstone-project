'use strict';

function requireWholeNumber(value, label, minimum) {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new TypeError(`${label} must be a whole number of at least ${minimum}.`);
  }
}

function createEvent(name, tiers, details = {}) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new TypeError('Event name must be a non-empty string.');
  }
  if (!Array.isArray(tiers) || tiers.length === 0) {
    throw new TypeError('An event must have at least one ticket tier.');
  }

  const { city = null, date = null } = details;
  if (city !== null && (typeof city !== 'string' || city.trim() === '')) {
    throw new TypeError('Event city must be a non-empty string.');
  }
  if (date !== null && (typeof date !== 'string' || Number.isNaN(Date.parse(date)))) {
    throw new TypeError('Event date must be a valid date string such as 2026-12-20.');
  }

  const tierNames = new Set();
  const eventTiers = tiers.map((tier) => {
    if (typeof tier.name !== 'string' || tier.name.trim() === '') {
      throw new TypeError('Ticket tier name must be a non-empty string.');
    }
    if (tierNames.has(tier.name)) {
      throw new TypeError(`Ticket tier "${tier.name}" is duplicated.`);
    }
    requireWholeNumber(tier.priceKobo, 'Ticket price in kobo', 0);
    requireWholeNumber(tier.capacity, 'Ticket capacity', 1);

    tierNames.add(tier.name);
    return {
      name: tier.name,
      priceKobo: tier.priceKobo,
      capacity: tier.capacity,
      seatsSold: 0,
    };
  });

  return {
    name: name.trim(),
    city: city === null ? null : city.trim(),
    date,
    tiers: eventTiers,
  };
}

module.exports = { createEvent };
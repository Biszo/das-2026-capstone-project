'use strict';

const TRANSITIONS = {
    pending: { pay: 'paid', cancel: 'cancelled', expire: 'expired' },
    paid: { cancel: 'cancelled', checkIn: 'checked_in' },
    cancelled: {},
    expired: {},
    checked_in: {},
};

class InvalidTransitionError extends Error {
    constructor(from, action) {
        super(`Cannot ${action} a booking that is ${from}.`);
        this.name = 'InvalidTransitionError';
        this.code = 'INVALID_TRANSITION';
        this.from = from;
        this.action = action;
    }
}

function nextState(current, action) {
    if (!Object.hasOwn(TRANSITIONS, current)) {
        throw new TypeError(`Unknown booking state "${current}".`);
    }
    if (!Object.hasOwn(TRANSITIONS[current], action)) {
        throw new InvalidTransitionError(current, action);
    }
    return TRANSITIONS[current][action];
}

module.exports = { TRANSITIONS, nextState, InvalidTransitionError };
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { nextState, InvalidTransitionError } = require('./booking-state');

const ACTIONS = ['pay', 'cancel', 'expire', 'checkIn'];
const isRefused = (error) =>
    error instanceof InvalidTransitionError && error.code === 'INVALID_TRANSITION';

test('allowed transitions move to the right state', () => {
    const allowed = [
        ['pending', 'pay', 'paid'],
        ['pending', 'cancel', 'cancelled'],
        ['pending', 'expire', 'expired'],
        ['paid', 'cancel', 'cancelled'],
        ['paid', 'checkIn', 'checked_in'],
    ];
    for (const [from, action, to] of allowed) {
        assert.equal(nextState(from, action), to);
    }
});

test('paying a cancelled booking is refused', () => {
    assert.throws(() => nextState('cancelled', 'pay'), isRefused);
});

test('paying twice is refused', () => {
    assert.throws(() => nextState('paid', 'pay'), isRefused);
});

test('an unpaid booking cannot be checked in', () => {
    assert.throws(() => nextState('pending', 'checkIn'), isRefused);
});

test('a paid booking cannot expire', () => {
    assert.throws(() => nextState('paid', 'expire'), isRefused);
});

test('cancelled, expired and checked-in bookings accept no action', () => {
    for (const state of ['cancelled', 'expired', 'checked_in']) {
        for (const action of ACTIONS) {
            assert.throws(() => nextState(state, action), isRefused);
        }
    }
});

test('an unknown action is refused', () => {
    assert.throws(() => nextState('pending', 'constructor'), isRefused);
});

test('an unknown state throws a TypeError', () => {
    assert.throws(() => nextState('lost', 'pay'), TypeError);
});
// @ts-nocheck
{
const assert = require('node:assert/strict');
const { connectionIconState } = require('../lib/equipment/connection-icon-state.ts');
const now = Date.parse('2026-09-04T12:00:00Z');
const stage = { id: 'strategy', state: 'healthy', observedAt: '2026-09-04T11:59:55Z' };
assert.equal(connectionIconState(stage, now), 'connected');
assert.equal(connectionIconState({ ...stage, state: 'fault' }, now), 'disconnected');
for (const state of ['checking', 'stale', 'unmonitored']) assert.equal(connectionIconState({ ...stage, state }, now), 'checking');
assert.equal(connectionIconState(stage, now + 46_000), 'checking');
assert.equal(connectionIconState({ ...stage, observedAt: null }, now), 'checking');
assert.equal(connectionIconState({ ...stage, observedAt: 'invalid' }, now), 'checking');
assert.equal(connectionIconState({ ...stage, observedAt: '2026-09-04T12:02:00Z' }, now), 'checking');
assert.equal(connectionIconState({ ...stage, id: 'vpn' }, now), 'checking');
assert.equal(connectionIconState({ ...stage, id: 'vpn', state: 'fault' }, now), 'checking');
console.log('Connection icon state tests passed.');
}

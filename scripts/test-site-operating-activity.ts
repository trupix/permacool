// @ts-nocheck
const assert = require('node:assert/strict');
const path = require('node:path');
const { deriveSiteOperatingActivity, isEquipmentRunKey, latestOperatingTimestamp } = require(
  path.join(__dirname, '..', 'lib', 'site-operating-activity.ts')
);

const now = new Date('2026-08-28T20:00:00Z');
assert.equal(deriveSiteOperatingActivity({ now, freshRunningSignalAt: '2026-08-28T19:58:00Z' }).state, 'running_now');
assert.equal(deriveSiteOperatingActivity({ now, lastRanAt: '2026-08-28T10:00:01Z' }).state, 'ran_within_12h');
assert.equal(deriveSiteOperatingActivity({ now, lastRanAt: '2026-08-28T05:00:00Z' }).state, 'idle_12_to_24h');
assert.equal(deriveSiteOperatingActivity({ now, lastRanAt: '2026-08-27T19:59:59Z' }).state, 'idle_over_24h');
assert.equal(deriveSiteOperatingActivity({ now }).state, 'never_observed');
assert.equal(isEquipmentRunKey('ch1_chiller_run'), true);
assert.equal(isEquipmentRunKey('CH2 Compressor Run'), true);
assert.equal(isEquipmentRunKey('compressor_status'), true);
assert.equal(isEquipmentRunKey('ch1_pump_run'), false);
assert.equal(latestOperatingTimestamp(['2026-08-28T10:00:00Z', '2026-08-28T11:00:00Z']), '2026-08-28T11:00:00.000Z');

console.log('Location operating activity distinguishes current, recent, 12–24 hour, stale, and never-observed runs.');

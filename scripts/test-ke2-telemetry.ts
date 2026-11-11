import assert from 'node:assert/strict';
// @ts-ignore Node's native TypeScript runner requires the explicit extension.
import { readKe2Telemetry, KE2_DEVICE_ID, KE2_METRICS, type Ke2Point } from '../lib/equipment/ke2-telemetry.ts';
const now = Date.now();
const point = (key: string, value: number, timestamp = now): Ke2Point => ({ deviceId: KE2_DEVICE_ID, key: `ke2_${key}`, latestValue: value, latestTimestamp: new Date(timestamp).toISOString() });
const base = [point('observed_at_ms', now), ...['communication_connected', 'data_valid', 'fahrenheit_verified', 'status_valid', 'alarms_valid', 'controller_on'].map(k => point(k, 1)), point('external_system_off_channel3', 0), point('alarm_mask', 0), ...KE2_METRICS.flatMap((m, i) => [point(m.key, [-5.3, -4.9, -60, -65.3, 7.8][i]), point(`${m.key}_valid`, 1)])];
const changed = (...updates: Ke2Point[]) => [...base.filter(p => !updates.some(u => u.key === p.key)), ...updates];
assert.equal(readKe2Telemetry([], now).communication, 'Waiting for KE2 data');
const good = readKe2Telemetry(base, now);
assert.equal(good.controller, 'Controller ON');
assert.equal(good.communication, 'Communication connected');
assert.deepEqual(good.metrics.map(m => m.value), [-5.3, -4.9, -60, -65.3, 7.8]);
assert.equal(good.alarmsKnown, true);
assert.equal(good.alarms.length, 0);
const off = readKe2Telemetry(changed(point('controller_on', 0), point('external_system_off_channel3', 1)), now);
assert.equal(off.controller, 'Controller Off'); assert.equal(off.connected, true); assert.equal(off.externalOff, true);
for (const p of [readKe2Telemetry(base, now + 45001), readKe2Telemetry(base, now, true), readKe2Telemetry(base, now - 5001)]) {
  assert.equal(p.metrics.every(m => m.value === null), true); assert.equal(p.controller, 'Controller — Unknown'); assert.equal(p.alarmsKnown, false);
}
const sensor = readKe2Telemetry(changed(point('superheat_valid', 0), point('alarm_mask', 1)), now);
assert.equal(sensor.metrics[0].value, null); assert.deepEqual(sensor.alarms, ['Pressure sensor fault']);
assert.equal(readKe2Telemetry(changed(point('superheat', 99, now - 15000)), now).metrics[0].value, null);
assert.equal(readKe2Telemetry(changed(point('superheat_valid', 1, now - 15000)), now).metrics[0].value, null);
assert.equal(readKe2Telemetry(changed(point('data_valid', 0)), now).metrics.every(m => m.value === null), true);
assert.equal(readKe2Telemetry(changed(point('alarm_mask', 4096)), now).alarms[0], 'Unrecognized alarm (0x1000)');
assert.equal(readKe2Telemetry(changed(point('alarm_mask', 4095)), now).alarms.length, 12);
assert.equal(readKe2Telemetry(changed(point('valve_manual', 1)), now).manualValve, true);
assert.equal(readKe2Telemetry(changed(point('superheat', NaN)), now).metrics[0].value, null);
assert.equal(readKe2Telemetry(base.map(p => ({ ...p, deviceId: 'other-device' })), now).connected, false);
assert.equal(readKe2Telemetry(changed(point('status_valid', 0)), now).controller, 'Controller — Unknown');
assert.equal(readKe2Telemetry(changed(point('controller_on', 2)), now).controller, 'Controller — Unknown');
console.log('KE2 tests passed: live/off, units, faults, stale/future/failed fetch, retained batches, alarms, manual valve, device scope.');

// @ts-nocheck
{
const assert = require('node:assert/strict');
const path = require('node:path');

const { isFastTelemetryKey, mergeTelemetryPoints } = require(
  path.join(__dirname, '..', 'lib', 'telemetry-groups.ts')
);

for (const key of [
  'ch1_high_pressure',
  'ch2_high_pressure_psi',
  'ch1_low_pressure',
  'ch2_lowside_pressure',
  'ch1_temperature_c',
  'ch2_temperature_f',
  'CH1compressoramps',
  'ch2_compressor_amps',
  'CH1_aiPumpAmps',
  'ch2_pump_amps',
  'ch3_high_pressure',
  'CH3_aiCompressorAmps',
  'ch4_temperature_f',
  'CH4_aiPumpAmps',
  'ch5_high_pressure',
  'CH5_aiCompressorAmps',
  'controller_heartbeat',
  'node_red_pac_read_ok',
  'pac_strategy_running',
  'pac_io_communication_ok',
  'controller_io_ready',
  'io_channel_fault_count'
]) {
  assert.equal(isFastTelemetryKey(key), true, `${key} should use the fast telemetry channel`);
}

for (const key of [
  'ch1_compressor_runtime_min',
  'ch2_chiller_run',
  'ch1_system_on',
  'ch2_high_pressure_stop',
  'ch1_setpoint_c'
]) {
  assert.equal(isFastTelemetryKey(key), false, `${key} should remain on the standard telemetry channel`);
}

const current = [
  {
    deviceId: 'epic-01',
    key: 'ch1_compressor_amps',
    latestTimestamp: '2026-07-25T10:00:00.000Z',
    value: 41.2
  },
  {
    deviceId: 'epic-01',
    key: 'ch1_compressor_runtime_min',
    latestTimestamp: '2026-07-25T10:00:00.000Z',
    value: 120
  }
];

const merged = mergeTelemetryPoints(current, [
  {
    deviceId: 'epic-01',
    key: 'CH1compressoramps',
    latestTimestamp: '2026-07-25T10:00:02.000Z',
    value: 43.8
  }
]);

assert.equal(merged.length, 2);
assert.equal(merged.find((point) => isFastTelemetryKey(point.key))?.value, 43.8);
assert.equal(merged.find((point) => point.key === 'ch1_compressor_runtime_min')?.value, 120);

const olderMerge = mergeTelemetryPoints(merged, [
  {
    deviceId: 'epic-01',
    key: 'ch1_compressor_amps',
    latestTimestamp: '2026-07-25T09:59:58.000Z',
    value: 10
  }
]);

assert.equal(olderMerge.find((point) => isFastTelemetryKey(point.key))?.value, 43.8);

console.log('Telemetry group tests passed.');
}

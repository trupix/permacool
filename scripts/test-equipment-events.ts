{
const assert = require('node:assert/strict');
const path = require('node:path');

const { evaluateEquipmentTransitions } = require(
  path.join(__dirname, '..', 'server', 'equipment-events.ts')
);

const base = {
  siteId: 'site-salinas',
  siteName: 'Salinas Extraction Campus',
  deviceId: 'epic-mvp-01',
  capturedAt: new Date('2026-07-19T12:00:00.000Z')
};

const previous = [
  { key: 'ch1_chiller_run', value: 1, unit: 'bool' },
  { key: 'ch1_system_on', value: 1, unit: 'bool' },
  { key: 'ch1_high_pressure_stop', value: 0, unit: 'bool' },
  { key: 'ch1_setpoint_c', value: -40, unit: 'F' },
  { key: 'ch1_temperature_c', value: -38, unit: 'F' },
  { key: 'ch1_high_pressure', value: 190, unit: 'psi' },
  { key: 'ch1_low_pressure', value: 31, unit: 'psi' },
  { key: 'ch1_compressor_amps', value: 52.4, unit: 'A' },
  { key: 'ch1_compressor_runtime_min', value: 12000, unit: 'min' }
];

const reached = evaluateEquipmentTransitions({
  ...base,
  previous,
  incoming: [
    { key: 'ch1_chiller_run', value: 0, unit: 'bool' },
    { key: 'ch1_temperature_c', value: -40.2, unit: 'F' },
    { key: 'ch1_high_pressure', value: 166, unit: 'psi' },
    { key: 'ch1_low_pressure', value: 27, unit: 'psi' },
    { key: 'ch1_compressor_amps', value: 0, unit: 'A' },
    { key: 'ch1_compressor_runtime_min', value: 12045, unit: 'min' }
  ]
});

assert.equal(reached.events.length, 1);
assert.equal(reached.events[0].eventType, 'reached_temperature');
assert.equal(reached.events[0].message, 'Reached Temperature (-40 °F) - CH1');
assert.equal(reached.events[0].temperatureUnit, '°F');
assert.equal(reached.events[0].setpointUnit, '°F');
assert.equal(reached.events[0].highPressure, 166);
assert.equal(reached.events[0].lowPressure, 27);
assert.equal(reached.events[0].processTemperature, -40.2);
assert.equal(reached.events[0].compressorAmps, 0);
assert.equal(reached.events[0].runtimeMinutes, 12045);
assert.equal(reached.alertActions.length, 0);

const pressureStop = evaluateEquipmentTransitions({
  ...base,
  previous,
  incoming: [
    { key: 'ch1_high_pressure_stop', value: 1, unit: 'bool' },
    { key: 'ch1_chiller_run', value: 0, unit: 'bool' },
    { key: 'ch1_temperature_c', value: -22.5, unit: 'F' },
    { key: 'ch1_high_pressure', value: 498.7, unit: 'psi' },
    { key: 'ch1_low_pressure', value: 42.1, unit: 'psi' },
    { key: 'ch1_compressor_amps', value: 0, unit: 'A' }
  ]
});

assert.equal(pressureStop.events.length, 1);
assert.equal(pressureStop.events[0].eventType, 'high_pressure_stop');
assert.equal(
  pressureStop.events[0].message,
  'Salinas Extraction Campus compressor - CH1 - HIGH PRESSURE STOP'
);
assert.equal(pressureStop.events[0].highPressure, 498.7);
assert.equal(pressureStop.alertActions[0].action, 'open');
assert.equal(pressureStop.alertActions[0].channel, 'CH1');

const systemOff = evaluateEquipmentTransitions({
  ...base,
  previous,
  incoming: [{ key: 'ch1_system_on', value: 0, unit: 'bool' }]
});
assert.equal(systemOff.events.length, 1);
assert.equal(systemOff.events[0].eventType, 'system_off');

const unchangedStop = evaluateEquipmentTransitions({
  ...base,
  previous: previous.map((point) =>
    point.key === 'ch1_high_pressure_stop' ? { ...point, value: 1 } : point
  ),
  incoming: [{ key: 'ch1_high_pressure_stop', value: 1, unit: 'bool' }]
});
assert.equal(unchangedStop.events.length, 0);
assert.equal(unchangedStop.alertActions.length, 0);

const stopCleared = evaluateEquipmentTransitions({
  ...base,
  previous: previous.map((point) =>
    point.key === 'ch1_high_pressure_stop' ? { ...point, value: 1 } : point
  ),
  incoming: [{ key: 'ch1_high_pressure_stop', value: 0, unit: 'bool' }]
});
assert.equal(stopCleared.events[0].eventType, 'high_pressure_cleared');
assert.equal(stopCleared.alertActions[0].action, 'resolve');

const aggregateStop = evaluateEquipmentTransitions({
  ...base,
  previous: [{ key: 'high_pressure_stop', value: 0, unit: 'bool' }],
  incoming: [{ key: 'high_pressure_stop', value: 1, unit: 'bool' }]
});
assert.equal(aggregateStop.events[0].channel, 'SYSTEM');
assert.equal(aggregateStop.alertActions[0].action, 'open');

const initialActiveStop = evaluateEquipmentTransitions({
  ...base,
  previous: [],
  incoming: [{ key: 'ch2_high_pressure_stop', value: 1, unit: 'bool' }]
});
assert.equal(initialActiveStop.events[0].eventType, 'high_pressure_stop');
assert.equal(initialActiveStop.alertActions[0].channel, 'CH2');

const aggregateWithClearChannels = evaluateEquipmentTransitions({
  ...base,
  previous: [
    { key: 'high_pressure_stop', value: 0, unit: 'bool' },
    { key: 'ch1_high_pressure_stop', value: 0, unit: 'bool' },
    { key: 'ch2_high_pressure_stop', value: 0, unit: 'bool' }
  ],
  incoming: [
    { key: 'high_pressure_stop', value: 1, unit: 'bool' },
    { key: 'ch1_high_pressure_stop', value: 0, unit: 'bool' },
    { key: 'ch2_high_pressure_stop', value: 0, unit: 'bool' }
  ]
});
assert.equal(aggregateWithClearChannels.events[0].channel, 'SYSTEM');
assert.equal(aggregateWithClearChannels.alertActions[0].action, 'open');

console.log('equipment event tests passed (26 assertions)');
}

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const equipmentPerformance = require(
  path.join(__dirname, '..', 'lib', 'equipment', 'performance.ts'),
);
const { resolveTelemetryPoint } = require(
  path.join(__dirname, '..', 'lib', 'equipment', 'telemetry.ts'),
);

const catalog = JSON.parse(
  readFileSync(
    path.join(
      __dirname,
      '..',
      'docs',
      'equipment-data',
      'russell-next-gen-ii-22hp-r404a.json',
    ),
    'utf8',
  ),
);

const DISCUS = 'russell-next-gen-ii-22hp-low-temp-discus-r404a';
const BITZER = 'russell-next-gen-ii-22hp-low-temp-bitzer-r404a';
const CAPTURED_AT = '2026-07-15T08:00:00.000Z';

const sameDeviceAliases = resolveTelemetryPoint(
  [
    { deviceId: 'epic-01', key: 'ch1_compressor_amps', latestTimestamp: '2026-07-19T10:00:00.000Z' },
    { deviceId: 'epic-01', key: 'CH1compressoramps', latestTimestamp: '2026-07-19T10:01:00.000Z' },
  ],
  ['ch1compressoramps'],
);
assert.equal(sameDeviceAliases.ambiguous, false);
assert.equal(sameDeviceAliases.point.key, 'CH1compressoramps');

const crossDeviceAliases = resolveTelemetryPoint(
  [
    { deviceId: 'epic-01', key: 'CH1compressoramps', latestTimestamp: '2026-07-19T10:01:00.000Z' },
    { deviceId: 'epic-02', key: 'ch1_compressor_amps', latestTimestamp: '2026-07-19T10:02:00.000Z' },
  ],
  ['ch1compressoramps'],
);
assert.equal(crossDeviceAliases.ambiguous, true);
assert.equal(crossDeviceAliases.point, undefined);

function operatingPoint(
  ambientTemperatureF: number,
  suctionTemperatureF: number,
  ambientSource = 'condenser_entering_air_sensor',
) {
  return {
    ambientTemperatureF,
    suctionTemperatureF,
    ambientSource,
    suctionSource: 'validated_pressure_temperature_conversion',
    suctionAxisValidated: true,
    capturedAt: CAPTURED_AT,
  };
}

function request(overrides = {}) {
  return {
    unitId: 'ch1',
    active: true,
    catalogVariantId: DISCUS,
    installedFrequencyHz: 60,
    parallelGroupId: 'salinas-parallel-group-01',
    liveOperatingPoint: operatingPoint(95, -20),
    ...overrides,
  };
}

let assertions = 4;
function check(condition: unknown, message?: string) {
  assertions += 1;
  assert.ok(condition, message);
}

const loaded = equipmentPerformance.loadRussellPerformanceCatalog(catalog);
assertions += 1;
assert.equal(loaded.status, 'ok');

const exact = equipmentPerformance.evaluateRussellUnitCapacity(catalog, request());
assertions += 5;
assert.equal(exact.status, 'ok');
assert.equal(exact.manufacturerTableEvaluation.capacityBtuPerHour, 78_840);
assert.equal(exact.derivedCapacity.capacityBtuPerHour, 78_840);
assert.equal(exact.quality.tableLookup, 'exact_catalog_point');
assert.equal(exact.quality.provenance.operatingInputs, 'live_operating_point');

const interpolated = equipmentPerformance.evaluateRussellUnitCapacity(
  catalog,
  request({ liveOperatingPoint: operatingPoint(97.5, -10) }),
);
assertions += 3;
assert.equal(interpolated.status, 'ok');
assert.equal(interpolated.manufacturerTableEvaluation.capacityBtuPerHour, 97_525);
assert.equal(interpolated.quality.tableLookup, 'bilinear_interpolation');

const selectedBitzer = equipmentPerformance.evaluateRussellUnitCapacity(
  catalog,
  request({
    catalogVariantId: BITZER,
    liveOperatingPoint: operatingPoint(100, -20),
  }),
);
assertions += 2;
assert.equal(selectedBitzer.status, 'ok');
assert.equal(selectedBitzer.derivedCapacity.capacityBtuPerHour, 72_110);

const fiftyHz = equipmentPerformance.evaluateRussellUnitCapacity(
  catalog,
  request({
    installedFrequencyHz: 50,
    liveOperatingPoint: operatingPoint(97.5, -10),
  }),
);
assertions += 4;
assert.equal(fiftyHz.status, 'ok');
assert.equal(fiftyHz.manufacturerTableEvaluation.capacityBtuPerHour, 97_525);
assert.equal(fiftyHz.derivedCapacity.appliedCapacityMultiplier, 0.83);
check(
  Math.abs(fiftyHz.derivedCapacity.capacityBtuPerHour - 80_945.75) < 1e-9,
  '50 Hz multiplier must be applied after catalog interpolation.',
);

const outside = equipmentPerformance.evaluateRussellUnitCapacity(
  catalog,
  request({ liveOperatingPoint: operatingPoint(89, -20) }),
);
assertions += 3;
assert.equal(outside.status, 'outside_published_envelope');
assert.equal(outside.manufacturerTableEvaluation, null);
assert.equal(outside.derivedCapacity, null);

const unvalidated = equipmentPerformance.evaluateRussellUnitCapacity(
  catalog,
  request({
    liveOperatingPoint: {
      ...operatingPoint(95, -20),
      suctionAxisValidated: false,
    },
  }),
);
assertions += 2;
assert.equal(unvalidated.status, 'unvalidated_suction_axis');
assert.equal(unvalidated.derivedCapacity, null);

const missingVariant = equipmentPerformance.evaluateRussellUnitCapacity(
  catalog,
  request({ catalogVariantId: null }),
);
assertions += 2;
assert.equal(missingVariant.status, 'variant_required');
assert.equal(missingVariant.derivedCapacity, null);

const unsupportedFrequency = equipmentPerformance.evaluateRussellUnitCapacity(
  catalog,
  request({ installedFrequencyHz: 55 }),
);
assertions += 2;
assert.equal(unsupportedFrequency.status, 'unsupported_frequency');
assert.equal(unsupportedFrequency.derivedCapacity, null);

const weatherAssisted = equipmentPerformance.evaluateRussellUnitCapacity(
  catalog,
  request({ liveOperatingPoint: operatingPoint(95, -20, 'local_weather') }),
);
assertions += 2;
assert.equal(weatherAssisted.status, 'ok');
assert.equal(weatherAssisted.quality.overall, 'reduced_input_quality');

const parallel = equipmentPerformance.evaluateRussellParallelCapacity(catalog, [
  request({ unitId: 'ch1' }),
  request({ unitId: 'ch2' }),
  request({ unitId: 'standby', active: false, catalogVariantId: null }),
]);
assertions += 5;
assert.equal(parallel.status, 'ok');
assert.equal(parallel.activeUnitCount, 2);
assert.equal(parallel.derivedCapacity.combinedCapacityBtuPerHour, 157_680);
assert.deepEqual(parallel.derivedCapacity.activeUnitIds, ['ch1', 'ch2']);
assert.equal(parallel.unitResults[2].status, 'inactive');

const incompleteParallel = equipmentPerformance.evaluateRussellParallelCapacity(catalog, [
  request({ unitId: 'ch1' }),
  request({
    unitId: 'ch2',
    liveOperatingPoint: operatingPoint(111, -20),
  }),
]);
assertions += 2;
assert.equal(incompleteParallel.status, 'incomplete_active_unit_evaluations');
assert.equal(incompleteParallel.derivedCapacity, null);

const staleParallel = equipmentPerformance.evaluateRussellParallelCapacity(catalog, [
  request({ unitId: 'ch1' }),
  request({
    unitId: 'ch2',
    liveOperatingPoint: {
      ...operatingPoint(95, -20),
      capturedAt: '2026-07-15T08:10:01.000Z',
    },
  }),
]);
assertions += 2;
assert.equal(staleParallel.status, 'conditions_not_comparable');
assert.equal(staleParallel.derivedCapacity, null);

const allInactive = equipmentPerformance.evaluateRussellParallelCapacity(catalog, [
  request({ unitId: 'ch1', active: false, catalogVariantId: null }),
  request({ unitId: 'ch2', active: false, catalogVariantId: null }),
]);
assertions += 3;
assert.equal(allInactive.status, 'no_active_units');
assert.equal(allInactive.activeUnitCount, 0);
assert.equal(allInactive.derivedCapacity.combinedCapacityBtuPerHour, 0);

console.log(`equipment performance tests passed (${assertions} assertions)`);

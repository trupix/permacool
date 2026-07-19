{
const assert = require('node:assert/strict');
const path = require('node:path');
const { defaultLogicDefinitions } = require(
  path.join(__dirname, '..', 'lib', 'equipment', 'logic-catalog.ts')
) as typeof import('../lib/equipment/logic-catalog');
const { parseLogicDefinitionInput } = require(
  path.join(__dirname, '..', 'server', 'logic-definition-input.ts')
) as typeof import('../server/logic-definition-input');

assert.ok(defaultLogicDefinitions.length >= 24, 'the initial logic catalog should include the complete operating specification');
assert.equal(new Set(defaultLogicDefinitions.map((item) => item.slug)).size, defaultLogicDefinitions.length, 'slugs must be unique');
assert.ok(defaultLogicDefinitions.every((item) => item.title && item.definition && item.behavior), 'every definition must be complete');
assert.ok(defaultLogicDefinitions.every((item) => item.implementationStatus === 'deployed'), 'initial definitions represent deployed behavior');

const searchableCatalog = defaultLogicDefinitions.map((item) => `${item.signalKey ?? ''} ${item.definition} ${item.behavior}`).join(' ');
for (const requiredSignal of [
  'ch1_chiller_run',
  'ch2_chiller_run',
  'ch1_compressor_runtime_min',
  'ch2_compressor_runtime_min',
  'ch1_high_pressure_stop',
  'ch2_high_pressure_stop',
  'high_pressure_stop',
  'ch1_low_pressure',
  'ch2_low_pressure',
  'ch1_setpoint_c',
  'ch2_setpoint_c',
  'ch1_system_on',
  'ch2_system_on',
  'ch1_temperature_c',
  'ch2_temperature_c',
  'ch1_compressor_amps',
  'ch2_compressor_amps'
]) {
  assert.ok(searchableCatalog.includes(requiredSignal), `${requiredSignal} must be documented`);
}

assert.deepEqual(
  parseLogicDefinitionInput({
    category: 'event',
    title: 'Test rule',
    signalKey: '',
    definition: 'A complete test definition.',
    behavior: 'A complete test behavior.',
    implementationStatus: 'draft'
  }),
  {
    category: 'event',
    title: 'Test rule',
    signalKey: null,
    definition: 'A complete test definition.',
    behavior: 'A complete test behavior.',
    implementationStatus: 'draft'
  }
);
assert.equal(parseLogicDefinitionInput({ title: 'Incomplete' }), null, 'incomplete input must be rejected');
assert.equal(parseLogicDefinitionInput({
  category: 'invalid',
  title: 'Test',
  definition: 'Definition',
  behavior: 'Behavior',
  implementationStatus: 'draft'
}), null, 'unknown categories must be rejected');

console.log(`logic catalog tests passed (${defaultLogicDefinitions.length} definitions)`);
}

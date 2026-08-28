// @ts-nocheck
const assert = require('node:assert/strict');
const path = require('node:path');
const { deriveOperatingSequence } = require(
  path.join(__dirname, '..', 'lib', 'equipment', 'operating-sequence.ts')
);

const fresh = (value) => ({ value, isFresh: true });

const missingOutputs = deriveOperatingSequence({
  systemOn: fresh(true),
  cycleRun: fresh(false),
  pumpOutput: null,
  solenoidOutput: null,
  compressorOutput: null,
  pumpAmps: fresh(0.1),
  compressorAmps: fresh(-0.1)
});
assert.equal(missingOutputs.steps.find((step) => step.id === 'pump').detail, 'Not configured');
assert.equal(missingOutputs.steps.find((step) => step.id === 'compressor').detail, 'Not configured');
assert.deepEqual(missingOutputs.findings, []);

const confirmedRun = deriveOperatingSequence({
  systemOn: fresh(true),
  cycleRun: fresh(true),
  pumpOutput: fresh(true),
  solenoidOutput: fresh(true),
  compressorOutput: fresh(true),
  pumpAmps: fresh(3.2),
  compressorAmps: fresh(14.8)
});
assert.equal(confirmedRun.steps.find((step) => step.id === 'system').state, 'ready');
assert.equal(confirmedRun.steps.find((step) => step.id === 'compressor').state, 'commanded');
assert.equal(confirmedRun.steps.find((step) => step.id === 'compressorFeedback').state, 'confirmed');
assert.deepEqual(confirmedRun.findings, []);

const failedStart = deriveOperatingSequence({
  systemOn: fresh(true),
  cycleRun: fresh(true),
  pumpOutput: fresh(true),
  solenoidOutput: fresh(true),
  compressorOutput: fresh(true),
  pumpAmps: fresh(0),
  compressorAmps: fresh(0.1)
});
assert.equal(failedStart.steps.find((step) => step.id === 'compressorFeedback').state, 'mismatch');
assert.match(failedStart.findings.join(' '), /compressor is commanded ON but current is not detected/i);
assert.match(failedStart.findings.join(' '), /pump is commanded ON but current is not detected/i);

const unexpectedOperation = deriveOperatingSequence({
  systemOn: fresh(false),
  cycleRun: fresh(false),
  pumpOutput: fresh(false),
  solenoidOutput: fresh(false),
  compressorOutput: fresh(false),
  pumpAmps: fresh(0),
  compressorAmps: fresh(9.4)
});
assert.equal(unexpectedOperation.steps.find((step) => step.id === 'compressorFeedback').state, 'mismatch');
assert.match(unexpectedOperation.findings.join(' '), /current is present/i);

const staleCommands = deriveOperatingSequence({
  systemOn: { value: true, isFresh: false },
  cycleRun: { value: true, isFresh: false },
  pumpOutput: { value: true, isFresh: false },
  solenoidOutput: { value: true, isFresh: false },
  compressorOutput: { value: true, isFresh: false },
  pumpAmps: { value: 4, isFresh: false },
  compressorAmps: { value: 12, isFresh: false }
});
assert.ok(staleCommands.steps.every((step) => step.state === 'unavailable'));
assert.deepEqual(staleCommands.findings, []);

console.log('Operating-sequence diagnostics passed for unavailable signals, confirmed operation, and safe mismatches.');

// @ts-nocheck
{
const assert = require('node:assert/strict');
const path = require('node:path');
const { resolveControllerConnectionPath } = require(
  path.join(__dirname, '..', 'lib', 'equipment', 'controller-connection-path.ts')
);

const DEVICE = 'epic-cannon-falls-01';
const NOW = '2026-08-28T19:00:30.000Z';
const point = (key, value, latestTimestamp = '2026-08-28T19:00:20.000Z', deviceId = DEVICE) => ({
  deviceId, key, latestValue: value, latestTimestamp
});

const healthy = resolveControllerConnectionPath({
  points: [
    point('controller_heartbeat', 88),
    point('node_red_pac_read_ok', 1),
    point('pac_strategy_running', 1),
    point('pac_io_communication_ok', 1),
    point('io_channel_fault_count', 0)
  ],
  deviceIds: [DEVICE],
  referenceTimestamp: NOW,
  feedStatus: 'ready'
});
assert.equal(healthy.state, 'healthy');
assert.equal(healthy.stages.find((stage) => stage.id === 'io').status, 'Communicating');
assert.match(healthy.stages.find((stage) => stage.id === 'vpn').detail, /inferred/i);

const splitBrain = resolveControllerConnectionPath({
  points: [
    point('node_red_pac_read_ok', 1),
    point('pac_strategy_running', 1),
    point('pac_io_communication_ok', 0),
    point('io_channel_fault_count', 4)
  ],
  deviceIds: [DEVICE],
  referenceTimestamp: NOW,
  feedStatus: 'ready'
});
assert.equal(splitBrain.state, 'fault');
assert.equal(splitBrain.stages.find((stage) => stage.id === 'strategy').status, 'Running');
assert.equal(splitBrain.stages.find((stage) => stage.id === 'io').state, 'fault');
assert.equal(splitBrain.stages.find((stage) => stage.id === 'website').state, 'healthy');

const separateIoReadyFault = resolveControllerConnectionPath({
  points: [
    point('node_red_pac_read_ok', 1),
    point('pac_strategy_running', 1),
    point('controller_io_communication_enabled', 1),
    point('controller_io_ready', 0),
    point('io_channel_fault_count', 0)
  ],
  deviceIds: [DEVICE],
  referenceTimestamp: NOW,
  feedStatus: 'ready'
});
assert.equal(separateIoReadyFault.stages.find((stage) => stage.id === 'io').state, 'fault');

const stale = resolveControllerConnectionPath({
  points: [
    point('node_red_pac_read_ok', 1, '2026-08-28T18:50:00.000Z'),
    point('pac_strategy_running', 1, '2026-08-28T18:50:00.000Z'),
    point('pac_io_communication_ok', 1, '2026-08-28T18:50:00.000Z'),
    point('io_channel_fault_count', 0, '2026-08-28T18:50:00.000Z')
  ],
  deviceIds: [DEVICE],
  referenceTimestamp: NOW,
  feedStatus: 'ready'
});
assert.equal(stale.state, 'stale');

const scoped = resolveControllerConnectionPath({
  points: [
    point('node_red_pac_read_ok', 1),
    point('pac_strategy_running', 1),
    point('pac_io_communication_ok', 1),
    point('io_channel_fault_count', 0),
    point('pac_io_communication_ok', 0, '2026-08-28T19:00:25.000Z', 'other-org-device')
  ],
  deviceIds: [DEVICE],
  referenceTimestamp: NOW,
  feedStatus: 'ready'
});
assert.equal(scoped.stages.find((stage) => stage.id === 'io').state, 'healthy');

const pending = resolveControllerConnectionPath({
  points: [], deviceIds: [DEVICE], referenceTimestamp: NOW, feedStatus: 'ready'
});
assert.equal(pending.state, 'incomplete');
assert.ok(pending.stages.slice(0, 5).every((stage) => stage.state === 'unmonitored'));

console.log('Controller connection-path tests passed for healthy, split-brain, stale, missing, and site-scoped states.');
}

import assert from 'node:assert/strict';
import test from 'node:test';
import { createOpenVpnClient } from '../src/openvpn-client.mjs';
import { createRelayHandler } from '../src/service.mjs';

const validProfile = '<key>test-only</key>\n<cert>test-only</cert>\nremote example.invalid 1194';
const key = 'a'.repeat(64);

function request(body, idempotencyKey = key) {
  return new Request('https://relay.test/v1/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(body)
  });
}

test('health is read-only', async () => {
  const calls = [];
  const handler = createRelayHandler({
    generationEnabled: false,
    openVpn: { health: async () => calls.push('health') },
    stateStore: { reserve: async () => calls.push('reserve') }
  });
  const response = await handler(new Request('https://relay.test/health'));
  assert.equal(response.status, 200);
  assert.deepEqual(calls, ['health']);
});

test('generation is disabled before state or OpenVPN access', async () => {
  const calls = [];
  const handler = createRelayHandler({
    generationEnabled: false,
    openVpn: { generateProfile: async () => calls.push('openvpn') },
    stateStore: { reserve: async () => calls.push('reserve') }
  });
  const response = await handler(request({ identity: 'test-epic-01', tunnelIp: null }));
  assert.equal(response.status, 503);
  assert.deepEqual(calls, []);
});

test('oversized chunked requests are rejected before parsing or reservation', async () => {
  const calls = [];
  const handler = createRelayHandler({
    generationEnabled: true,
    openVpn: { generateProfile: async () => calls.push('openvpn') },
    stateStore: { reserve: async () => calls.push('reserve') }
  });
  const oversized = new Request('https://relay.test/v1/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify({
      identity: 'test-epic-01',
      tunnelIp: null,
      padding: 'x'.repeat(5000)
    })
  });
  const response = await handler(oversized);
  assert.equal(response.status, 400);
  assert.deepEqual(calls, []);
});

test('an existing reservation blocks all OpenVPN access', async () => {
  const calls = [];
  const handler = createRelayHandler({
    generationEnabled: true,
    stateStore: { reserve: async () => false },
    openVpn: { generateProfile: async () => calls.push('openvpn') }
  });
  const response = await handler(request({ identity: 'test-epic-01', tunnelIp: null }));
  assert.equal(response.status, 409);
  assert.deepEqual(calls, []);
});

test('one reserved operation performs one ordered OpenVPN sequence', async () => {
  const calls = [];
  const transport = async ({ path, body, token }) => {
    calls.push({ path, body, token: Boolean(token) });
    if (path.endsWith('/login/userpassword')) return { status: 200, body: '{"auth_token":"test-token"}' };
    if (path.endsWith('/users/list')) return { status: 200, body: '[]' };
    if (path.endsWith('/profiles/create')) return { status: 200, body: validProfile };
    return { status: 200, body: '{}' };
  };
  const openVpn = createOpenVpnClient({
    username: 'test', password: 'test', timeoutMs: 100
  }, { transport });
  const state = [];
  const handler = createRelayHandler({
    generationEnabled: true,
    openVpn,
    stateStore: {
      reserve: async () => { state.push('reserved'); return true; },
      mark: async (_key, marker) => state.push(marker)
    }
  });
  const response = await handler(request({ identity: 'test-epic-01', tunnelIp: null }));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), validProfile);
  assert.deepEqual(calls.map(({ path }) => path), [
    '/api/auth/login/userpassword',
    '/api/users/list',
    '/api/users/create',
    '/api/userprop/set',
    '/api/profiles/create'
  ]);
  assert.deepEqual(state, ['reserved', 'profile-generated']);
});

test('an existing OpenVPN identity is never modified', async () => {
  const calls = [];
  const openVpn = createOpenVpnClient({ username: 'test', password: 'test', timeoutMs: 100 }, {
    transport: async ({ path }) => {
      calls.push(path);
      if (path.endsWith('/login/userpassword')) return { status: 200, body: '{"auth_token":"test-token"}' };
      return { status: 200, body: '[{"username":"test-epic-01"}]' };
    }
  });
  const markers = [];
  const handler = createRelayHandler({
    generationEnabled: true,
    openVpn,
    stateStore: { reserve: async () => true, mark: async (_key, marker) => markers.push(marker) }
  });
  const response = await handler(request({ identity: 'test-epic-01', tunnelIp: null }));
  assert.equal(response.status, 409);
  assert.equal(calls.length, 2);
  assert.deepEqual(markers, ['identity-conflict']);
});

test('identity lookup uses an exact parsed value instead of substring matching', async () => {
  const calls = [];
  const openVpn = createOpenVpnClient({ username: 'test', password: 'test', timeoutMs: 100 }, {
    transport: async ({ path }) => {
      calls.push(path);
      if (path.endsWith('/login/userpassword')) return { status: 200, body: '{"auth_token":"test-token"}' };
      if (path.endsWith('/users/list')) {
        return { status: 200, body: '[{"username":"test-epic-010"}]' };
      }
      if (path.endsWith('/profiles/create')) return { status: 200, body: validProfile };
      return { status: 200, body: '{}' };
    }
  });
  const handler = createRelayHandler({
    generationEnabled: true,
    openVpn,
    stateStore: { reserve: async () => true, mark: async () => true }
  });
  const response = await handler(request({ identity: 'test-epic-01', tunnelIp: null }));
  assert.equal(response.status, 200);
  assert.equal(calls.length, 5);
});

test('an uncertain failure remains reserved and is never retried', async () => {
  let attempts = 0;
  const handler = createRelayHandler({
    generationEnabled: true,
    openVpn: { generateProfile: async () => { attempts += 1; throw new Error('uncertain'); } },
    stateStore: { reserve: async () => true, mark: async () => true }
  });
  const response = await handler(request({ identity: 'test-epic-01', tunnelIp: null }));
  assert.equal(response.status, 502);
  assert.equal(attempts, 1);
  assert.match((await response.json()).error, /Do not retry/);
});

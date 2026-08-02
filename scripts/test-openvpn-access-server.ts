// @ts-nocheck
{
const assert = require('node:assert/strict');
const path = require('node:path');
const {
  generateOpenVpnProfileFor,
  getOpenVpnProvisioningStatusFor
} = require(path.join(__dirname, '..', 'server', 'openvpn-access-server-client.ts'));

function configure() {
  return {
    url: 'https://openvpn-staging.invalid:943',
    username: 'staging-health-user',
    password: 'staging-health-password'
  };
}

function response(body, status = 200, headers = {}) {
  return new Response(body, { status, headers });
}

function loginResponse() {
  return response(JSON.stringify({ auth_token: 'sanitized-test-token' }), 200, {
    'Content-Type': 'application/json'
  });
}

async function main() {
  const config = configure();

  const healthCalls = [];
  const healthy = await getOpenVpnProvisioningStatusFor(config, {
    fetchImpl: async (url, init) => {
      healthCalls.push({ url: String(url), init });
      return healthCalls.length === 1 ? loginResponse() : response('[]');
    },
    timeoutMs: 100
  });
  assert.deepEqual(healthy, {
    configured: true,
    healthy: true,
    host: 'openvpn-staging.invalid:943'
  });
  assert.equal(healthCalls.length, 2);
  assert.match(healthCalls[0].url, /\/api\/auth\/login\/userpassword$/);
  assert.match(healthCalls[1].url, /\/api\/users\/list$/);
  assert.deepEqual(JSON.parse(healthCalls[1].init.body), {
    users: ['__permacool_health_probe__']
  });
  assert.ok(healthCalls.every(({ init }) => init.method === 'POST'));
  assert.ok(healthCalls.every(({ url }) => !/users\/create|userprop\/set|profiles\/create/.test(url)));

  const authFailure = await getOpenVpnProvisioningStatusFor(config, {
    fetchImpl: async () => response('unauthorized', 401),
    timeoutMs: 100
  });
  assert.equal(authFailure.configured, true);
  assert.equal(authFailure.healthy, false);

  const unreachable = await getOpenVpnProvisioningStatusFor(config, {
    fetchImpl: async () => { throw new Error('unreachable'); },
    timeoutMs: 100
  });
  assert.equal(unreachable.configured, true);
  assert.equal(unreachable.healthy, false);

  const timedOut = await getOpenVpnProvisioningStatusFor(config, {
    fetchImpl: async (_url, init) => new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }),
    timeoutMs: 5
  });
  assert.equal(timedOut.configured, true);
  assert.equal(timedOut.healthy, false);

  const profileCalls = [];
  const generated = await generateOpenVpnProfileFor(
    config,
    { identity: 'staging-groov-epic-01', tunnelIp: null },
    {
      fetchImpl: async (url, init) => {
        profileCalls.push({ url: String(url), init });
        if (String(url).endsWith('/api/auth/login/userpassword')) return loginResponse();
        if (String(url).endsWith('/api/users/list')) return response('[]');
        if (String(url).endsWith('/api/profiles/create')) {
          return response('<key>test-only</key>\n<cert>test-only</cert>\nremote example.invalid 1194');
        }
        return response('{}');
      },
      timeoutMs: 100
    }
  );
  assert.equal(generated.serverHost, 'openvpn-staging.invalid:943');
  const profileCall = profileCalls.find(({ url }) => url.endsWith('/api/profiles/create'));
  assert.ok(profileCall);
  assert.deepEqual(JSON.parse(profileCall.init.body), {
    profile_type: 'autologin',
    user: 'staging-groov-epic-01'
  });
  assert.equal(Object.hasOwn(JSON.parse(profileCall.init.body), 'username'), false);

  const existingCalls = [];
  await assert.rejects(
    generateOpenVpnProfileFor(
      config,
      { identity: 'existing-groov-epic-01', tunnelIp: null },
      {
        fetchImpl: async (url) => {
          existingCalls.push(String(url));
          if (String(url).endsWith('/api/auth/login/userpassword')) return loginResponse();
          return response(JSON.stringify([{ username: 'existing-groov-epic-01' }]));
        },
        timeoutMs: 100
      }
    ),
    /identity already exists.*reconciled manually/i
  );
  assert.equal(existingCalls.length, 2);
  assert.ok(existingCalls.every((url) => !/users\/create|userprop\/set|profiles\/create/.test(url)));

  const insecureConfig = { ...config, url: 'http://openvpn-staging.invalid:943' };
  const insecureHealth = await getOpenVpnProvisioningStatusFor(insecureConfig, {
    fetchImpl: async () => { throw new Error('HTTP must not be contacted.'); }
  });
  assert.equal(insecureHealth.healthy, false);
  await assert.rejects(
    generateOpenVpnProfileFor(
      insecureConfig,
      { identity: 'staging-groov-epic-02', tunnelIp: null }
    ),
    /requires HTTPS/
  );

  console.log('OpenVPN authenticated health, timeout, request-shape, and existing-identity locks passed.');
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

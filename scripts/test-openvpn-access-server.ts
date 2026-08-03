// @ts-nocheck
{
const assert = require('node:assert/strict');
const path = require('node:path');
const {
  generateOpenVpnProfileFor,
  getOpenVpnProvisioningStatusFor
} = require(path.join(__dirname, '..', 'server', 'openvpn-access-server-client.ts'));

const config = {
  url: 'https://relay-staging.invalid',
  workloadIdentityAudience:
    '//iam.googleapis.com/projects/123/locations/global/workloadIdentityPools/test/providers/vercel',
  serviceAccountEmail: 'test-relay-caller@example.invalid'
};
const oidcToken = 'sanitized-vercel-oidc-token';
const googleAccessToken = 'sanitized-google-access-token';
const googleIdentityToken = 'sanitized-google-identity-token';

function response(body, status = 200, headers = {}) {
  return new Response(body, { status, headers });
}

function successfulFederation(calls, relayResponse) {
  return async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url) === 'https://sts.googleapis.com/v1/token') {
      return response(JSON.stringify({ access_token: googleAccessToken }), 200, {
        'Content-Type': 'application/json'
      });
    }
    if (String(url).startsWith('https://iamcredentials.googleapis.com/')) {
      return response(JSON.stringify({ token: googleIdentityToken }), 200, {
        'Content-Type': 'application/json'
      });
    }
    return relayResponse(url, init);
  };
}

async function main() {
  const healthCalls = [];
  const healthy = await getOpenVpnProvisioningStatusFor(config, oidcToken, {
    fetchImpl: successfulFederation(healthCalls, async () =>
      response(JSON.stringify({ healthy: true }), 200, { 'Content-Type': 'application/json' })
    ),
    timeoutMs: 100
  });
  assert.deepEqual(healthy, {
    configured: true,
    healthy: true,
    host: 'Secure Google Cloud relay'
  });
  assert.equal(healthCalls.length, 3);
  assert.equal(new URLSearchParams(healthCalls[0].init.body).get('subject_token'), oidcToken);
  assert.equal(healthCalls[1].init.headers.Authorization, `Bearer ${googleAccessToken}`);
  assert.equal(healthCalls[2].init.headers.Authorization, `Bearer ${googleIdentityToken}`);
  assert.equal(healthCalls[2].url, 'https://relay-staging.invalid/health');
  assert.equal(healthCalls[2].init.method, 'GET');

  const missingOidc = await getOpenVpnProvisioningStatusFor(config, '', {
    fetchImpl: async () => { throw new Error('A missing token must not cause network access.'); }
  });
  assert.deepEqual(missingOidc, {
    configured: false,
    healthy: false,
    host: 'Secure Google Cloud relay'
  });

  const unhealthy = await getOpenVpnProvisioningStatusFor(config, oidcToken, {
    fetchImpl: async () => response('unauthorized', 401),
    timeoutMs: 100
  });
  assert.equal(unhealthy.configured, true);
  assert.equal(unhealthy.healthy, false);

  const idempotencyKey = 'a'.repeat(64);
  const profileCalls = [];
  const profile = '<key>test-only</key>\n<cert>test-only</cert>\nremote example.invalid 1194';
  const generated = await generateOpenVpnProfileFor(
    config,
    { identity: 'staging-groov-epic-01', tunnelIp: null },
    oidcToken,
    idempotencyKey,
    {
      fetchImpl: successfulFederation(profileCalls, async () => response(profile)),
      timeoutMs: 100
    }
  );
  assert.equal(generated.profile, profile);
  assert.equal(generated.serverHost, 'secure-google-cloud-relay');
  assert.equal(profileCalls.length, 3);
  assert.equal(profileCalls[2].init.headers['Idempotency-Key'], idempotencyKey);
  assert.deepEqual(JSON.parse(profileCalls[2].init.body), {
    identity: 'staging-groov-epic-01',
    tunnelIp: null
  });

  let conflictCalls = 0;
  await assert.rejects(
    generateOpenVpnProfileFor(
      config,
      { identity: 'staging-groov-epic-01', tunnelIp: null },
      oidcToken,
      idempotencyKey,
      {
        fetchImpl: successfulFederation([], async () => {
          conflictCalls += 1;
          return response(JSON.stringify({ error: 'reserved' }), 409);
        }),
        timeoutMs: 100
      }
    ),
    /already reserved.*manual reconciliation/i
  );
  assert.equal(conflictCalls, 1, 'The application must never retry a relay generation request.');

  await assert.rejects(
    generateOpenVpnProfileFor(
      config,
      { identity: 'staging-groov-epic-01', tunnelIp: null },
      oidcToken,
      'not-valid',
      { fetchImpl: async () => { throw new Error('Invalid keys must not make requests.'); } }
    ),
    /valid VPN operation idempotency key/i
  );

  console.log('Vercel OIDC federation, authenticated relay health, idempotency, and no-retry tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
}

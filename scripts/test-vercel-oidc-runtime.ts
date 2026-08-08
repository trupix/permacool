// @ts-nocheck
{
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { getVercelOidcToken } = require(path.join(__dirname, '..', 'lib', 'vercel-oidc.ts'));

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

async function main() {
  const token = await getVercelOidcToken(async () => 'sanitized-runtime-oidc-token');
  assert.equal(token, 'sanitized-runtime-oidc-token');

  const unavailable = await getVercelOidcToken(async () => {
    throw new Error('No Vercel request context in this test.');
  });
  assert.equal(unavailable, '', 'Missing runtime context must fail closed without exposing an error.');

  const helper = read('lib/vercel-oidc.ts');
  assert.match(helper, /from '@vercel\/oidc'/);
  assert.doesNotMatch(helper, /requestHeaders|x-vercel-oidc-token|VERCEL_OIDC_TOKEN/);

  const page = read('app/(ops)/provisioning/page.tsx');
  assert.match(page, /await getVercelOidcToken\(\)/);
  assert.doesNotMatch(page, /from 'next\/headers'|getVercelOidcToken\(await headers\(\)\)/);

  const generationRoute = read('app/api/provisioning/devices/[deviceid]/vpn-profile/route.ts');
  assert.match(generationRoute, /await getVercelOidcToken\(\)/);
  assert.doesNotMatch(generationRoute, /getVercelOidcToken\(request\.headers\)/);
  assert.ok(
    generationRoute.indexOf('await getVercelOidcToken()') <
      generationRoute.indexOf('await getOpenVpnProvisioningStatus(oidcToken)'),
    'The runtime token must be read before the bridge health gate.'
  );
  assert.ok(
    generationRoute.indexOf('await getOpenVpnProvisioningStatus(oidcToken)') <
      generationRoute.indexOf('await reserveVpnProfileGeneration'),
    'The authenticated health gate must still run before reserving a VPN operation.'
  );

  console.log('Vercel runtime OIDC context and fail-closed bridge handoff checks passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
}

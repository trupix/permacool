// @ts-nocheck
{
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  canIssueVpnProfile
} = require(path.join(__dirname, '..', 'lib', 'workspace-access.ts'));

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

function user(overrides = {}) {
  const role = overrides.role ?? 'viewer';
  const organizationIds = overrides.organizationIds ?? [];
  return {
    id: 'user',
    name: 'Test User',
    email: 'test@example.com',
    role,
    platformRole: 'customer',
    status: 'approved',
    organizationIds,
    organizationRoles:
      overrides.organizationRoles ??
      Object.fromEntries(organizationIds.map((organizationId) => [organizationId, role])),
    allDeviceOrganizationIds: organizationIds,
    deviceIds: [],
    ...overrides
  };
}

const storage = read('server/provisioning-storage.ts');
assert.match(storage, /CREATE TABLE IF NOT EXISTS "VpnEnrollment"/);
assert.doesNotMatch(storage, /externalEnrollments/);
assert.doesNotMatch(storage, /172\.28\.0\.(?:10|11)/);
assert.doesNotMatch(
  storage,
  /db\.vpnEnrollment\.(?:create|createMany|upsert|update|updateMany|delete|deleteMany)\s*\(/
);

const repository = read('server/repositories/provisioning.ts');
const snapshotBody = repository.slice(
  repository.indexOf('export async function getProvisioningSnapshot'),
  repository.indexOf('async function uniqueSiteId')
);
assert.match(snapshotBody, /db\.site\.findMany/);
assert.doesNotMatch(
  snapshotBody,
  /\.(?:create|createMany|upsert|update|updateMany|delete|deleteMany)\s*\(/
);

const provisioningPage = read('app/(ops)/provisioning/page.tsx');
const connectivityPage = read('app/(ops)/sites/[siteid]/connectivity/page.tsx');
assert.match(provisioningPage, /getProvisioningSnapshot\(user\)/);
assert.match(connectivityPage, /getDevicesBySite\(user, site\.id\)/);

const vpnRoute = read('app/api/provisioning/devices/[deviceId]/vpn-profile/route.ts');
assert.match(vpnRoute, /export async function POST/);
assert.doesNotMatch(vpnRoute, /export async function GET/);
assert.ok(
  vpnRoute.indexOf('canIssueVpnProfile(user, device.site.organizationId)') <
    vpnRoute.indexOf('await generateOpenVpnProfile'),
  'Owner and organization authorization must run before OpenVPN profile generation.'
);

const owner = user({
  role: 'owner',
  organizationIds: ['org-permacool'],
  organizationRoles: { 'org-permacool': 'owner' }
});
const operator = user({
  role: 'operator',
  organizationIds: ['org-permacool'],
  organizationRoles: { 'org-permacool': 'operator' }
});
const viewer = user({
  role: 'viewer',
  organizationIds: ['org-permacool'],
  organizationRoles: { 'org-permacool': 'viewer' }
});
const otherOwner = user({
  role: 'owner',
  organizationIds: ['org-other'],
  organizationRoles: { 'org-other': 'owner' }
});
const mixedRoleOwner = user({
  role: 'owner',
  organizationIds: ['org-permacool', 'org-other'],
  organizationRoles: {
    'org-permacool': 'owner',
    'org-other': 'viewer'
  }
});

assert.equal(canIssueVpnProfile(owner, 'org-permacool'), true);
assert.equal(canIssueVpnProfile(operator, 'org-permacool'), false);
assert.equal(canIssueVpnProfile(viewer, 'org-permacool'), false);
assert.equal(canIssueVpnProfile(otherOwner, 'org-permacool'), false);
assert.equal(canIssueVpnProfile(mixedRoleOwner, 'org-permacool'), true);
assert.equal(canIssueVpnProfile(mixedRoleOwner, 'org-other'), false);

const proxySource = read('proxy.ts');
assert.match(proxySource, /isSupabaseAuthEnabled\(\)/);
assert.match(proxySource, /NextResponse\.next\(\{ request \}\)/);

function supabaseAuthEnabled(authProvider, configured) {
  const envPath = path.join(__dirname, '..', 'lib', 'env.ts');
  const code = [
    `const { isSupabaseAuthEnabled } = require(${JSON.stringify(envPath)});`,
    'process.stdout.write(String(isSupabaseAuthEnabled()));'
  ].join('');
  const env = {
    ...process.env,
    AUTH_PROVIDER: authProvider,
    NEXT_PUBLIC_SUPABASE_URL: configured ? 'https://staging.example.supabase.co' : '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: configured ? 'staging-anon-key' : ''
  };
  const result = spawnSync(process.execPath, ['-e', code], {
    cwd: path.join(__dirname, '..'),
    env,
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout === 'true';
}

assert.equal(supabaseAuthEnabled('supabase', true), true);
assert.equal(supabaseAuthEnabled('mock', true), false);
assert.equal(supabaseAuthEnabled('supabase', false), false);

console.log('Provisioning read-only, organization-scoped VPN issuance, and auth-provider regression checks passed.');
}

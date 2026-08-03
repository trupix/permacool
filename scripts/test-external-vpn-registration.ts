// @ts-nocheck
{
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  canRegisterExternalVpnProfile
} = require(path.join(__dirname, '..', 'lib', 'workspace-access.ts'));
const {
  parseExternalVpnProfileInput
} = require(path.join(__dirname, '..', 'server', 'provisioning-input.ts'));

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

assert.deepEqual(
  parseExternalVpnProfileInput({ identity: 'baldwin-park-groov-epic-01' }),
  { identity: 'baldwin-park-groov-epic-01' }
);
assert.equal(parseExternalVpnProfileInput({ identity: '' }), null);
assert.equal(parseExternalVpnProfileInput({ identity: 'UPPERCASE' }), null);
assert.equal(parseExternalVpnProfileInput({ identity: '../profile' }), null);
assert.equal(parseExternalVpnProfileInput({ identity: 'identity with spaces' }), null);
assert.equal(parseExternalVpnProfileInput({ identity: 'a'.repeat(101) }), null);

const owner = user({
  organizationIds: ['org-permacool'],
  organizationRoles: { 'org-permacool': 'owner' }
});
const operator = user({
  organizationIds: ['org-permacool'],
  organizationRoles: { 'org-permacool': 'operator' }
});
const viewer = user({
  organizationIds: ['org-permacool'],
  organizationRoles: { 'org-permacool': 'viewer' }
});
const otherOwner = user({
  organizationIds: ['org-other'],
  organizationRoles: { 'org-other': 'owner' }
});
const mixedRoleOwner = user({
  organizationIds: ['org-permacool', 'org-other'],
  organizationRoles: { 'org-permacool': 'owner', 'org-other': 'viewer' }
});

assert.equal(canRegisterExternalVpnProfile(owner, 'org-permacool'), true);
assert.equal(canRegisterExternalVpnProfile(operator, 'org-permacool'), false);
assert.equal(canRegisterExternalVpnProfile(viewer, 'org-permacool'), false);
assert.equal(canRegisterExternalVpnProfile(otherOwner, 'org-permacool'), false);
assert.equal(canRegisterExternalVpnProfile(mixedRoleOwner, 'org-permacool'), true);
assert.equal(canRegisterExternalVpnProfile(mixedRoleOwner, 'org-other'), false);

const route = read('app/api/provisioning/devices/[deviceid]/external-profile/route.ts');
assert.match(route, /export async function POST/);
assert.doesNotMatch(route, /export async function GET/);
assert.doesNotMatch(route, /generateOpenVpnProfile|openvpn-access-server|\.ovpn|certificate|private key/i);
assert.ok(
  route.indexOf('canRegisterExternalVpnProfile(user, device.site.organizationId)') <
    route.indexOf('await registerExternalVpnProfile'),
  'Organization-specific Owner authorization must run before external profile registration.'
);

const repository = read('server/repositories/provisioning.ts');
const registrationBody = repository.slice(repository.indexOf('export async function registerExternalVpnProfile'));
assert.match(registrationBody, /deviceWhere\(actor\)/);
assert.match(registrationBody, /canRegisterExternalVpnProfile\(actor, device\.site\.organizationId\)/);
assert.match(registrationBody, /claimExternalVpnProfile\(transaction, device\.id, identity/);
assert.match(registrationBody, /Registered externally issued OpenVPN profile/);
assert.match(registrationBody, /issuance: 'external_manual'/);
assert.match(registrationBody, /tunnelAssignment: 'dynamic'/);
assert.doesNotMatch(registrationBody, /generateOpenVpnProfile|profileContents|privateKey|certificate/);

const generationRoute = read('app/api/provisioning/devices/[deviceid]/vpn-profile/route.ts');
assert.match(
  generationRoute,
  /device\.vpnEnrollment\.profileStatus === 'issuing'/
);
assert.ok(
  generationRoute.indexOf('await getOpenVpnProvisioningStatus(oidcToken)') <
    generationRoute.indexOf('await reserveVpnProfileGeneration'),
  'A real read-only bridge health check must pass before the database operation is reserved.'
);
assert.match(generationRoute, /if \(!bridge\.healthy\)/);
assert.ok(
  generationRoute.indexOf('await reserveVpnProfileGeneration') < generationRoute.indexOf('await generateOpenVpnProfile'),
  'The database reservation must succeed before OpenVPN is contacted.'
);
assert.match(generationRoute, /do not retry automatically/);
assert.doesNotMatch(generationRoute, /releaseVpnProfileGeneration|profileStatus:\s*'not_generated'/);

const operationState = read('server/vpn-operation-state.ts');
assert.match(operationState, /profileStatus: \{ in: GENERATION_ELIGIBLE_STATUSES \}/);
assert.match(operationState, /profileStatus: VPN_PROFILE_ISSUING_STATUS/);
assert.match(operationState, /profileStatus: 'external'/);
assert.match(operationState, /tunnelIp: null/);
assert.match(operationState, /identity: current\.identity/);
assert.match(operationState, /claimed\.count !== 1/);

const workspace = read('components/provisioning-workspace.tsx');
assert.match(workspace, /Register existing/);
assert.match(workspace, /external-profile/);
assert.match(workspace, /No new profile was generated/);
assert.doesNotMatch(workspace, /useEffect\([\s\S]{0,500}external-profile/);

console.log('External VPN registration authorization, isolation, no-generation, and audit regression checks passed.');
}

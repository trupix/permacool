// @ts-nocheck
{
const assert = require('node:assert/strict');
const path = require('node:path');
const {
  canAccessDevice,
  canAccessOrganization,
  deviceWhere,
  siteWhere
} = require(path.join(__dirname, '..', 'lib', 'access.ts'));
const { scopeProvisioningFallback } = require(
  path.join(__dirname, '..', 'lib', 'provisioning-scope.ts')
);
const {
  canAccessProvisioning,
  canIssueVpnProfile,
  canManageLogicDefinitions,
  canManageSiteEquipment,
  roleForOrganization
} = require(path.join(__dirname, '..', 'lib', 'workspace-access.ts'));

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
    allDeviceOrganizationIds: [],
    deviceIds: [],
    ...overrides
  };
}

const permaOwner = user({
  id: 'owner-perma',
  role: 'owner',
  organizationIds: ['org-permacool'],
  allDeviceOrganizationIds: ['org-permacool']
});
const permaOperator = user({
  id: 'operator-perma',
  role: 'operator',
  organizationIds: ['org-permacool'],
  allDeviceOrganizationIds: ['org-permacool']
});
const permaViewer = user({
  id: 'viewer-perma',
  role: 'viewer',
  organizationIds: ['org-permacool'],
  allDeviceOrganizationIds: ['org-permacool']
});
const otherOwner = user({
  id: 'owner-other',
  role: 'owner',
  organizationIds: ['org-other'],
  allDeviceOrganizationIds: ['org-other']
});
const assignedOperator = user({
  id: 'assigned-operator',
  role: 'operator',
  organizationIds: ['org-permacool'],
  allDeviceOrganizationIds: [],
  deviceIds: ['plc-perma-1']
});
const staff = user({ id: 'staff', role: 'owner', platformRole: 'staff_support' });
const staffViewer = user({ id: 'staff-viewer', role: 'viewer', platformRole: 'staff_support' });
const mixedRoleOwner = user({
  id: 'mixed-role-owner',
  role: 'owner',
  organizationIds: ['org-permacool', 'org-other'],
  organizationRoles: {
    'org-permacool': 'owner',
    'org-other': 'viewer'
  },
  allDeviceOrganizationIds: ['org-permacool', 'org-other']
});
const mixedRoleOperator = user({
  id: 'mixed-role-operator',
  role: 'owner',
  organizationIds: ['org-permacool', 'org-other'],
  organizationRoles: {
    'org-permacool': 'viewer',
    'org-other': 'operator'
  },
  allDeviceOrganizationIds: ['org-permacool', 'org-other']
});

const sites = [
  { id: 'site-perma', organizationId: 'org-permacool', name: 'Perma site' },
  { id: 'site-other', organizationId: 'org-other', name: 'Other site' }
];
const devices = [
  { id: 'plc-perma-1', siteId: 'site-perma', name: 'Perma PLC 1' },
  { id: 'plc-perma-2', siteId: 'site-perma', name: 'Perma PLC 2' },
  { id: 'plc-other-1', siteId: 'site-other', name: 'Other PLC' }
];

const permaSnapshot = scopeProvisioningFallback(permaOwner, sites, devices);
assert.deepEqual(permaSnapshot.sites.map(({ id }) => id), ['site-perma']);
assert.deepEqual(permaSnapshot.devices.map(({ id }) => id), ['plc-perma-1', 'plc-perma-2']);

const otherSnapshot = scopeProvisioningFallback(otherOwner, sites, devices);
assert.deepEqual(otherSnapshot.sites.map(({ id }) => id), ['site-other']);
assert.deepEqual(otherSnapshot.devices.map(({ id }) => id), ['plc-other-1']);

const assignedSnapshot = scopeProvisioningFallback(assignedOperator, sites, devices);
assert.deepEqual(assignedSnapshot.sites.map(({ id }) => id), ['site-perma']);
assert.deepEqual(assignedSnapshot.devices.map(({ id }) => id), ['plc-perma-1']);

assert.equal(canAccessOrganization(permaOwner, 'org-permacool'), true);
assert.equal(canAccessOrganization(permaOwner, 'org-other'), false);
assert.equal(canAccessDevice(permaOwner, 'plc-other-1', 'org-other'), false);
assert.equal(canAccessDevice(assignedOperator, 'plc-perma-1', 'org-permacool'), true);
assert.equal(canAccessDevice(assignedOperator, 'plc-perma-2', 'org-permacool'), false);

assert.deepEqual(siteWhere(permaOwner), {
  OR: [
    { organizationId: { in: ['org-permacool'] } },
    { devices: { some: { id: { in: [] } } } }
  ]
});
assert.deepEqual(deviceWhere(otherOwner), {
  OR: [
    { site: { organizationId: { in: ['org-other'] } } },
    { id: { in: [] } }
  ]
});

assert.equal(canManageSiteEquipment(permaOwner, 'org-permacool'), true);
assert.equal(canManageSiteEquipment(permaOperator, 'org-permacool'), true);
assert.equal(canManageSiteEquipment(permaViewer, 'org-permacool'), false);
assert.equal(canManageSiteEquipment(otherOwner, 'org-permacool'), false);
assert.equal(canManageSiteEquipment(staffViewer, 'org-permacool'), false);
assert.equal(canManageSiteEquipment(mixedRoleOwner, 'org-permacool'), true);
assert.equal(canManageSiteEquipment(mixedRoleOwner, 'org-other'), false);
assert.equal(canManageSiteEquipment(mixedRoleOperator, 'org-permacool'), false);
assert.equal(canManageSiteEquipment(mixedRoleOperator, 'org-other'), true);

assert.equal(canIssueVpnProfile(permaOwner, 'org-permacool'), true);
assert.equal(canIssueVpnProfile(permaOperator, 'org-permacool'), false);
assert.equal(canIssueVpnProfile(permaViewer, 'org-permacool'), false);
assert.equal(canIssueVpnProfile(otherOwner, 'org-permacool'), false);
assert.equal(canIssueVpnProfile(mixedRoleOwner, 'org-permacool'), true);
assert.equal(canIssueVpnProfile(mixedRoleOwner, 'org-other'), false);
assert.equal(canIssueVpnProfile(mixedRoleOperator, 'org-permacool'), false);
assert.equal(canIssueVpnProfile(mixedRoleOperator, 'org-other'), false);

assert.equal(canAccessProvisioning(permaOwner), true);
assert.equal(canAccessProvisioning(permaOperator), true);
assert.equal(canAccessProvisioning(permaViewer), false);
assert.equal(canAccessProvisioning(mixedRoleOwner), true);
assert.equal(canAccessProvisioning(mixedRoleOperator), true);
assert.equal(canManageLogicDefinitions(permaOwner), true);
assert.equal(canManageLogicDefinitions(otherOwner), false);
assert.equal(canManageLogicDefinitions(permaOperator), false);
assert.equal(canManageLogicDefinitions(mixedRoleOwner), true);
assert.equal(canManageLogicDefinitions(mixedRoleOperator), false);
assert.equal(roleForOrganization(mixedRoleOwner, 'org-other'), 'viewer');
assert.equal(roleForOrganization(mixedRoleOperator, 'org-other'), 'operator');

const staffSnapshot = scopeProvisioningFallback(staff, sites, devices);
assert.equal(staffSnapshot.sites.length, 2);
assert.equal(staffSnapshot.devices.length, 3);

console.log('Organization isolation integration checks passed for sites, PLCs, provisioning, equipment, Logic, telemetry scopes, and VPN issuance.');
}

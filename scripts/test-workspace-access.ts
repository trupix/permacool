// @ts-nocheck
{
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  canAccessProvisioning,
  canIssueVpnProfile,
  canRegisterExternalVpnProfile,
  canManageLogicDefinitions,
  canManageSiteEquipment,
  roleForOrganization
} = require(path.join(__dirname, '..', 'lib', 'workspace-access.ts'));

function user(overrides = {}) {
  const role = overrides.role ?? 'viewer';
  const organizationIds = overrides.organizationIds ?? ['org-permacool'];
  return {
    id: 'user-test',
    name: 'Test user',
    email: 'test@perma.cool',
    role,
    platformRole: 'customer',
    status: 'approved',
    organizationIds,
    organizationRoles:
      overrides.organizationRoles ??
      Object.fromEntries(organizationIds.map((organizationId) => [organizationId, role])),
    allDeviceOrganizationIds: ['org-permacool'],
    deviceIds: [],
    ...overrides
  };
}

const owner = user({ role: 'owner' });
assert.equal(canAccessProvisioning(owner), true);
assert.equal(canManageLogicDefinitions(owner), true);

const operator = user({ role: 'operator' });
assert.equal(canAccessProvisioning(operator), true);
assert.equal(canManageLogicDefinitions(operator), false);

const viewer = user();
assert.equal(canAccessProvisioning(viewer), false);
assert.equal(canManageLogicDefinitions(viewer), false);

const otherOrganizationOwner = user({
  role: 'owner',
  email: 'owner@example.com',
  organizationIds: ['org-customer']
});
assert.equal(canAccessProvisioning(otherOrganizationOwner), true);
assert.equal(canManageLogicDefinitions(otherOrganizationOwner), false);

const staffSupport = user({
  role: 'viewer',
  platformRole: 'staff_support',
  organizationIds: []
});
assert.equal(canAccessProvisioning(staffSupport), true);
assert.equal(canManageLogicDefinitions(staffSupport), true);

const mixedRoleUser = user({
  role: 'owner',
  organizationIds: ['org-permacool', 'org-customer'],
  organizationRoles: {
    'org-permacool': 'owner',
    'org-customer': 'viewer'
  },
  allDeviceOrganizationIds: ['org-permacool', 'org-customer']
});
assert.equal(roleForOrganization(mixedRoleUser, 'org-permacool'), 'owner');
assert.equal(roleForOrganization(mixedRoleUser, 'org-customer'), 'viewer');
assert.equal(canManageSiteEquipment(mixedRoleUser, 'org-permacool'), true);
assert.equal(canManageSiteEquipment(mixedRoleUser, 'org-customer'), false);
assert.equal(canIssueVpnProfile(mixedRoleUser, 'org-permacool'), true);
assert.equal(canIssueVpnProfile(mixedRoleUser, 'org-customer'), false);
assert.equal(canRegisterExternalVpnProfile(mixedRoleUser, 'org-permacool'), true);
assert.equal(canRegisterExternalVpnProfile(mixedRoleUser, 'org-customer'), false);

const mixedOperatorUser = user({
  role: 'owner',
  organizationIds: ['org-permacool', 'org-customer'],
  organizationRoles: {
    'org-permacool': 'viewer',
    'org-customer': 'operator'
  },
  allDeviceOrganizationIds: ['org-permacool', 'org-customer']
});
assert.equal(canAccessProvisioning(mixedOperatorUser), true);
assert.equal(canManageLogicDefinitions(mixedOperatorUser), false);
assert.equal(canManageSiteEquipment(mixedOperatorUser, 'org-permacool'), false);
assert.equal(canManageSiteEquipment(mixedOperatorUser, 'org-customer'), true);
assert.equal(canIssueVpnProfile(mixedOperatorUser, 'org-customer'), false);
assert.equal(canRegisterExternalVpnProfile(mixedOperatorUser, 'org-customer'), false);

console.log('Workspace access policy tests passed.');
}

// @ts-nocheck
{
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  canAccessProvisioning,
  canManageLogicDefinitions
} = require(path.join(__dirname, '..', 'lib', 'workspace-access.ts'));

function user(overrides = {}) {
  return {
    id: 'user-test',
    name: 'Test user',
    email: 'test@perma.cool',
    role: 'viewer',
    platformRole: 'customer',
    status: 'approved',
    organizationIds: ['org-permacool'],
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

console.log('Workspace access policy tests passed.');
}

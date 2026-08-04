// @ts-nocheck
{
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseUpdatePlcInput } = require(path.join(__dirname, '..', 'server', 'provisioning-input.ts'));
const {
  canIssueVpnProfile,
  canManageSiteEquipment
} = require(path.join(__dirname, '..', 'lib', 'workspace-access.ts'));

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

function user(role, organizationId = 'org-permacool') {
  return {
    id: `${role}-user`,
    name: `${role} user`,
    email: `${role}@example.com`,
    role,
    platformRole: 'customer',
    status: 'approved',
    organizationIds: [organizationId],
    organizationRoles: { [organizationId]: role },
    allDeviceOrganizationIds: [organizationId],
    deviceIds: []
  };
}

assert.deepEqual(
  parseUpdatePlcInput({
    name: 'MuhaMeds groov EPIC 01',
    plcModel: 'Opto 22 groov EPIC PR1',
    serialNumber: '',
    firmwareVersion: '3.5.1-b.85',
    localIpAddress: '192.168.1.10',
    tunnelIp: '172.28.0.12'
  }),
  {
    name: 'MuhaMeds groov EPIC 01',
    plcModel: 'Opto 22 groov EPIC PR1',
    serialNumber: null,
    firmwareVersion: '3.5.1-b.85',
    localIpAddress: '192.168.1.10',
    tunnelIp: '172.28.0.12'
  }
);
assert.equal(parseUpdatePlcInput({ name: '', plcModel: 'Opto 22 groov EPIC PR1' }), null);
assert.equal(parseUpdatePlcInput({ name: 'PLC', plcModel: 'PR1', tunnelIp: '172.28.0.999' }), null);
assert.equal(parseUpdatePlcInput({ name: 'PLC', plcModel: 'PR1', localIpAddress: 'not-an-ip' }), null);

const owner = user('owner');
const operator = user('operator');
const viewer = user('viewer');
const otherOwner = user('owner', 'org-other');

assert.equal(canManageSiteEquipment(owner, 'org-permacool'), true);
assert.equal(canManageSiteEquipment(operator, 'org-permacool'), true);
assert.equal(canManageSiteEquipment(viewer, 'org-permacool'), false);
assert.equal(canManageSiteEquipment(otherOwner, 'org-permacool'), false);
assert.equal(canIssueVpnProfile(owner, 'org-permacool'), true);
assert.equal(canIssueVpnProfile(operator, 'org-permacool'), false);

const repository = read('server/repositories/provisioning.ts');
const updateBody = repository.slice(
  repository.indexOf('export async function updateProvisionedDevice'),
  repository.indexOf('export async function updateProvisionedSiteAddress')
);
assert.match(updateBody, /deviceWhere\(actor\)/);
assert.match(updateBody, /canManageSiteEquipment\(actor, device\.site\.organizationId\)/);
assert.match(updateBody, /canIssueVpnProfile\(actor, device\.site\.organizationId\)/);
assert.match(updateBody, /transaction\.device\.update/);
assert.match(updateBody, /vpnEnrollment:[\s\S]*update:[\s\S]*localIpAddress:[\s\S]*tunnelIp:/);
assert.doesNotMatch(updateBody, /identity:\s*input/);
assert.doesNotMatch(updateBody, /profileStatus:\s*input/);
assert.doesNotMatch(updateBody, /vpnServerHost:\s*input/);
assert.doesNotMatch(updateBody, /lastProfileIssuedAt:\s*input/);

const route = read('app/api/provisioning/devices/[deviceid]/route.ts');
assert.match(route, /export async function PATCH/);
assert.doesNotMatch(route, /export async function (?:GET|POST|DELETE)/);
assert.match(route, /parseUpdatePlcInput/);
assert.match(route, /updateProvisionedDevice\(deviceid, input, user\)/);
assert.match(route, /ProvisioningTunnelIpPermissionError/);
assert.match(route, /error\.code === 'P2002'/);

const workspace = read('components/provisioning-workspace.tsx');
assert.match(workspace, /Edit PLC/);
assert.match(workspace, /Save PLC/);
assert.match(workspace, /onSubmit=\{\(event\) => saveDeviceEdit/);
assert.match(workspace, /method: 'PATCH'/);
assert.match(workspace, /disabled=\{!canIssueForSite\}/);
assert.match(workspace, /VPN identity and profile remain unchanged/);
const effectBodies = [...workspace.matchAll(/useEffect\(\(\) => \{([\s\S]*?)\}, \[/g)].map((match) => match[1]);
assert.equal(effectBodies.some((body) => /saveDeviceEdit|method:\s*'PATCH'/.test(body)), false);

console.log('Provisioning PLC edit checks passed for explicit saves, organization scope, role enforcement, and VPN credential preservation.');
}

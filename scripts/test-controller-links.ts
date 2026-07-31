// @ts-nocheck
{
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  groovManageUrl,
  groovManageUrlForDevices,
  nodeRedUrlForDevices
} = require(path.join(__dirname, '..', 'lib', 'controller-links.ts'));

const salinas = {
  name: 'Sanitized Site A groov EPIC',
  protocol: 'HTTPS / Node-RED',
  vpnIdentity: 'sanitized-site-a-epic-01',
  vpnTunnelIp: '172.28.200.10'
};
const cannonFalls = {
  name: 'Sanitized Site B groov EPIC',
  protocol: 'HTTPS / Node-RED',
  vpnIdentity: 'cannon-falls-groov-epic-01',
  vpnTunnelIp: '172.28.200.11'
};

assert.equal(groovManageUrl(salinas.name, salinas.vpnTunnelIp), 'https://172.28.200.10/manage/');
assert.equal(groovManageUrlForDevices([salinas]), 'https://172.28.200.10/manage/');
assert.equal(nodeRedUrlForDevices([salinas]), 'https://172.28.200.10/node-red/');
assert.equal(
  nodeRedUrlForDevices([cannonFalls]),
  'https://172.28.200.11/node-red/#flow/a39a54de197f6707'
);

assert.equal(groovManageUrl('Generic PLC', '172.28.0.12'), null);
assert.equal(groovManageUrl('groov EPIC', null), null);
assert.equal(groovManageUrl('groov EPIC', '35.243.46.137'), null);
assert.equal(groovManageUrl('groov EPIC', '172.27.236.2'), null);
assert.equal(groovManageUrl('groov EPIC', '172.28.0.999'), null);
assert.equal(nodeRedUrlForDevices([{ ...salinas, protocol: 'HTTPS' }]), null);
assert.equal(nodeRedUrlForDevices([{ ...salinas, vpnTunnelIp: null }]), null);

const sitePages = [
  'app/(ops)/sites/[siteid]/page.tsx',
  'app/(ops)/sites/[siteid]/specs/page.tsx',
  'app/(ops)/sites/[siteid]/connectivity/page.tsx',
  'app/(ops)/sites/[siteid]/events/page.tsx'
];

for (const relativePath of sitePages) {
  const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  assert.match(source, /getSite\(user, siteI[dD]\)/);
  assert.match(source, /getDevicesBySite\(user, site\.id\)/);
  assert.match(source, /controllerManageUrl=\{controllerManageUrl\}/);
  assert.match(source, /nodeRedUrl=\{nodeRedUrl\}/);
}

const navigation = fs.readFileSync(
  path.join(__dirname, '..', 'components', 'site-section-nav.tsx'),
  'utf8'
);
assert.match(navigation, /rel="noopener noreferrer"/);
assert.match(navigation, /groov Manage not configured/);
assert.match(navigation, /Node-RED not configured/);
assert.match(navigation, /aria-disabled="true"/);
assert.doesNotMatch(navigation, /password|credential|certificate|private.?key|api.?token|\.ovpn/i);

console.log('Controller links passed VPN-address validation, missing-data handling, and authorized site-device scoping checks.');
}

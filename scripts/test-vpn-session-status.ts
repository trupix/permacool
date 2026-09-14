// @ts-nocheck
{
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { validVpnSessionStatus } = require('../lib/equipment/vpn-session-status.ts');
const { connectionIconState } = require('../lib/equipment/connection-icon-state.ts');
const now=Date.now();
const fresh={source:'openvpn-session',state:'connected',observedAt:new Date(now).toISOString()};
assert.equal(validVpnSessionStatus(fresh,now).state,'connected');
assert.equal(validVpnSessionStatus({...fresh,state:'disconnected'},now).state,'disconnected');
for(const value of [null,{}, {...fresh,source:'pac'}, {...fresh,observedAt:'bad'},
  {...fresh,observedAt:new Date(now-60001).toISOString()}, {...fresh,observedAt:new Date(now+5001).toISOString()}]) {
  assert.equal(validVpnSessionStatus(value,now).state,'unknown');
}
const stage={id:'vpn',source:'openvpn-session',state:'healthy',observedAt:fresh.observedAt};
assert.equal(connectionIconState(stage,now),'connected');
assert.equal(connectionIconState({...stage,state:'fault'},now),'disconnected');
assert.equal(connectionIconState(stage,now+60001),'checking');
assert.equal(connectionIconState({...stage,source:undefined},now),'checking');
const route=fs.readFileSync('app/api/sites/[siteid]/vpn-status/route.ts','utf8');
assert(route.includes('siteWhere(user)') && route.includes('deviceWhere(user)'));
assert(route.indexOf('getCurrentUser()') < route.indexOf('readVpnSessionStatus(identities)'));
assert(!/\.(create|update|upsert|delete)\(/.test(route));
console.log('VPN freshness, evidence, read-only and authorization guard tests passed.');
}

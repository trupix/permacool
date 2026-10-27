// @ts-nocheck
{
const assert = require('node:assert/strict');
const { resolveControllerConnectionPath } = require('../lib/equipment/controller-connection-path.ts');
const { connectionIconState } = require('../lib/equipment/connection-icon-state.ts');
const deviceId = 'epic-golddrop-golddrop-epic-01-4oic';
const now = Date.parse('2026-10-26T22:00:00Z');
const point = (key, latestValue, age=0, id=deviceId) => ({deviceId:id,key,latestValue,latestTimestamp:new Date(now-age).toISOString()});
const live = [point('controller_heartbeat',88),point('node_red_pac_read_ok',1),point('pac_strategy_running',1)];
const report = (age=1800000,value=1) => [point('pac_io_communication_ok',value,age),point('pac_io_diagnostic_sequence',2,age),point('pac_io_check_reason',2,age),point('pac_io_last_check_age_seconds',0,age)];
const resolve = (points,ids=[deviceId]) => resolveControllerConnectionPath({points,deviceIds:ids,referenceTimestamp:new Date(now).toISOString(),feedStatus:'ready'});
const io = (points,ids) => resolve(points,ids).stages.find(s=>s.id==='io');
let s=io([...live,...report()]);
assert.equal(s.state,'healthy');assert.match(s.detail,/30 minute/);assert.equal(connectionIconState(s,now),'connected');
assert.equal(connectionIconState(s,now+45001),'checking');
assert.equal(io([...live,...report(3660000)]).state,'healthy');
assert.equal(io([...live,...report(3660001)]).state,'stale');
assert.equal(io([...live,...report(1800000,0)]).state,'fault');
assert.equal(io([...live,...report(1800000,-1)]).state,'checking');
assert.equal(io(report()).state,'stale');
assert.equal(io([...live.slice(0,2),point('pac_strategy_running',0),...report()]).state,'stale');
assert.equal(io([...live,point('pac_io_communication_ok',1,1800000)]).state,'stale');
assert.equal(io([...live,...report(-61000)]).state,'stale');
assert.equal(io([...live,...report()].map(p=>({...p,deviceId:'other'})),['other']).state,'stale');
const mixed=report();mixed[1]={...mixed[1],latestTimestamp:new Date(now).toISOString()};
assert.equal(io([...live,...mixed]).state,'stale');
assert.equal(resolve(report()).stages.find(s=>s.id==='delivery').state,'stale');
assert.doesNotThrow(()=>io([...live,...report().map(p=>({...p,latestTimestamp:'invalid'}))]));
console.log('Hourly I/O scope, age, live-evidence and icon expiry checks passed.');
}

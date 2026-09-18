const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const body = fs.readFileSync(require('node:path').join(__dirname,'../gateway/healthio-map.js.txt'),'utf8');
const store = new Map();
const run = (payload,error) => vm.runInNewContext('(function(){'+body+'})()', {msg:{payload,error},context:{get:k=>store.get(k),set:(k,v)=>store.set(k,v)}});
const healthy = seq => [1,seq,1,1,0,0,0,0,-1879048172,1610612737,123,120,1,1];
const value = r => r?.payload[0].value;
assert.equal(value(run(healthy(2))),-1);
assert.equal(value(run(healthy(4))),1);
assert.equal(run(healthy(4)),null);
assert.equal(value(run(healthy(5))),-1);
assert.equal(value(run(healthy(6))),-1);
assert.equal(value(run(healthy(8))),1);
for (const [index,v,expected] of [[2,2,0],[2,3,0],[4,1,-1],[12,2,0],[5,-1,-1],[0,2,-1]]) {
 store.clear(); run(healthy(2)); const a=healthy(4); a[index]=v; assert.equal(value(run(a)),expected);
}
assert.equal(value(run(null)),-1);
assert.equal(value(run(healthy(10),true)),-1);
store.clear(); run(healthy(2000000000)); assert.equal(value(run(healthy(2))),1);
assert.equal(body.includes('io_channel_fault_count'),false);
console.log('HealthIO mapping tests passed: freshness, sequence, faults, simulation, schema, errors, rollover.');

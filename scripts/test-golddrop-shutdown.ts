{
const assert = require('node:assert/strict');
const {evaluateEquipmentTransitions: evaluate} = require('../server/equipment-events.ts');
const at = Date.parse('2026-11-12T16:09:35.123Z');
const points = (overrides = {}) => Object.entries({reason:1, sequence:3, at_ms:at, elapsed_sec:2100, limit_sec:2100, ...overrides})
  .map(([k,v])=>({key:`ch1_shutdown_${k}`,value:v,unit:'number'}));
const base = {siteId:'site-golddrop',siteName:'GoldDrop',deviceId:'epic-golddrop-golddrop-epic-01-4oic',capturedAt:new Date(at+15000),previous:[],incoming:points()};
const first=evaluate(base).events;
assert.equal(first.length,1); assert.equal(first[0].eventType,'pump_off_timeout');
assert.equal(first[0].occurredAt.getTime(),at); assert.match(first[0].message,/35 minutes/);
assert.equal(first[0].processTemperature,null);
assert.equal(evaluate({...base,previous:points()}).events[0].dedupeKey,first[0].dedupeKey);
assert.equal(evaluate({...base,siteId:'site-cannon-falls'}).events.length,0);
assert.equal(evaluate({...base,incoming:points({at_ms:NaN})}).events.length,0);
assert.equal(evaluate({...base,incoming:points({at_ms:at+120000})}).events.length,0);
assert.equal(evaluate({...base,incoming:points({sequence:0})}).events.length,0);
assert.equal(evaluate({...base,incoming:points({elapsed_sec:2099})}).events.length,0);
assert.equal(evaluate({...base,incoming:points({reason:2,elapsed_sec:43200,limit_sec:43200})}).events[0].eventType,'compressor_runtime_limit');
assert.equal(evaluate({...base,incoming:points().slice(1)}).events.length,0);
console.log('GoldDrop retained shutdown reporting tests passed (no network requests).');
}

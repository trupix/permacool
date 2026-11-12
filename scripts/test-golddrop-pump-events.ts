{
const assert = require('node:assert/strict');
const {evaluateEquipmentTransitions: evaluate} = require('../server/equipment-events.ts');
const point = value => [{key:'golddrop_liquid_pump_on', value, unit:'bool'}];
const base = {siteId:'site-golddrop',siteName:'GoldDrop',deviceId:'epic-golddrop-golddrop-epic-01-4oic',capturedAt:new Date('2026-11-12T22:45:00Z'),previous:point(0),incoming:point(1)};
assert.equal(evaluate(base).events[0].eventType,'liquid_pump_on');
assert.equal(evaluate({...base,previous:point(1),incoming:point(0)}).events[0].eventType,'liquid_pump_off');
for (const value of [-1,2,NaN,Infinity]) {
 assert.equal(evaluate({...base,incoming:point(value)}).events.length,0);
 assert.equal(evaluate({...base,previous:point(value)}).events.length,0);
}
for (const override of [{previous:[]},{incoming:[]},{previous:point(1)},{siteId:'site-cannon-falls'},{deviceId:'other'}])
 assert.equal(evaluate({...base,...override}).events.length,0);
assert.equal(evaluate(base).events[0].processTemperature,null);
assert.equal(evaluate(base).alertActions.length,0);
console.log('GoldDrop pump transition tests passed; no network or equipment writes.');
}

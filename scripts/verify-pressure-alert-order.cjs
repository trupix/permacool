// Uses only test-ingest-diagnostics' loopback website and disposable PostgreSQL database.
const assert = require('node:assert/strict');
module.exports = async function verifyPressureAlertOrder({db, deviceId, siteId, payload, post}) {
  const key = {CH1:'ch1_high_pressure_stop',CH2:'ch2_high_pressure_stop',SYSTEM:'high_pressure_stop'};
  const id = ch => 'high-pressure-stop:'+siteId+':'+deviceId+':'+ch;
  const at = t => new Date(payload(t).capturedAt);
  const read = ch => db.alert.findUnique({where:{id:id(ch)}});
  const events = (ch,type,t) => db.equipmentEvent.findMany({where:{siteId,deviceId,channel:ch,eventType:type,occurredAt:at(t)}});
  const send = async (t,values) => {
    const points = Object.entries(values).map(([ch,value])=>({key:key[ch] || ch,value,unit:'bool'}));
    const res = await post({...payload(t),points});
    assert.equal(res.status,200);
    const ack = await res.json();
    assert.equal(ack.persisted,true); assert.equal(ack.eventsPersisted,true);
  };
  const state = async (ch,status,start,end=null) => {
    const alert=await read(ch);
    assert.equal(alert?.status,status,ch+' active alert followed arrival order');
    assert.deepEqual(alert.startedAt,at(start)); assert.deepEqual(alert.endedAt,end===null?null:at(end));
  };
  await send(100,{CH1:0,CH2:0});
  await send(105,{CH1:1});
  await state('CH1','open',105);
  await send(104,{CH1:0}); // older clear arrives after newer trip
  assert.equal((await events('CH1','high_pressure_cleared',104)).length,1);
  assert.equal(await db.telemetrySample.count({where:{deviceId,key:key.CH1,value:0,capturedAt:at(104)}}),1);
  await state('CH1','open',105);
  const point=await db.telemetryPoint.findUniqueOrThrow({where:{deviceId_key:{deviceId,key:key.CH1}}});
  assert.equal(point.latestValue,1); assert.deepEqual(point.latestTimestamp,at(105));
  await send(104,{CH1:0}); // timeline entry must not be duplicated
  assert.equal((await events('CH1','high_pressure_cleared',104)).length,1);
  await db.alert.update({where:{id:id('CH1')},data:{status:'acknowledged'}});
  await send(111,{CH1:1});
  await send(110,{CH1:0,CH2:1}); // older than the last active reading, newer than the alert start
  await send(111,{CH1:0}); // contradictory equal-time reading
  await state('CH1','acknowledged',105); await state('CH2','open',110);
  await send(112,{CH1:0}); await state('CH1','resolved',105,112);
  await send(109,{CH1:1}); await state('CH1','resolved',105,112);
  await send(113,{CH1:1}); await state('CH1','open',113);
  await send(114,{CH1:0,CH2:0,SYSTEM:0});
  await send(113,{SYSTEM:1}); assert.equal(await read('SYSTEM'),null);
  await send(116,{SYSTEM:1}); await send(115,{SYSTEM:0}); await state('SYSTEM','open',116);
  assert.equal((await events('SYSTEM','high_pressure_cleared',115)).length,1);
  await send(117,{SYSTEM:0}); await state('SYSTEM','resolved',116,117);
  await send(118,{SYSTEM:1,CH2:1}); // channel-specific trip, no duplicate system alert
  await state('CH2','open',118); await state('SYSTEM','resolved',116,117);
  await send(120,{CH1:1});
  await send(119,{'CH1-High-Pressure-Stop':0});
  await state('CH1','open',120);
  await Promise.all([send(123,{CH1:0}),send(124,{CH1:1})]);
  assert.equal((await read('CH1')).status,'open');
  await Promise.all([send(125,{CH1:1}),send(126,{CH1:0})]);
  assert.equal((await read('CH1')).status,'resolved'); assert.deepEqual((await read('CH1')).endedAt,at(126));
  console.log('PASS: delayed clear retained exactly once on timeline, live alarm protected; newer clear and reopen, acknowledgment, ties, aliases, concurrent uploads and channel/system isolation verified.');
};

// Only called by the isolated HTTP/PostgreSQL fixture. Never run against a deployed site.
const assert = require('node:assert/strict');
module.exports = async function verifyTimelineRecovery({db,deviceId,siteId,payload,post,records,until}) {
  const signal=(t,on,pressure)=>({...payload(t),points:[
    {key:'ch1_chiller_run',value:on,unit:'bool'},{key:'ch1_high_pressure',value:pressure,unit:'psi'}
  ]});
  const origin=signal(301,1,184), later=signal(302,1,202);
  const rows=()=>db.equipmentEvent.findMany({where:{siteId,deviceId,occurredAt:new Date(origin.capturedAt)}});
  const samples=()=>db.telemetrySample.findMany({where:{deviceId,capturedAt:new Date(origin.capturedAt)},orderBy:{id:'asc'}});
  const send=async packet=>{const r=await post(packet);return {status:r.status,retryAfter:r.headers.get('retry-after'),body:await r.json()}};
  assert.equal((await send(signal(300,0,170))).status,200);
  // Real DB failure on the timeline write only. The upload and latest reading still commit.
  await db.$executeRaw`ALTER TABLE "EquipmentEvent" ADD CONSTRAINT local_timeline_unavailable CHECK ("eventType" <> 'compressor_started') NOT VALID`;
  let failed,originalSamples;
  try {
    failed=await send(origin);
    assert.equal(failed.body.persisted,true);
    assert.equal(failed.body.eventsPersisted,false);
    originalSamples=await samples(); assert.equal(originalSamples.length,2); assert.equal((await rows()).length,0);
    const next=await send(later); assert.equal(next.body.persisted,true);
    const current=await db.telemetryPoint.findUniqueOrThrow({where:{deviceId_key:{deviceId,key:'ch1_high_pressure'}}});
    assert.equal(current.latestValue,202);
  } finally { await db.$executeRaw`ALTER TABLE "EquipmentEvent" DROP CONSTRAINT local_timeline_unavailable`; }
  const acks=await Promise.all([send(origin),send(origin)]);
  const recovered=await rows();
  assert.equal(recovered.length,1,'retry must restore exactly one original event after the live state has advanced');
  assert.equal(recovered[0].eventType,'compressor_started'); assert.equal(recovered[0].highPressure,184);
  assert.equal(recovered[0].channel,'CH1'); assert.equal(recovered[0].occurredAt.toISOString(),origin.capturedAt);
  assert.equal(failed.status,503); assert.equal(failed.retryAfter,'15'); assert.equal(failed.body.ok,false);
  for(const a of acks){assert.equal(a.status,200);assert.equal(a.body.eventsPersisted,true);assert.equal(a.body.historyRowsInserted,0);}
  assert.equal((await send(origin)).status,200); assert.deepEqual(await samples(),originalSamples); assert.deepEqual(await rows(),recovered);
  assert.equal(await db.timelinePendingBatch.count({where:{siteId,deviceId}}),0);
  await until(()=>records().filter(r=>r.capturedAt===origin.capturedAt).length===4,'timeline recovery logs');
  const logs=records().filter(r=>r.capturedAt===origin.capturedAt);
  assert.equal(logs.filter(r=>r.outcome==='partial').length,1);
  assert.equal(logs.reduce((sum,r)=>sum+(r.timelineEventsInserted||0),0),1);
  console.log('PASS: readings committed while timeline insert failed; concurrent retries recovered the original compressor start once, with its original time and pressure; repeated replay added no readings or events.');

  const systems=(t,on)=>({...payload(t),points:[1,2].map(n=>({key:'ch'+n+'_system_on',value:on,unit:'bool'}))});
  await send(systems(310,0));
  const both=systems(311,1), where={siteId,deviceId,occurredAt:new Date(both.capturedAt)};
  await db.$executeRaw`ALTER TABLE "EquipmentEvent" ADD CONSTRAINT local_ch2_event_unavailable CHECK (channel <> 'CH2' OR "eventType" <> 'system_on') NOT VALID`;
  try {
    assert.equal((await send(both)).status,503);
    assert.equal(await db.equipmentEvent.count({where}),0);
    const q=await db.timelinePendingBatch.findFirstOrThrow({where:{siteId,deviceId}});
    assert.equal(q.drafts.length,2);
  } finally { await db.$executeRaw`ALTER TABLE "EquipmentEvent" DROP CONSTRAINT local_ch2_event_unavailable`; }
  // Another device must not drain this device's queue.
  const peer=await db.device.create({data:{siteId,id:deviceId+'-peer',name:'Peer',plcModel:'fixture',protocol:'fixture'}});
  assert.equal((await send({...payload(312),deviceId:peer.id})).status,200);
  assert.equal(await db.equipmentEvent.count({where}),0);
  // A pre-existing event is confirmation, not permission to duplicate or rewrite it.
  const existing=await db.equipmentEvent.create({data:{...where,channel:'CH1',eventType:'system_on',message:'Existing entry',
    dedupeKey:[siteId,deviceId,'CH1','system_on',both.capturedAt].join(':')}});
  const heartbeat=await send(payload(313)); assert.equal(heartbeat.status,200);
  assert.equal(await db.equipmentEvent.count({where}),2);
  assert.deepEqual(await db.equipmentEvent.findUniqueOrThrow({where:{id:existing.id}}),existing);
  assert.equal(await db.timelinePendingBatch.count({where:{siteId,deviceId}}),0);
  assert.equal((await send(both)).status,200); assert.equal(await db.equipmentEvent.count({where}),2);

  // A failed outbox write must roll back the readings too, so the edge remains detectable.
  const off=systems(314,0);
  await db.$executeRaw`ALTER TABLE "TimelinePendingBatch" ADD CONSTRAINT local_queue_unavailable CHECK (false) NOT VALID`;
  try {
    assert.equal((await send(off)).status,500);
    assert.equal(await db.telemetrySample.count({where:{deviceId,capturedAt:new Date(off.capturedAt)}}),0);
    assert.equal((await db.telemetryPoint.findUniqueOrThrow({where:{deviceId_key:{deviceId,key:'ch1_system_on'}}})).latestValue,1);
  } finally { await db.$executeRaw`ALTER TABLE "TimelinePendingBatch" DROP CONSTRAINT local_queue_unavailable`; }
  assert.equal((await send(off)).status,200);
  assert.equal(await db.equipmentEvent.count({where:{siteId,deviceId,occurredAt:new Date(off.capturedAt),eventType:'system_off'}}),2);
  console.log('PASS: later ordinary upload recovered a multi-event batch without rewriting an existing event; devices isolated; failed outbox write rolled back readings and recovered on retry.');
};

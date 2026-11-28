// Only invoked by the loopback HTTP / disposable PostgreSQL harness.
const assert = require('node:assert/strict');
module.exports = async function verifyHistoryRetries({db, deviceId, siteId, payload, post, records, until}) {
  const p = (key,value,unit) => ({key:'retry_'+key,value,unit});
  const readings=[p('temperature',-38,'F'),p('pressure',150,'psi'),p('pressure',150,'psi')];
  const batch=(t,points=readings)=>({...payload(t),points});
  const send=async packet=>{
    const r=await post(packet); assert.equal(r.status,200);
    const ack=await r.json(); assert.equal(ack.persisted,true); assert.equal(ack.pointCount,packet.points.length);
    return ack;
  };
  const rows=(t,d=deviceId)=>db.telemetrySample.findMany({where:{deviceId:d,capturedAt:new Date(payload(t).capturedAt)},orderBy:{id:'asc'}});
  const tuple=r=>JSON.stringify([r.key,r.value,r.unit]);
  const assertPoints=(actual,expected)=>assert.deepEqual(actual.map(tuple).sort(),expected.map(tuple).sort());
  const first=await send(batch(200)), before=await rows(200);
  const retry=await send(batch(200));
  assert.equal((await rows(200)).length,3,'Retry must not double the number of readings');
  assert.deepEqual(await rows(200),before,'IDs, values and original receipt dates must remain untouched');
  assertPoints(before,readings);
  assert.equal(first.historyRowsInserted,3); assert.equal(retry.historyRowsInserted,0);
  assert.equal(retry.historyRowsAlreadySaved,3);
  const reordered=batch(200,[...readings].reverse());
  reordered.capturedAt=reordered.capturedAt.replace('Z','+00:00');
  assert.equal((await send(reordered)).historyRowsInserted,0);
  const later=await send(batch(215)); assert.equal(later.historyRowsInserted,3); assertPoints(await rows(215),readings);
  const fine=batch(220), baseTime=fine.capturedAt;
  fine.capturedAt=baseTime.replace('.000Z','.0001Z'); assert.equal((await send(fine)).historyRowsInserted,3);
  fine.capturedAt=baseTime.replace('.000Z','.00020Z'); assert.equal((await send(fine)).historyRowsInserted,3);
  fine.capturedAt=baseTime.replace('.000Z','.0002+00:00'); assert.equal((await send(fine)).historyRowsInserted,0);
  assertPoints(await rows(220),[...readings,...readings]);
  const concurrent=await Promise.all([send(batch(230)),send(batch(230)),send(batch(230,[...readings].reverse()))]);
  assert.deepEqual(concurrent.map(r=>r.historyRowsInserted).sort(),[0,0,3]); assertPoints(await rows(230),readings);
  const changed=[readings[0],p('pressure',149,'psi'),readings[2]];
  assert.equal((await send(batch(200,changed))).historyRowsInserted,3,'Different batch at the same capture time');
  assertPoints(await rows(200),[...readings,...changed]);
  await db.device.create({data:{id:deviceId+'-other',siteId,name:'Second fixture',plcModel:'none',protocol:'fixture'}});
  assert.equal((await send({...batch(200),deviceId:deviceId+'-other'})).historyRowsInserted,3);
  assertPoints(await rows(200,deviceId+'-other'),readings);

  // The old writer used random IDs and one database receipt time for the whole transaction.
  await db.telemetrySample.createMany({data:readings.map(r=>({...r,deviceId,capturedAt:new Date(payload(190).capturedAt)}))});
  const legacy=await rows(190);
  assert.equal((await send(batch(190))).historyRowsInserted,0);
  assert.deepEqual(await rows(190),legacy);
  assert.equal((await send(batch(190,changed))).historyRowsInserted,3);
  assertPoints(await rows(190),[...readings,...changed]);
  // Separate partial legacy receipts must not masquerade as one complete batch.
  await db.telemetrySample.createMany({data:readings.map((r,i)=>({...r,deviceId,capturedAt:new Date(payload(180).capturedAt),
    receivedAt:new Date(payload(i===0?180:181).capturedAt)}))});
  assert.equal((await send(batch(180))).historyRowsInserted,3); assertPoints(await rows(180),[...readings,...readings]);
  assert.equal((await send(batch(180))).historyRowsInserted,0);
  // Fail after the history INSERT, before commit. No successful receipt may survive rollback.
  const rollbackPacket=batch(245,[p('rollback_only',42,'F')]);
  await db.$executeRaw`ALTER TABLE "TelemetryPoint" ADD CONSTRAINT local_retry_test CHECK (key <> 'retry_rollback_only') NOT VALID`;
  try {
    assert.equal((await post(rollbackPacket)).status,500);
    assert.deepEqual(await rows(245),[]);
  } finally {
    await db.$executeRaw`ALTER TABLE "TelemetryPoint" DROP CONSTRAINT local_retry_test`;
  }
  assert.equal((await send(rollbackPacket)).historyRowsInserted,1); assert.equal((await send(rollbackPacket)).historyRowsInserted,0);
  assertPoints(await rows(245),rollbackPacket.points);
  await until(()=>records().filter(l=>l.capturedAt===payload(230).capturedAt).length===3,'three committed retry receipts');
  const logs=records().filter(l=>l.capturedAt===payload(230).capturedAt);
  assert.equal(new Set(logs.map(l=>l.batchId)).size,1);
  assert.deepEqual(logs.map(l=>l.historyRowsInserted).sort(),[0,0,3]);
  assert.deepEqual(logs.map(l=>l.historyRowsAlreadySaved).sort(),[0,3,3]);
  console.log('PASS: 3 readings sent twice = 3 stored; identical readings at a later time = 3 more. Reordered/concurrent retries, repeated points, changed contents, separate devices and pre-release history verified.');
};

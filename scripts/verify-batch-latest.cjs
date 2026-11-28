// Invoked only by the loopback-only HTTP + PostgreSQL fixture.
const assert = require('node:assert/strict');
module.exports = async function verifyBatchLatest({db, blocker, deviceId, payload, post, until, deferred}) {
  const expected = [];
  const make = (key, value, unit='F') => ({key:'bulk_'+key, value, unit});
  const submit = async (i, points) => {
    const packet = {...payload(i), points};
    const res = await post(packet);
    assert.equal(res.status, 200);
    const ack = await res.json();
    assert.equal(ack.persisted, true); assert.equal(ack.pointCount, points.length);
    expected.push(...points.map(p => [packet.capturedAt, p.key, p.value, p.unit]));
  };
  const get = key => db.telemetryPoint.findUniqueOrThrow({where:{deviceId_key:{deviceId,key:'bulk_'+key}}});
  const points = (v,u) => Array.from({length:35},(_,i)=>make('sensor_'+i,v+i,u));
  await submit(20,points(100,'F'));
  const original = await get('sensor_0');
  await db.telemetryPoint.update({where:{id:original.id},data:{label:'Custom sensor label'}});
  await submit(25,points(200,'psi'));
  await submit(15,points(-100,'F')); // Backfill all 35, with different values AND units.
  let rows=await db.telemetryPoint.findMany({where:{deviceId,key:{startsWith:'bulk_sensor_'}}});
  assert.equal(rows.length,35);
  for(const r of rows){
    assert.equal(r.latestValue,200+Number(r.key.slice('bulk_sensor_'.length)));
    assert.equal(r.unit,'psi'); assert.equal(r.latestTimestamp.toISOString(),payload(25).capturedAt);
  }
  assert.equal((await get('sensor_0')).id,original.id);
  assert.equal((await get('sensor_0')).label,'Custom sensor label');
  assert.equal((await db.device.findUniqueOrThrow({where:{id:deviceId}})).lastSeenAt.toISOString(),payload(25).capturedAt);

  await submit(22,[make('sensor_0',-7),make('first_seen',1),make('first_seen',2)]);
  assert.equal((await get('first_seen')).latestValue,2); // history retains both values
  await submit(25,[make('sensor_0',-9)]); // same timestamp: keep the first accepted current value
  assert.equal((await get('sensor_0')).latestValue,200);
  await Promise.all([submit(40,[make('sensor_1',400)]),submit(35,[make('sensor_1',350)])]);
  assert.equal((await get('sensor_1')).latestValue,400);
  assert.equal((await db.device.findUniqueOrThrow({where:{id:deviceId}})).lastSeenAt.toISOString(),payload(40).capturedAt);

  // Force a genuine row-lock race: a newer value commits *after* the HTTP upload
  // has read the old snapshot and is blocked on the conflicting current-value row.
  const locked=deferred(),release=deferred();
  const lockTask=blocker.$transaction(async tx=>{
    const [r]=await tx.$queryRaw`SELECT pg_backend_pid() AS pid`;
    await tx.telemetryPoint.update({where:{id:original.id},data:{latestValue:600,latestTimestamp:new Date(payload(60).capturedAt)}});
    locked.resolve(r.pid); await release.promise;
  },{timeout:20000});
  let pending;
  try {
    const pid=await Promise.race([locked.promise,lockTask]);
    pending=submit(50,[make('sensor_0',500)]);
    await until(async()=>{const [r]=await db.$queryRaw`SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE ${pid}::int = ANY(pg_blocking_pids(pid))) AS blocked`;return r.blocked},'concurrent latest-row conflict');
  } finally { release.resolve(); await Promise.all([lockTask,pending]); }
  assert.equal((await get('sensor_0')).latestValue,600);
  assert.equal((await get('sensor_0')).latestTimestamp.toISOString(),payload(60).capturedAt);
  const history=await db.telemetrySample.findMany({where:{deviceId,key:{startsWith:'bulk_'}}});
  const canonical = list => list.map(row=>JSON.stringify(row)).sort();
  assert.deepEqual(canonical(history.map(r=>[r.capturedAt.toISOString(),r.key,r.value,r.unit])),canonical(expected));
  console.log('PASS: all '+history.length+' history rows matched exactly; delayed, duplicate-key, equal-time and concurrent writes preserved current values, metadata and freshness.');
};

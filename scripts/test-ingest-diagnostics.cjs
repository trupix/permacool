// End-to-end against a built Next server and a disposable, loopback-only PostgreSQL fixture.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { randomUUID } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const url = new URL(process.env.INGEST_TEST_DATABASE_URL || 'file:///missing');
assert(url.protocol === 'postgresql:' && url.hostname === '127.0.0.1' && url.username === 'trace_fixture'
  && url.searchParams.get('connection_limit') === '1' && url.searchParams.get('pool_timeout') === '1',
  'Supply an explicitly disposable local database owned by trace_fixture, with one connection and a one-second pool timeout.');
const db = new PrismaClient({datasourceUrl:url.href}), blocker = new PrismaClient({datasourceUrl:url.href});
const token = randomUUID(), orgId = 'fixture-'+randomUUID(), siteId = 'site-'+orgId, deviceId = 'device-'+orgId;
const port = 31789, base = 'http://127.0.0.1:'+port;
const delay = ms => new Promise(r=>setTimeout(r,ms));
const deferred = () => { let resolve; const promise = new Promise(r=>{resolve=r}); return {promise,resolve}; };
let server, output='', lockTask, created=false; const release=deferred();
const payload = i => ({gatewayId:'fixture',siteId,deviceId,capturedAt:new Date(1700000000000+i*1000).toISOString(),points:[{key:'fixture_temperature',value:31.234567,unit:'F'}]});
const post = (p,auth=token) => fetch(base+'/api/ingest/telemetry',{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),
  headers:{'content-type':'application/json','x-telemetry-token':auth},body:JSON.stringify(p)});
const records = () => output.split(/\r?\n/).flatMap(l=>{try{const p=JSON.parse(l);return p.event==='telemetry.upload'?[p]:[]}catch{return []}});
async function until(fn,desc) {for(let i=0;i<90;i++){if(await fn())return;await delay(100)}throw Error('Timed out: '+desc)}
(async()=>{
  await db.organization.create({data:{id:orgId,name:'Local isolated fixture',sites:{create:{id:siteId,name:'Fixture',region:'local',timezone:'UTC',
    devices:{create:{id:deviceId,name:'test',plcModel:'none',protocol:'fixture'}}}}}});created=true;
  server=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',String(port)],{
    windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,NODE_ENV:'production',DATABASE_URL:url.href,DIRECT_URL:url.href,TELEMETRY_INGEST_TOKEN:token,
      NEXT_PUBLIC_APP_URL:base,DEFAULT_ORGANIZATION_ID:orgId,AUTH_PROVIDER:'local'}});
  server.stdout.on('data',b=>output+=b);server.stderr.on('data',b=>output+=b);
  await until(()=>output.includes('Ready') || output.includes('Local:'),'local website startup');
  assert.equal((await post(payload(0),'invalid')).status,401);
  assert.equal((await post({...payload(0),points:[{key:'fixture_temperature',value:null,unit:'F'}]})).status,400);
  assert.equal((await post({...payload(0),deviceId:'unregistered-fixture'})).status,404);
  const ok=await post(payload(1)); assert.equal(ok.status,200); assert.equal((await ok.json()).persisted,true);
  const locked=deferred();
  lockTask=blocker.$transaction(async tx=>{
    const [r]=await tx.$queryRaw`SELECT pg_backend_pid() AS pid FROM "Site" WHERE id=${siteId} FOR UPDATE`;
    locked.resolve(r.pid); await release.promise;
  },{timeout:20000});
  const pid=await locked.promise;
  const holding=post(payload(2));
  await until(async()=>{const [r]=await db.$queryRaw`SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE ${pid}::int = ANY(pg_blocking_pids(pid))) AS blocked`;return r.blocked},'writer holding connection');
  const rejected=await post(payload(3)); assert.equal(rejected.status,500);
  release.resolve(); await lockTask;
  assert.equal((await holding).status,200);
  assert.equal(await db.telemetrySample.count({where:{deviceId,capturedAt:new Date(payload(3).capturedAt)}}),0);
  const replay=await post(payload(3));assert.equal(replay.status,200);
  assert.equal(await db.telemetrySample.count({where:{deviceId,capturedAt:new Date(payload(3).capturedAt)}}),1);
  await until(()=>records().length>=6,'structured completion logs');
  const logs=records(),fail=logs.find(l=>l.code==='P2024'),saved=logs.find(l=>l.outcome==='saved' && l.capturedAt===payload(3).capturedAt);
  const writer=logs.find(l=>l.outcome==='saved' && l.capturedAt===payload(2).capturedAt);
  const invalid=logs.find(l=>l.phase==='validation');
  assert.equal(invalid.failedPointIndex,0);assert.equal(invalid.failedPointKey,'fixture_temperature');
  assert.equal(logs.length,6);assert.equal(fail.siteId,siteId);assert.equal(fail.deviceId,deviceId);assert.equal(fail.capturedAt,payload(3).capturedAt);
  assert.deepEqual(fail.readingKeys,['fixture_temperature']);assert.equal(fail.phase,'device_lookup');assert(fail.waitMs>=900);assert.equal(fail.heldMaxMs,0);
  assert.equal(fail.batchId,saved.batchId);assert.notEqual(fail.attemptId,saved.attemptId);
  assert(writer.heldMinMs>=900 && writer.heldMaxMs>=writer.heldMinMs);assert(saved.waitMs!==null && saved.heldMaxMs!==null);
  assert(!JSON.stringify(logs).includes(token));assert(!JSON.stringify(logs).includes('31.234567'));
  console.log('PASS: 401/400/404, persisted upload, actual pool timeout, concurrent attribution, retry and stored count.');
  console.log(JSON.stringify({failedWaitMs:fail.waitMs,failedHeldMaxMs:fail.heldMaxMs,writerHeldMinMs:writer.heldMinMs,writerHeldMaxMs:writer.heldMaxMs}));
  await require('./verify-batch-latest.cjs')({db, blocker, deviceId, payload, post, until, deferred});
  await require('./verify-pressure-alert-order.cjs')({db, deviceId, siteId, payload, post});
  await require('./verify-history-retries.cjs')({db, deviceId, siteId, payload, post, records, until});
  await require('./verify-timeline-recovery.cjs')({db, deviceId, siteId, payload, post, records, until});
  await require('./verify-muhameds-event-temperatures.cjs')({db, orgId, deviceId, payload, post});
})().catch(e=>{console.error(e.message);console.error(JSON.stringify(records()));process.exitCode=1}).finally(async()=>{
  release.resolve();if(lockTask)await lockTask.catch(()=>{});
  if(server && server.exitCode===null){const exit=once(server,'exit');server.kill();await exit;}
  if(created)await db.organization.delete({where:{id:orgId}});
  await Promise.all([db.$disconnect(),blocker.$disconnect()]);
});

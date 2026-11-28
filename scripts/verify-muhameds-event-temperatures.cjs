// Runs only inside the guarded loopback HTTP/PostgreSQL fixture.
const assert = require('node:assert/strict');
module.exports = async function verifyMuhaTemps({db, orgId, deviceId, payload, post}) {
  const siteId = 'site-muhameds-los-angeles';
  const id = deviceId + '-muha';
  await db.site.create({data:{id:siteId, organizationId:orgId, name:'Muha local test', region:'local', timezone:'UTC',
    devices:{create:{id, name:'fixture', plcModel:'none', protocol:'fixture'}}}});
  const sample = (key,value,unit) => ({key,value,unit});
  const sensors = (a,b) => [sample('ch1_temperature',a,'F'),sample('ch2_temperature',b,'F')];
  const run = value => [1,2].map(n => sample('ch'+n+'_chiller_run',value,'state'));
  const send = async (t,points) => {
    const res = await post({...payload(t), siteId, deviceId:id, points});
    assert.equal(res.status,200); assert.equal((await res.json()).eventsPersisted,true);
  };
  const entries = async t => (await db.equipmentEvent.findMany({where:{siteId,deviceId:id,occurredAt:new Date(payload(t).capturedAt)},
    orderBy:{channel:'asc'}})).map(e=>[e.channel,e.eventType,e.processTemperature,e.temperatureUnit]);
  const expected = (type,a,b) => [['CH1',type,a,'°F'],['CH2',type,b,'°F']];
  await send(400,run(0));
  await send(401,sensors(-38.997177,-39.007317));
  await send(402,run(1));
  assert.deepEqual(await entries(402),expected('compressor_started',-38.997177,-39.007317));
  await send(410,sensors(-35.5,-34.25)); // Newer sensor packet arrives before the delayed stop.
  await send(405,run(0));
  assert.deepEqual(await entries(405),expected('compressor_stopped',-38.997177,-39.007317));
  await send(405,run(0));
  assert.deepEqual(await entries(405),expected('compressor_stopped',-38.997177,-39.007317));
  await send(411,[...run(1),...sensors(0,-39.123456)]);
  assert.deepEqual(await entries(411),expected('compressor_started',0,-39.123456));
  console.log('PASS: both MuhaMeds channels preserved original Fahrenheit values for split, delayed, retried and same-packet events.');
};

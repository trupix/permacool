const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('server/repositories/cycle-averages.ts','utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const end = Date.now();
const at = minutes => new Date(end + minutes*60000);
const samples = Array.from({length: 601}, (_,i) => ({ capturedAt: at(-i), value: i >= 240 && i < 300 ? 0 : 1 }));
const events = [
  [-100,'reached_temperature'],[-98,'compressor_started'],[-80,'reached_temperature'],[-76,'compressor_started'],
  [-60,'reached_temperature'],[-59,'high_pressure_stop'],[-58,'compressor_started']
].map(([m,eventType]) => ({deviceId:'d',channel:'CH1',eventType,occurredAt:at(m)}));
const db = {
  telemetryPoint: {findMany: async()=>[{deviceId:'d',key:'ch1_system_on'}]},
  telemetrySample: {findMany: async()=>samples},
  equipmentEvent: {findMany: async()=>events},
  device: {findMany: async()=>[{id:'d',name:'Test'}]}
};
const exportsObject = {};
new Function('require','exports',source)(n=>n==='next/cache'?{unstable_cache:f=>f}:n==='@/lib/db'?{db}:{shouldUseDatabase:()=>true},exportsObject);
(async()=>{
  const [row] = await exportsObject.getSiteCycleAverages('test');
  assert.equal(row.hours,8);
  assert.equal(row.off,180);
  assert.equal(row.offCount,2);
  assert.equal(row.between,1200);
  assert.equal(row.betweenCount,2);
  // Freshness gaps cannot become operating time or bridge an event pair.
  db.telemetrySample.findMany = async()=>samples.filter(s=>s.capturedAt<at(-99)||s.capturedAt>at(-95));
  const [gap] = await exportsObject.getSiteCycleAverages('test');
  assert.equal(gap.offCount,1);
  assert.equal(gap.betweenCount,1);
  console.log('Verified: eight enabled hours across shutdown; completed cycles; fault barrier; communication gap.');
})().catch(e=>{console.error(e);process.exitCode=1});

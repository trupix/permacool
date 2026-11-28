// Apply this single additive migration before the new production build can serve traffic.
// A preview never migrates a shared database. Local verification must opt into the isolated fixture.
const local = process.argv.includes('--loopback-test');
if (local || process.env.VERCEL_ENV === 'production') {
  const url = local ? new URL(process.env.INGEST_TEST_DATABASE_URL) : null;
  if (local && (url.protocol !== 'postgresql:' || url.hostname !== '127.0.0.1' || url.username !== 'trace_fixture'))
    throw Error('Expected the isolated loopback fixture.');
  const {PrismaClient} = require('@prisma/client');
  const db = new PrismaClient(local ? {datasourceUrl:url.href} : {});
  const sql = require('node:fs').readFileSync(require('node:path').join(__dirname,
    '../prisma/migrations/20261128090000_timeline_pending_batch/migration.sql'),'utf8');
  db.$transaction(async tx => {
    await tx.$executeRawUnsafe("SET LOCAL lock_timeout = '3s'");
    for (const statement of sql.split(/^-- next statement\s*$/m)) await tx.$executeRawUnsafe(statement.trim());
  },{timeout:30000}).then(()=>console.log('Private timeline recovery storage ready.'))
    .catch(()=>{console.error('Timeline recovery storage setup failed; stopping build.');process.exitCode=1;})
    .finally(()=>db.$disconnect());
}

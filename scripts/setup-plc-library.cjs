// Production-only additive migration, run by the existing deployment environment.
// No controller access and no general prisma migrate/db push against other tables.
if (process.env.VERCEL_ENV === 'production') {
  const { PrismaClient } = require('@prisma/client');
  const fs = require('node:fs');
  const db = new PrismaClient();
  const sql = fs.readFileSync(require('node:path').join(__dirname, 'sql/plc-library-snapshot.sql'), 'utf8');
  db.$transaction(async tx => {
    for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) await tx.$executeRawUnsafe(statement);
  }, { timeout: 30_000 }).then(() => console.log('Private PLC library snapshot storage ready.'))
    .catch(() => { console.error('PLC library storage setup failed; deployment must not proceed.'); process.exitCode = 1; })
    .finally(() => db.$disconnect());
}

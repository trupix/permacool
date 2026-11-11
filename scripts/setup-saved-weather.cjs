const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const { spawnSync } = require('child_process');
const crypto = require('crypto');
async function main() {
  const db = new PrismaClient();
  try {
    const sql = fs.readFileSync('prisma/migrations/20261030000100_saved_event_weather/migration.sql', 'utf8');
    for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) await db.$executeRawUnsafe(statement);
    console.log('Weather storage created.');
  } finally { await db.$disconnect(); }
  if (process.argv.includes('--configure-schedule-secret')) {
    const result = spawnSync('npx.cmd', ['vercel', 'env', 'add', 'CRON_SECRET', 'production', '--sensitive'], { input: crypto.randomBytes(32).toString('hex'), encoding: 'utf8', shell: true });
    if (result.status !== 0) throw new Error('Could not configure schedule authentication.');
    console.log('Schedule authentication configured; credential not displayed.');
  }
}
main().catch(() => { console.error('Weather setup failed.'); process.exitCode = 1; });

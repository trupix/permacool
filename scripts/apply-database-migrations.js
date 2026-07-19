const { spawnSync } = require('node:child_process');

if (!process.env.DATABASE_URL) {
  console.log('DATABASE_URL is not configured; skipping database migrations.');
  process.exit(0);
}

if (process.env.VERCEL && process.env.VERCEL_ENV !== 'production') {
  console.log(`Skipping database migrations for Vercel ${process.env.VERCEL_ENV || 'preview'} build.`);
  process.exit(0);
}

console.log('Applying pending Prisma database migrations...');
const prismaCommand = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';
const result = spawnSync(prismaCommand, ['migrate', 'deploy'], {
  stdio: 'inherit',
  shell: false
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);

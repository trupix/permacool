import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL must point to the dedicated PermaCool staging database.');
}

if (process.env.PERMACOOL_TEST_DATABASE !== 'staging') {
  throw new Error('Set PERMACOOL_TEST_DATABASE=staging before running this database-backed test.');
}

const stressedUrl = new URL(databaseUrl);
stressedUrl.searchParams.set('connection_limit', '1');
stressedUrl.searchParams.set('pool_timeout', '10');
if (stressedUrl.hostname.endsWith('.pooler.supabase.com')) {
  stressedUrl.searchParams.set('pgbouncer', 'true');
}

const db = new PrismaClient({ datasourceUrl: stressedUrl.toString() });

async function operationalSnapshot() {
  return {
    vpnEnrollments: await db.vpnEnrollment.count(),
    telemetryPoints: await db.telemetryPoint.count(),
    telemetrySamples: await db.telemetrySample.count(),
    alerts: await db.alert.count(),
    events: await db.equipmentEvent.count(),
    equipment: await db.siteEquipmentConfiguration.count(),
    users: await db.user.count()
  };
}

async function authRead(email: string) {
  return db.user.findUnique({
    where: { email },
    include: { memberships: true, deviceAccess: true }
  });
}

async function telemetryRead(siteId: string) {
  const site = await db.site.findFirst({ where: { id: siteId }, select: { id: true } });
  if (!site) return;
  const devices = await db.device.findMany({
    where: { siteId },
    select: { id: true, name: true }
  });
  await db.telemetryPoint.findMany({
    where: { deviceId: { in: devices.map((device) => device.id) } },
    orderBy: { key: 'asc' }
  });
}

async function weatherRead(siteId: string) {
  await db.site.findUnique({
    where: { id: siteId },
    include: {
      provisioningDetails: true,
      devices: { select: { id: true } }
    }
  });
}

async function pageRead() {
  await db.site.findMany({
    include: {
      provisioningDetails: true,
      devices: { select: { id: true } }
    },
    orderBy: { name: 'asc' }
  });
}

try {
  await db.$connect();

  const authSource = await readFile(new URL('../lib/auth.ts', import.meta.url), 'utf8');
  const dbSource = await readFile(new URL('../lib/db.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(
    authSource,
    /db\.user\.update\s*\(/,
    'Authentication reads must not update the user row.'
  );
  assert.match(
    dbSource,
    /globalForPrisma\.prisma\s*=\s*db/,
    'The Prisma client must be shared for the lifetime of each server runtime.'
  );

  const approvedUser = await db.user.findFirst({
    where: { status: 'approved' },
    select: { email: true }
  });
  const site = await db.site.findFirst({ select: { id: true } });
  assert.ok(approvedUser, 'Staging must contain one sanitized approved user fixture.');
  assert.ok(site, 'Staging must contain at least one sanitized site fixture.');

  const before = await operationalSnapshot();
  const requests = Array.from({ length: 48 }, (_, index) => {
    switch (index % 4) {
      case 0:
        return authRead(approvedUser.email);
      case 1:
        return telemetryRead(site.id);
      case 2:
        return weatherRead(site.id);
      default:
        return pageRead();
    }
  });

  await Promise.all(requests);

  const after = await operationalSnapshot();
  assert.deepEqual(after, before, 'Concurrent read traffic must leave all operational counts unchanged.');

  console.log('Database pool resilience passed: 48 concurrent staging reads, zero writes.');
  console.log(`Staging counts unchanged: ${JSON.stringify(after)}`);
} finally {
  await db.$disconnect();
}

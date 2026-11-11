// Explicit one-time website database setup; never contacts a PLC.
const fs = require('node:fs');
require('dotenv').config({ path: process.argv[2] || '.env.local', quiet: true });
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
const runKey = "^(compressorstatus|(ch[0-9]+)?(chiller|compressor)run(output)?|(ch[0-9]+)?do(chiller|compressor)run)$";
(async () => {
  const sql = fs.readFileSync('prisma/migrations/20261111233000_sites_display_snapshot/migration.sql', 'utf8');
  for (const statement of sql.split(';').filter(s => s.trim())) await db.$executeRawUnsafe(statement);
  console.log('Snapshot storage ready; seeding saved last-running timestamps.');
  const start = Date.now();
  await db.$executeRawUnsafe(`INSERT INTO "DeviceDisplaySnapshot" ("deviceId", "lastObservedRunAt")
    SELECT "deviceId", MAX("capturedAt") FROM "TelemetrySample"
    WHERE value > 0.5 AND (key ILIKE '%chiller%' OR key ILIKE '%compressor%')
      AND regexp_replace(lower(key), '[^a-z0-9]', '', 'g') ~ $1
    GROUP BY "deviceId"
    ON CONFLICT ("deviceId") DO UPDATE SET "lastObservedRunAt" =
      GREATEST("DeviceDisplaySnapshot"."lastObservedRunAt", EXCLUDED."lastObservedRunAt")`, runKey);
  console.log(JSON.stringify({ backfillMs: Date.now() - start }));
  await db.$executeRawUnsafe(`INSERT INTO "DeviceDisplaySnapshot"
    ("deviceId", "lastObservedRunAt", "lastSeenAt", "lastRanAt", "runningSignalAt", "capturedAt")
    SELECT d.id, GREATEST(s."lastObservedRunAt", p.running), d."lastSeenAt",
      GREATEST(s."lastObservedRunAt", p.running), p.running, CURRENT_TIMESTAMP
    FROM "Device" d LEFT JOIN "DeviceDisplaySnapshot" s ON s."deviceId" = d.id
    LEFT JOIN LATERAL (SELECT MAX("latestTimestamp") AS running FROM "TelemetryPoint"
      WHERE "deviceId" = d.id AND "latestValue" > 0.5
      AND regexp_replace(lower(key), '[^a-z0-9]', '', 'g') ~ $1) p ON true
    ON CONFLICT ("deviceId") DO UPDATE SET
      "lastObservedRunAt" = GREATEST("DeviceDisplaySnapshot"."lastObservedRunAt", EXCLUDED."lastObservedRunAt"),
      "lastSeenAt" = EXCLUDED."lastSeenAt", "lastRanAt" = EXCLUDED."lastRanAt",
      "runningSignalAt" = EXCLUDED."runningSignalAt", "capturedAt" = EXCLUDED."capturedAt"`, runKey);
  console.log(JSON.stringify({ savedDevices: await db.deviceDisplaySnapshot.count() }));
})().catch(e => { console.error(e.code || e.name); process.exitCode = 1; }).finally(() => db.$disconnect());

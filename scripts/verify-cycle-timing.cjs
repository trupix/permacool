// Read-only verification against existing events. Never inserts test telemetry.
require('dotenv').config({ path: '.env.local', quiet: true });
const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const db = new PrismaClient();
const source = fs.readFileSync('server/repositories/equipment-events.ts', 'utf8');
const template = source.match(/Prisma\.sql`([\s\S]*?)`\) : \[\]/)[1];
const query = new Function('Prisma', 'rows', 'return Prisma.sql`' + template + '`;');
(async () => {
  const sites = await db.equipmentEvent.groupBy({ by: ['siteId'] });
  let checked = 0;
  for (const { siteId } of sites) {
    const rows = await db.equipmentEvent.findMany({ where: { siteId }, orderBy: { occurredAt: 'desc' }, take: 100 });
    const start = Date.now();
    const timings = await db.$queryRaw(query(Prisma, rows));
    for (const timing of timings) {
      const event = rows.find(row => row.id === timing.id);
      const previous = await db.equipmentEvent.findFirst({ where: { siteId, deviceId: event.deviceId, channel: event.channel, eventType: 'reached_temperature', occurredAt: { lt: event.occurredAt } }, orderBy: { occurredAt: 'desc' } });
      for (const key of ['offCycleSeconds', 'sincePreviousOffCycleSeconds']) {
        if (timing[key] != null) {
          assert.equal(timing[key], (event.occurredAt - previous.occurredAt) / 1000);
          assert.ok(timing[key] > 0);
          checked++;
        }
      }
    }
    // A one-row page must produce identical timing to a larger page.
    if (timings.length) {
      const row = rows.find(row => row.id === timings[0].id);
      assert.deepEqual(await db.$queryRaw(query(Prisma, [row])), [timings[0]]);
    }
    console.log(JSON.stringify({ siteId, events: rows.length, timedEvents: timings.length, verificationMs: Date.now() - start, example: timings.find(t => t.offCycleSeconds != null) }));
  }
  console.log(`Verified ${checked} recorded intervals; page-boundary checks passed.`);
})().finally(() => db.$disconnect());

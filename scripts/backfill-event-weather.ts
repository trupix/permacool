import { db } from '../lib/db';
import { Prisma } from '@prisma/client';
import { resolveWeatherLocation } from '../server/site-weather-service';
async function main() {
  for (const site of await db.site.findMany({ include: { provisioningDetails: true } })) {
    try {
      const events = await db.equipmentEvent.findMany({ where: { siteId: site.id, occurredAt: { gte: new Date(Date.now() - 7 * 86400000) } }, select: { id: true, occurredAt: true } });
      if (!events.length) continue;
      const location = await resolveWeatherLocation({ ...site, ...site.provisioningDetails, deviceIds: [], lastActiveAt: null });
      const observations: Array<{ at: number; temperature: number; station: string }> = [];
      for (const station of location.stations.slice(0, 2)) {
        const response = await fetch(`https://api.weather.gov/stations/${encodeURIComponent(station.stationId)}/observations?limit=500`, { headers: { 'User-Agent': 'PermaCoolOps/1.0 (operations@perma.cool)' }, signal: AbortSignal.timeout(15000) });
        if (!response.ok) continue;
        const data = await response.json();
        for (const feature of data.features ?? []) {
          const p = feature.properties, value = p?.temperature?.value, unit = p?.temperature?.unitCode;
          const at = Date.parse(p?.timestamp);
          if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isFinite(at) || !['wmoUnit:degC', 'wmoUnit:degF'].includes(unit)) continue;
          observations.push({ at, temperature: unit === 'wmoUnit:degC' ? value * 9 / 5 + 32 : value, station: station.stationId });
        }
      }
      observations.sort((a, b) => b.at - a.at);
      let count = 0;
      const inserts: Prisma.Sql[] = [];
      for (const event of events) {
        const obs = observations.find(o => o.at <= event.occurredAt.getTime() && event.occurredAt.getTime() - o.at <= 90 * 60000);
        if (!obs) continue;
        inserts.push(Prisma.sql`(${event.id}, ${obs.temperature}, ${new Date(obs.at)}, ${obs.station})`);
      }
      for (let i = 0; i < inserts.length; i += 250) count += await db.$executeRaw(Prisma.sql`INSERT INTO "EventAmbientWeather" ("eventId", "temperatureF", "observedAt", station) VALUES ${Prisma.join(inserts.slice(i, i + 250))} ON CONFLICT ("eventId") DO NOTHING`);
      console.log(site.id, 'historical event weather saved:', count);
    } catch { console.log(site.id, 'historical weather unavailable'); }
  }
}
main().finally(() => db.$disconnect());

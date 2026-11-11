import { db } from '@/lib/db';
import { resolveWeatherLocation, fetchBestObservation } from './site-weather-service';

export async function attachSavedEventWeather(siteId: string) {
  return db.$executeRaw`
    INSERT INTO "EventAmbientWeather" ("eventId", "temperatureF", "observedAt", "station")
    SELECT e.id, w."temperatureF", w."observedAt", w.station
    FROM "EquipmentEvent" e
    CROSS JOIN LATERAL (
      SELECT s.* FROM "SiteWeatherSnapshot" s
      WHERE s."siteId" = e."siteId" AND s."observedAt" <= e."occurredAt"
        AND s."observedAt" >= e."occurredAt" - INTERVAL '90 minutes'
      ORDER BY s."observedAt" DESC, s."fetchedAt" ASC LIMIT 1
    ) w
    WHERE e."siteId" = ${siteId}
      AND NOT EXISTS (SELECT 1 FROM "EventAmbientWeather" a WHERE a."eventId" = e.id)
    ON CONFLICT ("eventId") DO NOTHING
  `;
}

export async function collectSiteWeather() {
  const sites = await db.site.findMany({ include: { provisioningDetails: true } });
  const slot = new Date(Math.floor(Date.now() / 900000) * 900000);
  return Promise.all(sites.map(async site => {
    try {
      const existing = await db.$queryRaw<Array<{ station: string }>>`SELECT station FROM "SiteWeatherSnapshot" WHERE "siteId" = ${site.id} AND "slotAt" = ${slot}`;
      if (!existing.length) {
        const location = await resolveWeatherLocation({ ...site, ...site.provisioningDetails, deviceIds: [], lastActiveAt: null });
        const observation = await fetchBestObservation(location.stations, { Accept: 'application/geo+json', 'User-Agent': 'PermaCoolOps/1.0 (operations@perma.cool)' });
        if (!observation.usable || observation.observedTemperatureF === null || observation.observedAtMs > Date.now()) return { siteId: site.id, status: 'weather_unavailable' };
        await db.$executeRaw`INSERT INTO "SiteWeatherSnapshot" ("siteId", "slotAt", "observedAt", "temperatureF", station)
          VALUES (${site.id}, ${slot}, ${new Date(observation.observedAtMs)}, ${observation.observedTemperatureF}, ${observation.station.stationId})
          ON CONFLICT ("siteId", "slotAt") DO NOTHING`;
      }
      const attached = await attachSavedEventWeather(site.id);
      return { siteId: site.id, status: 'saved', attached };
    } catch { return { siteId: site.id, status: 'weather_unavailable' }; }
  }));
}

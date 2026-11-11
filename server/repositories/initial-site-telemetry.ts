import { db } from '@/lib/db';
import { deviceWhere, type AccessScope } from '@/lib/access';
import { hasDatabaseUrl, isSiteTelemetryApiEnabled } from '@/lib/env';

// Latest stored points only. No history scan, controller request or browser cache.
export async function getInitialSiteTelemetry(scope: AccessScope, siteId: string) {
  if (!hasDatabaseUrl() || !isSiteTelemetryApiEnabled()) return null;
  try {
    const rows = await db.telemetryPoint.findMany({
      where: { device: { AND: [{ siteId }, deviceWhere(scope)] } },
      select: { id: true, deviceId: true, key: true, label: true, unit: true,
        latestValue: true, latestTimestamp: true, device: { select: { name: true } } },
      orderBy: { key: 'asc' }
    });
    return { fetchedAt: new Date().toISOString(), points: rows.map(({ device, latestTimestamp, ...point }) => ({
      ...point, deviceName: device.name, latestTimestamp: latestTimestamp.toISOString()
    })) };
  } catch {
    // Existing authenticated polling can recover even if the initial read fails.
    console.error('Initial saved site telemetry unavailable.');
    return null;
  }
}

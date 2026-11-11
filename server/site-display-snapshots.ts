import { db } from '@/lib/db';
import { isEquipmentRunKey, latestOperatingTimestamp } from '@/lib/site-operating-activity';

// Called only after normal telemetry persistence. No controller requests.
export async function recordObservedRun(deviceId: string, capturedAt: Date) {
  await db.$executeRaw`
    INSERT INTO "DeviceDisplaySnapshot" ("deviceId", "lastObservedRunAt")
    VALUES (${deviceId}, ${capturedAt})
    ON CONFLICT ("deviceId") DO UPDATE SET "lastObservedRunAt" =
      GREATEST("DeviceDisplaySnapshot"."lastObservedRunAt", EXCLUDED."lastObservedRunAt")`;
}

// Ten-minute background projection of already-saved current telemetry.
export async function refreshSiteDisplaySnapshots() {
  const devices = await db.device.findMany({ select: {
    id: true, lastSeenAt: true, displaySnapshot: { select: { lastObservedRunAt: true } },
    telemetryPoints: { select: { key: true, latestValue: true, latestTimestamp: true } }
  } });
  const capturedAt = new Date();
  await db.$transaction(devices.map(device => {
    const running = latestOperatingTimestamp(device.telemetryPoints
      .filter(p => isEquipmentRunKey(p.key) && p.latestValue > 0.5)
      .map(p => p.latestTimestamp));
    const lastRan = latestOperatingTimestamp([device.displaySnapshot?.lastObservedRunAt, running]);
    const data = { lastSeenAt: device.lastSeenAt, lastRanAt: lastRan ? new Date(lastRan) : null,
      runningSignalAt: running ? new Date(running) : null, capturedAt };
    return db.deviceDisplaySnapshot.upsert({ where: { deviceId: device.id }, update: data,
      create: { deviceId: device.id, lastObservedRunAt: data.lastRanAt, ...data } });
  }));
  return { devices: devices.length, capturedAt: capturedAt.toISOString() };
}

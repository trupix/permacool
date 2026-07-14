import { db } from '@/lib/db';
import { hasDatabaseUrl } from '@/lib/env';
import type { TelemetryIngestPayload } from '@/types/domain';

function telemetryLabel(key: string) {
  return key
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function persistTelemetryPayload(payload: TelemetryIngestPayload) {
  if (!hasDatabaseUrl()) {
    return { persisted: false, pointCount: payload.points.length, reason: 'database-not-configured' } as const;
  }

  const capturedAt = new Date(payload.capturedAt);

  const device = await db.device.findUnique({
    where: { id: payload.deviceId },
    select: { id: true, siteId: true }
  });

  if (!device || device.siteId !== payload.siteId) {
    return { persisted: false, pointCount: 0, reason: 'unknown-device' } as const;
  }

  await db.$transaction([
    db.site.update({
      where: { id: payload.siteId },
      data: { gatewayStatus: 'online' }
    }),
    db.device.update({
      where: { id: payload.deviceId },
      data: { status: 'online', lastSeenAt: capturedAt }
    }),
    ...payload.points.map((point) =>
      db.telemetryPoint.upsert({
        where: { deviceId_key: { deviceId: payload.deviceId, key: point.key } },
        update: {
          latestValue: point.value,
          unit: point.unit,
          latestTimestamp: capturedAt
        },
        create: {
          deviceId: payload.deviceId,
          key: point.key,
          label: telemetryLabel(point.key),
          unit: point.unit,
          latestValue: point.value,
          latestTimestamp: capturedAt
        }
      })
    )
  ]);

  return { persisted: true, pointCount: payload.points.length } as const;
}

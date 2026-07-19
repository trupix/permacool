import { db } from '@/lib/db';
import { hasDatabaseUrl } from '@/lib/env';
import type { TelemetryIngestPayload } from '@/types/domain';
import { evaluateEquipmentTransitions } from '@/server/equipment-events';
import { ensureEquipmentEventStorage } from '@/server/equipment-event-storage';

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
    select: { id: true, siteId: true, site: { select: { name: true } } }
  });

  if (!device || device.siteId !== payload.siteId) {
    return { persisted: false, pointCount: 0, reason: 'unknown-device' } as const;
  }

  const previousPoints = await db.telemetryPoint.findMany({
    where: { deviceId: payload.deviceId },
    select: { key: true, latestValue: true, unit: true }
  });
  const transitions = evaluateEquipmentTransitions({
    siteId: payload.siteId,
    siteName: device.site.name,
    deviceId: payload.deviceId,
    capturedAt,
    previous: previousPoints.map((point) => ({
      key: point.key,
      value: point.latestValue,
      unit: point.unit
    })),
    incoming: payload.points
  });

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
    ),
    ...transitions.alertActions.map((alert) =>
      alert.action === 'open'
        ? db.alert.upsert({
            where: { id: alert.alertId },
            update: {
              severity: 'critical',
              status: 'open',
              message: alert.message,
              startedAt: alert.occurredAt,
              endedAt: null
            },
            create: {
              id: alert.alertId,
              siteId: payload.siteId,
              deviceId: payload.deviceId,
              severity: 'critical',
              status: 'open',
              message: alert.message,
              startedAt: alert.occurredAt
            }
          })
        : db.alert.updateMany({
            where: { id: alert.alertId, status: { not: 'resolved' } },
            data: { status: 'resolved', endedAt: alert.occurredAt }
          })
    )
  ]);

  let eventsPersisted = true;
  if (transitions.events.length) {
    try {
      if (!(await ensureEquipmentEventStorage())) throw new Error('Equipment event storage is unavailable.');
      await db.equipmentEvent.createMany({
        data: transitions.events.map((event) => ({
          dedupeKey: event.dedupeKey,
          siteId: event.siteId,
          deviceId: event.deviceId,
          channel: event.channel,
          eventType: event.eventType,
          message: event.message,
          occurredAt: event.occurredAt,
          highPressure: event.highPressure,
          lowPressure: event.lowPressure,
          processTemperature: event.processTemperature,
          temperatureUnit: event.temperatureUnit,
          compressorAmps: event.compressorAmps,
          runtimeMinutes: event.runtimeMinutes,
          setpoint: event.setpoint,
          setpointUnit: event.setpointUnit
        })),
        skipDuplicates: true
      });
    } catch (error) {
      eventsPersisted = false;
      console.error('Equipment event persistence failed after telemetry was saved.', error);
    }
  }

  return {
    persisted: true,
    pointCount: payload.points.length,
    eventCount: transitions.events.length,
    eventsPersisted
  } as const;
}

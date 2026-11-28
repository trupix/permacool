import { randomUUID } from 'node:crypto';
import { db } from '@/lib/db';
import { hasDatabaseUrl } from '@/lib/env';
import type { TelemetryIngestPayload } from '@/types/domain';
import { evaluateEquipmentTransitions } from '@/server/equipment-events';
import { ensureEquipmentEventStorage } from '@/server/equipment-event-storage';
import { attachSavedEventWeather } from '@/server/saved-event-weather';
import { isEquipmentRunKey } from '@/lib/site-operating-activity';
import { recordObservedRun } from '@/server/site-display-snapshots';
import { timeDbStep, type DbStep } from '@/server/ingest-db-timing';

function telemetryLabel(key: string) {
  return key
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeTelemetryUnit(unit: string) {
  if (unit === '°C' || unit === 'Â°C' || unit === '?C') return 'C';
  return unit;
}

function saveLatestReadings(payload: TelemetryIngestPayload, capturedAt: Date) {
  // History retains every occurrence. For the current view, the last occurrence
  // of a key within one packet wins, as it did with sequential upserts.
  const unique = new Map(payload.points.map(point => [point.key, point]));
  const rows = Array.from(unique.values(), p => ({
    id: randomUUID(), key: p.key, label: telemetryLabel(p.key),
    unit: normalizeTelemetryUnit(p.unit), value: String(p.value)
  }));
  // One bound JSON parameter regardless of batch size. The guard is evaluated
  // under the row lock; an older concurrent writer cannot undo a newer one.
  return db.$executeRaw`
    INSERT INTO "TelemetryPoint" AS current_point
      ("id", "deviceId", "key", "label", "unit", "latestValue", "latestTimestamp", "updatedAt")
    SELECT p.id, ${payload.deviceId}, p.key, p.label, p.unit, p.value, ${capturedAt.toISOString()}::timestamp,
           (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
    FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
         AS p(id text, key text, label text, unit text, value double precision)
    ORDER BY p.key
    ON CONFLICT ("deviceId", "key") DO UPDATE SET
      "unit" = EXCLUDED."unit", "latestValue" = EXCLUDED."latestValue",
      "latestTimestamp" = EXCLUDED."latestTimestamp", "updatedAt" = EXCLUDED."updatedAt"
    WHERE current_point."latestTimestamp" < EXCLUDED."latestTimestamp"`;
}

export async function persistTelemetryPayload(payload: TelemetryIngestPayload, steps: DbStep[]) {
  if (!hasDatabaseUrl()) {
    return { persisted: false, pointCount: payload.points.length, reason: 'database-not-configured' } as const;
  }

  const capturedAt = new Date(payload.capturedAt);

  const device = await timeDbStep(steps, 'device_lookup', () => db.device.findUnique({
    where: { id: payload.deviceId },
    select: { id: true, siteId: true, site: { select: { name: true } } }
  }));

  if (!device || device.siteId !== payload.siteId) {
    return { persisted: false, pointCount: 0, reason: 'unknown-device' } as const;
  }

  const previousPoints = await timeDbStep(steps, 'previous_readings', () => db.telemetryPoint.findMany({
    where: { deviceId: payload.deviceId },
    select: { key: true, latestValue: true, unit: true }
  }));
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

  await timeDbStep(steps, 'save_batch', () => db.$transaction([
    db.site.update({
      where: { id: payload.siteId },
      data: { gatewayStatus: 'online' }
    }),
    db.$executeRaw`
      UPDATE "Device" SET "status" = 'online',
        "lastSeenAt" = GREATEST("lastSeenAt", ${capturedAt.toISOString()}::timestamp),
        "updatedAt" = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
      WHERE "id" = ${payload.deviceId}`,
    db.telemetrySample.createMany({
      data: payload.points.map((point) => ({
        deviceId: payload.deviceId,
        key: point.key,
        value: point.value,
        unit: normalizeTelemetryUnit(point.unit),
        capturedAt
      }))
    }),
    saveLatestReadings(payload, capturedAt),
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
  ]));

  // Ancillary display bookkeeping must never reject an already-saved telemetry batch.
  if (payload.points.some(point => isEquipmentRunKey(point.key) && point.value > 0.5)) {
    await timeDbStep(steps, 'activity', () => recordObservedRun(payload.deviceId, capturedAt))
      .catch(() => console.error('Sites display last-running timestamp update failed.'));
  }
  let eventsPersisted = true;
  if (transitions.events.length) {
    try {
      if (!(await timeDbStep(steps, 'event_storage', () => ensureEquipmentEventStorage()))) throw new Error('Equipment event storage is unavailable.');
      await timeDbStep(steps, 'events', () => db.equipmentEvent.createMany({
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
      }));
      // Weather failure must not reject telemetry or lose the equipment event.
      await timeDbStep(steps, 'event_weather', () => attachSavedEventWeather(payload.siteId)).catch(() => console.error('Event weather attachment delayed.'));
    } catch {
      eventsPersisted = false;
      console.warn('Equipment event persistence failed after telemetry was saved.');
    }
  }

  return {
    persisted: true,
    pointCount: payload.points.length,
    eventCount: transitions.events.length,
    eventsPersisted
  } as const;
}

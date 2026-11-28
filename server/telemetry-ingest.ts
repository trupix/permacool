import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { hasDatabaseUrl } from '@/lib/env';
import type { TelemetryIngestPayload } from '@/types/domain';
import { evaluateEquipmentTransitions, pressureObservations } from '@/server/equipment-events';
import { ensureEquipmentEventStorage } from '@/server/equipment-event-storage';
import { attachSavedEventWeather } from '@/server/saved-event-weather';
import { isEquipmentRunKey } from '@/lib/site-operating-activity';
import { recordObservedRun } from '@/server/site-display-snapshots';
import { timeDbStep, type DbStep } from '@/server/ingest-db-timing';
import { normalizeTelemetryUnit, saveHistory, type identifyTelemetryBatch } from '@/server/telemetry-history';
import { deliverPendingEvents } from '@/server/timeline-outbox';

function telemetryLabel(key: string) {
  return key
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function saveLatestReadings(payload: TelemetryIngestPayload, capturedAt: Date, siteName: string) {
  // History retains every occurrence. For the current view, the last occurrence
  // of a key within one packet wins, as it did with sequential upserts.
  const unique = new Map(payload.points.map(point => [point.key, point]));
  const rows = Array.from(unique.values(), p => ({
    id: randomUUID(), key: p.key, label: telemetryLabel(p.key),
    unit: normalizeTelemetryUnit(p.unit), value: String(p.value)
  }));
  // One bound JSON parameter regardless of batch size. The guard is evaluated
  // under the row lock; an older concurrent writer cannot undo a newer one.
  const upsert = Prisma.sql`
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
  const signals = pressureObservations({ ...payload, siteName, incoming: payload.points });
  if (!signals.length) return db.$executeRaw(upsert);

  // The existing transaction locks Site before this statement. Its snapshot sees
  // the previous committed readings; RETURNING contains only the readings this
  // upload actually advanced. Never drive a live alert from historical drafts.
  return db.$executeRaw`
    WITH accepted AS (${upsert} RETURNING "key", "latestTimestamp" AS ts, "latestValue" <> 0 AS active),
    signals AS (
      SELECT * FROM jsonb_to_recordset(${JSON.stringify(signals)}::jsonb)
        AS s("alertId" text, channel text, message text, signal text, key text)
    ), previous AS (
      SELECT DISTINCT ON (signal) signal, t."latestTimestamp" AS ts, t."latestValue" <> 0 AS active
      FROM "TelemetryPoint" t
      JOIN signals s ON s.signal = regexp_replace(lower(t.key), '[^a-z0-9]', '', 'g')
      WHERE t."deviceId" = ${payload.deviceId}
      ORDER BY signal, t."latestTimestamp" DESC, t."updatedAt", t.key
    ), readings AS (
      SELECT s.*, a.ts, p.active AS was_active,
        CASE WHEN a.ts > p.ts OR p.ts IS NULL THEN a.active ELSE p.active END AS active,
        a.ts IS NOT NULL AND (p.ts IS NULL OR a.ts > p.ts) AS fresh
      FROM signals s LEFT JOIN accepted a ON a.key = s.key LEFT JOIN previous p USING (signal)
    ), edges AS (
      SELECT * FROM readings r WHERE fresh AND active <> COALESCE(was_active, false)
        AND (channel <> 'SYSTEM' OR NOT EXISTS (SELECT 1 FROM readings WHERE channel <> 'SYSTEM' AND active))
    ), clears AS (
      UPDATE "Alert" old SET status = 'resolved', "endedAt" = e.ts, "updatedAt" = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
      FROM edges e WHERE NOT e.active AND old.id = e."alertId" AND old.status <> 'resolved'
        AND e.ts > GREATEST(old."startedAt", old."endedAt")
    )
    INSERT INTO "Alert" AS old (id, "siteId", "deviceId", severity, status, message, "startedAt", "updatedAt")
    SELECT "alertId", ${payload.siteId}, ${payload.deviceId}, 'critical', 'open', message, ts, CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
    FROM edges WHERE active
    ON CONFLICT (id) DO UPDATE SET status = 'open', severity = 'critical', message = EXCLUDED.message,
      "startedAt" = EXCLUDED."startedAt", "endedAt" = NULL, "updatedAt" = EXCLUDED."updatedAt"
    WHERE old.status = 'resolved' AND EXCLUDED."startedAt" > GREATEST(old."startedAt", old."endedAt")`;
}

export async function persistTelemetryPayload(payload: TelemetryIngestPayload, steps: DbStep[], batch: ReturnType<typeof identifyTelemetryBatch>) {
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

  const [, , [history]] = await timeDbStep(steps, 'save_batch', () => db.$transaction([
    db.site.update({
      where: { id: payload.siteId },
      data: { gatewayStatus: 'online' }
    }),
    db.$executeRaw`
      UPDATE "Device" SET "status" = 'online',
        "lastSeenAt" = GREATEST("lastSeenAt", ${capturedAt.toISOString()}::timestamp),
        "updatedAt" = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
      WHERE "id" = ${payload.deviceId}`,
    saveHistory(payload.siteId, payload.deviceId, capturedAt, batch, transitions.events),
    saveLatestReadings(payload, capturedAt, device.site.name)
  ]));

  // Ancillary display bookkeeping must never reject an already-saved telemetry batch.
  if (payload.points.some(point => isEquipmentRunKey(point.key) && point.value > 0.5)) {
    await timeDbStep(steps, 'activity', () => recordObservedRun(payload.deviceId, capturedAt))
      .catch(() => console.error('Sites display last-running timestamp update failed.'));
  }
  let eventsPersisted = history.eventCount === 0;
  let timelineEventsInserted = 0;
  let timelineDelivery: 'idle' | 'checked' | 'deferred' = 'idle';
  if (history.eventCount || history.hasPending) {
    try {
      if (!(await timeDbStep(steps, 'event_storage', () => ensureEquipmentEventStorage()))) throw new Error('Equipment event storage is unavailable.');
      const [[delivery], pendingThisBatch] = await timeDbStep(steps, 'events',
        () => deliverPendingEvents(payload.siteId, payload.deviceId, batch.rowPrefix));
      timelineEventsInserted = delivery.inserted;
      eventsPersisted = pendingThisBatch === 0;
      timelineDelivery = eventsPersisted ? 'checked' : 'deferred';
      // Weather failure must not reject telemetry or lose the equipment event.
      if (timelineEventsInserted) await timeDbStep(steps, 'event_weather', () => attachSavedEventWeather(payload.siteId)).catch(() => console.error('Event weather attachment delayed.'));
    } catch {
      timelineDelivery = 'deferred';
      // No affirmative acknowledgment for a packet with unconfirmed events.
      // Other packets with no events of their own can continue to be accepted.
    }
  }

  return {
    persisted: true,
    pointCount: payload.points.length,
    historyRowsInserted:history.inserted,
    historyRowsAlreadySaved: payload.points.length - history.inserted,
    eventCount: history.eventCount,
    timelineEventsInserted,
    timelineDelivery,
    eventsPersisted
  } as const;
}

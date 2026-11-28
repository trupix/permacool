import { createHash, randomUUID } from 'node:crypto';
import { db } from '@/lib/db';
import type { TelemetryIngestPayload } from '@/types/domain';
import type { EquipmentEventDraft } from './equipment-events';

export function normalizeTelemetryUnit(unit: string) {
  if (unit === '°C' || unit === 'Â°C' || unit === '?C') return 'C';
  return unit;
}

export function identifyTelemetryBatch(payload: TelemetryIngestPayload) {
  // Sort a copy: latest-value processing still uses the original packet order.
  // Keep duplicate tuples: a second legitimate occurrence has its own slot.
  const ordered = payload.points.map(point => ({ point, tuple: JSON.stringify([
    point.key, Number.isFinite(point.value) ? point.value : String(point.value), point.unit
  ]) })).sort((a,b) => a.tuple < b.tuple ? -1 : a.tuple > b.tuple ? 1 : 0);
  // The existing timestamp column stores milliseconds. Don't merge distinct
  // higher-precision ISO captures just because their display timestamps round together.
  const fraction = String(payload.capturedAt).match(/[T ]\d\d:\d\d:\d\d\.(\d+)/i)?.[1] ?? '';
  const subMillis = fraction.slice(3).replace(/0+$/, '');
  const instant = new Date(payload.capturedAt).toISOString().replace(/Z$/, subMillis + 'Z');
  const digest = createHash('sha256').update(JSON.stringify([
    payload.siteId, payload.deviceId, instant, ordered.map(p => p.tuple)
  ])).digest();
  return {
    logId: digest.toString('hex').slice(0,32), // compatible with existing upload logs
    rowPrefix: 'r1:' + digest.toString('base64url') + ':', orderedPoints: ordered.map(p => p.point),
    comparableWithLegacy: !subMillis
  };
}

export function saveHistory(siteId: string, deviceId: string, capturedAt: Date, batch: ReturnType<typeof identifyTelemetryBatch>, events: EquipmentEventDraft[]) {
  const points = batch.orderedPoints.map((p,i) => ({
    id: batch.rowPrefix + i.toString(36), key: p.key, value: String(p.value), unit: normalizeTelemetryUnit(p.unit)
  }));
  const ts = capturedAt.toISOString();
  // No new receipt table/index. The primary key arbitrates simultaneous retries.
  // Old writers used random sample IDs. Use the existing device/time index to
  // compare only legacy packets at this exact instant, separately by receipt.
  // Compare sorted multisets, not a distinct set or a mere row count.
  // Commit the *original* event text/time/snapshot in the same transaction as
  // its first readings. A replay must not invent a new edge from later live tags.
  const drafts = events.map(event => ({...event, id:randomUUID()}));
  return db.$queryRaw<Array<{inserted:number; eventCount:number; hasPending:boolean}>>`
    WITH incoming AS (
      SELECT * FROM jsonb_to_recordset(${JSON.stringify(points)}::jsonb)
        AS p(id text, key text, value double precision, unit text)
    ), saved AS (
    INSERT INTO "TelemetrySample" (id, "deviceId", key, value, unit, "capturedAt")
    SELECT p.id, ${deviceId}, p.key, p.value, p.unit, ${ts}::timestamp FROM incoming p
    WHERE NOT EXISTS (
      SELECT 1 FROM "TelemetrySample" old
      WHERE ${batch.comparableWithLegacy} AND old."deviceId" = ${deviceId} AND old."capturedAt" = ${ts}::timestamp
        AND old.id NOT LIKE 'r1:%'
      GROUP BY old."receivedAt"
      HAVING count(*) = ${points.length} AND
        jsonb_agg(jsonb_build_array(old.key,old.value,old.unit) ORDER BY old.key COLLATE "C",old.value,old.unit COLLATE "C") =
        (SELECT jsonb_agg(jsonb_build_array(i.key,i.value,i.unit) ORDER BY i.key COLLATE "C",i.value,i.unit COLLATE "C") FROM incoming i)
    )
    ORDER BY p.id
    ON CONFLICT (id) DO NOTHING RETURNING 1
    ), queued AS (
      INSERT INTO "TimelinePendingBatch" ("batchKey","siteId","deviceId",drafts)
      SELECT ${batch.rowPrefix}, ${siteId}, ${deviceId}, ${JSON.stringify(drafts)}::jsonb
      WHERE ${drafts.length} > 0 AND EXISTS (SELECT FROM saved)
      ON CONFLICT ("batchKey") DO NOTHING RETURNING jsonb_array_length(drafts) AS n
    )
    SELECT (SELECT count(*)::int FROM saved) AS inserted,
      COALESCE((SELECT n FROM queued),
        (SELECT jsonb_array_length(drafts) FROM "TimelinePendingBatch" WHERE "batchKey" = ${batch.rowPrefix}),0) AS "eventCount",
      EXISTS (SELECT FROM "TimelinePendingBatch" WHERE "siteId" = ${siteId} AND "deviceId" = ${deviceId}) AS "hasPending"`;
}

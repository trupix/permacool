import { db } from '@/lib/db';

// Bounded FIFO per device. Concurrent deliveries lock in the same order. Remove
// a packet only when *every* event key is accounted for, including older rows
// with a different ID. An insert error rolls back the whole delivery.
export function deliverPendingEvents(siteId: string, deviceId: string, batchKey: string) {
  return db.$transaction([
    db.$queryRaw<Array<{inserted:number}>>`
      WITH picked AS (
        SELECT "batchKey", drafts FROM "TimelinePendingBatch"
        WHERE "siteId" = ${siteId} AND "deviceId" = ${deviceId}
        ORDER BY "queuedAt","batchKey" LIMIT 32 FOR UPDATE
      ), candidates AS (
        SELECT p."batchKey", e.* FROM picked p CROSS JOIN LATERAL jsonb_to_recordset(p.drafts) AS e(
          id text,"dedupeKey" text,channel text,"eventType" text,message text,"occurredAt" timestamp,
          "highPressure" float8,"lowPressure" float8,"processTemperature" float8,"temperatureUnit" text,
          "compressorAmps" float8,"runtimeMinutes" float8,setpoint float8,"setpointUnit" text)
      ), added AS (
        INSERT INTO "EquipmentEvent" (id,"dedupeKey","siteId","deviceId",channel,"eventType",message,"occurredAt",
          "highPressure","lowPressure","processTemperature","temperatureUnit","compressorAmps","runtimeMinutes",setpoint,"setpointUnit")
        SELECT id,"dedupeKey",${siteId},${deviceId},channel,"eventType",message,"occurredAt",
          "highPressure","lowPressure","processTemperature","temperatureUnit","compressorAmps","runtimeMinutes",setpoint,"setpointUnit"
        FROM candidates ORDER BY "dedupeKey" ON CONFLICT ("dedupeKey") DO NOTHING RETURNING "dedupeKey"
      ), confirmed AS (
        SELECT "dedupeKey" FROM added UNION ALL
        SELECT e."dedupeKey" FROM candidates c JOIN "EquipmentEvent" e USING ("dedupeKey")
          WHERE e."siteId" = ${siteId} AND e."deviceId" = ${deviceId}
      ), retired AS (
        DELETE FROM "TimelinePendingBatch" q USING picked p WHERE q."batchKey" = p."batchKey"
          AND NOT EXISTS (SELECT FROM candidates c WHERE c."batchKey" = p."batchKey"
            AND NOT EXISTS (SELECT FROM confirmed f WHERE f."dedupeKey" = c."dedupeKey"))
      )
      SELECT (SELECT count(*)::int FROM added) AS inserted`,
    // Fresh post-delivery snapshot, also when a concurrent retry drained this batch.
    db.timelinePendingBatch.count({where:{batchKey,siteId,deviceId}})
  ]);
}

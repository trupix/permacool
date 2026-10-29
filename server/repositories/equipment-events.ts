import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { getEquipmentEventsForSite } from '@/lib/mock-data';
import type { EquipmentEvent } from '@/types/domain';
import { ensureEquipmentEventStorage } from '@/server/equipment-event-storage';
import { shouldUseDatabase } from './shared';

export type EquipmentEventPage = {
  events: EquipmentEvent[];
  total: number;
  persistenceReady: boolean;
};

function isMissingEquipmentEventTable(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021';
}

export async function getSiteEquipmentEvents(
  siteId: string,
  options: { limit?: number; offset?: number; includeTotal?: boolean } = {}
): Promise<EquipmentEventPage> {
  const limit = Math.min(Math.max(options.limit ?? 100, 1), 10_000);
  const offset = Math.max(options.offset ?? 0, 0);

  if (!shouldUseDatabase()) {
    const allEvents = getEquipmentEventsForSite(siteId);
    return {
      events: allEvents.slice(offset, offset + limit),
      total: allEvents.length,
      persistenceReady: false
    };
  }

  try {
    const storageReady = await ensureEquipmentEventStorage();
    if (!storageReady) return { events: [], total: 0, persistenceReady: false };
    const [rows, total] = await Promise.all([
      db.equipmentEvent.findMany({
        where: { siteId },
        include: { device: { select: { name: true } } },
        orderBy: { occurredAt: 'desc' },
        skip: offset,
        take: limit
      }),
      options.includeTotal === false ? Promise.resolve(0) : db.equipmentEvent.count({ where: { siteId } })
    ]);

    // Use persisted history, not the visible page, so pagination cannot change timing.
    // Temperature cycling is distinct from operator shutdowns and fault stops.
    const timings = rows.length ? await db.$queryRaw<Array<{
      id: string; offCycleSeconds: number | null; sincePreviousOffCycleSeconds: number | null;
    }>>(Prisma.sql`
      SELECT e.id,
        CASE WHEN e."eventType" = 'compressor_started'
          AND NOT EXISTS (
            SELECT 1 FROM "EquipmentEvent" x
            WHERE x."siteId" = e."siteId" AND x."deviceId" = e."deviceId"
              AND x.channel = e.channel AND x."eventType" = 'compressor_started'
              AND x."occurredAt" > p."occurredAt" AND x."occurredAt" < e."occurredAt"
          ) THEN EXTRACT(EPOCH FROM (e."occurredAt" - p."occurredAt"))::double precision
          END AS "offCycleSeconds",
        CASE WHEN e."eventType" = 'reached_temperature'
          AND EXISTS (
            SELECT 1 FROM "EquipmentEvent" x
            WHERE x."siteId" = e."siteId" AND x."deviceId" = e."deviceId"
              AND x.channel = e.channel AND x."eventType" = 'compressor_started'
              AND x."occurredAt" > p."occurredAt" AND x."occurredAt" < e."occurredAt"
          ) THEN EXTRACT(EPOCH FROM (e."occurredAt" - p."occurredAt"))::double precision
          END AS "sincePreviousOffCycleSeconds"
      FROM "EquipmentEvent" e
      CROSS JOIN LATERAL (
        SELECT p."occurredAt" FROM "EquipmentEvent" p
        WHERE p."siteId" = e."siteId" AND p."deviceId" = e."deviceId"
          AND p.channel = e.channel AND p."eventType" = 'reached_temperature'
          AND p."occurredAt" < e."occurredAt"
        ORDER BY p."occurredAt" DESC LIMIT 1
      ) p
      WHERE e.id IN (${Prisma.join(rows.map((row) => row.id))})
        AND e."eventType" IN ('compressor_started', 'reached_temperature')
        AND NOT EXISTS (
          SELECT 1 FROM "EquipmentEvent" b
          WHERE b."siteId" = e."siteId" AND b."deviceId" = e."deviceId"
            AND (b.channel = e.channel OR b.channel = 'SYSTEM')
            AND b."eventType" IN ('system_on', 'system_off', 'high_pressure_stop',
              'high_pressure_cleared', 'compressor_stopped')
            AND b."occurredAt" >= p."occurredAt" AND b."occurredAt" <= e."occurredAt"
        )
    `) : [];
    const timingById = new Map(timings.map((timing) => [timing.id, timing]));

    return {
      events: rows.map((row) => ({
        offCycleSeconds: timingById.get(row.id)?.offCycleSeconds ?? null,
        sincePreviousOffCycleSeconds: timingById.get(row.id)?.sincePreviousOffCycleSeconds ?? null,
        id: row.id,
        siteId: row.siteId,
        deviceId: row.deviceId,
        deviceName: row.device.name,
        channel: row.channel,
        eventType: row.eventType,
        message: row.message,
        occurredAt: row.occurredAt.toISOString(),
        highPressure: row.highPressure,
        lowPressure: row.lowPressure,
        processTemperature: row.processTemperature,
        temperatureUnit: row.temperatureUnit,
        compressorAmps: row.compressorAmps,
        runtimeMinutes: row.runtimeMinutes,
        setpoint: row.setpoint,
        setpointUnit: row.setpointUnit
      })),
      total,
      persistenceReady: true
    };
  } catch (error) {
    if (isMissingEquipmentEventTable(error)) {
      return { events: [], total: 0, persistenceReady: false };
    }
    throw error;
  }
}

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
  options: { limit?: number; offset?: number } = {}
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
      db.equipmentEvent.count({ where: { siteId } })
    ]);

    return {
      events: rows.map((row) => ({
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

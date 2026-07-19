import { db } from '@/lib/db';
import { hasDatabaseUrl } from '@/lib/env';

let storageInitialization: Promise<boolean> | undefined;

async function initializeEquipmentEventStorage() {
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EquipmentEvent" (
        "id" TEXT NOT NULL,
        "dedupeKey" TEXT NOT NULL,
        "siteId" TEXT NOT NULL,
        "deviceId" TEXT NOT NULL,
        "channel" TEXT NOT NULL,
        "eventType" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "occurredAt" TIMESTAMP(3) NOT NULL,
        "highPressure" DOUBLE PRECISION,
        "lowPressure" DOUBLE PRECISION,
        "processTemperature" DOUBLE PRECISION,
        "temperatureUnit" TEXT,
        "compressorAmps" DOUBLE PRECISION,
        "runtimeMinutes" DOUBLE PRECISION,
        "setpoint" DOUBLE PRECISION,
        "setpointUnit" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "EquipmentEvent_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "EquipmentEvent_siteId_fkey" FOREIGN KEY ("siteId")
          REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "EquipmentEvent_deviceId_fkey" FOREIGN KEY ("deviceId")
          REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.$executeRawUnsafe(
      'CREATE UNIQUE INDEX IF NOT EXISTS "EquipmentEvent_dedupeKey_key" ON "EquipmentEvent"("dedupeKey")'
    );
    await db.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "EquipmentEvent_siteId_occurredAt_idx" ON "EquipmentEvent"("siteId", "occurredAt" DESC)'
    );
    await db.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "EquipmentEvent_deviceId_occurredAt_idx" ON "EquipmentEvent"("deviceId", "occurredAt" DESC)'
    );
    return true;
  } catch (error) {
    console.error('Equipment event storage is not ready.', error);
    return false;
  }
}

export async function ensureEquipmentEventStorage() {
  if (!hasDatabaseUrl()) return false;
  storageInitialization ??= initializeEquipmentEventStorage();
  const ready = await storageInitialization;
  if (!ready) storageInitialization = undefined;
  return ready;
}

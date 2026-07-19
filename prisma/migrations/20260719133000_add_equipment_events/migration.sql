CREATE TABLE "EquipmentEvent" (
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

  CONSTRAINT "EquipmentEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EquipmentEvent_dedupeKey_key" ON "EquipmentEvent"("dedupeKey");
CREATE INDEX "EquipmentEvent_siteId_occurredAt_idx" ON "EquipmentEvent"("siteId", "occurredAt" DESC);
CREATE INDEX "EquipmentEvent_deviceId_occurredAt_idx" ON "EquipmentEvent"("deviceId", "occurredAt" DESC);

ALTER TABLE "EquipmentEvent"
  ADD CONSTRAINT "EquipmentEvent_siteId_fkey"
  FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EquipmentEvent"
  ADD CONSTRAINT "EquipmentEvent_deviceId_fkey"
  FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

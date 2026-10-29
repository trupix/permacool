CREATE TABLE IF NOT EXISTS "SiteWeatherSnapshot" (
  "siteId" TEXT NOT NULL REFERENCES "Site"("id") ON DELETE CASCADE,
  "slotAt" TIMESTAMP(3) NOT NULL,
  "observedAt" TIMESTAMP(3) NOT NULL,
  "temperatureF" DOUBLE PRECISION NOT NULL,
  "station" TEXT NOT NULL,
  "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("siteId", "slotAt")
);
CREATE INDEX IF NOT EXISTS "SiteWeatherSnapshot_observed_idx" ON "SiteWeatherSnapshot"("siteId", "observedAt" DESC);
CREATE TABLE IF NOT EXISTS "EventAmbientWeather" (
  "eventId" TEXT PRIMARY KEY REFERENCES "EquipmentEvent"("id") ON DELETE CASCADE,
  "temperatureF" DOUBLE PRECISION NOT NULL,
  "observedAt" TIMESTAMP(3) NOT NULL,
  "station" TEXT NOT NULL,
  "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

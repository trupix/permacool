CREATE TABLE IF NOT EXISTS "DeviceDisplaySnapshot" (
  "deviceId" TEXT PRIMARY KEY REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "lastObservedRunAt" TIMESTAMP(3),
  "lastSeenAt" TIMESTAMP(3),
  "lastRanAt" TIMESTAMP(3),
  "runningSignalAt" TIMESTAMP(3),
  "capturedAt" TIMESTAMP(3)
);
ALTER TABLE "DeviceDisplaySnapshot" ENABLE ROW LEVEL SECURITY;

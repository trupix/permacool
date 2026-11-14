-- Additive website-only storage. No controller or telemetry tables are changed.
CREATE TABLE IF NOT EXISTS "PlcLibrarySnapshot" (
  "id" TEXT PRIMARY KEY,
  "snapshot" JSONB,
  "receivedAt" TIMESTAMPTZ,
  "lastAttemptAt" TIMESTAMPTZ NOT NULL,
  "lastError" TEXT,
  "runNumber" BIGINT NOT NULL,
  "runAttempt" INTEGER NOT NULL
);
-- Only the server database role should read this table, never the public API.
ALTER TABLE "PlcLibrarySnapshot" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "PlcLibrarySnapshot" FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS "TimelinePendingBatch" (
  "batchKey" TEXT PRIMARY KEY,
  "siteId" TEXT NOT NULL REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "deviceId" TEXT NOT NULL REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "drafts" JSONB NOT NULL CHECK (jsonb_typeof("drafts") = 'array' AND jsonb_array_length("drafts") > 0),
  "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- next statement
CREATE INDEX IF NOT EXISTS "TimelinePendingBatch_scope_idx" ON "TimelinePendingBatch" ("siteId","deviceId","queuedAt","batchKey");
-- next statement
ALTER TABLE "TimelinePendingBatch" ENABLE ROW LEVEL SECURITY;
-- next statement
REVOKE ALL ON "TimelinePendingBatch" FROM PUBLIC;
-- next statement
DO $guard$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON "TimelinePendingBatch" FROM anon;
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON "TimelinePendingBatch" FROM authenticated;
  END IF;
END
$guard$;

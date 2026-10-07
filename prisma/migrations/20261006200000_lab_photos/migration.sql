CREATE TABLE "LabPhoto" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "assetId" TEXT NOT NULL,
  "kind" TEXT NOT NULL CHECK ("kind" IN ('nameplate', 'additional')),
  "caption" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "bytes" BYTEA NOT NULL
);
CREATE INDEX "LabPhoto_organizationId_assetId_idx" ON "LabPhoto"("organizationId", "assetId");
ALTER TABLE "LabPhoto" ENABLE ROW LEVEL SECURITY;

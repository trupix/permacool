CREATE TABLE "LabCatalog" (
  "organizationId" TEXT NOT NULL,
  "catalog" JSONB NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "updatedBy" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LabCatalog_pkey" PRIMARY KEY ("organizationId"),
  CONSTRAINT "LabCatalog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
ALTER TABLE "LabCatalog" ENABLE ROW LEVEL SECURITY;

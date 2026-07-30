CREATE TABLE "SiteEquipmentConfiguration" (
    "siteId" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "configuration" JSONB NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteEquipmentConfiguration_pkey" PRIMARY KEY ("siteId")
);

ALTER TABLE "SiteEquipmentConfiguration"
ADD CONSTRAINT "SiteEquipmentConfiguration_siteId_fkey"
FOREIGN KEY ("siteId") REFERENCES "Site"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

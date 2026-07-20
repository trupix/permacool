CREATE TABLE "SiteProvisioningDetails" (
    "siteId" TEXT NOT NULL,
    "addressLine1" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteProvisioningDetails_pkey" PRIMARY KEY ("siteId")
);

CREATE TABLE "VpnEnrollment" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "identity" TEXT NOT NULL,
    "tunnelIp" TEXT,
    "localIpAddress" TEXT,
    "profileStatus" TEXT NOT NULL DEFAULT 'not_generated',
    "vpnServerHost" TEXT,
    "lastProfileIssuedAt" TIMESTAMP(3),
    "lastProfileRevokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VpnEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VpnEnrollment_deviceId_key" ON "VpnEnrollment"("deviceId");
CREATE UNIQUE INDEX "VpnEnrollment_identity_key" ON "VpnEnrollment"("identity");
CREATE UNIQUE INDEX "VpnEnrollment_tunnelIp_key" ON "VpnEnrollment"("tunnelIp");

ALTER TABLE "SiteProvisioningDetails"
ADD CONSTRAINT "SiteProvisioningDetails_siteId_fkey"
FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VpnEnrollment"
ADD CONSTRAINT "VpnEnrollment_deviceId_fkey"
FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "VpnEnrollment" (
    "id", "deviceId", "identity", "tunnelIp", "profileStatus", "createdAt", "updatedAt"
)
SELECT
    'vpn-enrollment-epic-mvp-01', 'epic-mvp-01', 'salinas-groov-epic-01', '172.28.0.10', 'external', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Device" WHERE "id" = 'epic-mvp-01')
ON CONFLICT DO NOTHING;

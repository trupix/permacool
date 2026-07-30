DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM "Site"
        WHERE "id" = 'site-cannon-falls'
          AND "organizationId" <> 'org-permacool'
    ) THEN
        RAISE EXCEPTION 'Cannon Falls preflight failed: site ID belongs to another organization';
    END IF;

    IF EXISTS (
        SELECT 1 FROM "Device"
        WHERE "id" = 'epic-cannon-falls-01'
          AND "siteId" <> 'site-cannon-falls'
    ) THEN
        RAISE EXCEPTION 'Cannon Falls preflight failed: device ID belongs to another site';
    END IF;

    IF EXISTS (
        SELECT 1 FROM "VpnEnrollment"
        WHERE (
            "id" = 'vpn-enrollment-epic-cannon-falls-01'
            OR "identity" = 'cannon-falls-groov-epic-01'
            OR "tunnelIp" = '172.28.0.11'
        )
        AND "deviceId" <> 'epic-cannon-falls-01'
    ) THEN
        RAISE EXCEPTION 'Cannon Falls preflight failed: VPN identity or tunnel IP belongs to another device';
    END IF;
END $$;

INSERT INTO "Site" (
    "id",
    "organizationId",
    "name",
    "region",
    "timezone",
    "gatewayStatus",
    "createdAt",
    "updatedAt"
)
SELECT
    'site-cannon-falls',
    'org-permacool',
    'Cannon Falls',
    'Minnesota, US',
    'America/Chicago',
    'offline',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Organization" WHERE "id" = 'org-permacool')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "SiteProvisioningDetails" (
    "siteId",
    "city",
    "state",
    "country",
    "createdAt",
    "updatedAt"
)
SELECT
    'site-cannon-falls',
    'Cannon Falls',
    'MN',
    'US',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (
    SELECT 1 FROM "Site"
    WHERE "id" = 'site-cannon-falls'
      AND "organizationId" = 'org-permacool'
)
ON CONFLICT ("siteId") DO NOTHING;

INSERT INTO "Device" (
    "id",
    "siteId",
    "name",
    "plcModel",
    "protocol",
    "status",
    "createdAt",
    "updatedAt"
)
SELECT
    'epic-cannon-falls-01',
    'site-cannon-falls',
    'Cannon Falls groov EPIC 01',
    'Opto 22 groov EPIC',
    'Node-RED HTTPS telemetry',
    'offline',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (
    SELECT 1 FROM "Site"
    WHERE "id" = 'site-cannon-falls'
      AND "organizationId" = 'org-permacool'
)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "VpnEnrollment" (
    "id",
    "deviceId",
    "identity",
    "tunnelIp",
    "profileStatus",
    "vpnServerHost",
    "createdAt",
    "updatedAt"
)
SELECT
    'vpn-enrollment-epic-cannon-falls-01',
    'epic-cannon-falls-01',
    'cannon-falls-groov-epic-01',
    '172.28.0.11',
    'external',
    '35.243.46.137',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (
    SELECT 1
    FROM "Device"
    JOIN "Site" ON "Site"."id" = "Device"."siteId"
    WHERE "Device"."id" = 'epic-cannon-falls-01'
      AND "Device"."siteId" = 'site-cannon-falls'
      AND "Site"."organizationId" = 'org-permacool'
)
ON CONFLICT DO NOTHING;

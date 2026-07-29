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
WHERE EXISTS (SELECT 1 FROM "Site" WHERE "id" = 'site-cannon-falls')
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
WHERE EXISTS (SELECT 1 FROM "Site" WHERE "id" = 'site-cannon-falls')
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
WHERE EXISTS (SELECT 1 FROM "Device" WHERE "id" = 'epic-cannon-falls-01')
ON CONFLICT DO NOTHING;

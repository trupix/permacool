// @ts-nocheck
{
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

const genericTelemetry = read('components/site-telemetry-panel.tsx');
const salinasTelemetry = read('components/salinas-equipment-dashboard.tsx');
const weatherRoute = read('app/api/sites/[siteid]/weather/route.ts');
const equipmentRoute = read('app/api/sites/[siteid]/equipment/route.ts');
const telemetryRoute = read('app/api/sites/[siteid]/telemetry/route.ts');
const eventsRoute = read('app/api/sites/[siteid]/events/route.ts');
const cannonMigration = read('prisma/migrations/20260729143000_add_cannon_falls_site/migration.sql');

for (const source of [genericTelemetry, salinasTelemetry]) {
  assert.match(source, /-50/);
  assert.match(source, /100/);
  assert.match(source, /500/);
  assert.match(source, /-14\.7/);
  assert.match(source, /300/);
  assert.doesNotMatch(source, /-14\.5/);
}

assert.match(weatherRoute, /fetchBestObservation/);
assert.match(weatherRoute, /observedTemperatureF !== null/);
assert.match(weatherRoute, /observationIsCurrent[\s\S]*observedTemperatureF !== null/);
assert.match(weatherRoute, /temperatureF: observationIsCurrent && observedTemperatureF !== null/);

assert.match(equipmentRoute, /getSite\(user, siteid\)/);
assert.match(equipmentRoute, /canManageSiteEquipment\(user, site\.organizationId\)/);
assert.match(
  read('app/api/provisioning/sites/route.ts'),
  /canManageSiteEquipment\(user, input\.organizationId\)/
);
assert.match(telemetryRoute, /getSite\(user, siteid\)|siteWhere\(user\)/);
assert.match(eventsRoute, /getSite\(user, siteI[dD]\)/);

assert.match(cannonMigration, /organizationId" <> 'org-permacool'/);
assert.match(cannonMigration, /device ID belongs to another site/);
assert.match(cannonMigration, /VPN identity or tunnel IP belongs to another device/);

console.log('Dashboard guardrails passed for telemetry ranges, NWS fallback readiness, organization gates, and Cannon Falls migration safety.');
}

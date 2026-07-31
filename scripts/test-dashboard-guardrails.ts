// @ts-nocheck
{
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

const genericTelemetry = read('components/site-telemetry-panel.tsx');
const salinasTelemetry = read('components/site-equipment-dashboard.tsx');
const weatherRoute = read('app/api/sites/[siteid]/weather/route.ts');
const equipmentRoute = read('app/api/sites/[siteid]/equipment/route.ts');
const telemetryRoute = read('app/api/sites/[siteid]/telemetry/route.ts');
const eventsRoute = read('app/api/sites/[siteid]/events/route.ts');
const cannonMigration = read('prisma/migrations/20260729143000_add_cannon_falls_site/migration.sql');
const weatherHero = read('components/location-weather-hero.tsx');
const addressEditor = read('components/facility-address-editor.tsx');
const livePage = read('app/(ops)/sites/[siteid]/page.tsx');
const sitesRepository = read('server/repositories/sites.ts');

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
assert.match(weatherRoute, /!hasDatabaseUrl\(\)[\s\S]*parseSiteAddressInput/);
assert.match(addressEditor, /!storageReady[\s\S]*localStorage\.setItem/);
assert.match(addressEditor, /FACILITY_ADDRESS_UPDATED_EVENT/);
assert.match(livePage, /facilityAddress=\{\{/);
assert.match(salinasTelemetry, /weather\.data\?\.locationLabel \?\? facilityAddressLabel/);
assert.doesNotMatch(addressEditor, /placeholder="3558 E 8th St"/);
assert.match(sitesRepository, /addressLine1: row\.provisioningDetails\?\.addressLine1/);
assert.match(sitesRepository, /postalCode: row\.provisioningDetails\?\.postalCode/);
assert.match(weatherRoute, /const site = await getSite\(user, siteid\)/);
assert.match(weatherRoute, /const address = siteAddressLabel\(site\)/);
assert.match(weatherHero, /allowBrowserDraft[\s\S]*URLSearchParams\(resolvedAddress\)/);
assert.match(weatherHero, /addEventListener\(FACILITY_ADDRESS_UPDATED_EVENT/);
assert.match(weatherHero, /detail\?\.siteId !== siteId/);

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

console.log('Dashboard guardrails passed for telemetry ranges, NWS fallback readiness, scoped address drafts, organization gates, and Cannon Falls migration safety.');
}

// @ts-nocheck
{
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { resolveSiteDashboardFoundation } = require(
  path.join(__dirname, '..', 'lib', 'equipment', 'site-foundation.ts')
);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8'));
}

const catalogRecords = [
  readJson('docs/equipment-data/russell-next-gen-ii-22hp-r404a.json'),
  readJson('docs/equipment-data/russell-next-gen-ii-22hp-r448a.json'),
  readJson('docs/equipment-data/russell-next-gen-minicon-6hp-zs45k4e-r404a.json'),
  readJson('docs/equipment-data/russell-next-gen-minicon-6hp-zs45k4e-r448a.json'),
  readJson('docs/equipment-data/turbo-air-ts060xr404a3a-r404a.json')
];

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

const cannonConfiguration = {
  kind: 'location',
  draft: {
    condenserCount: 2,
    arrangement: 'multiple_parallel_same_system',
    processSolvent: 'ethanol',
    processSolventOther: '',
    ambientMode: 'automatic',
    units: [
      {
        label: 'CH1 Condenser',
        channel: 'CH1',
        catalogSelection: 'russell-next-gen-minicon-6hp-zs45k4e-r404a',
        manufacturer: 'Russell',
        productFamily: 'Next-Gen MiniCon',
        exactModelNumber: 'R*O600E4S**',
        nominalHorsepower: '6',
        refrigerant: 'R404A',
        compressorVariant: 'russell-next-gen-minicon-6hp-zs45k4e-r404a',
        compressorManufacturer: 'Copeland',
        compressorTechnology: 'Scroll',
        compressorModel: 'ZS45K4E',
        voltage: '208-230',
        phase: '3',
        frequencyHz: '60'
      },
      {
        label: 'CH2 Condenser',
        channel: 'CH2',
        catalogSelection: 'russell-next-gen-minicon-6hp-zs45k4e-r404a',
        manufacturer: 'Russell',
        productFamily: 'Next-Gen MiniCon',
        exactModelNumber: 'R*O600E4S**',
        nominalHorsepower: '6',
        refrigerant: 'R404A',
        compressorVariant: 'russell-next-gen-minicon-6hp-zs45k4e-r404a',
        compressorManufacturer: 'Copeland',
        compressorTechnology: 'Scroll',
        compressorModel: 'ZS45K4E',
        voltage: '208-230',
        phase: '3',
        frequencyHz: '60'
      }
    ]
  }
};

const originalCannonConfiguration = structuredClone(cannonConfiguration);
const cannon = resolveSiteDashboardFoundation({
  siteId: 'site-cannon-falls',
  siteName: 'Cannon Falls',
  storedConfiguration: cannonConfiguration,
  catalogRecords
});

assert.equal(cannon.equipmentRecord.siteId, 'site-cannon-falls');
assert.equal(cannon.equipmentRecord.processSystems[0].displayName, 'Cannon Falls refrigeration system');
assert.equal(cannon.equipmentRecord.processSystems[0].condensers.length, 2);
assert.deepEqual(
  cannon.equipmentRecord.processSystems[0].condensers.map((unit) => unit.dashboardChannel),
  ['CH1', 'CH2']
);
assert.deepEqual(
  cannon.equipmentRecord.processSystems[0].condensers.map((unit) => unit.nominalHorsepower),
  [6, 6]
);
assert.equal(cannon.equipmentRecord.processSystems[0].condenserArrangement.selection, 'multiple_parallel_same_system');
assert.equal(cannon.equipmentRecord.processSystems[0].processSolvent.selection, 'ethanol');
assert.equal(cannon.primaryCatalog.catalogRecordId, 'russell-next-gen-minicon-6hp-zs45k4e-r404a');
assert.equal(cannon.dashboardConfiguration.kind, 'salinas');
assert.deepEqual(cannonConfiguration, originalCannonConfiguration, 'Resolving the Live foundation must not mutate saved site data.');

const mixedCatalogSite = resolveSiteDashboardFoundation({
  siteId: 'site-mixed-equipment',
  siteName: 'Mixed Equipment Site',
  storedConfiguration: {
    kind: 'location',
    draft: {
      condenserCount: 2,
      arrangement: 'multiple_separate_systems',
      processSolvent: 'ethanol',
      units: [
        cannonConfiguration.draft.units[0],
        {
          ...cannonConfiguration.draft.units[1],
          catalogSelection: 'turbo-air-ts060xr404a3a-r404a',
          manufacturer: 'Turbo Air',
          productFamily: 'TS Series',
          exactModelNumber: 'TS060XR404A3A',
          compressorVariant: 'turbo-air-ts060xr404a3a-r404a'
        }
      ]
    }
  },
  catalogRecords
});
assert.deepEqual(
  mixedCatalogSite.equipmentRecord.processSystems[0].condensers.map((unit) => unit.catalogRecordId),
  ['russell-next-gen-minicon-6hp-zs45k4e-r404a', 'turbo-air-ts060xr404a3a-r404a'],
  'Each condenser must retain its own manufacturer catalog selection.'
);

const muhameds = resolveSiteDashboardFoundation({
  siteId: 'site-muhameds-los-angeles',
  siteName: 'MuhaMeds - Los Angeles',
  storedConfiguration: {
    kind: 'location',
    draft: {
      condenserCount: 5,
      arrangement: 'two_independent_cascade_pairs_plus_freezer',
      processSolvent: 'ethanol',
      units: Array.from({ length: 5 }, (_, index) => ({
        ...cannonConfiguration.draft.units[index % 2],
        label: index === 4 ? 'Freezer Condenser' : `Condenser ${index + 1}`,
        channel: `CH${index + 1}`
      }))
    }
  },
  catalogRecords
});
const muhamedsSystem = muhameds.equipmentRecord.processSystems[0];
assert.equal(muhamedsSystem.condensers.length, 5);
assert.deepEqual(muhamedsSystem.condensers.map((unit) => unit.dashboardChannel), ['CH1', 'CH2', 'CH3', 'CH4', 'CH5']);
assert.equal(muhamedsSystem.condenserArrangement.selection, 'two_independent_cascade_pairs_plus_freezer');
assert.deepEqual(
  muhamedsSystem.condensers.map((unit) => unit.cascadePairId),
  [
    'site-muhameds-los-angeles-cascade-pair-1',
    'site-muhameds-los-angeles-cascade-pair-1',
    'site-muhameds-los-angeles-cascade-pair-2',
    'site-muhameds-los-angeles-cascade-pair-2',
    null
  ]
);
assert.deepEqual(
  muhamedsSystem.condensers.map((unit) => unit.cascadeStageRole),
  ['process_stage', 'cascade_stage', 'process_stage', 'cascade_stage', null]
);
assert.deepEqual(
  muhamedsSystem.condensers.map((unit) => unit.equipmentDuty),
  ['process', 'process', 'process', 'process', 'freezer']
);
assert.equal(muhamedsSystem.condensers[4].displayName, 'Freezer Condenser');
assert.equal(muhamedsSystem.refrigerationCircuits.length, 5);

const salinasRecord = readJson('docs/equipment-data/site-salinas-equipment.json');
const salinas = resolveSiteDashboardFoundation({
  siteId: 'site-salinas',
  siteName: 'Salinas',
  storedConfiguration: null,
  verifiedRecord: salinasRecord,
  catalogRecords
});
assert.equal(salinas.equipmentRecord, salinasRecord, 'Verified source records must remain the source of truth.');
assert.equal(salinas.equipmentRecord.processSystems[0].condensers.length, 2);
assert.equal(salinas.primaryCatalog.catalogRecordId, 'russell-next-gen-ii-22hp-r404a');

const futureSite = resolveSiteDashboardFoundation({
  siteId: 'site-future',
  siteName: 'Future Extraction Site',
  storedConfiguration: null,
  catalogRecords
});
assert.equal(futureSite.equipmentRecord.recordStatus, 'base_template_pending');
assert.equal(futureSite.equipmentRecord.processSystems[0].condensers.length, 1);
assert.equal(futureSite.equipmentRecord.processSystems[0].condensers[0].dashboardChannel, 'CH1');
assert.equal(futureSite.dashboardConfiguration.kind, 'salinas');

const savedBlankSite = resolveSiteDashboardFoundation({
  siteId: 'site-saved-blank',
  siteName: 'Saved Blank Site',
  storedConfiguration: {
    kind: 'location',
    draft: {
      condenserCount: 1,
      arrangement: 'single',
      processSolvent: '',
      units: [{ label: 'Condenser 1', channel: 'CH1', compressorVariant: 'unconfirmed' }]
    }
  },
  catalogRecords
});
assert.equal(
  savedBlankSite.equipmentRecord.recordStatus,
  'base_template_pending',
  'A saved blank form must not be mislabeled as configured equipment.'
);

const livePage = read('app/(ops)/sites/[siteid]/page.tsx');
assert.match(livePage, /resolveSiteDashboardFoundation/);
assert.match(livePage, /<SiteEquipmentDashboard/);
assert.match(
  livePage,
  /facilityAddress=\{\{[\s\S]*addressLine1: site\.addressLine1[\s\S]*postalCode: site\.postalCode/,
  'The shared Live page must pass its saved site address to the weather hero.'
);
assert.doesNotMatch(livePage, /LocationEquipmentWorkspace|SiteTelemetryPanel|hasEquipmentDashboard/);
assert.match(livePage, /canEdit=\{false\}/, 'The shared Live view must stay read-only.');

const dashboard = read('components/site-equipment-dashboard.tsx');
assert.match(dashboard, /siteName: string/);
assert.match(dashboard, /facilityAddress\?: FacilityAddress/);
assert.match(dashboard, /formatFacilityAddress\(facilityAddress\)/);
assert.match(dashboard, /weather\.data\?\.locationLabel \?\? facilityAddressLabel/);
assert.match(
  dashboard,
  /backgroundImage: weather\.data\?\.imageryUrl[\s\S]*linear-gradient\(145deg/,
  'Address-less sites must use a neutral hero instead of inheriting Salinas satellite imagery.'
);
assert.doesNotMatch(dashboard, /Salinas operating site|3558 E 8th St|22 HP Russell Next-Gen II/);
assert.match(dashboard, /system\.condensers\.map/);
assert.match(
  dashboard,
  /system\.condensers\.map[\s\S]*<TelemetryDial3D label="Process temperature"[\s\S]*<TelemetryDial3D label="Discharge pressure"[\s\S]*<TelemetryDial3D label="Suction pressure"[\s\S]*<TelemetryDial3D label="Compressor current"[\s\S]*<TelemetryDial3D label="Pump current"/,
  'Every configured condenser must render the same five-gauge Live foundation.'
);
assert.match(dashboard, /signals\.temperature\?\.value \?\?[\s\S]*: null\)/);
assert.match(dashboard, /signals\.highPressure\?\.value \?\?[\s\S]*: null\)/);
assert.match(dashboard, /signals\.lowPressure\?\.value \?\?[\s\S]*: null\)/);
assert.match(dashboard, /signals\.compressorAmps\?\.value \?\?[\s\S]*: null\)/);
assert.match(dashboard, /signals\.pumpAmps\?\.value \?\? null/);
assert.match(dashboard, /signalDetail\(signals\.pumpAmps, 'Awaiting sensor'/);
assert.match(dashboard, /Waiting for PLC/, 'Missing telemetry must keep the gauges visible and label the unit clearly.');
assert.match(dashboard, /Equipment selections pending/);
assert.match(dashboard, /Manufacturer source pending/);
assert.match(dashboard, /catalogByRecordId\.get\(asset\.catalogRecordId\)/);
assert.match(dashboard, /analysis\.catalog\.source\.publicationNumber/);
assert.doesNotMatch(dashboard, /14\.5/);

const addressEditor = read('components/facility-address-editor.tsx');
const provisioningWorkspace = read('components/provisioning-workspace.tsx');
for (const source of [addressEditor, provisioningWorkspace]) {
  assert.doesNotMatch(
    source,
    /placeholder="(?:3558 E 8th St|Los Angeles|CA|90023)"/,
    'Blank and future sites must not inherit Salinas-specific address examples.'
  );
}
assert.match(addressEditor, /placeholder="123 Example St"/);
assert.match(addressEditor, /placeholder="City"/);
assert.match(addressEditor, /placeholder="ST"/);
assert.match(addressEditor, /placeholder="00000"/);

console.log('Reusable site foundation checks passed for Salinas, Cannon Falls, and a blank future extraction site.');
}

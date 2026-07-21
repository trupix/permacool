import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const catalog = JSON.parse(
  readFileSync(new URL('../docs/equipment-data/turbo-air-ts060xr404a3a-r404a.json', import.meta.url), 'utf8')
) as Record<string, any>;

assert.equal(catalog.catalogRecordId, 'turbo-air-ts060xr404a3a-r404a');
assert.equal(catalog.manufacturer, 'Turbo Air');
assert.equal(catalog.refrigerant, 'R404A');
assert.equal(catalog.nominalHorsepower, null, 'Unpublished horsepower must not be inferred.');

const variant = catalog.modelVariants[0];
assert.equal(variant.catalogVariantId, 'turbo-air-ts060xr404a3a');
assert.equal(variant.baseModelPattern, 'TS060XR404A3A');
assert.equal(variant.compressor.model, 'ZF18K4E-TF5');
assert.equal(variant.fixedSpecifications.receiverCapacityLbAt90Percent, 31);
assert.equal(variant.electricalRatings[0].minimumCircuitAmpacityA, 29.7);
assert.equal(variant.electricalRatings[0].maximumOvercurrentProtectionA, 50);

const capacityPoints = variant.capacityTable.rows.reduce(
  (total: number, row: { capacityBtuPerHour: number[] }) => total + row.capacityBtuPerHour.length,
  0
);
assert.equal(capacityPoints, 32);
assert.equal(variant.capacityTable.rows[0].capacityBtuPerHour[0], 33130);
assert.equal(variant.capacityTable.rows[3].capacityBtuPerHour[7], 11967);

console.log('Equipment catalog ingestion checks passed.');

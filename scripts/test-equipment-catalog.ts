import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function readCatalog(fileName: string): Record<string, any> {
  return JSON.parse(
    readFileSync(new URL(`../docs/equipment-data/${fileName}`, import.meta.url), 'utf8')
  ) as Record<string, any>;
}

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

const russellR404a = readCatalog('russell-next-gen-minicon-6hp-zs45k4e-r404a.json');
const russellR448a = readCatalog('russell-next-gen-minicon-6hp-zs45k4e-r448a.json');
for (const russell of [russellR404a, russellR448a]) {
  assert.equal(russell.manufacturer, 'Russell');
  assert.equal(russell.productFamily, 'Next-Gen MiniCon');
  assert.equal(russell.nominalHorsepower, 6);
  assert.equal(russell.source.publicationNumber, 'RU-RFH-A1-0925-2');
  assert.equal(
    russell.source.sha256,
    'd285e32a87d8650b7cf61322f4289c25504a0e2eb8fff123b9b6f4846413af31'
  );

  const russellVariant = russell.modelVariants[0];
  assert.equal(russellVariant.baseModelPattern, 'R*O600E4S**');
  assert.equal(russellVariant.compressor.model, 'ZS45K4E');
  assert.equal(russellVariant.fixedSpecifications.receiverPumpDownCapacityLbAt90Percent.standardReceiver.R404A, 28);
  assert.equal(russellVariant.fixedSpecifications.receiverPumpDownCapacityLbAt90Percent.standardReceiver.R448A, 29.4);
  assert.equal(russellVariant.fixedSpecifications.approximateShipWeightLb, 405);
  assert.equal(russellVariant.fixedSpecifications.soundDba, 76);
  assert.equal(russellVariant.electricalRatings[0].compressorRlaA, 21.5);
  assert.equal(russellVariant.electricalRatings[0].compressorLraA, 156);
  assert.equal(russellVariant.electricalRatings[1].compressorRlaA, 8.3);
  assert.equal(russellVariant.electricalRatings[1].compressorLraA, 75);
  assert.equal(russell.powerRatingAvailability.awefValue, 7.6);
}

assert.equal(russellR404a.refrigerant, 'R404A');
assert.deepEqual(russellR404a.capacityRatingBasis.suctionTemperaturesF, [45, 35, 25, 20, 0, -10, -20]);
assert.equal(russellR404a.modelVariants[0].capacityTable.rows[0].capacityBtuPerHour[0], 80860);
assert.equal(russellR404a.modelVariants[0].capacityTable.rows[3].capacityBtuPerHour[6], 18340);

assert.equal(russellR448a.refrigerant, 'R448A');
assert.deepEqual(russellR448a.capacityRatingBasis.suctionTemperaturesF, [45, 35, 30, 25, 20, 0, -5, -10]);
assert.equal(russellR448a.modelVariants[0].capacityTable.rows[0].capacityBtuPerHour[0], 73700);
assert.equal(russellR448a.modelVariants[0].capacityTable.rows[3].capacityBtuPerHour[5], 27820);

console.log('Equipment catalog ingestion checks passed.');

import rawCatalogRecord from '../../docs/equipment-data/russell-next-gen-ii-22hp-r404a.json';
import rawTurboAirCatalogRecord from '../../docs/equipment-data/turbo-air-ts060xr404a3a-r404a.json';
import rawSiteRecord from '../../docs/equipment-data/site-salinas-equipment.json';

import {
  CONDENSER_ARRANGEMENTS,
  PROCESS_SOLVENTS,
  type CatalogCapacityTable,
  type CatalogVariantMatch,
  type CondenserArrangementSelection,
  type CondenserAsset,
  type CondenserCatalogRecord,
  type CondenserCatalogOption,
  type CondenserCatalogVariant,
  type EquipmentDataBundle,
  type ProcessSolventSelection,
  type RefrigerationProcessSystem,
  type SiteEquipmentRecord
} from './types';

type JsonRecord = Record<string, unknown>;

export class EquipmentDataValidationError extends Error {
  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = 'EquipmentDataValidationError';
  }
}

function fail(path: string, message: string): never {
  throw new EquipmentDataValidationError(path, message);
}

function expectRecord(value: unknown, path: string): JsonRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(path, 'expected an object');
  }

  return value as JsonRecord;
}

function expectArray(value: unknown, path: string, allowEmpty = false): unknown[] {
  if (!Array.isArray(value)) {
    fail(path, 'expected an array');
  }
  if (!allowEmpty && value.length === 0) {
    fail(path, 'must not be empty');
  }

  return value;
}

function expectString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(path, 'expected a non-empty string');
  }

  return value;
}

function expectNullableString(value: unknown, path: string): string | null {
  if (value === null) {
    return null;
  }

  return expectString(value, path);
}

function expectOptionalNullableString(value: unknown, path: string): string | null | undefined {
  if (value === undefined || value === null) {
    return value;
  }

  return expectString(value, path);
}

function expectBoolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') {
    fail(path, 'expected a boolean');
  }

  return value;
}

function expectNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(path, 'expected a finite number');
  }

  return value;
}

function expectPositiveNumber(value: unknown, path: string): number {
  const number = expectNumber(value, path);
  if (number <= 0) {
    fail(path, 'must be greater than zero');
  }

  return number;
}

function expectPositiveInteger(value: unknown, path: string): number {
  const number = expectPositiveNumber(value, path);
  if (!Number.isInteger(number)) {
    fail(path, 'expected a positive integer');
  }

  return number;
}

function expectNullableNumber(value: unknown, path: string): number | null {
  if (value === null) {
    return null;
  }

  return expectNumber(value, path);
}

function expectNullablePositiveNumber(value: unknown, path: string): number | null {
  const number = expectNullableNumber(value, path);
  if (number !== null && number <= 0) {
    fail(path, 'must be greater than zero when provided');
  }

  return number;
}

function expectStringArray(value: unknown, path: string, allowEmpty = false): string[] {
  return expectArray(value, path, allowEmpty).map((item, index) => expectString(item, `${path}[${index}]`));
}

function expectNumberArray(value: unknown, path: string, allowEmpty = false): number[] {
  return expectArray(value, path, allowEmpty).map((item, index) => expectNumber(item, `${path}[${index}]`));
}

function expectPage(value: unknown, path: string): number {
  return expectPositiveInteger(value, path);
}

function expectPageArray(value: unknown, path: string): number[] {
  return expectArray(value, path).map((item, index) => expectPage(item, `${path}[${index}]`));
}

function expectOneOf<const TValues extends readonly string[]>(
  value: unknown,
  values: TValues,
  path: string
): TValues[number] {
  const text = expectString(value, path);
  if (!values.includes(text)) {
    fail(path, `expected one of: ${values.join(', ')}`);
  }

  return text as TValues[number];
}

function ensureUnique(values: readonly string[], path: string): void {
  if (new Set(values).size !== values.length) {
    fail(path, 'contains duplicate values');
  }
}

function ensureUniqueNumbers(values: readonly number[], path: string): void {
  if (new Set(values).size !== values.length) {
    fail(path, 'contains duplicate values');
  }
}

function expectExactOptions(
  value: unknown,
  expectedValues: readonly string[],
  path: string
): void {
  const options = expectArray(value, path);
  const actualValues = options.map((option, index) => {
    const record = expectRecord(option, `${path}[${index}]`);
    expectString(record.label, `${path}[${index}].label`);
    return expectString(record.value, `${path}[${index}].value`);
  });

  ensureUnique(actualValues, `${path}.value`);
  if (
    actualValues.length !== expectedValues.length ||
    expectedValues.some((expected) => !actualValues.includes(expected))
  ) {
    fail(path, `must define exactly: ${expectedValues.join(', ')}`);
  }
}

function validateInstalledElectrical(value: unknown, path: string): void {
  const record = expectRecord(value, path);
  const voltage = record.voltage;
  if (voltage !== null && typeof voltage !== 'string' && typeof voltage !== 'number') {
    fail(`${path}.voltage`, 'expected a string, number, or null');
  }
  if (typeof voltage === 'string') {
    expectString(voltage, `${path}.voltage`);
  }
  if (typeof voltage === 'number') {
    expectPositiveNumber(voltage, `${path}.voltage`);
  }

  for (const key of ['phase', 'frequencyHz', 'nameplateRlaA', 'nameplateLraA'] as const) {
    const number = expectNullableNumber(record[key], `${path}.${key}`);
    if (number !== null && number <= 0) {
      fail(`${path}.${key}`, 'must be greater than zero when provided');
    }
  }

  expectOneOf(record.verificationStatus, ['requires_nameplate', 'verified'] as const, `${path}.verificationStatus`);
}

function validateInstalledCompressor(value: unknown, path: string): void {
  const record = expectRecord(value, path);
  for (const key of ['manufacturer', 'technology', 'model', 'serialNumber'] as const) {
    expectNullableString(record[key], `${path}.${key}`);
  }
  expectOneOf(record.verificationStatus, ['requires_nameplate', 'verified'] as const, `${path}.verificationStatus`);
}

function validateCondenserAsset(value: unknown, path: string): void {
  const record = expectRecord(value, path);
  for (const key of [
    'assetId',
    'dashboardChannel',
    'displayName',
    'manufacturer',
    'productFamily',
    'refrigerationCircuitId',
    'refrigerant',
    'catalogRecordId'
  ] as const) {
    expectString(record[key], `${path}.${key}`);
  }
  expectOptionalNullableString(record.telemetryDeviceId, `${path}.telemetryDeviceId`);
  expectOneOf(record.equipmentType, ['air_cooled_condensing_unit'] as const, `${path}.equipmentType`);
  expectPositiveNumber(record.nominalHorsepower, `${path}.nominalHorsepower`);
  expectNullableString(record.parallelGroupId, `${path}.parallelGroupId`);
  expectOptionalNullableString(record.highSideRole, `${path}.highSideRole`);
  if (record.highSideRole !== undefined && record.highSideRole !== null) {
    expectOneOf(record.highSideRole, ['primary', 'subcooler'] as const, `${path}.highSideRole`);
  }
  expectNullableString(record.catalogVariantId, `${path}.catalogVariantId`);
  const candidates = expectStringArray(record.catalogVariantCandidates, `${path}.catalogVariantCandidates`, true);
  ensureUnique(candidates, `${path}.catalogVariantCandidates`);
  if (record.catalogVariantId === null && candidates.length === 0) {
    fail(path, 'requires a selected catalog variant or at least one catalog-variant candidate');
  }
  expectNullableString(record.exactModelNumber, `${path}.exactModelNumber`);
  expectNullableString(record.serialNumber, `${path}.serialNumber`);
  validateInstalledElectrical(record.installedElectrical, `${path}.installedElectrical`);
  validateInstalledCompressor(record.compressor, `${path}.compressor`);
}

function validateRefrigerationCircuit(value: unknown, path: string): void {
  const record = expectRecord(value, path);
  expectString(record.circuitId, `${path}.circuitId`);
  expectString(record.displayName, `${path}.displayName`);
  expectString(record.refrigerant, `${path}.refrigerant`);
  const charge = expectNullableNumber(record.refrigerantChargeLb, `${path}.refrigerantChargeLb`);
  if (charge !== null && charge <= 0) {
    fail(`${path}.refrigerantChargeLb`, 'must be greater than zero when provided');
  }
  expectString(record.assignment, `${path}.assignment`);
}

function validateProcessSystem(value: unknown, path: string): void {
  const record = expectRecord(value, path);
  expectString(record.systemId, `${path}.systemId`);
  expectString(record.displayName, `${path}.displayName`);

  const solvent = expectRecord(record.processSolvent, `${path}.processSolvent`);
  expectOneOf(solvent.selection, PROCESS_SOLVENTS, `${path}.processSolvent.selection`);
  expectString(solvent.displayName, `${path}.processSolvent.displayName`);
  const concentration = expectNullableNumber(
    solvent.concentrationPercent,
    `${path}.processSolvent.concentrationPercent`
  );
  if (concentration !== null && (concentration < 0 || concentration > 100)) {
    fail(`${path}.processSolvent.concentrationPercent`, 'must be between 0 and 100');
  }

  const arrangement = expectRecord(record.condenserArrangement, `${path}.condenserArrangement`);
  const selection = expectOneOf(
    arrangement.selection,
    CONDENSER_ARRANGEMENTS,
    `${path}.condenserArrangement.selection`
  );
  expectString(arrangement.displayName, `${path}.condenserArrangement.displayName`);
  const declaredCount = expectPositiveInteger(
    arrangement.condenserCount,
    `${path}.condenserArrangement.condenserCount`
  );
  const sharedCircuit = expectBoolean(
    arrangement.sharedRefrigerationCircuit,
    `${path}.condenserArrangement.sharedRefrigerationCircuit`
  );
  const arrangementParallelGroup = expectOptionalNullableString(
    arrangement.parallelGroupId,
    `${path}.condenserArrangement.parallelGroupId`
  );

  const circuitValues = expectArray(record.refrigerationCircuits, `${path}.refrigerationCircuits`);
  circuitValues.forEach((circuit, index) =>
    validateRefrigerationCircuit(circuit, `${path}.refrigerationCircuits[${index}]`)
  );
  const circuits = circuitValues as unknown as RefrigerationProcessSystem['refrigerationCircuits'];
  ensureUnique(
    circuits.map((circuit) => circuit.circuitId),
    `${path}.refrigerationCircuits.circuitId`
  );

  const condenserValues = expectArray(record.condensers, `${path}.condensers`);
  condenserValues.forEach((condenser, index) => validateCondenserAsset(condenser, `${path}.condensers[${index}]`));
  const condensers = condenserValues as unknown as CondenserAsset[];
  ensureUnique(
    condensers.map((condenser) => condenser.assetId),
    `${path}.condensers.assetId`
  );
  ensureUnique(
    condensers.map((condenser) => condenser.dashboardChannel),
    `${path}.condensers.dashboardChannel`
  );

  if (declaredCount !== condensers.length) {
    fail(`${path}.condenserArrangement.condenserCount`, `declares ${declaredCount}, found ${condensers.length}`);
  }

  const circuitsById = new Map(circuits.map((circuit) => [circuit.circuitId, circuit]));
  for (const [index, condenser] of condensers.entries()) {
    const circuit = circuitsById.get(condenser.refrigerationCircuitId);
    if (!circuit) {
      fail(
        `${path}.condensers[${index}].refrigerationCircuitId`,
        `does not reference a circuit in process system ${record.systemId as string}`
      );
    }
    if (circuit.refrigerant !== condenser.refrigerant) {
      fail(
        `${path}.condensers[${index}].refrigerant`,
        `does not match referenced circuit refrigerant ${circuit.refrigerant}`
      );
    }
  }

  const assignedCircuitIds = condensers.map((condenser) => condenser.refrigerationCircuitId);
  if (selection === 'single' && condensers.length !== 1) {
    fail(`${path}.condensers`, 'single arrangement requires exactly one condenser');
  }
  if (selection === 'multiple_separate_systems') {
    if (sharedCircuit) {
      fail(`${path}.condenserArrangement.sharedRefrigerationCircuit`, 'must be false for separate systems');
    }
    if (new Set(assignedCircuitIds).size !== condensers.length) {
      fail(`${path}.condensers`, 'separate systems must use distinct refrigeration circuits');
    }
  }
  if (selection === 'multiple_parallel_same_system') {
    if (condensers.length < 2) {
      fail(`${path}.condensers`, 'parallel arrangement requires at least two condensers');
    }
    if (!sharedCircuit) {
      fail(`${path}.condenserArrangement.sharedRefrigerationCircuit`, 'must be true for parallel condensers');
    }
    if (!arrangementParallelGroup) {
      fail(`${path}.condenserArrangement.parallelGroupId`, 'is required for parallel condensers');
    }
    if (new Set(assignedCircuitIds).size !== 1) {
      fail(`${path}.condensers`, 'parallel condensers must share one refrigeration circuit');
    }
    const refrigerants = new Set(condensers.map((condenser) => condenser.refrigerant));
    if (refrigerants.size !== 1) {
      fail(`${path}.condensers`, 'parallel condensers must use the same refrigerant');
    }
    condensers.forEach((condenser, index) => {
      if (condenser.parallelGroupId !== arrangementParallelGroup) {
        fail(
          `${path}.condensers[${index}].parallelGroupId`,
          `must match arrangement parallelGroupId ${arrangementParallelGroup}`
        );
      }
    });
  }
  if (selection === 'multiple_high_side_subcooling') {
    if (new Set(assignedCircuitIds).size !== condensers.length) {
      fail(`${path}.condensers`, 'high-side subcooling condensers require separate circuit records');
    }
    const roles = condensers.map((condenser) => condenser.highSideRole);
    if (!roles.includes('primary') || !roles.includes('subcooler')) {
      fail(`${path}.condensers.highSideRole`, 'requires both primary and subcooler roles');
    }
  }
}

function validateCalculationPolicy(value: unknown, path: string): void {
  const record = expectRecord(value, path);
  expectBoolean(record.manufacturerCapacityCalculationEnabled, `${path}.manufacturerCapacityCalculationEnabled`);
  expectStringArray(record.enableOnlyAfter, `${path}.enableOnlyAfter`);
  expectStringArray(record.ambientInputPriority, `${path}.ambientInputPriority`);
  for (const key of [
    'capacityInterpolation',
    'capacityExtrapolation',
    'parallelAggregation',
    'electricalPower'
  ] as const) {
    expectString(record[key], `${path}.${key}`);
  }
}

export function validateSiteEquipmentRecord(value: unknown): asserts value is SiteEquipmentRecord {
  const record = expectRecord(value, 'siteEquipment');
  expectPositiveInteger(record.schemaVersion, 'siteEquipment.schemaVersion');
  expectString(record.siteId, 'siteEquipment.siteId');
  expectString(record.recordStatus, 'siteEquipment.recordStatus');
  expectString(record.verifiedFrom, 'siteEquipment.verifiedFrom');
  const verifiedOn = expectString(record.verifiedOn, 'siteEquipment.verifiedOn');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(verifiedOn) || Number.isNaN(Date.parse(`${verifiedOn}T00:00:00Z`))) {
    fail('siteEquipment.verifiedOn', 'expected a valid YYYY-MM-DD date');
  }

  const systems = expectArray(record.processSystems, 'siteEquipment.processSystems');
  systems.forEach((system, index) => validateProcessSystem(system, `siteEquipment.processSystems[${index}]`));
  const typedSystems = systems as unknown as RefrigerationProcessSystem[];
  ensureUnique(
    typedSystems.map((system) => system.systemId),
    'siteEquipment.processSystems.systemId'
  );

  const selectionOptions = expectRecord(record.selectionOptions, 'siteEquipment.selectionOptions');
  expectExactOptions(
    selectionOptions.condenserArrangement,
    CONDENSER_ARRANGEMENTS,
    'siteEquipment.selectionOptions.condenserArrangement'
  );
  expectExactOptions(
    selectionOptions.processSolvent,
    PROCESS_SOLVENTS,
    'siteEquipment.selectionOptions.processSolvent'
  );
  expectStringArray(record.validationRules, 'siteEquipment.validationRules');
  validateCalculationPolicy(record.calculationPolicy, 'siteEquipment.calculationPolicy');
}

function validateCatalogSource(value: unknown, path: string): void {
  const record = expectRecord(value, path);
  for (const key of ['documentTitle', 'publicationNumber', 'publicationDate', 'fileName'] as const) {
    expectString(record[key], `${path}.${key}`);
  }
  expectOptionalNullableString(record.replacesPublication, `${path}.replacesPublication`);
  const sha256 = expectString(record.sha256, `${path}.sha256`);
  if (!/^[a-f0-9]{64}$/i.test(sha256)) {
    fail(`${path}.sha256`, 'expected a 64-character SHA-256 digest');
  }

  const pages = expectRecord(record.sourcePages, `${path}.sourcePages`);
  if (Object.keys(pages).length === 0) {
    fail(`${path}.sourcePages`, 'must contain at least one named page reference');
  }
  Object.entries(pages).forEach(([key, page]) => {
    if (Array.isArray(page)) {
      expectPageArray(page, `${path}.sourcePages.${key}`);
    } else {
      expectPage(page, `${path}.sourcePages.${key}`);
    }
  });
}

function validateCatalogFeatures(value: unknown, path: string): void {
  expectArray(value, path).forEach((feature, index) => {
    const featurePath = `${path}[${index}]`;
    const record = expectRecord(feature, featurePath);
    expectString(record.feature, `${featurePath}.feature`);
    if (record.detail !== undefined) {
      expectString(record.detail, `${featurePath}.detail`);
    }
    const hasPage = record.sourcePage !== undefined;
    const hasPages = record.sourcePages !== undefined;
    if (hasPage === hasPages) {
      fail(featurePath, 'requires exactly one of sourcePage or sourcePages');
    }
    if (hasPage) {
      expectPage(record.sourcePage, `${featurePath}.sourcePage`);
    } else {
      expectPageArray(record.sourcePages, `${featurePath}.sourcePages`);
    }
  });
}

function validateCapacityRatingBasis(value: unknown, path: string): void {
  const record = expectRecord(value, path);
  expectOneOf(record.capacityUnit, ['BTU/h'] as const, `${path}.capacityUnit`);
  expectPositiveNumber(record.frequencyHz, `${path}.frequencyHz`);
  const ambient = expectNumberArray(record.ambientTemperaturesF, `${path}.ambientTemperaturesF`);
  const suction = expectNumberArray(record.suctionTemperaturesF, `${path}.suctionTemperaturesF`);
  ensureUniqueNumbers(ambient, `${path}.ambientTemperaturesF`);
  ensureUniqueNumbers(suction, `${path}.suctionTemperaturesF`);
  expectNullableNumber(record.compressorSuperheatF, `${path}.compressorSuperheatF`);
  expectNullablePositiveNumber(record.capacityMultiplierFor50Hz, `${path}.capacityMultiplierFor50Hz`);
  if (record.approximateCapacityMultiplierAt65FReturnGas !== null) {
    const multiplier = expectRecord(
      record.approximateCapacityMultiplierAt65FReturnGas,
      `${path}.approximateCapacityMultiplierAt65FReturnGas`
    );
    const minimum = expectPositiveNumber(
      multiplier.minimum,
      `${path}.approximateCapacityMultiplierAt65FReturnGas.minimum`
    );
    const maximum = expectPositiveNumber(
      multiplier.maximum,
      `${path}.approximateCapacityMultiplierAt65FReturnGas.maximum`
    );
    if (minimum > maximum) {
      fail(`${path}.approximateCapacityMultiplierAt65FReturnGas`, 'minimum must not exceed maximum');
    }
  }
  expectStringArray(record.notes, `${path}.notes`);
}

function validatePowerRatingAvailability(value: unknown, path: string): void {
  const record = expectRecord(value, path);
  for (const key of [
    'inputPowerCurveStatus',
    'copStatus',
    'eerStatus',
    'awefStatus',
    'preferredFutureSource'
  ] as const) {
    expectString(record[key], `${path}.${key}`);
  }
  expectOneOf(record.inputPowerUnit, ['kW'] as const, `${path}.inputPowerUnit`);
  if (record.inputPowerValues !== null) {
    expectNumberArray(record.inputPowerValues, `${path}.inputPowerValues`, true);
  }
  if (record.awefValue !== undefined) {
    expectNullablePositiveNumber(record.awefValue, `${path}.awefValue`);
  }
  expectPage(record.sourcePageForAwefLimitation, `${path}.sourcePageForAwefLimitation`);
}

function validateCatalogCompressor(value: unknown, path: string): void {
  const record = expectRecord(value, path);
  for (const key of [
    'manufacturer',
    'technology',
    'model',
    'staging',
    'lowTemperatureCoolingProvision'
  ] as const) {
    expectString(record[key], `${path}.${key}`);
  }
  expectPositiveInteger(record.count, `${path}.count`);
}

function validateFixedSpecifications(value: unknown, path: string): void {
  const record = expectRecord(value, path);
  expectNullablePositiveNumber(record.nominalHorsepower, `${path}.nominalHorsepower`);
  expectString(record.suctionConnectionIn, `${path}.suctionConnectionIn`);
  expectString(record.liquidConnectionIn, `${path}.liquidConnectionIn`);
  if (record.receiverPumpDownCapacityLbAt80Percent !== null) {
    const pumpDown = expectRecord(
      record.receiverPumpDownCapacityLbAt80Percent,
      `${path}.receiverPumpDownCapacityLbAt80Percent`
    );
    expectPositiveNumber(
      pumpDown.standardReceiverR404A,
      `${path}.receiverPumpDownCapacityLbAt80Percent.standardReceiverR404A`
    );
    expectPositiveNumber(
      pumpDown.oversizedReceiverR404A,
      `${path}.receiverPumpDownCapacityLbAt80Percent.oversizedReceiverR404A`
    );
  }
  if (record.receiverCapacityLbAt90Percent !== undefined) {
    expectNullablePositiveNumber(record.receiverCapacityLbAt90Percent, `${path}.receiverCapacityLbAt90Percent`);
  }
  expectNullableString(record.cabinetSize, `${path}.cabinetSize`);
  expectPositiveInteger(record.condenserFanQuantity, `${path}.condenserFanQuantity`);
  if (record.fanAirflowCfm !== undefined) {
    expectNullablePositiveNumber(record.fanAirflowCfm, `${path}.fanAirflowCfm`);
  }
  const dimensions = expectRecord(record.dimensionsIn, `${path}.dimensionsIn`);
  for (const key of ['depth', 'width', 'height'] as const) {
    const dimension = dimensions[key];
    if (typeof dimension === 'number') {
      expectPositiveNumber(dimension, `${path}.dimensionsIn.${key}`);
    } else {
      expectString(dimension, `${path}.dimensionsIn.${key}`);
    }
  }
  expectNullablePositiveNumber(record.approximateShipWeightLb, `${path}.approximateShipWeightLb`);
  for (const key of ['netWeightLb', 'soundDba'] as const) {
    if (record[key] !== undefined) {
      expectNullablePositiveNumber(record[key], `${path}.${key}`);
    }
  }
  expectPageArray(record.sourcePages, `${path}.sourcePages`);
}

function validateElectricalRatings(value: unknown, path: string): void {
  const ratings = expectArray(value, path);
  const supplyKeys: string[] = [];
  ratings.forEach((rating, ratingIndex) => {
    const ratingPath = `${path}[${ratingIndex}]`;
    const record = expectRecord(rating, ratingPath);
    const supplies = expectArray(record.supplyOptions, `${ratingPath}.supplyOptions`);
    supplies.forEach((supply, supplyIndex) => {
      const supplyPath = `${ratingPath}.supplyOptions[${supplyIndex}]`;
      const supplyRecord = expectRecord(supply, supplyPath);
      const voltage = expectString(supplyRecord.voltage, `${supplyPath}.voltage`);
      const phase = expectPositiveInteger(supplyRecord.phase, `${supplyPath}.phase`);
      const frequency = expectPositiveNumber(supplyRecord.frequencyHz, `${supplyPath}.frequencyHz`);
      supplyKeys.push(`${voltage}/${phase}/${frequency}`);
    });

    for (const key of ['compressorRlaA', 'compressorLraA'] as const) {
      expectPositiveNumber(record[key], `${ratingPath}.${key}`);
    }
    for (const key of [
      'totalCondenserFanFlaA',
      'minimumCircuitAmpacityA',
      'maximumOvercurrentProtectionA',
      'airDefrostMcaA',
      'airDefrostMopdA',
      'electricDefrostMcaA',
      'electricDefrostMopdA',
      'representativeDefrostAmpsA',
      'representativeEvaporatorFanAmpsA'
    ] as const) {
      if (record[key] !== undefined) {
        expectNullablePositiveNumber(record[key], `${ratingPath}.${key}`);
      }
    }
    expectPage(record.sourcePage, `${ratingPath}.sourcePage`);
  });
  ensureUnique(supplyKeys, `${path}.supplyOptions`);
}

function validateCapacityTable(value: unknown, path: string): CatalogCapacityTable {
  const record = expectRecord(value, path);
  const suctionTemperatures = expectNumberArray(record.suctionTemperaturesF, `${path}.suctionTemperaturesF`);
  ensureUniqueNumbers(suctionTemperatures, `${path}.suctionTemperaturesF`);
  expectString(record.interpolationPolicy, `${path}.interpolationPolicy`);
  expectString(record.extrapolationPolicy, `${path}.extrapolationPolicy`);
  const rows = expectArray(record.rows, `${path}.rows`);
  const ambientTemperatures: number[] = [];
  rows.forEach((row, rowIndex) => {
    const rowPath = `${path}.rows[${rowIndex}]`;
    const rowRecord = expectRecord(row, rowPath);
    ambientTemperatures.push(expectNumber(rowRecord.ambientTemperatureF, `${rowPath}.ambientTemperatureF`));
    const capacities = expectArray(rowRecord.capacityBtuPerHour, `${rowPath}.capacityBtuPerHour`);
    if (capacities.length !== suctionTemperatures.length) {
      fail(
        `${rowPath}.capacityBtuPerHour`,
        `contains ${capacities.length} points for ${suctionTemperatures.length} suction temperatures`
      );
    }
    capacities.forEach((capacity, capacityIndex) => {
      if (capacity === null) {
        return;
      }
      expectPositiveNumber(capacity, `${rowPath}.capacityBtuPerHour[${capacityIndex}]`);
    });
  });
  ensureUniqueNumbers(ambientTemperatures, `${path}.rows.ambientTemperatureF`);
  expectPage(record.sourcePage, `${path}.sourcePage`);

  return value as CatalogCapacityTable;
}

function sameNumberSet(left: readonly number[], right: readonly number[]): boolean {
  return left.length === right.length && left.every((value) => right.includes(value));
}

function validateCatalogVariant(
  value: unknown,
  path: string,
  rootHorsepower: number | null,
  ratingAmbientTemperatures: readonly number[],
  ratingSuctionTemperatures: readonly number[]
): void {
  const record = expectRecord(value, path);
  expectString(record.catalogVariantId, `${path}.catalogVariantId`);
  expectString(record.baseModelPattern, `${path}.baseModelPattern`);
  expectString(record.modelNumberStatus, `${path}.modelNumberStatus`);
  validateCatalogCompressor(record.compressor, `${path}.compressor`);
  validateFixedSpecifications(record.fixedSpecifications, `${path}.fixedSpecifications`);
  const fixed = record.fixedSpecifications as JsonRecord;
  if (fixed.nominalHorsepower !== rootHorsepower) {
    fail(`${path}.fixedSpecifications.nominalHorsepower`, `must match catalog value ${rootHorsepower}`);
  }
  validateElectricalRatings(record.electricalRatings, `${path}.electricalRatings`);
  const capacityTable = validateCapacityTable(record.capacityTable, `${path}.capacityTable`);
  if (!sameNumberSet(capacityTable.suctionTemperaturesF, ratingSuctionTemperatures)) {
    fail(`${path}.capacityTable.suctionTemperaturesF`, 'must match the catalog rating basis');
  }
  const rowAmbientTemperatures = capacityTable.rows.map((row) => row.ambientTemperatureF);
  if (!sameNumberSet(rowAmbientTemperatures, ratingAmbientTemperatures)) {
    fail(`${path}.capacityTable.rows`, 'ambient temperatures must match the catalog rating basis');
  }
}

export function validateCondenserCatalogRecord(value: unknown): asserts value is CondenserCatalogRecord {
  const record = expectRecord(value, 'equipmentCatalog');
  expectPositiveInteger(record.schemaVersion, 'equipmentCatalog.schemaVersion');
  for (const key of ['catalogRecordId', 'manufacturer', 'productFamily', 'refrigerant'] as const) {
    expectString(record[key], `equipmentCatalog.${key}`);
  }
  expectOneOf(record.equipmentType, ['air_cooled_condensing_unit'] as const, 'equipmentCatalog.equipmentType');
  const horsepower = expectNullablePositiveNumber(record.nominalHorsepower, 'equipmentCatalog.nominalHorsepower');
  expectOneOf(
    record.applicationRange,
    ['medium_temperature', 'extended_range_medium', 'low_temperature', 'extra_low_temperature'] as const,
    'equipmentCatalog.applicationRange'
  );
  validateCatalogSource(record.source, 'equipmentCatalog.source');
  validateCatalogFeatures(record.commonFeatures, 'equipmentCatalog.commonFeatures');
  validateCapacityRatingBasis(record.capacityRatingBasis, 'equipmentCatalog.capacityRatingBasis');
  validatePowerRatingAvailability(record.powerRatingAvailability, 'equipmentCatalog.powerRatingAvailability');

  const ratingBasis = record.capacityRatingBasis as JsonRecord;
  const ambientTemperatures = ratingBasis.ambientTemperaturesF as number[];
  const suctionTemperatures = ratingBasis.suctionTemperaturesF as number[];
  const variants = expectArray(record.modelVariants, 'equipmentCatalog.modelVariants');
  variants.forEach((variant, index) =>
    validateCatalogVariant(
      variant,
      `equipmentCatalog.modelVariants[${index}]`,
      horsepower,
      ambientTemperatures,
      suctionTemperatures
    )
  );
  const typedVariants = variants as unknown as CondenserCatalogVariant[];
  ensureUnique(
    typedVariants.map((variant) => variant.catalogVariantId),
    'equipmentCatalog.modelVariants.catalogVariantId'
  );
  expectStringArray(record.calculationWarnings, 'equipmentCatalog.calculationWarnings');
}

function validateCrossRecordReferences(bundle: EquipmentDataBundle): void {
  const catalogsById = new Map(bundle.catalogs.map((catalog) => [catalog.catalogRecordId, catalog]));
  for (const [siteIndex, site] of bundle.sites.entries()) {
    for (const [systemIndex, system] of site.processSystems.entries()) {
      for (const [assetIndex, asset] of system.condensers.entries()) {
        const path = `sites[${siteIndex}].processSystems[${systemIndex}].condensers[${assetIndex}]`;
        const catalog = catalogsById.get(asset.catalogRecordId);
        if (!catalog) {
          fail(`${path}.catalogRecordId`, `unknown catalog record ${asset.catalogRecordId}`);
        }
        if (catalog.manufacturer !== asset.manufacturer || catalog.productFamily !== asset.productFamily) {
          fail(path, 'asset manufacturer/product family does not match its catalog record');
        }
        if (catalog.equipmentType !== asset.equipmentType) {
          fail(`${path}.equipmentType`, 'does not match its catalog record');
        }
        if (catalog.nominalHorsepower !== null && catalog.nominalHorsepower !== asset.nominalHorsepower) {
          fail(`${path}.nominalHorsepower`, 'does not match its catalog record');
        }
        if (catalog.refrigerant !== asset.refrigerant) {
          fail(`${path}.refrigerant`, 'does not match its catalog record');
        }

        const variantsById = new Map(catalog.modelVariants.map((variant) => [variant.catalogVariantId, variant]));
        asset.catalogVariantCandidates.forEach((candidateId, candidateIndex) => {
          if (!variantsById.has(candidateId)) {
            fail(`${path}.catalogVariantCandidates[${candidateIndex}]`, `unknown catalog variant ${candidateId}`);
          }
        });
        if (asset.catalogVariantId && !variantsById.has(asset.catalogVariantId)) {
          fail(`${path}.catalogVariantId`, `unknown catalog variant ${asset.catalogVariantId}`);
        }
      }
    }
  }
}

export function loadEquipmentData(): EquipmentDataBundle {
  const siteRecord: unknown = rawSiteRecord;
  const catalogRecord: unknown = rawCatalogRecord;
  const turboAirCatalogRecord: unknown = rawTurboAirCatalogRecord;
  validateSiteEquipmentRecord(siteRecord);
  validateCondenserCatalogRecord(catalogRecord);
  validateCondenserCatalogRecord(turboAirCatalogRecord);

  const bundle: EquipmentDataBundle = {
    sites: [siteRecord],
    catalogs: [catalogRecord, turboAirCatalogRecord]
  };
  validateCrossRecordReferences(bundle);
  return bundle;
}

export const equipmentData = loadEquipmentData();
export const siteEquipmentRecords = equipmentData.sites;
export const equipmentCatalogRecords = equipmentData.catalogs;
export const condenserCatalogOptions: readonly CondenserCatalogOption[] = equipmentCatalogRecords.flatMap(
  (catalog) =>
    catalog.modelVariants.map((variant) => ({
      catalogRecordId: catalog.catalogRecordId,
      catalogVariantId: variant.catalogVariantId,
      label: `${catalog.manufacturer} ${variant.baseModelPattern} - ${catalog.refrigerant}`,
      manufacturer: catalog.manufacturer,
      productFamily: catalog.productFamily,
      model: variant.baseModelPattern,
      refrigerant: catalog.refrigerant,
      nominalHorsepower: catalog.nominalHorsepower,
      applicationRange: catalog.applicationRange
    }))
);

const sitesById = new Map(siteEquipmentRecords.map((site) => [site.siteId, site]));
const catalogsById = new Map(equipmentCatalogRecords.map((catalog) => [catalog.catalogRecordId, catalog]));
const variantsById = new Map<string, CatalogVariantMatch>();

for (const catalog of equipmentCatalogRecords) {
  for (const variant of catalog.modelVariants) {
    variantsById.set(variant.catalogVariantId, { catalog, variant });
  }
}

export function getSiteEquipmentRecord(siteId: string): SiteEquipmentRecord | undefined {
  return sitesById.get(siteId);
}

export function getEquipmentCatalogRecord(catalogRecordId: string): CondenserCatalogRecord | undefined {
  return catalogsById.get(catalogRecordId);
}

export function getEquipmentCatalogVariant(catalogVariantId: string): CatalogVariantMatch | undefined {
  return variantsById.get(catalogVariantId);
}

export function getSiteCondenserAssets(siteId: string): readonly CondenserAsset[] {
  return getSiteEquipmentRecord(siteId)?.processSystems.flatMap((system) => system.condensers) ?? [];
}

export type { CondenserArrangementSelection, ProcessSolventSelection };

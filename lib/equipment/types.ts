export const CONDENSER_ARRANGEMENTS = [
  'single',
  'multiple_separate_systems',
  'multiple_parallel_same_system',
  'multiple_high_side_subcooling'
] as const;

export type CondenserArrangementSelection = (typeof CONDENSER_ARRANGEMENTS)[number];

export const PROCESS_SOLVENTS = ['ethanol', 'butane', 'other'] as const;

export type ProcessSolventSelection = (typeof PROCESS_SOLVENTS)[number];
export type EquipmentVerificationStatus = 'requires_nameplate' | 'verified';
export type CondenserRole = 'primary' | 'subcooler';
export type CatalogApplicationRange =
  | 'medium_temperature'
  | 'extended_range_medium'
  | 'low_temperature'
  | 'extra_low_temperature';

export interface SelectionOption<TValue extends string> {
  value: TValue;
  label: string;
}

export interface ProcessSolvent {
  selection: ProcessSolventSelection;
  displayName: string;
  concentrationPercent: number | null;
}

export interface CondenserArrangement {
  selection: CondenserArrangementSelection;
  displayName: string;
  condenserCount: number;
  sharedRefrigerationCircuit: boolean;
  parallelGroupId?: string | null;
}

export interface RefrigerationCircuit {
  circuitId: string;
  displayName: string;
  refrigerant: string;
  refrigerantChargeLb: number | null;
  assignment: string;
}

export interface InstalledElectricalData {
  voltage: string | number | null;
  phase: number | null;
  frequencyHz: number | null;
  nameplateRlaA: number | null;
  nameplateLraA: number | null;
  verificationStatus: EquipmentVerificationStatus;
}

export interface InstalledCompressorData {
  manufacturer: string | null;
  technology: string | null;
  model: string | null;
  serialNumber: string | null;
  verificationStatus: EquipmentVerificationStatus;
}

export interface CondenserAsset {
  assetId: string;
  dashboardChannel: string;
  telemetryDeviceId?: string | null;
  displayName: string;
  equipmentType: 'air_cooled_condensing_unit';
  manufacturer: string;
  productFamily: string;
  nominalHorsepower: number;
  refrigerationCircuitId: string;
  refrigerant: string;
  parallelGroupId: string | null;
  highSideRole?: CondenserRole | null;
  catalogRecordId: string;
  catalogVariantId: string | null;
  catalogVariantCandidates: string[];
  exactModelNumber: string | null;
  serialNumber: string | null;
  installedElectrical: InstalledElectricalData;
  compressor: InstalledCompressorData;
}

export interface RefrigerationProcessSystem {
  systemId: string;
  displayName: string;
  processSolvent: ProcessSolvent;
  condenserArrangement: CondenserArrangement;
  refrigerationCircuits: RefrigerationCircuit[];
  condensers: CondenserAsset[];
}

export interface EquipmentCalculationPolicy {
  manufacturerCapacityCalculationEnabled: boolean;
  enableOnlyAfter: string[];
  ambientInputPriority: string[];
  capacityInterpolation: string;
  capacityExtrapolation: string;
  parallelAggregation: string;
  electricalPower: string;
}

export interface SiteEquipmentRecord {
  schemaVersion: number;
  siteId: string;
  recordStatus: string;
  verifiedFrom: string;
  verifiedOn: string;
  processSystems: RefrigerationProcessSystem[];
  selectionOptions: {
    condenserArrangement: SelectionOption<CondenserArrangementSelection>[];
    processSolvent: SelectionOption<ProcessSolventSelection>[];
  };
  validationRules: string[];
  calculationPolicy: EquipmentCalculationPolicy;
}

export type CatalogSourcePages = Record<string, number | number[]>;

export interface CatalogSource {
  documentTitle: string;
  publicationNumber: string;
  replacesPublication?: string | null;
  publicationDate: string;
  fileName: string;
  sha256: string;
  sourcePages: CatalogSourcePages;
}

export type CatalogFeature = {
  feature: string;
  detail?: string;
} & (
  | { sourcePage: number; sourcePages?: never }
  | { sourcePages: number[]; sourcePage?: never }
);

export interface CapacityRatingBasis {
  capacityUnit: 'BTU/h';
  frequencyHz: number;
  ambientTemperaturesF: number[];
  suctionTemperaturesF: number[];
  compressorSuperheatF: number | null;
  capacityMultiplierFor50Hz: number | null;
  approximateCapacityMultiplierAt65FReturnGas: {
    minimum: number;
    maximum: number;
  } | null;
  notes: string[];
}

export interface PowerRatingAvailability {
  inputPowerCurveStatus: string;
  inputPowerUnit: 'kW';
  inputPowerValues: number[] | null;
  copStatus: string;
  eerStatus: string;
  awefStatus: string;
  awefValue?: number | null;
  sourcePageForAwefLimitation: number;
  preferredFutureSource: string;
}

export interface CatalogCompressor {
  manufacturer: string;
  technology: string;
  model: string;
  count: number;
  staging: string;
  lowTemperatureCoolingProvision: string;
}

export interface CatalogFixedSpecifications {
  nominalHorsepower: number | null;
  suctionConnectionIn: string;
  liquidConnectionIn: string;
  receiverPumpDownCapacityLbAt80Percent: {
    standardReceiverR404A: number;
    oversizedReceiverR404A: number;
  } | null;
  receiverCapacityLbAt90Percent?: number | null;
  cabinetSize: string | null;
  condenserFanQuantity: number;
  fanAirflowCfm?: number | null;
  dimensionsIn: {
    depth: number | string;
    width: number | string;
    height: number | string;
  };
  approximateShipWeightLb: number | null;
  netWeightLb?: number | null;
  soundDba?: number | null;
  sourcePages: number[];
}

export interface ElectricalSupplyOption {
  voltage: string;
  phase: number;
  frequencyHz: number;
}

export interface CatalogElectricalRating {
  supplyOptions: ElectricalSupplyOption[];
  compressorRlaA: number;
  compressorLraA: number;
  totalCondenserFanFlaA: number | null;
  minimumCircuitAmpacityA?: number | null;
  maximumOvercurrentProtectionA?: number | null;
  airDefrostMcaA: number | null;
  airDefrostMopdA: number | null;
  electricDefrostMcaA: number | null;
  electricDefrostMopdA: number | null;
  representativeDefrostAmpsA: number | null;
  representativeEvaporatorFanAmpsA: number | null;
  sourcePage: number;
}

export interface CapacityTableRow {
  ambientTemperatureF: number;
  capacityBtuPerHour: Array<number | null>;
}

export interface CatalogCapacityTable {
  suctionTemperaturesF: number[];
  interpolationPolicy: string;
  extrapolationPolicy: string;
  rows: CapacityTableRow[];
  sourcePage: number;
}

export interface CondenserCatalogVariant {
  catalogVariantId: string;
  baseModelPattern: string;
  modelNumberStatus: string;
  compressor: CatalogCompressor;
  fixedSpecifications: CatalogFixedSpecifications;
  electricalRatings: CatalogElectricalRating[];
  capacityTable: CatalogCapacityTable;
}

export interface CondenserCatalogRecord {
  schemaVersion: number;
  catalogRecordId: string;
  manufacturer: string;
  productFamily: string;
  equipmentType: 'air_cooled_condensing_unit';
  nominalHorsepower: number | null;
  applicationRange: CatalogApplicationRange;
  refrigerant: string;
  source: CatalogSource;
  commonFeatures: CatalogFeature[];
  capacityRatingBasis: CapacityRatingBasis;
  powerRatingAvailability: PowerRatingAvailability;
  modelVariants: CondenserCatalogVariant[];
  calculationWarnings: string[];
}

export interface EquipmentDataBundle {
  sites: readonly SiteEquipmentRecord[];
  catalogs: readonly CondenserCatalogRecord[];
}

export interface CatalogVariantMatch {
  catalog: CondenserCatalogRecord;
  variant: CondenserCatalogVariant;
}

export interface CondenserCatalogOption {
  catalogRecordId: string;
  catalogVariantId: string;
  label: string;
  manufacturer: string;
  productFamily: string;
  model: string;
  refrigerant: string;
  nominalHorsepower: number | null;
  applicationRange: CatalogApplicationRange;
}

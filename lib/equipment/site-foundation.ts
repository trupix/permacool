import type {
  CondenserArrangementSelection,
  CondenserAsset,
  CondenserCatalogRecord,
  ProcessSolventSelection,
  RefrigerationCircuit,
  SiteEquipmentRecord
} from './types';
import type { StoredEquipmentConfiguration } from '../../server/repositories/equipment-configurations';

type JsonRecord = Record<string, unknown>;

const CONDENSER_ARRANGEMENTS: readonly CondenserArrangementSelection[] = [
  'single',
  'multiple_separate_systems',
  'multiple_parallel_same_system',
  'multiple_high_side_subcooling'
];

const PROCESS_SOLVENTS: readonly ProcessSolventSelection[] = ['ethanol', 'butane', 'other'];

type LocationUnitDraft = {
  label: string;
  channel: string;
  catalogSelection: string;
  manufacturer: string;
  productFamily: string;
  exactModelNumber: string;
  serialNumber: string;
  nominalHorsepower: string;
  refrigerant: string;
  refrigerantOther: string;
  refrigerantChargeLb: string;
  compressorVariant: string;
  compressorManufacturer: string;
  compressorTechnology: string;
  compressorModel: string;
  compressorSerialNumber: string;
  voltage: string;
  phase: string;
  frequencyHz: string;
  nameplateRlaA: string;
  nameplateLraA: string;
};

const arrangementLabels: Record<CondenserArrangementSelection, string> = {
  single: 'Single condenser',
  multiple_separate_systems: 'Multiple - separate systems',
  multiple_parallel_same_system: 'Multiple - parallel on the same system',
  multiple_high_side_subcooling: "Multiple - one subcools the other's high side"
};

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function asNumber(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(asString(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizedVoltage(value: unknown) {
  const voltage = asString(value);
  if (voltage === '208' || voltage === '230') return '208-230';
  if (voltage === '480' || voltage === '460/480') return '460';
  return ['200-220', '208-230', '380', '460', '575'].includes(voltage)
    ? voltage
    : 'unconfirmed';
}

function normalizedFrequency(value: unknown): 50 | 60 | 'unconfirmed' {
  const frequency = asNumber(value);
  return frequency === 50 || frequency === 60 ? frequency : 'unconfirmed';
}

function defaultUnit(index: number): LocationUnitDraft {
  return {
    label: `Condenser ${index + 1}`,
    channel: `CH${index + 1}`,
    catalogSelection: '',
    manufacturer: '',
    productFamily: '',
    exactModelNumber: '',
    serialNumber: '',
    nominalHorsepower: '',
    refrigerant: '',
    refrigerantOther: '',
    refrigerantChargeLb: '',
    compressorVariant: '',
    compressorManufacturer: '',
    compressorTechnology: '',
    compressorModel: '',
    compressorSerialNumber: '',
    voltage: 'unconfirmed',
    phase: '',
    frequencyHz: 'unconfirmed',
    nameplateRlaA: '',
    nameplateLraA: ''
  };
}

function readLocationUnit(value: unknown, index: number): LocationUnitDraft {
  const source = asRecord(value);
  const fallback = defaultUnit(index);
  return Object.fromEntries(
    Object.entries(fallback).map(([key, defaultValue]) => [key, asString(source[key], defaultValue)])
  ) as LocationUnitDraft;
}

function catalogForUnit(unit: LocationUnitDraft, catalogRecords: readonly CondenserCatalogRecord[]) {
  const selectedCatalog = catalogRecords.find((catalog) => catalog.catalogRecordId === unit.catalogSelection);
  if (selectedCatalog) return selectedCatalog;

  const selectedVariantCatalog = catalogRecords.find((catalog) =>
    catalog.modelVariants.some((variant) => variant.catalogVariantId === unit.compressorVariant)
  );
  if (selectedVariantCatalog) return selectedVariantCatalog;

  const manufacturer = unit.manufacturer.toLowerCase().replaceAll(' ', '');
  const horsepower = asNumber(unit.nominalHorsepower);
  const refrigerant = unit.refrigerant.toUpperCase();
  return catalogRecords.find((catalog) =>
    catalog.manufacturer.toLowerCase().replaceAll(' ', '') === manufacturer &&
    catalog.nominalHorsepower === horsepower &&
    catalog.refrigerant.toUpperCase() === refrigerant
  );
}

function variantIdForUnit(unit: LocationUnitDraft, catalog: CondenserCatalogRecord | undefined) {
  if (!catalog) return null;
  if (catalog.modelVariants.some((variant) => variant.catalogVariantId === unit.compressorVariant)) {
    return unit.compressorVariant;
  }
  if (catalog.modelVariants.some((variant) => variant.catalogVariantId === unit.catalogSelection)) {
    return unit.catalogSelection;
  }
  return catalog.modelVariants.length === 1 ? catalog.modelVariants[0].catalogVariantId : null;
}

function arrangementFrom(value: unknown, condenserCount: number): CondenserArrangementSelection {
  if (condenserCount === 1) return 'single';
  return typeof value === 'string' && CONDENSER_ARRANGEMENTS.includes(value as CondenserArrangementSelection)
    ? value as CondenserArrangementSelection
    : 'multiple_separate_systems';
}

function solventFrom(value: unknown): ProcessSolventSelection {
  return typeof value === 'string' && PROCESS_SOLVENTS.includes(value as ProcessSolventSelection)
    ? value as ProcessSolventSelection
    : 'other';
}

function displaySolvent(selection: ProcessSolventSelection, other: string) {
  if (selection === 'ethanol') return 'Ethanol';
  if (selection === 'butane') return 'Butane';
  return other || 'Not selected';
}

function buildConfiguredFoundation({
  siteId,
  siteName,
  storedConfiguration,
  catalogRecords
}: {
  siteId: string;
  siteName: string;
  storedConfiguration: StoredEquipmentConfiguration | null;
  catalogRecords: readonly CondenserCatalogRecord[];
}) {
  const fallbackCatalog =
    catalogRecords.find((catalog) => catalog.catalogRecordId === 'russell-next-gen-minicon-6hp-zs45k4e-r404a') ??
    catalogRecords[0];
  if (!fallbackCatalog) {
    throw new Error('The reusable site foundation requires at least one equipment catalog record.');
  }
  const source = storedConfiguration?.kind === 'location'
    ? asRecord(storedConfiguration.draft)
    : {};
  const sourceUnits = Array.isArray(source.units) ? source.units : [];
  const configuredCount = source.condenserCount === 2 || sourceUnits.length >= 2 ? 2 : 1;
  const units = Array.from({ length: configuredCount }, (_, index) => readLocationUnit(sourceUnits[index], index));
  const arrangement = arrangementFrom(source.arrangement, configuredCount);
  const solvent = solventFrom(source.processSolvent);
  const solventOther = asString(source.processSolventOther);
  const parallelGroupId = arrangement === 'multiple_parallel_same_system'
    ? `${siteId}-parallel-group-01`
    : null;
  const configuredCatalogs = units.map((unit) => catalogForUnit(unit, catalogRecords));
  const primaryCatalog = configuredCatalogs.find(Boolean) ?? fallbackCatalog;

  const condensers: CondenserAsset[] = units.map((unit, index) => {
    const configuredCatalog = configuredCatalogs[index];
    const catalog = configuredCatalog ?? primaryCatalog;
    const variantId = variantIdForUnit(unit, configuredCatalog);
    const channel = unit.channel || `CH${index + 1}`;
    const refrigerationCircuitId = arrangement === 'multiple_parallel_same_system'
      ? `${siteId}-circuit-01`
      : `${siteId}-circuit-${index + 1}`;
    const refrigerant = unit.refrigerant === 'other'
      ? unit.refrigerantOther || 'Other'
      : unit.refrigerant || configuredCatalog?.refrigerant || 'Unconfirmed';
    const nominalHorsepower = asNumber(unit.nominalHorsepower) ?? configuredCatalog?.nominalHorsepower ?? 0;
    const installedVoltage = normalizedVoltage(unit.voltage);
    const installedFrequency = normalizedFrequency(unit.frequencyHz);

    return {
      assetId: `${siteId}-condenser-${channel.toLowerCase()}`,
      dashboardChannel: channel,
      telemetryDeviceId: null,
      displayName: unit.label || `${channel} Condenser`,
      equipmentType: 'air_cooled_condensing_unit',
      manufacturer: unit.manufacturer || configuredCatalog?.manufacturer || 'Manufacturer pending',
      productFamily: unit.productFamily || configuredCatalog?.productFamily || 'Equipment selection pending',
      nominalHorsepower,
      refrigerationCircuitId,
      refrigerant,
      parallelGroupId,
      highSideRole: arrangement === 'multiple_high_side_subcooling'
        ? index === 0 ? 'primary' : 'subcooler'
        : null,
      catalogRecordId: catalog.catalogRecordId,
      catalogVariantId: variantId,
      catalogVariantCandidates: configuredCatalog
        ? configuredCatalog.modelVariants.map((variant) => variant.catalogVariantId)
        : [],
      exactModelNumber: unit.exactModelNumber || null,
      serialNumber: unit.serialNumber || null,
      installedElectrical: {
        voltage: installedVoltage === 'unconfirmed' ? null : installedVoltage,
        phase: asNumber(unit.phase),
        frequencyHz: installedFrequency === 'unconfirmed' ? null : installedFrequency,
        nameplateRlaA: asNumber(unit.nameplateRlaA),
        nameplateLraA: asNumber(unit.nameplateLraA),
        verificationStatus: unit.serialNumber ? 'verified' : 'requires_nameplate'
      },
      compressor: {
        manufacturer: unit.compressorManufacturer || null,
        technology: unit.compressorTechnology || null,
        model: unit.compressorModel || null,
        serialNumber: unit.compressorSerialNumber || null,
        verificationStatus: unit.compressorModel ? 'verified' : 'requires_nameplate'
      }
    };
  });

  const circuitIds = [...new Set(condensers.map((condenser) => condenser.refrigerationCircuitId))];
  const refrigerationCircuits: RefrigerationCircuit[] = circuitIds.map((circuitId, index) => {
    const circuitCondensers = condensers.filter((condenser) => condenser.refrigerationCircuitId === circuitId);
    const refrigerants = [...new Set(circuitCondensers.map((condenser) => condenser.refrigerant))];
    return {
      circuitId,
      displayName: arrangement === 'multiple_parallel_same_system'
        ? 'Shared refrigeration circuit'
        : `Refrigeration circuit ${index + 1}`,
      refrigerant: refrigerants.join(' / ') || 'Unconfirmed',
      refrigerantChargeLb: asNumber(units[index]?.refrigerantChargeLb),
      assignment: arrangement === 'multiple_parallel_same_system'
        ? 'shared_by_parallel_condensing_units'
        : 'assigned_to_individual_condensing_unit'
    };
  });

  const hasConfiguredEquipment = units.some((unit) => Boolean(
    unit.manufacturer ||
    unit.nominalHorsepower ||
    unit.catalogSelection ||
    (unit.compressorVariant && unit.compressorVariant !== 'unconfirmed')
  ));
  const equipmentRecord: SiteEquipmentRecord = {
    schemaVersion: 1,
    siteId,
    recordStatus: hasConfiguredEquipment ? 'configured_from_site_selections' : 'base_template_pending',
    verifiedFrom: hasConfiguredEquipment ? 'Saved location equipment selections' : 'Reusable site foundation',
    verifiedOn: '2026-07-31',
    processSystems: [{
      systemId: `${siteId}-process-system-01`,
      displayName: `${siteName} refrigeration system`,
      processSolvent: {
        selection: solvent,
        displayName: displaySolvent(solvent, solventOther),
        concentrationPercent: null
      },
      condenserArrangement: {
        selection: arrangement,
        displayName: arrangementLabels[arrangement],
        condenserCount: condensers.length,
        sharedRefrigerationCircuit: arrangement === 'multiple_parallel_same_system',
        parallelGroupId
      },
      refrigerationCircuits,
      condensers
    }],
    selectionOptions: {
      condenserArrangement: CONDENSER_ARRANGEMENTS.map((value) => ({ value, label: arrangementLabels[value] })),
      processSolvent: [
        { value: 'ethanol', label: 'Ethanol' },
        { value: 'butane', label: 'Butane' },
        { value: 'other', label: 'Other' }
      ]
    },
    validationRules: [
      'Every site uses the same operating-page foundation.',
      'Site identity, address, equipment selections, controller links, and telemetry remain site-scoped.',
      'Manufacturer calculations require a matching catalog and confirmed operating inputs.'
    ],
    calculationPolicy: {
      manufacturerCapacityCalculationEnabled: Boolean(configuredCatalogs.find(Boolean)),
      enableOnlyAfter: [
        'The installed condenser model and refrigerant are selected.',
        'The installed frequency is confirmed.',
        'The suction-temperature input is thermodynamically defined and validated.'
      ],
      ambientInputPriority: ['condenser_entering_air_sensor', 'local_weather_with_lower_quality_flag'],
      capacityInterpolation: 'bilinear_inside_published_envelope_only',
      capacityExtrapolation: 'disabled',
      parallelAggregation: 'Sum active units only when evaluated at comparable operating conditions.',
      electricalPower: 'Do not infer real kW from compressor amps alone.'
    }
  };

  const dashboardConfiguration: StoredEquipmentConfiguration = {
    kind: 'salinas',
    draft: {
      arrangement,
      solvent,
      units: Object.fromEntries(condensers.map((condenser, index) => [
        condenser.assetId,
        {
          refrigerant: configuredCatalogs[index]?.refrigerant ?? condenser.refrigerant,
          variant: condenser.catalogVariantId ?? 'unconfirmed',
          voltage: normalizedVoltage(units[index].voltage),
          frequencyHz: normalizedFrequency(units[index].frequencyHz)
        }
      ])),
      ambientMode: source.ambientMode === 'manual' ? 'manual' : 'automatic',
      manualAmbientF: asNumber(source.manualAmbientF) ?? 95,
      manualSuctionF: asNumber(source.manualSuctionF) ?? -20,
      manualSuctionValidated: source.manualSuctionValidated === true
    }
  };

  return { equipmentRecord, primaryCatalog, dashboardConfiguration };
}

export function resolveSiteDashboardFoundation({
  siteId,
  siteName,
  storedConfiguration,
  verifiedRecord,
  catalogRecords
}: {
  siteId: string;
  siteName: string;
  storedConfiguration: StoredEquipmentConfiguration | null;
  verifiedRecord?: SiteEquipmentRecord;
  catalogRecords: readonly CondenserCatalogRecord[];
}) {
  const fallbackCatalog =
    catalogRecords.find((catalog) => catalog.catalogRecordId === 'russell-next-gen-minicon-6hp-zs45k4e-r404a') ??
    catalogRecords[0];
  if (!fallbackCatalog) {
    throw new Error('The reusable site foundation requires at least one equipment catalog record.');
  }

  if (verifiedRecord) {
    const catalogId = verifiedRecord.processSystems[0]?.condensers[0]?.catalogRecordId;
    return {
      equipmentRecord: verifiedRecord,
      primaryCatalog: catalogRecords.find((catalog) => catalog.catalogRecordId === catalogId) ?? fallbackCatalog,
      dashboardConfiguration: storedConfiguration?.kind === 'salinas' ? storedConfiguration : null
    };
  }

  return buildConfiguredFoundation({ siteId, siteName, storedConfiguration, catalogRecords });
}

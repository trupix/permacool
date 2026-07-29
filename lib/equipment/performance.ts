/**
 * Pure Russell catalog capacity evaluation.
 *
 * Manufacturer catalog values, live operating inputs, and derived estimates
 * intentionally occupy separate fields in every result. This module does not
 * read files, query telemetry, or infer electrical kW from nameplate amperage.
 */

export type AmbientTemperatureSource =
  | 'condenser_entering_air_sensor'
  | 'local_weather'
  | 'manual_entry'
  | 'unknown';

export type SuctionTemperatureSource =
  | 'validated_pressure_temperature_conversion'
  | 'validated_manufacturer_axis_sensor'
  | 'process_fluid_temperature_estimate'
  | 'manual_entry'
  | 'unknown';

export interface RussellLiveOperatingPoint {
  /** Live/fallback input. It never overwrites a manufacturer table value. */
  ambientTemperatureF: number;
  /** Live/derived input mapped to the catalog's "suction temperature" axis. */
  suctionTemperatureF: number;
  ambientSource: AmbientTemperatureSource;
  suctionSource: SuctionTemperatureSource;
  /** The caller must explicitly confirm the catalog-axis interpretation. */
  suctionAxisValidated: boolean;
  capturedAt?: string;
}

export interface RussellUnitEvaluationRequest {
  unitId: string;
  active: boolean;
  catalogVariantId: string | null;
  installedFrequencyHz: number;
  liveOperatingPoint: RussellLiveOperatingPoint;
  parallelGroupId?: string;
}

interface RussellCapacityRow {
  ambientTemperatureF: number;
  capacityBtuPerHour: number[];
}

interface RussellCapacityTable {
  suctionTemperaturesF: number[];
  rows: RussellCapacityRow[];
  sourcePage: number;
}

interface RussellCatalogVariant {
  catalogVariantId: string;
  baseModelPattern: string;
  capacityTable: RussellCapacityTable;
}

export interface RussellPerformanceCatalog {
  schemaVersion: number;
  catalogRecordId: string;
  manufacturer: string;
  productFamily: string;
  refrigerant: string;
  capacityRatingBasis: {
    capacityUnit: 'BTU/h';
    frequencyHz: 60;
    ambientTemperaturesF: number[];
    suctionTemperaturesF: number[];
    capacityMultiplierFor50Hz: number;
  };
  modelVariants: RussellCatalogVariant[];
}

export type RussellCatalogLoadResult =
  | {
      status: 'ok';
      catalog: RussellPerformanceCatalog;
      errors: [];
    }
  | {
      status: 'invalid_catalog';
      catalog: null;
      errors: string[];
    };

export type RussellUnitEvaluationStatus =
  | 'ok'
  | 'inactive'
  | 'invalid_catalog'
  | 'variant_required'
  | 'variant_not_found'
  | 'invalid_live_conditions'
  | 'unvalidated_suction_axis'
  | 'unsupported_frequency'
  | 'outside_published_envelope';

export interface RussellCatalogReference {
  catalogRecordId: string;
  catalogVariantId: string;
  baseModelPattern: string;
  refrigerant: string;
  sourcePage: number;
  publishedEnvelope: {
    ambientTemperatureF: { minimum: number; maximum: number };
    suctionTemperatureF: { minimum: number; maximum: number };
  };
}

export interface RussellCapacityQuality {
  overall: 'catalog_supported' | 'reduced_input_quality' | 'unavailable';
  tableLookup: 'exact_catalog_point' | 'bilinear_interpolation' | null;
  ambientInputQuality: 'on_site_sensor' | 'weather_fallback' | 'other' | null;
  suctionInputQuality:
    | 'validated_pressure_temperature_conversion'
    | 'validated_manufacturer_axis_sensor'
    | 'process_fluid_temperature_estimate'
    | 'other'
    | null;
  frequencyAdjustment: 'none' | 'manufacturer_50hz_multiplier' | null;
  warnings: string[];
  provenance: {
    manufacturerTableValues: 'manufacturer_catalog';
    operatingInputs: 'live_operating_point';
    output: 'derived_capacity_estimate' | 'not_available';
  };
}

export interface RussellUnitCapacityEvaluation {
  unitId: string;
  active: boolean;
  status: RussellUnitEvaluationStatus;
  message: string;
  /** A copy of live/fallback inputs, never catalog data. */
  liveOperatingPoint: RussellLiveOperatingPoint;
  catalogReference: RussellCatalogReference | null;
  /** Catalog lookup/interpolation at the catalog's native 60 Hz basis. */
  manufacturerTableEvaluation: {
    tableFrequencyHz: 60;
    capacityBtuPerHour: number;
    ambientBracketF: [number, number];
    suctionBracketF: [number, number];
  } | null;
  /** Derived output after the explicit installed-frequency adjustment. */
  derivedCapacity: {
    capacityBtuPerHour: number;
    capacityTons: number;
    installedFrequencyHz: 50 | 60;
    appliedCapacityMultiplier: number;
    method:
      | 'catalog_value_at_live_operating_point'
      | 'catalog_value_at_live_operating_point_with_50hz_multiplier';
  } | null;
  quality: RussellCapacityQuality;
}

export interface RussellParallelEvaluationOptions {
  /** Reject totals when active-unit timestamps differ by more than this. */
  maxTimestampSkewSeconds?: number;
}

export interface RussellParallelCapacityEvaluation {
  status:
    | 'ok'
    | 'no_active_units'
    | 'invalid_catalog'
    | 'incomplete_active_unit_evaluations'
    | 'conditions_not_comparable';
  message: string;
  activeUnitCount: number;
  unitResults: RussellUnitCapacityEvaluation[];
  derivedCapacity: {
    combinedCapacityBtuPerHour: number;
    combinedCapacityTons: number;
    activeUnitIds: string[];
    method: 'sum_of_active_unit_derived_capacity_estimates';
  } | null;
  quality: {
    overall:
      | 'catalog_supported'
      | 'reduced_input_quality'
      | 'unavailable'
      | 'not_applicable';
    warnings: string[];
    provenance: {
      manufacturerTableValues: 'manufacturer_catalog';
      operatingInputs: 'live_operating_points';
      output: 'derived_parallel_capacity_estimate' | 'not_available';
    };
  };
}

interface NumberBracket {
  lowerIndex: number;
  upperIndex: number;
  lowerValue: number;
  upperValue: number;
}

interface InterpolationResult {
  status: 'ok' | 'outside_published_envelope';
  capacityBtuPerHour: number | null;
  ambientBracketF: [number, number] | null;
  suctionBracketF: [number, number] | null;
  usedInterpolation: boolean;
  outsideAxes: Array<'ambientTemperatureF' | 'suctionTemperatureF'>;
}

const EPSILON = 1e-9;
const BTU_PER_HOUR_PER_TON = 12_000;
const DEFAULT_MAX_TIMESTAMP_SKEW_SECONDS = 300;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function readNumberArray(
  value: unknown,
  path: string,
  errors: string[],
  requireUnique = false,
): number[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${path} must be a non-empty number array.`);
    return null;
  }

  if (!value.every(isFiniteNumber)) {
    errors.push(`${path} must contain only finite numbers.`);
    return null;
  }

  const values = [...value];
  if (requireUnique && new Set(values).size !== values.length) {
    errors.push(`${path} must not contain duplicate axis values.`);
    return null;
  }

  return values;
}

function sameNumericSet(left: number[], right: number[]): boolean {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort((a, b) => a - b);
  const sortedRight = [...right].sort((a, b) => a - b);
  return sortedLeft.every(
    (value, index) => Math.abs(value - sortedRight[index]) <= EPSILON,
  );
}

/**
 * Validate and copy the structural subset used by the evaluator.
 * File I/O deliberately belongs to the caller/loader.
 */
export function loadRussellPerformanceCatalog(
  input: unknown,
): RussellCatalogLoadResult {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return {
      status: 'invalid_catalog',
      catalog: null,
      errors: ['Catalog must be a JSON object.'],
    };
  }

  const schemaVersion = input.schemaVersion;
  const catalogRecordId = input.catalogRecordId;
  const manufacturer = input.manufacturer;
  const productFamily = input.productFamily;
  const refrigerant = input.refrigerant;

  if (!isFiniteNumber(schemaVersion)) errors.push('schemaVersion must be numeric.');
  if (typeof catalogRecordId !== 'string' || !catalogRecordId.trim()) {
    errors.push('catalogRecordId must be a non-empty string.');
  }
  if (manufacturer !== 'Russell') {
    errors.push('manufacturer must be Russell for this evaluator.');
  }
  if (typeof productFamily !== 'string' || !productFamily.trim()) {
    errors.push('productFamily must be a non-empty string.');
  }
  if (refrigerant !== 'R404A') {
    errors.push('refrigerant must be R404A for this catalog evaluator.');
  }

  const basisInput = input.capacityRatingBasis;
  let ratingAmbient: number[] | null = null;
  let ratingSuction: number[] | null = null;
  let capacityMultiplierFor50Hz: number | null = null;

  if (!isRecord(basisInput)) {
    errors.push('capacityRatingBasis must be an object.');
  } else {
    if (basisInput.capacityUnit !== 'BTU/h') {
      errors.push('capacityRatingBasis.capacityUnit must be BTU/h.');
    }
    if (basisInput.frequencyHz !== 60) {
      errors.push('capacityRatingBasis.frequencyHz must be the published 60 Hz basis.');
    }
    ratingAmbient = readNumberArray(
      basisInput.ambientTemperaturesF,
      'capacityRatingBasis.ambientTemperaturesF',
      errors,
      true,
    );
    ratingSuction = readNumberArray(
      basisInput.suctionTemperaturesF,
      'capacityRatingBasis.suctionTemperaturesF',
      errors,
      true,
    );
    if (
      !isFiniteNumber(basisInput.capacityMultiplierFor50Hz) ||
      basisInput.capacityMultiplierFor50Hz <= 0
    ) {
      errors.push(
        'capacityRatingBasis.capacityMultiplierFor50Hz must be a positive number.',
      );
    } else {
      capacityMultiplierFor50Hz = basisInput.capacityMultiplierFor50Hz;
    }
  }

  const variants: RussellCatalogVariant[] = [];
  const variantIds = new Set<string>();
  const rawVariants = input.modelVariants;
  if (!Array.isArray(rawVariants) || rawVariants.length === 0) {
    errors.push('modelVariants must be a non-empty array.');
  } else {
    rawVariants.forEach((rawVariant, variantIndex) => {
      const path = `modelVariants[${variantIndex}]`;
      if (!isRecord(rawVariant)) {
        errors.push(`${path} must be an object.`);
        return;
      }

      const catalogVariantId = rawVariant.catalogVariantId;
      const baseModelPattern = rawVariant.baseModelPattern;
      if (typeof catalogVariantId !== 'string' || !catalogVariantId.trim()) {
        errors.push(`${path}.catalogVariantId must be a non-empty string.`);
        return;
      }
      if (variantIds.has(catalogVariantId)) {
        errors.push(`${path}.catalogVariantId is duplicated.`);
        return;
      }
      variantIds.add(catalogVariantId);
      if (typeof baseModelPattern !== 'string' || !baseModelPattern.trim()) {
        errors.push(`${path}.baseModelPattern must be a non-empty string.`);
      }

      const tableInput = rawVariant.capacityTable;
      if (!isRecord(tableInput)) {
        errors.push(`${path}.capacityTable must be an object.`);
        return;
      }

      const suctionTemperaturesF = readNumberArray(
        tableInput.suctionTemperaturesF,
        `${path}.capacityTable.suctionTemperaturesF`,
        errors,
        true,
      );
      const sourcePage = tableInput.sourcePage;
      if (!Number.isInteger(sourcePage) || (sourcePage as number) <= 0) {
        errors.push(`${path}.capacityTable.sourcePage must be a positive integer.`);
      }

      const rows: RussellCapacityRow[] = [];
      const ambientValues = new Set<number>();
      if (!Array.isArray(tableInput.rows) || tableInput.rows.length === 0) {
        errors.push(`${path}.capacityTable.rows must be a non-empty array.`);
      } else {
        tableInput.rows.forEach((rawRow, rowIndex) => {
          const rowPath = `${path}.capacityTable.rows[${rowIndex}]`;
          if (!isRecord(rawRow)) {
            errors.push(`${rowPath} must be an object.`);
            return;
          }
          const ambientTemperatureF = rawRow.ambientTemperatureF;
          const capacities = readNumberArray(
            rawRow.capacityBtuPerHour,
            `${rowPath}.capacityBtuPerHour`,
            errors,
          );
          if (!isFiniteNumber(ambientTemperatureF)) {
            errors.push(`${rowPath}.ambientTemperatureF must be finite.`);
            return;
          }
          if (ambientValues.has(ambientTemperatureF)) {
            errors.push(`${rowPath}.ambientTemperatureF is duplicated.`);
            return;
          }
          ambientValues.add(ambientTemperatureF);
          if (capacities && capacities.some((capacity) => capacity <= 0)) {
            errors.push(`${rowPath}.capacityBtuPerHour must contain positive values.`);
          }
          if (
            capacities &&
            suctionTemperaturesF &&
            capacities.length !== suctionTemperaturesF.length
          ) {
            errors.push(
              `${rowPath}.capacityBtuPerHour length must match the suction axis.`,
            );
          }
          if (capacities) {
            rows.push({ ambientTemperatureF, capacityBtuPerHour: capacities });
          }
        });
      }

      if (
        ratingAmbient &&
        rows.length > 0 &&
        !sameNumericSet(
          ratingAmbient,
          rows.map((row) => row.ambientTemperatureF),
        )
      ) {
        errors.push(`${path}.capacityTable ambient rows do not match the rating basis.`);
      }
      if (
        ratingSuction &&
        suctionTemperaturesF &&
        !sameNumericSet(ratingSuction, suctionTemperaturesF)
      ) {
        errors.push(`${path}.capacityTable suction axis does not match the rating basis.`);
      }

      if (
        suctionTemperaturesF &&
        Number.isInteger(sourcePage) &&
        (sourcePage as number) > 0 &&
        rows.length > 0
      ) {
        variants.push({
          catalogVariantId,
          baseModelPattern:
            typeof baseModelPattern === 'string' ? baseModelPattern : '',
          capacityTable: {
            suctionTemperaturesF,
            rows,
            sourcePage: sourcePage as number,
          },
        });
      }
    });
  }

  if (errors.length > 0 || !ratingAmbient || !ratingSuction || !capacityMultiplierFor50Hz) {
    return { status: 'invalid_catalog', catalog: null, errors };
  }

  return {
    status: 'ok',
    errors: [],
    catalog: {
      schemaVersion: schemaVersion as number,
      catalogRecordId: catalogRecordId as string,
      manufacturer: 'Russell',
      productFamily: productFamily as string,
      refrigerant: 'R404A',
      capacityRatingBasis: {
        capacityUnit: 'BTU/h',
        frequencyHz: 60,
        ambientTemperaturesF: ratingAmbient,
        suctionTemperaturesF: ratingSuction,
        capacityMultiplierFor50Hz,
      },
      modelVariants: variants,
    },
  };
}

function findBracket(sortedValues: number[], requested: number): NumberBracket | null {
  if (
    requested < sortedValues[0] - EPSILON ||
    requested > sortedValues[sortedValues.length - 1] + EPSILON
  ) {
    return null;
  }

  for (let index = 0; index < sortedValues.length; index += 1) {
    if (Math.abs(requested - sortedValues[index]) <= EPSILON) {
      return {
        lowerIndex: index,
        upperIndex: index,
        lowerValue: sortedValues[index],
        upperValue: sortedValues[index],
      };
    }
    if (index > 0 && requested < sortedValues[index]) {
      return {
        lowerIndex: index - 1,
        upperIndex: index,
        lowerValue: sortedValues[index - 1],
        upperValue: sortedValues[index],
      };
    }
  }

  return null;
}

function interpolateLinearly(
  lowerAxis: number,
  upperAxis: number,
  lowerValue: number,
  upperValue: number,
  requestedAxis: number,
): number {
  if (Math.abs(upperAxis - lowerAxis) <= EPSILON) return lowerValue;
  const fraction = (requestedAxis - lowerAxis) / (upperAxis - lowerAxis);
  return lowerValue + fraction * (upperValue - lowerValue);
}

function interpolateCapacity(
  variant: RussellCatalogVariant,
  ambientTemperatureF: number,
  suctionTemperatureF: number,
): InterpolationResult {
  const sortedRows = [...variant.capacityTable.rows].sort(
    (left, right) => left.ambientTemperatureF - right.ambientTemperatureF,
  );
  const sortedSuction = variant.capacityTable.suctionTemperaturesF
    .map((value, originalIndex) => ({ value, originalIndex }))
    .sort((left, right) => left.value - right.value);

  const ambientBracket = findBracket(
    sortedRows.map((row) => row.ambientTemperatureF),
    ambientTemperatureF,
  );
  const suctionBracket = findBracket(
    sortedSuction.map((point) => point.value),
    suctionTemperatureF,
  );

  const outsideAxes: InterpolationResult['outsideAxes'] = [];
  if (!ambientBracket) outsideAxes.push('ambientTemperatureF');
  if (!suctionBracket) outsideAxes.push('suctionTemperatureF');
  if (!ambientBracket || !suctionBracket) {
    return {
      status: 'outside_published_envelope',
      capacityBtuPerHour: null,
      ambientBracketF: null,
      suctionBracketF: null,
      usedInterpolation: false,
      outsideAxes,
    };
  }

  const capacityAtRow = (row: RussellCapacityRow): number => {
    const lowerSuction = sortedSuction[suctionBracket.lowerIndex];
    const upperSuction = sortedSuction[suctionBracket.upperIndex];
    return interpolateLinearly(
      lowerSuction.value,
      upperSuction.value,
      row.capacityBtuPerHour[lowerSuction.originalIndex],
      row.capacityBtuPerHour[upperSuction.originalIndex],
      suctionTemperatureF,
    );
  };

  const lowerAmbientRow = sortedRows[ambientBracket.lowerIndex];
  const upperAmbientRow = sortedRows[ambientBracket.upperIndex];
  const capacityAtLowerAmbient = capacityAtRow(lowerAmbientRow);
  const capacityAtUpperAmbient = capacityAtRow(upperAmbientRow);
  const capacityBtuPerHour = interpolateLinearly(
    ambientBracket.lowerValue,
    ambientBracket.upperValue,
    capacityAtLowerAmbient,
    capacityAtUpperAmbient,
    ambientTemperatureF,
  );

  return {
    status: 'ok',
    capacityBtuPerHour,
    ambientBracketF: [ambientBracket.lowerValue, ambientBracket.upperValue],
    suctionBracketF: [suctionBracket.lowerValue, suctionBracket.upperValue],
    usedInterpolation:
      ambientBracket.lowerIndex !== ambientBracket.upperIndex ||
      suctionBracket.lowerIndex !== suctionBracket.upperIndex,
    outsideAxes: [],
  };
}

function makeCatalogReference(
  catalog: RussellPerformanceCatalog,
  variant: RussellCatalogVariant,
): RussellCatalogReference {
  const ambient = variant.capacityTable.rows.map((row) => row.ambientTemperatureF);
  const suction = variant.capacityTable.suctionTemperaturesF;
  return {
    catalogRecordId: catalog.catalogRecordId,
    catalogVariantId: variant.catalogVariantId,
    baseModelPattern: variant.baseModelPattern,
    refrigerant: catalog.refrigerant,
    sourcePage: variant.capacityTable.sourcePage,
    publishedEnvelope: {
      ambientTemperatureF: {
        minimum: Math.min(...ambient),
        maximum: Math.max(...ambient),
      },
      suctionTemperatureF: {
        minimum: Math.min(...suction),
        maximum: Math.max(...suction),
      },
    },
  };
}

function inputQualityForAmbient(
  source: AmbientTemperatureSource,
): RussellCapacityQuality['ambientInputQuality'] {
  if (source === 'condenser_entering_air_sensor') return 'on_site_sensor';
  if (source === 'local_weather') return 'weather_fallback';
  return 'other';
}

function inputQualityForSuction(
  source: SuctionTemperatureSource,
): RussellCapacityQuality['suctionInputQuality'] {
  if (source === 'validated_pressure_temperature_conversion') {
    return 'validated_pressure_temperature_conversion';
  }
  if (source === 'validated_manufacturer_axis_sensor') {
    return 'validated_manufacturer_axis_sensor';
  }
  if (source === 'process_fluid_temperature_estimate') {
    return 'process_fluid_temperature_estimate';
  }
  return 'other';
}

function failedUnitEvaluation(
  request: RussellUnitEvaluationRequest,
  status: Exclude<RussellUnitEvaluationStatus, 'ok'>,
  message: string,
  warnings: string[],
  catalogReference: RussellCatalogReference | null = null,
): RussellUnitCapacityEvaluation {
  return {
    unitId: request.unitId,
    active: request.active,
    status,
    message,
    liveOperatingPoint: { ...request.liveOperatingPoint },
    catalogReference,
    manufacturerTableEvaluation: null,
    derivedCapacity: null,
    quality: {
      overall: 'unavailable',
      tableLookup: null,
      ambientInputQuality: request.liveOperatingPoint
        ? inputQualityForAmbient(request.liveOperatingPoint.ambientSource)
        : null,
      suctionInputQuality: request.liveOperatingPoint
        ? inputQualityForSuction(request.liveOperatingPoint.suctionSource)
        : null,
      frequencyAdjustment: null,
      warnings,
      provenance: {
        manufacturerTableValues: 'manufacturer_catalog',
        operatingInputs: 'live_operating_point',
        output: 'not_available',
      },
    },
  };
}

function evaluateLoadedCatalogUnit(
  catalog: RussellPerformanceCatalog,
  request: RussellUnitEvaluationRequest,
): RussellUnitCapacityEvaluation {
  if (!request.active) {
    return failedUnitEvaluation(
      request,
      'inactive',
      'Unit is inactive and was not assigned a catalog capacity estimate.',
      ['Inactive units are excluded from parallel capacity totals.'],
    );
  }

  if (!request.catalogVariantId?.trim()) {
    return failedUnitEvaluation(
      request,
      'variant_required',
      'An exact catalog variant must be selected before capacity can be evaluated.',
      ['The Russell catalog contains more than one 22 HP R404A candidate.'],
    );
  }

  const variant = catalog.modelVariants.find(
    (candidate) => candidate.catalogVariantId === request.catalogVariantId,
  );
  if (!variant) {
    return failedUnitEvaluation(
      request,
      'variant_not_found',
      `Catalog variant ${request.catalogVariantId} was not found.`,
      ['No fallback variant was selected.'],
    );
  }

  const catalogReference = makeCatalogReference(catalog, variant);
  const point = request.liveOperatingPoint;
  if (
    !point ||
    !isFiniteNumber(point.ambientTemperatureF) ||
    !isFiniteNumber(point.suctionTemperatureF) ||
    (point.capturedAt !== undefined && Number.isNaN(Date.parse(point.capturedAt)))
  ) {
    return failedUnitEvaluation(
      request,
      'invalid_live_conditions',
      'Live operating temperatures and any supplied timestamp must be valid.',
      ['Manufacturer catalog data was not evaluated against invalid live input.'],
      catalogReference,
    );
  }

  if (
    !point.suctionAxisValidated &&
    point.suctionSource !== 'process_fluid_temperature_estimate'
  ) {
    return failedUnitEvaluation(
      request,
      'unvalidated_suction_axis',
      'The live suction value has not been validated against the catalog axis meaning.',
      [
        'A suction-line temperature must not be assumed to equal the manufacturer table axis.',
      ],
      catalogReference,
    );
  }

  if (request.installedFrequencyHz !== 50 && request.installedFrequencyHz !== 60) {
    return failedUnitEvaluation(
      request,
      'unsupported_frequency',
      `Installed frequency ${request.installedFrequencyHz} Hz is not supported by the catalog rule.`,
      ['Only the published 60 Hz basis and explicit 50 Hz multiplier are supported.'],
      catalogReference,
    );
  }

  const interpolation = interpolateCapacity(
    variant,
    point.ambientTemperatureF,
    point.suctionTemperatureF,
  );
  if (interpolation.status !== 'ok' || interpolation.capacityBtuPerHour === null) {
    return failedUnitEvaluation(
      request,
      'outside_published_envelope',
      `Live point is outside the published envelope on: ${interpolation.outsideAxes.join(', ')}.`,
      ['Extrapolation and silent clamping are forbidden.'],
      catalogReference,
    );
  }

  const multiplier =
    request.installedFrequencyHz === 50
      ? catalog.capacityRatingBasis.capacityMultiplierFor50Hz
      : 1;
  const derivedCapacityBtuPerHour = interpolation.capacityBtuPerHour * multiplier;
  const warnings = [
    'Output is a derived catalog estimate, not live telemetry or measured process load.',
  ];
  if (point.ambientSource === 'local_weather') {
    warnings.push(
      'Local weather is a lower-quality fallback for condenser entering-air temperature.',
    );
  } else if (point.ambientSource !== 'condenser_entering_air_sensor') {
    warnings.push('Ambient input was not measured at the condenser entering-air location.');
  }
  if (
    point.suctionSource !== 'validated_pressure_temperature_conversion' &&
    point.suctionSource !== 'validated_manufacturer_axis_sensor'
  ) {
    warnings.push(
      point.suctionSource === 'process_fluid_temperature_estimate'
        ? 'Process-fluid temperature was used as an estimated stand-in for saturated suction temperature; actual capacity may differ materially.'
        : 'Suction-axis validation was asserted using a lower-quality input source.',
    );
  }
  if (request.installedFrequencyHz === 50) {
    warnings.push(
      `Applied the catalog's explicit 50 Hz capacity multiplier (${multiplier}).`,
    );
  }

  return {
    unitId: request.unitId,
    active: true,
    status: 'ok',
    message: 'Capacity evaluated within the published manufacturer envelope.',
    liveOperatingPoint: { ...point },
    catalogReference,
    manufacturerTableEvaluation: {
      tableFrequencyHz: 60,
      capacityBtuPerHour: interpolation.capacityBtuPerHour,
      ambientBracketF: interpolation.ambientBracketF as [number, number],
      suctionBracketF: interpolation.suctionBracketF as [number, number],
    },
    derivedCapacity: {
      capacityBtuPerHour: derivedCapacityBtuPerHour,
      capacityTons: derivedCapacityBtuPerHour / BTU_PER_HOUR_PER_TON,
      installedFrequencyHz: request.installedFrequencyHz,
      appliedCapacityMultiplier: multiplier,
      method:
        request.installedFrequencyHz === 50
          ? 'catalog_value_at_live_operating_point_with_50hz_multiplier'
          : 'catalog_value_at_live_operating_point',
    },
    quality: {
      overall:
        point.ambientSource === 'condenser_entering_air_sensor' &&
        (point.suctionSource === 'validated_pressure_temperature_conversion' ||
          point.suctionSource === 'validated_manufacturer_axis_sensor')
          ? 'catalog_supported'
          : 'reduced_input_quality',
      tableLookup: interpolation.usedInterpolation
        ? 'bilinear_interpolation'
        : 'exact_catalog_point',
      ambientInputQuality: inputQualityForAmbient(point.ambientSource),
      suctionInputQuality: inputQualityForSuction(point.suctionSource),
      frequencyAdjustment:
        request.installedFrequencyHz === 50
          ? 'manufacturer_50hz_multiplier'
          : 'none',
      warnings,
      provenance: {
        manufacturerTableValues: 'manufacturer_catalog',
        operatingInputs: 'live_operating_point',
        output: 'derived_capacity_estimate',
      },
    },
  };
}

/** Evaluate one active/inactive Russell unit against a caller-supplied JSON catalog. */
export function evaluateRussellUnitCapacity(
  catalogInput: unknown,
  request: RussellUnitEvaluationRequest,
): RussellUnitCapacityEvaluation {
  const loaded = loadRussellPerformanceCatalog(catalogInput);
  if (loaded.status !== 'ok') {
    return failedUnitEvaluation(
      request,
      'invalid_catalog',
      'The manufacturer catalog record failed validation.',
      loaded.errors,
    );
  }
  return evaluateLoadedCatalogUnit(loaded.catalog, request);
}

function parallelUnavailableQuality(warnings: string[]): RussellParallelCapacityEvaluation['quality'] {
  return {
    overall: 'unavailable',
    warnings,
    provenance: {
      manufacturerTableValues: 'manufacturer_catalog',
      operatingInputs: 'live_operating_points',
      output: 'not_available',
    },
  };
}

/**
 * Sum all active parallel units. The function returns no partial total when any
 * active unit is rejected, preventing a plausible-looking but incomplete value.
 */
export function evaluateRussellParallelCapacity(
  catalogInput: unknown,
  requests: RussellUnitEvaluationRequest[],
  options: RussellParallelEvaluationOptions = {},
): RussellParallelCapacityEvaluation {
  const loaded = loadRussellPerformanceCatalog(catalogInput);
  if (loaded.status !== 'ok') {
    const unitResults = requests.map((request) =>
      failedUnitEvaluation(
        request,
        'invalid_catalog',
        'The manufacturer catalog record failed validation.',
        loaded.errors,
      ),
    );
    return {
      status: 'invalid_catalog',
      message: 'Parallel capacity was not evaluated because the catalog is invalid.',
      activeUnitCount: requests.filter((request) => request.active).length,
      unitResults,
      derivedCapacity: null,
      quality: parallelUnavailableQuality(loaded.errors),
    };
  }

  const unitResults = requests.map((request) =>
    evaluateLoadedCatalogUnit(loaded.catalog, request),
  );
  const activeRequests = requests.filter((request) => request.active);
  const activeUnitCount = activeRequests.length;

  if (activeUnitCount === 0) {
    return {
      status: 'no_active_units',
      message: 'No units are active; the active-unit capacity sum is zero.',
      activeUnitCount: 0,
      unitResults,
      derivedCapacity: {
        combinedCapacityBtuPerHour: 0,
        combinedCapacityTons: 0,
        activeUnitIds: [],
        method: 'sum_of_active_unit_derived_capacity_estimates',
      },
      quality: {
        overall: 'not_applicable',
        warnings: ['Inactive units were excluded from the total.'],
        provenance: {
          manufacturerTableValues: 'manufacturer_catalog',
          operatingInputs: 'live_operating_points',
          output: 'derived_parallel_capacity_estimate',
        },
      },
    };
  }

  const activeResults = unitResults.filter((result) => result.active);
  const failedActiveResults = activeResults.filter((result) => result.status !== 'ok');
  if (failedActiveResults.length > 0) {
    return {
      status: 'incomplete_active_unit_evaluations',
      message: 'No parallel total was returned because at least one active unit was rejected.',
      activeUnitCount,
      unitResults,
      derivedCapacity: null,
      quality: parallelUnavailableQuality(
        failedActiveResults.map(
          (result) => `${result.unitId}: ${result.status} - ${result.message}`,
        ),
      ),
    };
  }

  const warnings: string[] = [];
  const activeUnitIds = activeRequests.map((request) => request.unitId);
  if (new Set(activeUnitIds).size !== activeUnitIds.length) {
    return {
      status: 'conditions_not_comparable',
      message: 'Active-unit identifiers must be unique before capacities can be summed.',
      activeUnitCount,
      unitResults,
      derivedCapacity: null,
      quality: parallelUnavailableQuality([
        'Duplicate unit identifiers could double-count one physical unit.',
      ]),
    };
  }

  const groupIds = activeRequests
    .map((request) => request.parallelGroupId?.trim())
    .filter((value): value is string => Boolean(value));
  if (new Set(groupIds).size > 1) {
    return {
      status: 'conditions_not_comparable',
      message: 'Active units do not belong to one parallel group.',
      activeUnitCount,
      unitResults,
      derivedCapacity: null,
      quality: parallelUnavailableQuality([
        'Parallel-group identifiers differed; capacities were not summed.',
      ]),
    };
  }
  if (groupIds.length !== activeUnitCount) {
    warnings.push('One or more active units lacked a parallel-group identifier.');
  }

  const timestampValues = activeRequests
    .map((request) => request.liveOperatingPoint.capturedAt)
    .filter((value): value is string => Boolean(value));
  if (timestampValues.length === activeUnitCount) {
    const epochValues = timestampValues.map((value) => Date.parse(value));
    const timestampSkewSeconds =
      (Math.max(...epochValues) - Math.min(...epochValues)) / 1000;
    const configuredSkew = options.maxTimestampSkewSeconds;
    const maxTimestampSkewSeconds =
      isFiniteNumber(configuredSkew) && configuredSkew >= 0
        ? configuredSkew
        : DEFAULT_MAX_TIMESTAMP_SKEW_SECONDS;
    if (timestampSkewSeconds > maxTimestampSkewSeconds) {
      return {
        status: 'conditions_not_comparable',
        message: 'Active-unit live inputs are too far apart in time to sum safely.',
        activeUnitCount,
        unitResults,
        derivedCapacity: null,
        quality: parallelUnavailableQuality([
          `Timestamp skew ${timestampSkewSeconds}s exceeded ${maxTimestampSkewSeconds}s.`,
        ]),
      };
    }
  } else {
    warnings.push('Comparable live timestamps were not available for every active unit.');
  }

  const combinedCapacityBtuPerHour = activeResults.reduce(
    (total, result) => total + (result.derivedCapacity?.capacityBtuPerHour ?? 0),
    0,
  );
  const hasReducedUnitQuality = activeResults.some(
    (result) => result.quality.overall === 'reduced_input_quality',
  );
  if (hasReducedUnitQuality) {
    warnings.push('At least one unit used a lower-quality ambient input.');
  }
  warnings.push(
    'Combined capacity is a derived sum of active unit estimates, not a measured shared-system load.',
  );

  return {
    status: 'ok',
    message: 'All active unit estimates were summed.',
    activeUnitCount,
    unitResults,
    derivedCapacity: {
      combinedCapacityBtuPerHour,
      combinedCapacityTons: combinedCapacityBtuPerHour / BTU_PER_HOUR_PER_TON,
      activeUnitIds: activeResults.map((result) => result.unitId),
      method: 'sum_of_active_unit_derived_capacity_estimates',
    },
    quality: {
      overall:
        hasReducedUnitQuality ||
        timestampValues.length !== activeUnitCount ||
        groupIds.length !== activeUnitCount
          ? 'reduced_input_quality'
          : 'catalog_supported',
      warnings,
      provenance: {
        manufacturerTableValues: 'manufacturer_catalog',
        operatingInputs: 'live_operating_points',
        output: 'derived_parallel_capacity_estimate',
      },
    },
  };
}

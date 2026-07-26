'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  CircleAlert,
  CloudRain,
  CloudSun,
  Cpu,
  Database,
  Droplets,
  Gauge,
  Clock3,
  MapPin,
  Mic,
  Power,
  RefreshCw,
  Satellite,
  Settings2,
  ShieldAlert,
  Sun,
  Thermometer,
  Wind,
  Zap
} from 'lucide-react';
import {
  evaluateRussellParallelCapacity,
  evaluateRussellUnitCapacity,
  type AmbientTemperatureSource,
  type RussellUnitCapacityEvaluation,
  type SuctionTemperatureSource
} from '@/lib/equipment/performance';
import { normalizeTelemetryKey, resolveTelemetryPoint } from '@/lib/equipment/telemetry';
import { mergeTelemetryPoints } from '@/lib/telemetry-groups';
import { displayTelemetryUnit } from '@/lib/telemetry-units';
import {
  TelemetryDial3D,
  type TelemetryDialGoal,
  type TelemetryDialScale,
  type TelemetryDialZone
} from '@/components/telemetry-dial-3d';
import type {
  CatalogElectricalRating,
  CondenserArrangementSelection,
  CondenserAsset,
  CondenserCatalogRecord,
  CondenserCatalogVariant,
  ProcessSolventSelection,
  SiteEquipmentRecord
} from '@/lib/equipment/types';

type TelemetryPoint = {
  id: string;
  deviceId: string;
  deviceName?: string;
  key: string;
  label: string;
  unit: string;
  latestValue: unknown;
  latestTimestamp: string;
};

type TelemetryState = {
  status: 'loading' | 'ready' | 'error';
  points: TelemetryPoint[];
  source: string | null;
  fetchedAt: string | null;
  error: string | null;
};

const PROCESS_TEMPERATURE_GOAL: TelemetryDialGoal = {
  value: -40,
  color: '#b8f260',
  label: '−40°F goal'
};

const PROCESS_TEMPERATURE_ZONES: TelemetryDialZone[] = [
  {
    from: -40,
    to: -30,
    color: '#f3fdff',
    secondaryColor: '#17384f',
    label: '−40–−30°F frost',
    effect: 'frost'
  },
  {
    from: -30,
    to: -20,
    color: '#8fd8ff',
    label: '−30–−20°F ice'
  },
  {
    from: -20,
    to: 0,
    color: '#f5fcff',
    label: '−20–0°F white'
  },
  {
    from: 60,
    to: 70,
    color: '#f4c45e',
    label: '60–70°F caution'
  },
  {
    from: 70,
    to: 100,
    color: '#ff665c',
    label: '70–100°F high'
  }
];

const PROCESS_TEMPERATURE_SCALE: TelemetryDialScale = {
  stops: [
    { value: -50, angleDegrees: 150 },
    { value: -40, angleDegrees: 126 },
    { value: -30, angleDegrees: 84 },
    { value: -20, angleDegrees: 42 },
    { value: 0, angleDegrees: 0 },
    { value: 100, angleDegrees: -135 }
  ],
  tickValues: [
    -50, -45, -40, -35, -30, -25, -20, -15, -10, -5,
    0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
  ],
  labelValues: [-40, -30, -20, 0, 40, 70, 100]
};

type FastTelemetryState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  fetchedAt: string | null;
  error: string | null;
};

type WeatherData = {
  locationLabel: string;
  observation: {
    stationId: string;
    stationName: string;
    temperatureF: number | null;
    humidityPercent: number | null;
    dewpointF: number | null;
    windSpeedMph: number | null;
    windGustMph: number | null;
    windDirectionDegrees: number | null;
    windDirectionCardinal: string | null;
    pressureInHg: number | null;
    precipitationLastHourIn: number | null;
    precipitationLast3HoursIn: number | null;
    condition: string | null;
    observedAt: string;
    ageMinutes: number | null;
    isCurrent: boolean;
    source: string;
    sourceUrl: string;
  };
  forecast: {
    temperatureF: number | null;
    humidityPercent: number | null;
    rainChancePercent: number | null;
    precipitationAmountIn: number | null;
    skyCoverPercent: number | null;
    sunlightEstimatePercent: number | null;
    sunlightMethod: string;
    isDaytime: boolean;
    windSpeed: string | null;
    windDirection: string | null;
    condition: string | null;
    periodStartAt: string | null;
    source: string;
    sourceUrl: string;
    sourceUpdatedAt: string | null;
  } | null;
  ambientFallback: {
    temperatureF: number | null;
    source: 'nws_observation';
    observedAt: string;
  };
  fetchedAt: string;
};

type WeatherState = {
  status: 'loading' | 'ready' | 'error';
  data: WeatherData | null;
  error: string | null;
};

type VariantSelection = 'unconfirmed' | string;
type VoltageSelection = 'unconfirmed' | '200-220' | '208-230' | '380' | '460' | '575';
type FrequencySelection = 'unconfirmed' | 50 | 60;
type AmbientMode = 'automatic' | 'manual';

type UnitConfigurationDraft = {
  refrigerant: string;
  variant: VariantSelection;
  voltage: VoltageSelection;
  frequencyHz: FrequencySelection;
};

type ConfigurationDraft = {
  arrangement: CondenserArrangementSelection;
  solvent: ProcessSolventSelection;
  units: Record<string, UnitConfigurationDraft>;
  ambientMode: AmbientMode;
  manualAmbientF: number;
  manualSuctionF: number;
  manualSuctionValidated: boolean;
};

type NumericSignal = {
  value: number;
  point: TelemetryPoint;
  isFresh: boolean;
};

type BooleanSignal = {
  value: boolean;
  point: TelemetryPoint;
  isFresh: boolean;
};

type AssetSignals = {
  temperature: NumericSignal | null;
  highPressure: NumericSignal | null;
  lowPressure: NumericSignal | null;
  compressorAmps: NumericSignal | null;
  compressorRuntimeMinutes: NumericSignal | null;
  setpoint: NumericSignal | null;
  inletAir: NumericSignal | null;
  suctionSaturation: NumericSignal | null;
  realPowerKw: NumericSignal | null;
  running: BooleanSignal | null;
  systemOn: BooleanSignal | null;
  highPressureStop: BooleanSignal | null;
  ambiguousAliasCount: number;
};

type CandidateEvaluation = {
  variant: CondenserCatalogVariant;
  evaluation: RussellUnitCapacityEvaluation;
};

type CapacityRange = {
  minimumBtuPerHour: number;
  maximumBtuPerHour: number;
};

type AssetAnalysis = {
  asset: CondenserAsset;
  signals: AssetSignals;
  ambientTemperatureF: number;
  ambientSource: AmbientTemperatureSource;
  suctionTemperatureF: number;
  suctionSource: SuctionTemperatureSource;
  evaluations: CandidateEvaluation[];
  capacityRange: CapacityRange | null;
  configuration: UnitConfigurationDraft;
  selectedVariants: CondenserCatalogVariant[];
  capacityBlockedReason: string | null;
  suctionAxisValidated: boolean;
  operatingPointCapturedAt?: string;
};

const DEFAULT_TELEMETRY_REFRESH_MS = 15_000;
const LIVE_TELEMETRY_REFRESH_MS = 2_000;
const LIVE_TELEMETRY_MAX_MS = 60 * 60_000;
const WEATHER_REFRESH_MS = 5 * 60_000;
const SIGNAL_STALE_MS = 5 * 60_000;
const CONTROLLER_HEARTBEAT_MS = 15_000;
const CONTROLLER_HEARTBEAT_STALE_MS = 45_000;
const SIGNAL_FUTURE_TOLERANCE_MS = 60_000;
const BTU_PER_TON_HOUR = 12_000;
const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const oneDecimalFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

function signalIsFresh(
  point: TelemetryPoint,
  referenceTimestamp: string | null,
  maximumAgeMs = SIGNAL_STALE_MS
): boolean {
  const capturedAt = Date.parse(point.latestTimestamp);
  const referenceTime = referenceTimestamp ? Date.parse(referenceTimestamp) : Date.now();

  if (!Number.isFinite(capturedAt) || !Number.isFinite(referenceTime)) return false;
  return (
    referenceTime - capturedAt <= maximumAgeMs &&
    capturedAt - referenceTime <= SIGNAL_FUTURE_TOLERANCE_MS
  );
}

function pointNumber(point: TelemetryPoint | undefined, referenceTimestamp: string | null): NumericSignal | null {
  if (!point) return null;

  const value =
    typeof point.latestValue === 'number'
      ? point.latestValue
      : typeof point.latestValue === 'string' && point.latestValue.trim() !== ''
        ? Number(point.latestValue)
        : null;

  return value !== null && Number.isFinite(value)
    ? { value, point, isFresh: signalIsFresh(point, referenceTimestamp) }
    : null;
}

function pointBoolean(point: TelemetryPoint | undefined, referenceTimestamp: string | null): BooleanSignal | null {
  if (!point) return null;
  const value = point.latestValue;
  const isFresh = signalIsFresh(point, referenceTimestamp);

  if (typeof value === 'boolean') return { value, point, isFresh };
  if (typeof value === 'number') return { value: value !== 0, point, isFresh };
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'on', 'running'].includes(normalized)) return { value: true, point, isFresh };
    if (['false', '0', 'off', 'stopped'].includes(normalized)) return { value: false, point, isFresh };
  }

  return null;
}

function signalsForChannel(
  points: TelemetryPoint[],
  channel: string,
  referenceTimestamp: string | null,
  telemetryDeviceId?: string | null
): AssetSignals {
  const prefix = channel.toLowerCase();
  const scopedPoints = telemetryDeviceId
    ? points.filter((point) => point.deviceId === telemetryDeviceId)
    : points;
  const temperature = resolveTelemetryPoint(scopedPoints, [`${prefix}_temperature_f`, `${prefix}_temperature_c`, `${prefix}_temperature`]);
  const highPressure = resolveTelemetryPoint(scopedPoints, [`${prefix}_high_pressure`, `${prefix}_high_pressure_psi`, `${prefix}_highside_pressure`]);
  const lowPressure = resolveTelemetryPoint(scopedPoints, [`${prefix}_low_pressure`, `${prefix}_low_pressure_psi`, `${prefix}_lowside_pressure`]);
  const compressorAmps = resolveTelemetryPoint(scopedPoints, [
    `${prefix}compressoramps`,
    `${prefix}_compressor_amps`,
    `${prefix}_compressoramps`,
    `${prefix}_amps`
  ]);
  const inletAir = resolveTelemetryPoint(scopedPoints, [
    `${prefix}_condenser_inlet_air_f`,
    `${prefix}_condenser_inlet_temp_f`,
    `${prefix}_inlet_air_temp_f`,
    `${prefix}_inlet_air_temperature_f`,
    `${prefix}_condenser_entering_air_f`,
    `${prefix}_entering_air_temp_f`
  ]);
  const suctionSaturation = resolveTelemetryPoint(scopedPoints, [
    `${prefix}_suction_saturation_temp_f`,
    `${prefix}_saturated_suction_temp_f`,
    `${prefix}_sst_f`
  ]);
  const realPowerKw = resolveTelemetryPoint(scopedPoints, [`${prefix}_compressor_kw`, `${prefix}_real_power_kw`, `${prefix}_total_kw`]);
  const compressorRuntimeMinutes = resolveTelemetryPoint(scopedPoints, [`${prefix}_compressor_runtime_min`]);
  const setpoint = resolveTelemetryPoint(scopedPoints, [`${prefix}_setpoint_c`, `${prefix}_setpoint`]);
  const running = resolveTelemetryPoint(scopedPoints, [`${prefix}_chiller_run`, `${prefix}_compressor_run`]);
  const systemOn = resolveTelemetryPoint(scopedPoints, [`${prefix}_system_on`]);
  const highPressureStop = resolveTelemetryPoint(scopedPoints, [`${prefix}_high_pressure_stop`]);
  const matches = [
    temperature,
    highPressure,
    lowPressure,
    compressorAmps,
    compressorRuntimeMinutes,
    setpoint,
    inletAir,
    suctionSaturation,
    realPowerKw,
    running,
    systemOn,
    highPressureStop
  ];

  return {
    // The deployed keys end in `_c`, but the user verified that their raw readings are Fahrenheit.
    temperature: pointNumber(temperature.point, referenceTimestamp),
    highPressure: pointNumber(highPressure.point, referenceTimestamp),
    lowPressure: pointNumber(lowPressure.point, referenceTimestamp),
    compressorAmps: pointNumber(compressorAmps.point, referenceTimestamp),
    compressorRuntimeMinutes: pointNumber(compressorRuntimeMinutes.point, referenceTimestamp),
    setpoint: pointNumber(setpoint.point, referenceTimestamp),
    inletAir: pointNumber(inletAir.point, referenceTimestamp),
    suctionSaturation: pointNumber(suctionSaturation.point, referenceTimestamp),
    realPowerKw: pointNumber(realPowerKw.point, referenceTimestamp),
    running: pointBoolean(running.point, referenceTimestamp),
    systemOn: pointBoolean(systemOn.point, referenceTimestamp),
    highPressureStop: pointBoolean(highPressureStop.point, referenceTimestamp),
    ambiguousAliasCount: matches.filter((match) => match.ambiguous).length
  };
}

function finiteOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function sanitizeConfigurationDraft(
  value: unknown,
  fallback: ConfigurationDraft,
  equipmentRecord: SiteEquipmentRecord,
  catalog: CondenserCatalogRecord
): ConfigurationDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;

  const candidate = value as Record<string, unknown>;
  const arrangement =
    typeof candidate.arrangement === 'string' &&
    equipmentRecord.selectionOptions.condenserArrangement.some((option) => option.value === candidate.arrangement)
      ? (candidate.arrangement as CondenserArrangementSelection)
      : fallback.arrangement;
  const solvent =
    typeof candidate.solvent === 'string' &&
    equipmentRecord.selectionOptions.processSolvent.some((option) => option.value === candidate.solvent)
      ? (candidate.solvent as ProcessSolventSelection)
      : fallback.solvent;
  const candidateUnits =
    candidate.units && typeof candidate.units === 'object' && !Array.isArray(candidate.units)
      ? (candidate.units as Record<string, unknown>)
      : {};
  const units = Object.fromEntries(
    Object.entries(fallback.units).map(([assetId, fallbackUnit]) => {
      const rawUnit =
        candidateUnits[assetId] && typeof candidateUnits[assetId] === 'object' && !Array.isArray(candidateUnits[assetId])
          ? (candidateUnits[assetId] as Record<string, unknown>)
          : {};
      const refrigerant =
        typeof rawUnit.refrigerant === 'string' && [catalog.refrigerant, 'other'].includes(rawUnit.refrigerant)
          ? rawUnit.refrigerant
          : fallbackUnit.refrigerant;
      const variant =
        typeof rawUnit.variant === 'string' &&
        (rawUnit.variant === 'unconfirmed' ||
          catalog.modelVariants.some((catalogVariant) => catalogVariant.catalogVariantId === rawUnit.variant))
          ? rawUnit.variant
          : fallbackUnit.variant;
      const frequencyHz: FrequencySelection =
        rawUnit.frequencyHz === 50 || rawUnit.frequencyHz === 60
          ? rawUnit.frequencyHz
          : 'unconfirmed';
      const allowedVoltages: VoltageSelection[] =
        frequencyHz === 50
          ? ['unconfirmed', '200-220', '380']
          : frequencyHz === 60
            ? ['unconfirmed', '208-230', '460', '575']
            : ['unconfirmed'];
      const voltage =
        typeof rawUnit.voltage === 'string' && allowedVoltages.includes(rawUnit.voltage as VoltageSelection)
          ? (rawUnit.voltage as VoltageSelection)
          : 'unconfirmed';

      return [assetId, { refrigerant, variant, voltage, frequencyHz } satisfies UnitConfigurationDraft];
    })
  );
  const ambientMode = candidate.ambientMode === 'automatic' || candidate.ambientMode === 'manual'
    ? candidate.ambientMode
    : fallback.ambientMode;
  const manualAmbientF =
    typeof candidate.manualAmbientF === 'number' &&
    Number.isFinite(candidate.manualAmbientF) &&
    candidate.manualAmbientF >= -100 &&
    candidate.manualAmbientF <= 200
      ? candidate.manualAmbientF
      : fallback.manualAmbientF;
  const manualSuctionF =
    typeof candidate.manualSuctionF === 'number' &&
    Number.isFinite(candidate.manualSuctionF) &&
    candidate.manualSuctionF >= -100 &&
    candidate.manualSuctionF <= 100
      ? candidate.manualSuctionF
      : fallback.manualSuctionF;
  const manualSuctionValidated = candidate.manualSuctionValidated === true;

  return {
    arrangement,
    solvent,
    units,
    ambientMode,
    manualAmbientF,
    manualSuctionF,
    manualSuctionValidated
  };
}

function capacityRange(evaluations: CandidateEvaluation[]): CapacityRange | null {
  const values = evaluations
    .map(({ evaluation }) => evaluation.derivedCapacity?.capacityBtuPerHour ?? null)
    .filter((value): value is number => value !== null);

  if (!values.length) return null;

  return {
    minimumBtuPerHour: Math.min(...values),
    maximumBtuPerHour: Math.max(...values)
  };
}

function formatCapacityRange(range: CapacityRange | null): string {
  if (!range) return 'Not available';
  if (Math.abs(range.maximumBtuPerHour - range.minimumBtuPerHour) < 1) {
    return `${numberFormatter.format(range.minimumBtuPerHour)} BTU/h`;
  }
  return `${numberFormatter.format(range.minimumBtuPerHour)}-${numberFormatter.format(range.maximumBtuPerHour)} BTU/h`;
}

function formatTonsRange(range: CapacityRange | null): string {
  if (!range) return 'Waiting for valid conditions';
  const minimum = range.minimumBtuPerHour / BTU_PER_TON_HOUR;
  const maximum = range.maximumBtuPerHour / BTU_PER_TON_HOUR;
  if (Math.abs(maximum - minimum) < 0.01) return `${oneDecimalFormatter.format(minimum)} tons`;
  return `${oneDecimalFormatter.format(minimum)}-${oneDecimalFormatter.format(maximum)} tons`;
}

function formatValue(value: number | null, suffix = '', digits = 0): string {
  if (value === null) return '--';
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })}${suffix}`;
}

function formatNumericRange(values: number[]): string {
  if (!values.length) return '--';
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  return minimum === maximum ? `${minimum}` : `${minimum}-${maximum}`;
}

function formatTimestamp(value: string | null, includeSeconds = false): string {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' as const } : {})
  });
}

function formatObservationAge(minutes: number | null): string {
  if (minutes === null) return 'Age unavailable';
  if (minutes < 1) return 'Less than a minute old';
  if (minutes === 1) return '1 minute old';
  if (minutes < 60) return `${minutes} minutes old`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h${remainingMinutes ? ` ${remainingMinutes}m` : ''} old`;
}

function formatRuntimeMinutes(value: number | null): string {
  if (value === null) return 'Not available';
  const minutes = Math.max(0, Math.round(value));
  return `${Math.floor(minutes / 60).toLocaleString()}h ${minutes % 60}m`;
}

function unitHasCurrentTelemetry(signals: AssetSignals): boolean {
  return [
    signals.temperature,
    signals.highPressure,
    signals.lowPressure,
    signals.compressorAmps,
    signals.running,
    signals.systemOn
  ].some((signal) => signal?.isFresh === true);
}

function signalDetail(signal: NumericSignal | null, normalDetail: string, feedUnavailable = false): string {
  if (!signal) return normalDetail;
  const captured = formatTimestamp(signal.point.latestTimestamp);
  if (feedUnavailable) return `Last known - ${captured}`;
  return signal.isFresh ? `${normalDetail} - ${captured}` : `Stale reading - ${captured}`;
}

function variantName(variant: CondenserCatalogVariant): string {
  return `${variant.compressor.manufacturer} ${variant.compressor.technology}`;
}

function capacityStatusText(evaluations: CandidateEvaluation[]): string {
  if (evaluations.some(({ evaluation }) => evaluation.status === 'ok')) {
    return evaluations.some(
      ({ evaluation }) => evaluation.quality.tableLookup === 'bilinear_interpolation'
    )
      ? 'Interpolated inside Russell envelope'
      : 'Exact Russell rating point';
  }

  const status = evaluations[0]?.evaluation.status;
  if (status === 'outside_published_envelope') return 'Conditions outside the published 90-110 °F envelope';
  if (status === 'unvalidated_suction_axis') return 'Suction-temperature input is not validated';
  if (status === 'unsupported_frequency') return 'Frequency is not supported by this table';
  return 'A valid model and operating point are required';
}

function MetricTile({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return (
    <article className="salinas-dashboard__metric-tile">
      <span className="salinas-dashboard__metric-icon">{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function DataStatus({ available, children }: { available: boolean; children: ReactNode }) {
  return (
    <span className={`salinas-dashboard__data-status ${available ? 'is-ready' : 'is-pending'}`}>
      {available ? <CheckCircle2 size={14} /> : <CircleAlert size={14} />}
      {children}
    </span>
  );
}

function TelemetryRefreshCountdown({
  dueAt,
  intervalMs,
  live
}: {
  dueAt: number | null;
  intervalMs: number;
  live: boolean;
}) {
  const [remainingMs, setRemainingMs] = useState(intervalMs);

  useEffect(() => {
    function updateRemaining() {
      setRemainingMs(dueAt === null ? intervalMs : Math.max(0, dueAt - Date.now()));
    }

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 100);
    return () => window.clearInterval(timer);
  }, [dueAt, intervalMs]);

  const secondsRemaining = Math.max(0, Math.ceil(remainingMs / 1000));
  const progress = Math.max(0, Math.min(1, remainingMs / intervalMs));
  const ringStyle = {
    '--telemetry-countdown-progress': `${progress * 360}deg`
  } as CSSProperties;

  return (
    <span
      className={`salinas-dashboard__refresh-label salinas-dashboard__countdown${live ? ' is-live' : ''}`}
      role="timer"
      aria-label={`Telemetry refreshes in ${secondsRemaining} seconds`}
    >
      <span className="salinas-dashboard__countdown-ring" style={ringStyle} aria-hidden="true">
        <b>{secondsRemaining}</b>
      </span>
      <span className="salinas-dashboard__countdown-copy">
        <strong>{live ? 'Live telemetry refresh' : 'Next telemetry refresh'}</strong>
        <small>in {secondsRemaining} second{secondsRemaining === 1 ? '' : 's'}</small>
      </span>
    </span>
  );
}

export function SalinasEquipmentDashboard({
  siteId,
  equipmentRecord,
  catalog,
  view = 'overview'
}: {
  siteId: string;
  equipmentRecord: SiteEquipmentRecord;
  catalog: CondenserCatalogRecord;
  view?: 'overview' | 'specs';
}) {
  const system = equipmentRecord.processSystems[0];
  const defaultDraft: ConfigurationDraft = {
    arrangement: system.condenserArrangement.selection,
    solvent: system.processSolvent.selection,
    units: Object.fromEntries(
      system.condensers.map((asset) => [
        asset.assetId,
        {
          refrigerant: asset.refrigerant,
          variant: asset.catalogVariantId ?? 'unconfirmed',
          voltage: 'unconfirmed',
          frequencyHz: 'unconfirmed'
        } satisfies UnitConfigurationDraft
      ])
    ),
    ambientMode: 'automatic',
    manualAmbientF: 95,
    manualSuctionF: -20,
    manualSuctionValidated: false
  };
  const [draft, setDraft] = useState<ConfigurationDraft>(defaultDraft);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    status: 'loading',
    points: [],
    source: null,
    fetchedAt: null,
    error: null
  });
  const [telemetryRefreshVersion, setTelemetryRefreshVersion] = useState(0);
  const [telemetryRefreshDueAt, setTelemetryRefreshDueAt] = useState<number | null>(null);
  const [standardTelemetryFetchedAt, setStandardTelemetryFetchedAt] = useState<string | null>(null);
  const [fastTelemetryRefreshDueAt, setFastTelemetryRefreshDueAt] = useState<number | null>(null);
  const [fastTelemetry, setFastTelemetry] = useState<FastTelemetryState>({
    status: 'idle',
    fetchedAt: null,
    error: null
  });
  const [facilityLiveUntil, setFacilityLiveUntil] = useState(0);
  const [dialDemoTick, setDialDemoTick] = useState(0);
  const [weather, setWeather] = useState<WeatherState>({ status: 'loading', data: null, error: null });
  const storageKey = `permacool:equipment-draft:${siteId}`;
  const liveTelemetryActive = facilityLiveUntil > Date.now();
  const localDialDemoEnabled = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!localDialDemoEnabled) return;
    const timer = window.setInterval(
      () => setDialDemoTick((current) => current + 1),
      1_800
    );
    return () => window.clearInterval(timer);
  }, [localDialDemoEnabled]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        setDraft((current) => sanitizeConfigurationDraft(parsed, current, equipmentRecord, catalog));
      }
    } catch {
      // A malformed browser draft should never block the verified equipment record.
    } finally {
      setDraftLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!draftLoaded) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // Storage can be disabled or full; the dashboard must remain usable without persistence.
    }
  }, [draft, draftLoaded, storageKey]);

  useEffect(() => {
    let mounted = true;
    let requestInFlight = false;

    async function loadTelemetry() {
      if (requestInFlight) return;
      requestInFlight = true;
      if (mounted) setTelemetryRefreshDueAt(Date.now() + DEFAULT_TELEMETRY_REFRESH_MS);
      try {
        const response = await fetch(`/api/sites/${siteId}/telemetry`, { cache: 'no-store' });
        const payload = (await response.json()) as {
          points?: unknown;
          source?: unknown;
          fetchedAt?: unknown;
          error?: unknown;
        };
        if (!response.ok) throw new Error(typeof payload.error === 'string' ? payload.error : 'Telemetry request failed.');
        if (!Array.isArray(payload.points)) throw new Error('Telemetry response did not include a points array.');
        if (!mounted) return;
        const fetchedAt = typeof payload.fetchedAt === 'string' ? payload.fetchedAt : new Date().toISOString();
        setTelemetry((current) => ({
          status: 'ready',
          points: mergeTelemetryPoints(current.points, payload.points as TelemetryPoint[]),
          source: typeof payload.source === 'string' ? payload.source : 'unknown',
          fetchedAt,
          error: null
        }));
        setStandardTelemetryFetchedAt(fetchedAt);
      } catch (error) {
        if (!mounted) return;
        const fetchedAt = new Date().toISOString();
        setTelemetry((current) => ({
          ...current,
          status: 'error',
          fetchedAt,
          error: error instanceof Error ? error.message : 'Telemetry unavailable.'
        }));
        setStandardTelemetryFetchedAt(fetchedAt);
      } finally {
        requestInFlight = false;
      }
    }

    void loadTelemetry();
    const timer = window.setInterval(loadTelemetry, DEFAULT_TELEMETRY_REFRESH_MS);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [siteId, telemetryRefreshVersion]);

  useEffect(() => {
    if (!liveTelemetryActive) {
      setFastTelemetryRefreshDueAt(null);
      setFastTelemetry((current) => ({
        ...current,
        status: 'idle',
        error: null
      }));
      return;
    }

    let mounted = true;
    let requestInFlight = false;

    async function loadFastTelemetry() {
      if (requestInFlight) return;
      requestInFlight = true;
      if (mounted) {
        setFastTelemetryRefreshDueAt(Date.now() + LIVE_TELEMETRY_REFRESH_MS);
        setFastTelemetry((current) => ({
          ...current,
          status: current.fetchedAt ? 'ready' : 'loading',
          error: null
        }));
      }

      try {
        const response = await fetch(`/api/sites/${siteId}/telemetry?scope=fast`, { cache: 'no-store' });
        const payload = (await response.json()) as {
          points?: unknown;
          source?: unknown;
          fetchedAt?: unknown;
          error?: unknown;
        };
        if (!response.ok) throw new Error(typeof payload.error === 'string' ? payload.error : 'Fast telemetry request failed.');
        if (!Array.isArray(payload.points)) throw new Error('Fast telemetry response did not include a points array.');
        if (!mounted) return;

        const fetchedAt = typeof payload.fetchedAt === 'string' ? payload.fetchedAt : new Date().toISOString();
        const incomingPoints = payload.points as TelemetryPoint[];
        setTelemetry((current) => ({
          ...current,
          status: 'ready',
          points: mergeTelemetryPoints(current.points, incomingPoints),
          source: typeof payload.source === 'string' ? payload.source : current.source,
          fetchedAt,
          error: null
        }));
        setFastTelemetry({
          status: 'ready',
          fetchedAt,
          error: null
        });
      } catch (error) {
        if (!mounted) return;
        setFastTelemetry({
          status: 'error',
          fetchedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Fast telemetry unavailable.'
        });
      } finally {
        requestInFlight = false;
      }
    }

    void loadFastTelemetry();
    const timer = window.setInterval(loadFastTelemetry, LIVE_TELEMETRY_REFRESH_MS);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [liveTelemetryActive, siteId, telemetryRefreshVersion]);

  useEffect(() => {
    if (!liveTelemetryActive) return;

    const timer = window.setTimeout(() => {
      setFacilityLiveUntil(0);
    }, Math.max(0, facilityLiveUntil - Date.now()) + 50);

    return () => window.clearTimeout(timer);
  }, [facilityLiveUntil, liveTelemetryActive]);

  useEffect(() => {
    let mounted = true;

    async function loadWeather() {
      try {
        const response = await fetch(`/api/sites/${siteId}/weather`, { cache: 'no-store' });
        const payload = (await response.json()) as WeatherData & { error?: string };
        if (!response.ok) throw new Error(payload.error ?? 'Weather request failed.');
        if (!mounted) return;
        setWeather({ status: 'ready', data: payload, error: null });
      } catch (error) {
        if (!mounted) return;
        setWeather({
          status: 'error',
          data: null,
          error: error instanceof Error ? error.message : 'Weather unavailable.'
        });
      }
    }

    void loadWeather();
    const timer = window.setInterval(loadWeather, WEATHER_REFRESH_MS);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [siteId]);

  const variantById = useMemo(
    () => new Map(catalog.modelVariants.map((variant) => [variant.catalogVariantId, variant])),
    [catalog.modelVariants]
  );

  const analyses = useMemo<AssetAnalysis[]>(() => {
    return system.condensers.map((asset) => {
      const configuration = draft.units[asset.assetId] ?? {
        refrigerant: asset.refrigerant,
        variant: 'unconfirmed',
        voltage: 'unconfirmed',
        frequencyHz: 'unconfirmed'
      };
      const signals = signalsForChannel(
        telemetry.points,
        asset.dashboardChannel,
        telemetry.fetchedAt,
        asset.telemetryDeviceId
      );
      const freshInletAir = signals.inletAir?.isFresh ? signals.inletAir : null;
      const freshSuctionSaturation = signals.suctionSaturation?.isFresh ? signals.suctionSaturation : null;
      const observedAmbient = finiteOrNull(weather.data?.ambientFallback.temperatureF);
      const automaticAmbient = freshInletAir?.value ?? observedAmbient;
      const ambientTemperatureF =
        draft.ambientMode === 'automatic' && automaticAmbient !== null
          ? automaticAmbient
          : draft.manualAmbientF;
      const ambientSource: AmbientTemperatureSource =
        draft.ambientMode === 'manual'
          ? 'manual_entry'
          : freshInletAir
            ? 'condenser_entering_air_sensor'
            : observedAmbient !== null
              ? 'local_weather'
              : 'manual_entry';
      const suctionTemperatureF = freshSuctionSaturation?.value ?? draft.manualSuctionF;
      const suctionSource: SuctionTemperatureSource = freshSuctionSaturation
        ? 'validated_manufacturer_axis_sensor'
        : 'manual_entry';
      const selectedVariant =
        configuration.variant === 'unconfirmed' ? undefined : variantById.get(configuration.variant);
      const selectedVariants = selectedVariant ? [selectedVariant] : [];
      const confirmedFrequency =
        configuration.frequencyHz === 50 || configuration.frequencyHz === 60
          ? configuration.frequencyHz
          : null;
      const suctionAxisValidated = Boolean(freshSuctionSaturation || draft.manualSuctionValidated);
      const contributingTimestamps = [
        freshInletAir?.point.latestTimestamp,
        freshSuctionSaturation?.point.latestTimestamp,
        !freshInletAir && ambientSource === 'local_weather' ? weather.data?.observation.observedAt : undefined
      ].filter((value): value is string => Boolean(value));
      const parsedTimestamps = contributingTimestamps
        .map((value) => Date.parse(value))
        .filter((value) => Number.isFinite(value));
      const operatingPointCapturedAt = parsedTimestamps.length
        ? new Date(Math.min(...parsedTimestamps)).toISOString()
        : undefined;
      const capacityBlockedReason =
        configuration.refrigerant !== catalog.refrigerant
          ? `No ${configuration.refrigerant} manufacturer curve is loaded`
          : !selectedVariant
            ? 'Confirm the exact compressor model from this unit nameplate'
            : confirmedFrequency === null
              ? 'Confirm installed frequency from this unit nameplate'
              : !suctionAxisValidated
                ? 'Validate that the suction input is saturated suction temperature'
                : null;
      const evaluations =
        capacityBlockedReason === null && selectedVariant && confirmedFrequency !== null
          ? [
              {
                variant: selectedVariant,
                evaluation: evaluateRussellUnitCapacity(catalog, {
                  unitId: asset.assetId,
                  active: true,
                  catalogVariantId: selectedVariant.catalogVariantId,
                  installedFrequencyHz: confirmedFrequency,
                  parallelGroupId: asset.parallelGroupId ?? undefined,
                  liveOperatingPoint: {
                    ambientTemperatureF,
                    suctionTemperatureF,
                    ambientSource,
                    suctionSource,
                    suctionAxisValidated,
                    capturedAt: operatingPointCapturedAt
                  }
                })
              }
            ]
          : [];

      return {
        asset,
        signals,
        ambientTemperatureF,
        ambientSource,
        suctionTemperatureF,
        suctionSource,
        evaluations,
        capacityRange: capacityRange(evaluations),
        configuration,
        selectedVariants,
        capacityBlockedReason,
        suctionAxisValidated,
        operatingPointCapturedAt
      };
    });
  }, [catalog, draft, system.condensers, telemetry.fetchedAt, telemetry.points, variantById, weather.data]);

  const hasCurrentRunStates =
    telemetry.status === 'ready' &&
    analyses.every(
      (analysis) => Boolean(analysis.signals.running) && unitHasCurrentTelemetry(analysis.signals)
    );

  const exactParallelEvaluation = useMemo(() => {
    if (
      draft.arrangement !== 'multiple_parallel_same_system' ||
      analyses.some(
        (analysis) =>
          analysis.capacityBlockedReason !== null ||
          analysis.configuration.variant === 'unconfirmed' ||
          analysis.configuration.frequencyHz === 'unconfirmed' ||
          !analysis.suctionAxisValidated
      )
    ) {
      return null;
    }
    const requests = analyses.map((analysis) => ({
      unitId: analysis.asset.assetId,
      active: hasCurrentRunStates ? Boolean(analysis.signals.running?.value) : true,
      catalogVariantId: analysis.configuration.variant,
      installedFrequencyHz: analysis.configuration.frequencyHz as 50 | 60,
      parallelGroupId: analysis.asset.parallelGroupId ?? undefined,
      liveOperatingPoint: {
        ambientTemperatureF: analysis.ambientTemperatureF,
        suctionTemperatureF: analysis.suctionTemperatureF,
        ambientSource: analysis.ambientSource,
        suctionSource: analysis.suctionSource,
        suctionAxisValidated: analysis.suctionAxisValidated,
        capturedAt: analysis.operatingPointCapturedAt
      }
    }));
    return evaluateRussellParallelCapacity(catalog, requests);
  }, [analyses, catalog, draft.arrangement, hasCurrentRunStates]);

  const systemCapacityRange = useMemo<CapacityRange | null>(() => {
    if (draft.arrangement === 'single') {
      const first = analyses[0];
      if (!first) return null;
      if (
        telemetry.status === 'ready' &&
        first.signals.running &&
        unitHasCurrentTelemetry(first.signals)
      ) {
        return first.signals.running.value
          ? first.capacityRange
          : { minimumBtuPerHour: 0, maximumBtuPerHour: 0 };
      }
      return first.capacityRange;
    }
    if (draft.arrangement !== 'multiple_parallel_same_system') return null;
    const combined = exactParallelEvaluation?.derivedCapacity?.combinedCapacityBtuPerHour;
    return combined === undefined || combined === null
      ? null
      : { minimumBtuPerHour: combined, maximumBtuPerHour: combined };
  }, [analyses, draft.arrangement, exactParallelEvaluation, telemetry.status]);
  const usesFreshRunStateForCapacity =
    (draft.arrangement === 'multiple_parallel_same_system' && hasCurrentRunStates) ||
    (draft.arrangement === 'single' &&
      telemetry.status === 'ready' &&
      Boolean(analyses[0]?.signals.running) &&
      unitHasCurrentTelemetry(analyses[0].signals));

  const readinessRows = useMemo(() => {
    const allFresh = (selector: (signals: AssetSignals) => NumericSignal | null) =>
      analyses.every((analysis) => selector(analysis.signals)?.isFresh === true);
    return [
      { label: 'High-side pressure', available: allFresh((signals) => signals.highPressure), unlocks: 'Head-pressure context' },
      { label: 'Low-side pressure', available: allFresh((signals) => signals.lowPressure), unlocks: 'Evaporator-side context' },
      { label: 'Compressor amps', available: allFresh((signals) => signals.compressorAmps), unlocks: 'Electrical loading' },
      { label: 'Condenser inlet air', available: allFresh((signals) => signals.inletAir), unlocks: 'True entering-air correction' },
      { label: 'Validated suction saturation', available: allFresh((signals) => signals.suctionSaturation), unlocks: 'Automatic capacity lookup' },
      { label: 'Three-phase real power', available: allFresh((signals) => signals.realPowerKw), unlocks: 'kW, COP and efficiency' }
    ];
  }, [analyses]);

  const readyCount = readinessRows.filter((row) => row.available).length;
  const fastSignalAvailability = {
    temperature: analyses.length > 0 && analyses.every((analysis) => analysis.signals.temperature?.isFresh === true),
    highPressure: analyses.length > 0 && analyses.every((analysis) => analysis.signals.highPressure?.isFresh === true),
    lowPressure: analyses.length > 0 && analyses.every((analysis) => analysis.signals.lowPressure?.isFresh === true),
    compressorAmps: analyses.length > 0 && analyses.every((analysis) => analysis.signals.compressorAmps?.isFresh === true)
  };
  const immediateSignalAvailability = {
    running: analyses.length > 0 && analyses.every((analysis) => Boolean(analysis.signals.running)),
    systemOn: analyses.length > 0 && analyses.every((analysis) => Boolean(analysis.signals.systemOn)),
    highPressureStop: analyses.length > 0 && analyses.every((analysis) => Boolean(analysis.signals.highPressureStop))
  };
  const immediateSignalsMapped = Object.values(immediateSignalAvailability).every(Boolean);
  const slowSignalAvailability = {
    runtime: analyses.length > 0 && analyses.every((analysis) => Boolean(analysis.signals.compressorRuntimeMinutes)),
    setpoint: analyses.length > 0 && analyses.every((analysis) => Boolean(analysis.signals.setpoint))
  };
  const slowSignalsMapped = Object.values(slowSignalAvailability).every(Boolean);
  const heartbeatKeys = new Set(['controllerheartbeat', 'epicheartbeat', 'heartbeat']);
  const heartbeatPoint = [...telemetry.points]
    .filter((point) => heartbeatKeys.has(normalizeTelemetryKey(point.key)))
    .sort((left, right) => Date.parse(right.latestTimestamp) - Date.parse(left.latestTimestamp))[0];
  const heartbeatIsCurrent = heartbeatPoint
    ? signalIsFresh(heartbeatPoint, telemetry.fetchedAt, CONTROLLER_HEARTBEAT_STALE_MS)
    : false;
  const mappedRelevantSignals = analyses.flatMap((analysis) =>
    [
      analysis.signals.temperature,
      analysis.signals.highPressure,
      analysis.signals.lowPressure,
      analysis.signals.compressorAmps,
      analysis.signals.compressorRuntimeMinutes,
      analysis.signals.setpoint,
      analysis.signals.running,
      analysis.signals.systemOn,
      analysis.signals.highPressureStop
    ].filter((signal): signal is NumericSignal | BooleanSignal => Boolean(signal))
  );
  const telemetryRelevantCount = mappedRelevantSignals.filter((signal) => signal.isFresh).length;
  const staleTelemetryRelevantCount = mappedRelevantSignals.length - telemetryRelevantCount;
  const currentUnitCount = analyses.filter((analysis) => unitHasCurrentTelemetry(analysis.signals)).length;
  const ambiguousAliasCount = analyses.reduce(
    (total, analysis) => total + analysis.signals.ambiguousAliasCount,
    0
  );
  const newestMappedSignalTimestamp = mappedRelevantSignals.reduce<string | null>((latest, signal) => {
    const timestamp = Date.parse(signal.point.latestTimestamp);
    if (!Number.isFinite(timestamp)) return latest;
    return !latest || timestamp > Date.parse(latest) ? signal.point.latestTimestamp : latest;
  }, null);
  const confirmedModelCount = analyses.filter((analysis) => analysis.selectedVariants.length === 1).length;
  const firstCapacityBlock = analyses.find((analysis) => analysis.capacityBlockedReason)?.capacityBlockedReason ?? null;

  function updateDraft<TKey extends keyof ConfigurationDraft>(key: TKey, value: ConfigurationDraft[TKey]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateUnitDraft(assetId: string, patch: Partial<UnitConfigurationDraft>) {
    setDraft((current) => ({
      ...current,
      units: {
        ...current.units,
        [assetId]: { ...current.units[assetId], ...patch }
      }
    }));
  }

  function refreshTelemetry() {
    if (telemetry.status === 'loading') return;
    setTelemetry((current) => ({ ...current, status: 'loading', error: null }));
    setTelemetryRefreshVersion((current) => current + 1);
  }

  function toggleFacilityLiveTelemetry() {
    setFacilityLiveUntil((current) =>
      current > Date.now() ? 0 : Date.now() + LIVE_TELEMETRY_MAX_MS
    );
  }

  return (
    <div className="salinas-dashboard">
      {view === 'overview' ? (
        <>
      <section className="salinas-dashboard__hero">
        <div className="salinas-dashboard__hero-copy">
          <div className="salinas-dashboard__kicker">
            <Database size={16} /> Verified equipment record
          </div>
          <h2>{system.displayName}</h2>
          <p>
            A condition-aware view of two Russell Next-Gen II condensing units. Manufacturer ratings, live PLC
            signals and derived estimates remain separate and traceable.
          </p>
          <div className="salinas-dashboard__chips">
            <span>2 x 22 HP</span>
            <span>Parallel system</span>
            <span>R404A</span>
            <span>Ethanol</span>
          </div>
        </div>
        <div className="salinas-dashboard__connection-card">
          <div className="salinas-dashboard__connection-heading">
            <span
              className={`salinas-dashboard__pulse ${telemetry.status === 'error' ? 'is-error' : currentUnitCount ? 'is-live' : ''}`}
            />
            <div>
              <strong>
                {telemetry.status === 'error'
                  ? 'Telemetry feed unavailable'
                  : ambiguousAliasCount
                    ? 'Device mapping required'
                    : currentUnitCount
                      ? 'PLC signals current'
                      : staleTelemetryRelevantCount
                        ? 'PLC signals stale'
                        : 'Equipment model ready'}
              </strong>
              <p>
                {telemetry.status === 'loading'
                  ? 'Checking the protected telemetry feed...'
                  : telemetry.status === 'error'
                    ? telemetry.error
                  : ambiguousAliasCount
                    ? `${ambiguousAliasCount} aliases appear on more than one device`
                  : currentUnitCount
                    ? `${currentUnitCount} of ${analyses.length} units reporting current pressure, temperature, amps, or state`
                    : staleTelemetryRelevantCount
                      ? `${staleTelemetryRelevantCount} mapped values are older than five minutes`
                    : 'Waiting for mapped CH1 / CH2 values'}
              </p>
            </div>
            <button
              type="button"
              className="salinas-dashboard__refresh-button"
              onClick={refreshTelemetry}
              disabled={telemetry.status === 'loading'}
              aria-label="Refresh PLC telemetry now"
            >
              <RefreshCw
                size={15}
                className={telemetry.status === 'loading' ? 'salinas-dashboard__spin' : undefined}
              />
              {telemetry.status === 'loading' ? 'Refreshing' : 'Refresh'}
            </button>
          </div>
          <small>
            Standard dashboard check every {DEFAULT_TELEMETRY_REFRESH_MS / 1000} seconds
          </small>
          <small>
            Live operating channel: {liveTelemetryActive ? `every ${LIVE_TELEMETRY_REFRESH_MS / 1000} seconds` : 'off'}
          </small>
          <span>Newest PLC sample: {formatTimestamp(newestMappedSignalTimestamp, true)}</span>
          <span>Dashboard check: {formatTimestamp(telemetry.fetchedAt, true)}</span>
        </div>
      </section>

        </>
      ) : null}

      {view === 'specs' ? (
      <section className="salinas-dashboard__section">
        <div className="salinas-dashboard__section-heading">
          <div>
            <p className="eyebrow">System configuration</p>
            <h2>System and condenser records</h2>
          </div>
          <span className="salinas-dashboard__draft-label">
            <CheckCircle2 size={15} /> Browser draft saved
          </span>
        </div>

        <div className="salinas-dashboard__configuration-grid">
          <label>
            <span>Condenser arrangement</span>
            <select
              value={draft.arrangement}
              onChange={(event) => updateDraft('arrangement', event.target.value as CondenserArrangementSelection)}
            >
              {equipmentRecord.selectionOptions.condenserArrangement.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Process solvent</span>
            <select
              value={draft.solvent}
              onChange={(event) => updateDraft('solvent', event.target.value as ProcessSolventSelection)}
            >
              {equipmentRecord.selectionOptions.processSolvent.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="salinas-dashboard__unit-config-grid">
          {system.condensers.map((asset, index) => {
            const configuration = draft.units[asset.assetId] ?? defaultDraft.units[asset.assetId];
            const voltageOptions =
              configuration.frequencyHz === 50
                ? [
                    { value: '200-220', label: '200-220 V / 3 phase / 50 Hz' },
                    { value: '380', label: '380 V / 3 phase / 50 Hz' }
                  ]
                : configuration.frequencyHz === 60
                  ? [
                      { value: '208-230', label: '208-230 V / 3 phase / 60 Hz' },
                      { value: '460', label: '460 V / 3 phase / 60 Hz' },
                      { value: '575', label: '575 V / 3 phase / 60 Hz' }
                    ]
                  : [];

            return (
              <fieldset className="salinas-dashboard__unit-config-card" key={asset.assetId}>
                <legend>
                  <span>0{index + 1}</span>
                  <div>
                    <strong>{asset.displayName}</strong>
                    <small>{asset.nominalHorsepower} HP Russell Next-Gen II</small>
                  </div>
                </legend>
                <div className="salinas-dashboard__unit-config-fields">
                  <label>
                    <span>Refrigerant</span>
                    <select
                      value={configuration.refrigerant}
                      onChange={(event) => updateUnitDraft(asset.assetId, { refrigerant: event.target.value })}
                    >
                      <option value="R404A">R404A - catalog loaded</option>
                      <option value="other">Other - curve required</option>
                    </select>
                  </label>
                  <label>
                    <span>Installed compressor</span>
                    <select
                      value={configuration.variant}
                      onChange={(event) => updateUnitDraft(asset.assetId, { variant: event.target.value })}
                    >
                      <option value="unconfirmed">Nameplate model pending</option>
                      {asset.catalogVariantCandidates
                        .map((candidateId) => variantById.get(candidateId))
                        .filter((variant): variant is CondenserCatalogVariant => Boolean(variant))
                        .map((variant) => (
                          <option key={variant.catalogVariantId} value={variant.catalogVariantId}>
                            {variantName(variant)} - {variant.compressor.model}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    <span>Installed frequency</span>
                    <select
                      value={configuration.frequencyHz}
                      onChange={(event) => {
                        const frequencyHz =
                          event.target.value === 'unconfirmed'
                            ? 'unconfirmed'
                            : (Number(event.target.value) as 50 | 60);
                        updateUnitDraft(asset.assetId, { frequencyHz, voltage: 'unconfirmed' });
                      }}
                    >
                      <option value="unconfirmed">Nameplate pending</option>
                      <option value={60}>60 Hz</option>
                      <option value={50}>50 Hz - 0.83 capacity factor</option>
                    </select>
                  </label>
                  <label>
                    <span>Installed voltage</span>
                    <select
                      value={configuration.voltage}
                      disabled={configuration.frequencyHz === 'unconfirmed'}
                      onChange={(event) =>
                        updateUnitDraft(asset.assetId, { voltage: event.target.value as VoltageSelection })
                      }
                    >
                      <option value="unconfirmed">
                        {configuration.frequencyHz === 'unconfirmed' ? 'Confirm frequency first' : 'Nameplate pending'}
                      </option>
                      {voltageOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <p>
                  Telemetry source: {asset.telemetryDeviceId
                    ? `device ${asset.telemetryDeviceId}`
                    : 'unique CH key matching; production device ID pending'}
                </p>
              </fieldset>
            );
          })}
        </div>
        <p className="salinas-dashboard__configuration-note">
          The verified Salinas defaults are preserved in the source record. Changes here are an engineering draft
          stored in this browser until Jose&apos;s production database/schema is available.
        </p>
      </section>
      ) : null}

      {view === 'specs' ? (
      <section className="salinas-dashboard__section">
        <div className="salinas-dashboard__section-heading">
          <div>
            <p className="eyebrow">Telemetry configuration</p>
            <h2>Delivery schedules and connection health</h2>
          </div>
          <span className="salinas-dashboard__refresh-label">
            <Cpu size={15} /> EPIC data policy
          </span>
        </div>

        <div className={`salinas-dashboard__telemetry-cadence${liveTelemetryActive ? ' is-live' : ''}`}>
          <article className="salinas-dashboard__cadence-card is-fast">
            <div className="salinas-dashboard__cadence-interval" aria-hidden="true">
              <strong>2</strong>
              <span>sec</span>
            </div>
            <div className="salinas-dashboard__cadence-copy">
              <header>
                <div>
                  <small>Fast operating channel</small>
                  <strong>{liveTelemetryActive ? 'Live checks active' : 'Ready when Live is on'}</strong>
                </div>
                <span className={`salinas-dashboard__cadence-state is-${fastTelemetry.status}`}>
                  {fastTelemetry.status === 'error'
                    ? 'Interrupted'
                    : liveTelemetryActive
                      ? fastTelemetry.status === 'loading'
                        ? 'Starting'
                        : 'Live'
                      : 'Off'}
                </span>
              </header>
              <p>
                Pressure, process-fluid temperature and compressor loading update here first.
              </p>
              <div className="salinas-dashboard__cadence-signals">
                <span className={fastSignalAvailability.highPressure ? 'is-ready' : 'is-pending'}>
                  <Gauge size={13} /> High pressure
                </span>
                <span className={fastSignalAvailability.lowPressure ? 'is-ready' : 'is-pending'}>
                  <Gauge size={13} /> Low pressure
                </span>
                <span className={fastSignalAvailability.temperature ? 'is-ready' : 'is-pending'}>
                  <Thermometer size={13} /> Process temperature
                </span>
                <span className={fastSignalAvailability.compressorAmps ? 'is-ready' : 'is-pending'}>
                  <Zap size={13} /> Compressor amps
                </span>
              </div>
              <small className="salinas-dashboard__cadence-checked">
                {fastTelemetry.status === 'error'
                  ? fastTelemetry.error
                  : liveTelemetryActive
                    ? `Last fast check ${formatTimestamp(fastTelemetry.fetchedAt, true)}`
                    : 'Turn on Live from Overview to start the 2-second channel'}
              </small>
            </div>
          </article>

          <article className="salinas-dashboard__cadence-card is-event">
            <div className="salinas-dashboard__cadence-interval" aria-hidden="true">
              <strong>Now</strong>
              <span>on change</span>
            </div>
            <div className="salinas-dashboard__cadence-copy">
              <header>
                <div>
                  <small>Immediate events</small>
                  <strong>Recorded whenever state changes</strong>
                </div>
                <span className={`salinas-dashboard__cadence-state${immediateSignalsMapped ? ' is-ready' : ''}`}>
                  {immediateSignalsMapped ? 'Mapped' : 'Waiting'}
                </span>
              </header>
              <p>
                Important operating transitions are saved without waiting for the next scheduled reading.
              </p>
              <div className="salinas-dashboard__cadence-signals">
                <span className={immediateSignalAvailability.running ? 'is-ready' : 'is-pending'}>
                  <Zap size={13} /> Compressor running
                </span>
                <span className={immediateSignalAvailability.systemOn ? 'is-ready' : 'is-pending'}>
                  <Power size={13} /> System enabled
                </span>
                <span className={immediateSignalAvailability.highPressureStop ? 'is-ready' : 'is-pending'}>
                  <ShieldAlert size={13} /> High-pressure stops
                </span>
              </div>
              <small className="salinas-dashboard__cadence-checked">
                Each event stores the pressure, temperature and amperage available at that moment
              </small>
            </div>
          </article>

          <article className="salinas-dashboard__cadence-card is-slow">
            <div className="salinas-dashboard__cadence-interval" aria-hidden="true">
              <strong>1</strong>
              <span>min</span>
            </div>
            <div className="salinas-dashboard__cadence-copy">
              <header>
                <div>
                  <small>Slow information</small>
                  <strong>Low-change controller values</strong>
                </div>
                <span className={`salinas-dashboard__cadence-state${slowSignalsMapped ? ' is-ready' : ''}`}>
                  {slowSignalsMapped ? 'Mapped' : 'Waiting'}
                </span>
              </header>
              <p>
                Accumulated and configured values do not need the fast operating channel.
              </p>
              <div className="salinas-dashboard__cadence-signals">
                <span className={slowSignalAvailability.runtime ? 'is-ready' : 'is-pending'}>
                  <Clock3 size={13} /> Runtime every minute
                </span>
                <span className={slowSignalAvailability.setpoint ? 'is-ready' : 'is-pending'}>
                  <Settings2 size={13} /> Setpoint when changed
                </span>
              </div>
              <small className="salinas-dashboard__cadence-checked">
                Last standard check {formatTimestamp(standardTelemetryFetchedAt, true)}
              </small>
            </div>
          </article>

          <div className={`salinas-dashboard__heartbeat${heartbeatIsCurrent ? ' is-current' : ''}`}>
            <span className="salinas-dashboard__heartbeat-icon" aria-hidden="true"><Cpu size={16} /></span>
            <div>
              <small>Controller heartbeat</small>
              <strong>{heartbeatIsCurrent ? 'EPIC communicating' : 'Waiting for dedicated heartbeat'}</strong>
            </div>
            <span className="salinas-dashboard__heartbeat-time">
              Target every {CONTROLLER_HEARTBEAT_MS / 1000} seconds
            </span>
            <small>
              {heartbeatPoint
                ? `Last heartbeat ${formatTimestamp(heartbeatPoint.latestTimestamp, true)}`
                : 'Add controller_heartbeat to the PLC payload'}
            </small>
          </div>

          <p className="salinas-dashboard__cadence-note">
            Live mode checks for new critical values every 2 seconds. It displays a new value immediately when the
            PLC publishes one, but it does not force the controller to transmit faster. Immediate events are created
            by the incoming PLC change itself; the dashboard background check remains every 15 seconds.
          </p>
        </div>
      </section>
      ) : null}

      <section className={`salinas-dashboard__context-grid${view === 'specs' ? ' is-single' : ''}`}>
        {view === 'overview' ? (
        <article className="salinas-dashboard__weather-hero">
          <div
            className="salinas-dashboard__weather-hero-imagery"
            role="img"
            aria-label="Aerial satellite view centered on 3558 E 8th Street in Los Angeles"
          />
          <div className="salinas-dashboard__weather-hero-shade" aria-hidden="true" />

          <header className="salinas-dashboard__weather-hero-header">
            <span className="salinas-dashboard__weather-hero-kicker">
              <Satellite size={15} /> Facility weather
            </span>
            <span className="salinas-dashboard__weather-hero-attribution">
              Imagery: Esri, Vantor, Earthstar Geographics, GIS User Community
            </span>
          </header>

          <div className="salinas-dashboard__weather-location">
            <span className="salinas-dashboard__weather-location-pin" aria-hidden="true">
              <MapPin size={18} />
            </span>
            <div>
              <strong>Salinas operating site</strong>
              <small>3558 E 8th St · Los Angeles, CA</small>
            </div>
          </div>

          {weather.data ? (
            <div className="salinas-dashboard__weather-dock">
              <div className="salinas-dashboard__weather-now">
                <span>
                  Latest observed conditions
                  {weather.status === 'loading' ? <RefreshCw className="salinas-dashboard__spin" size={14} /> : null}
                </span>
                <div>
                  <strong>{formatValue(weather.data.observation.temperatureF, '', 0)}</strong>
                  <sup>°F</sup>
                </div>
                <p>{weather.data.observation.stationName}</p>
                <small>
                  Observed {formatTimestamp(weather.data.observation.observedAt)} · {formatObservationAge(weather.data.observation.ageMinutes)}
                </small>
              </div>

              <div className="salinas-dashboard__weather-observation-grid">
                <div>
                  <Droplets size={15} />
                  <span>Humidity</span>
                  <strong>{formatValue(weather.data.observation.humidityPercent, '%')}</strong>
                </div>
                <div>
                  <Thermometer size={15} />
                  <span>Dew point</span>
                  <strong>{formatValue(weather.data.observation.dewpointF, ' °F')}</strong>
                </div>
                <div>
                  <Wind size={15} />
                  <span>Wind</span>
                  <strong>{formatValue(weather.data.observation.windSpeedMph, ' mph', 1)}</strong>
                  <small>{weather.data.observation.windDirectionCardinal ?? 'Direction unavailable'}</small>
                </div>
                <div>
                  <CloudRain size={15} />
                  <span>{weather.data.observation.precipitationLastHourIn !== null ? 'Rain · 1 hour' : 'Rain · 3 hours'}</span>
                  <strong>{formatValue(weather.data.observation.precipitationLastHourIn ?? weather.data.observation.precipitationLast3HoursIn, ' in', 2)}</strong>
                </div>
              </div>

              {weather.data.forecast ? (
                <div className="salinas-dashboard__weather-forecast-strip">
                  <div>
                    <CloudSun size={17} />
                    <span>
                      <small>Next-hour forecast</small>
                      <strong>{formatValue(weather.data.forecast.temperatureF, ' °F')} · {weather.data.forecast.condition ?? 'Conditions pending'}</strong>
                    </span>
                  </div>
                  <span><CloudRain size={14} /> Rain {formatValue(weather.data.forecast.rainChancePercent, '%')}</span>
                  <span><CloudSun size={14} /> Sky {formatValue(weather.data.forecast.skyCoverPercent, '%')}</span>
                  <span><Sun size={14} /> Sunlight {formatValue(weather.data.forecast.sunlightEstimatePercent, '%')}</span>
                </div>
              ) : null}

              <footer className="salinas-dashboard__weather-dock-footer">
                <div>
                  <Cpu size={15} />
                  <span>Condenser ambient input: PLC inlet-air first, then this NWS observation</span>
                </div>
                <b className={weather.data.observation.isCurrent ? 'is-current' : 'is-stale'}>
                  {weather.data.observation.isCurrent ? 'Fallback ready' : 'Observation stale'}
                </b>
                <small>Station {weather.data.observation.stationId} · Dashboard checked {formatTimestamp(weather.data.fetchedAt)}</small>
              </footer>
            </div>
          ) : (
            <div className="salinas-dashboard__weather-dock is-empty">
              <CircleAlert size={22} />
              <div>
                <strong>Weather feed unavailable</strong>
                <p>{weather.error ?? 'Waiting for the latest NWS station observation.'}</p>
              </div>
            </div>
          )}
        </article>
        ) : null}

        {view === 'specs' ? (
        <article className="salinas-dashboard__panel salinas-dashboard__analysis-panel">
          <div className="salinas-dashboard__panel-heading">
            <span className="salinas-dashboard__panel-icon"><Settings2 size={22} /></span>
            <div>
              <p className="eyebrow">Capacity model</p>
              <h3>Analysis inputs</h3>
            </div>
          </div>
          <div className="salinas-dashboard__input-grid">
            <label>
              <span>Entering-air source</span>
              <select value={draft.ambientMode} onChange={(event) => updateDraft('ambientMode', event.target.value as AmbientMode)}>
                <option value="automatic">PLC inlet-air, then observed weather</option>
                <option value="manual">Manual value</option>
              </select>
            </label>
            <label>
              <span>Manual entering air</span>
              <div className="salinas-dashboard__number-input">
                <input
                  type="number"
                  min={-20}
                  max={140}
                  step={1}
                  value={draft.manualAmbientF}
                  onChange={(event) => updateDraft('manualAmbientF', Number(event.target.value))}
                />
                <b>°F</b>
              </div>
            </label>
            <label>
              <span>Catalog suction temperature</span>
              <div className="salinas-dashboard__number-input">
                <input
                  type="number"
                  min={-40}
                  max={0}
                  step={1}
                  value={draft.manualSuctionF}
                  onChange={(event) => updateDraft('manualSuctionF', Number(event.target.value))}
                />
                <b>°F</b>
              </div>
            </label>
          </div>
          <label className="salinas-dashboard__validation-check">
            <input
              type="checkbox"
              checked={draft.manualSuctionValidated}
              onChange={(event) => updateDraft('manualSuctionValidated', event.target.checked)}
            />
            <span>I confirm the manual value is saturated suction temperature, not pipe temperature.</span>
          </label>
          <div className="salinas-dashboard__analysis-warning">
            <CircleAlert size={17} />
            <p>
              Capacity stays locked until each unit model and frequency are confirmed and the suction-table axis is
              validated. A normal pipe-temperature probe must not be substituted for this value.
            </p>
          </div>
        </article>
        ) : null}
      </section>

      {view === 'overview' ? (
      <section className="salinas-dashboard__system-status-bar" aria-label="Condenser operating status">
        {analyses.map((analysis, index) => {
          const signals = analysis.signals;
          const isCurrent = unitHasCurrentTelemetry(signals);
          const running = signals.running && isCurrent ? signals.running.value : null;
          const systemOn = signals.systemOn && isCurrent ? signals.systemOn.value : null;
          const highPressureStop = signals.highPressureStop?.value === true &&
            (signals.highPressureStop.isFresh || isCurrent);

          return (
            <article
              key={analysis.asset.assetId}
              className={`salinas-dashboard__system-status${highPressureStop ? ' has-alarm' : ''}`}
            >
              <span className="salinas-dashboard__status-icon" aria-hidden="true">
                {highPressureStop ? <ShieldAlert size={19} /> : <Power size={19} />}
              </span>
              <div className="salinas-dashboard__status-copy">
                <span>0{index + 1} · {analysis.asset.displayName}</span>
                <strong>
                  {highPressureStop
                    ? 'High pressure stop'
                    : running === true
                      ? 'Condenser on'
                      : running === false
                        ? 'Condenser off'
                        : 'Run state pending'}
                </strong>
              </div>
              <div className="salinas-dashboard__status-meta">
                <span className={`salinas-dashboard__status-pill ${running === true ? 'is-on' : running === false ? 'is-off' : ''}`}>
                  {running === true ? 'ON' : running === false ? 'OFF' : '--'}
                </span>
                <small>
                  System {systemOn === true ? 'enabled' : systemOn === false ? 'disabled' : 'state pending'} ·{' '}
                  {isCurrent ? 'telemetry current' : 'waiting for current signal'}
                </small>
                <small><Clock3 size={12} /> Runtime {formatRuntimeMinutes(signals.compressorRuntimeMinutes?.value ?? null)}</small>
              </div>
            </article>
          );
        })}
      </section>
      ) : null}

      {view === 'overview' ? (
        <>
      <section className="salinas-dashboard__section">
        <div className="salinas-dashboard__section-heading">
          <div>
            <p className="eyebrow">Live operating units</p>
            <h2>CH1 and CH2 condenser performance</h2>
          </div>
          <div className="salinas-dashboard__live-refresh-controls">
            <button
              type="button"
              className={`salinas-dashboard__live-button${liveTelemetryActive ? ' is-live' : ''}`}
              onClick={toggleFacilityLiveTelemetry}
              aria-pressed={liveTelemetryActive}
              aria-label={`${liveTelemetryActive ? 'Turn off' : 'Turn on'} live telemetry for the facility`}
              title={
                liveTelemetryActive
                  ? 'Facility live telemetry is on and will turn off automatically within one hour.'
                  : 'Check pressure, process temperature and compressor amps every 2 seconds.'
              }
            >
              <small>Facility</small>
              <Mic size={14} aria-hidden="true" />
              <span>Live</span>
            </button>
            <TelemetryRefreshCountdown
              dueAt={liveTelemetryActive ? fastTelemetryRefreshDueAt : telemetryRefreshDueAt}
              intervalMs={liveTelemetryActive ? LIVE_TELEMETRY_REFRESH_MS : DEFAULT_TELEMETRY_REFRESH_MS}
              live={liveTelemetryActive}
            />
          </div>
        </div>

        <div className={`salinas-dashboard__overview-telemetry-status${liveTelemetryActive ? ' is-live' : ''}`}>
          <span className="salinas-dashboard__overview-telemetry-icon" aria-hidden="true">
            <Zap size={15} />
          </span>
          <div>
            <strong>{liveTelemetryActive ? 'Live readings every 2 seconds' : 'Standard readings every 15 seconds'}</strong>
            <small>Pressure, process temperature and compressor amps</small>
          </div>
          <span className={`salinas-dashboard__overview-heartbeat${heartbeatIsCurrent ? ' is-current' : ''}`}>
            <Cpu size={14} />
            {heartbeatIsCurrent ? 'EPIC communicating' : 'Heartbeat pending'}
          </span>
        </div>

        <div className="salinas-dashboard__condenser-grid">
          {analyses.map((analysis, index) => {
            const { asset, signals } = analysis;
            const referenceVariants = analysis.selectedVariants.length
              ? analysis.selectedVariants
              : asset.catalogVariantCandidates
                  .map((candidateId) => variantById.get(candidateId))
                  .filter((variant): variant is CondenserCatalogVariant => Boolean(variant));
            const ampsReference = referenceVariants
              .map((variant) => {
                if (
                  analysis.configuration.voltage === 'unconfirmed' ||
                  analysis.configuration.frequencyHz === 'unconfirmed'
                ) {
                  return null;
                }
                return variant.electricalRatings.find((rating) =>
                  rating.supplyOptions.some(
                    (supply) =>
                      supply.voltage === analysis.configuration.voltage &&
                      supply.frequencyHz === analysis.configuration.frequencyHz
                  )
                )?.compressorRlaA ?? null;
              })
              .filter((value): value is number => value !== null);
            const unitIsCurrent = unitHasCurrentTelemetry(signals);
            const status = signals.running && unitIsCurrent ? signals.running.value : null;
            const highPressureStop = signals.highPressureStop?.value === true &&
              (signals.highPressureStop.isFresh || unitIsCurrent);
            const demoPhase = dialDemoTick * 0.65 + index * 1.2;
            const temperatureIsDemo = localDialDemoEnabled && !signals.temperature;
            const dischargeIsDemo = localDialDemoEnabled && !signals.highPressure;
            const suctionIsDemo = localDialDemoEnabled && !signals.lowPressure;
            const currentIsDemo = localDialDemoEnabled && !signals.compressorAmps;
            const temperatureValue = signals.temperature?.value ??
              (temperatureIsDemo ? -38 + Math.sin(demoPhase) * 4 - index * 1.2 : null);
            const dischargeValue = signals.highPressure?.value ??
              (dischargeIsDemo ? 218 + Math.sin(demoPhase + 0.8) * 22 + index * 8 : null);
            const suctionValue = signals.lowPressure?.value ??
              (suctionIsDemo ? 34 + Math.sin(demoPhase + 1.6) * 7 + index * 2 : null);
            const currentValue = signals.compressorAmps?.value ??
              (currentIsDemo ? 47 + Math.sin(demoPhase + 2.3) * 6 + index * 4 : null);
            const runStateText = highPressureStop
              ? 'High pressure stop'
              : status === true
                ? 'Running'
                : status === false
                  ? 'Stopped'
                  : signals.running
                    ? 'Last state retained'
                  : signals.ambiguousAliasCount
                    ? 'Device mapping pending'
                    : 'Run state pending';

            return (
              <article className="salinas-dashboard__condenser-card" key={asset.assetId}>
                <header>
                  <div className="salinas-dashboard__unit-index">0{index + 1}</div>
                  <div>
                    <p className="eyebrow">Russell Next-Gen II</p>
                    <h3>{asset.displayName}</h3>
                    <span>{asset.nominalHorsepower} HP air-cooled condensing unit</span>
                  </div>
                  <span className={`salinas-dashboard__run-state ${highPressureStop ? 'is-alarm' : status === true ? 'is-running' : status === false ? 'is-stopped' : ''}`}>
                    {runStateText}
                  </span>
                </header>

                <div className="salinas-dashboard__gauge-grid">
                  <TelemetryDial3D label="Process temperature" value={temperatureValue} unit="°F" minimum={-50} maximum={100} detail={temperatureIsDemo ? 'Local demo signal' : signalDetail(signals.temperature, 'Display range', telemetry.status === 'error')} accent="cyan" demo={temperatureIsDemo} goal={PROCESS_TEMPERATURE_GOAL} zones={PROCESS_TEMPERATURE_ZONES} scale={PROCESS_TEMPERATURE_SCALE} renderer="glossy-svg" />
                  <TelemetryDial3D label="Discharge pressure" value={dischargeValue} unit="PSI" minimum={0} maximum={500} detail={dischargeIsDemo ? 'Local demo signal' : signalDetail(signals.highPressure, 'Discharge range', telemetry.status === 'error')} accent="gold" demo={dischargeIsDemo} />
                  <TelemetryDial3D label="Suction pressure" value={suctionValue} unit="PSI" minimum={-14.5} maximum={300} detail={suctionIsDemo ? 'Local demo signal' : signalDetail(signals.lowPressure, 'Suction range', telemetry.status === 'error')} accent="violet" demo={suctionIsDemo} />
                  <TelemetryDial3D label="Compressor current" value={currentValue} unit="A" minimum={0} maximum={120} detail={currentIsDemo ? 'Local demo signal' : signalDetail(signals.compressorAmps, ampsReference.length ? `Catalog RLA ${ampsReference.join('-')} A` : 'Current range', telemetry.status === 'error')} accent="lime" demo={currentIsDemo} />
                </div>

                <div className="salinas-dashboard__unit-analysis">
                  <div>
                    <span>Entering-air input</span>
                    <strong>{oneDecimalFormatter.format(analysis.ambientTemperatureF)} °F</strong>
                    <small>{analysis.ambientSource.replaceAll('_', ' ')}</small>
                  </div>
                  <div>
                    <span>Suction-table input</span>
                    <strong>{oneDecimalFormatter.format(analysis.suctionTemperatureF)} °F</strong>
                    <small>{analysis.suctionSource.replaceAll('_', ' ')}</small>
                  </div>
                  <div>
                    <span>Total compressor runtime</span>
                    <strong>{formatRuntimeMinutes(signals.compressorRuntimeMinutes?.value ?? null)}</strong>
                    <small>PLC accumulated minutes</small>
                  </div>
                  <div>
                    <span>Temperature setpoint</span>
                    <strong>{formatValue(signals.setpoint?.value ?? null, ` ${displayTelemetryUnit(signals.setpoint?.point.unit, { temperature: true }) || '°F'}`, 1)}</strong>
                    <small>{signals.systemOn?.value === false ? 'System disabled' : 'Normal cycle target'}</small>
                  </div>
                  <div className="salinas-dashboard__capacity-result">
                    <span>Catalog capacity estimate</span>
                    <strong>{formatCapacityRange(analysis.capacityRange)}</strong>
                    <small>{analysis.capacityBlockedReason ?? capacityStatusText(analysis.evaluations)}</small>
                  </div>
                </div>

                <footer>
                  <span><Cpu size={15} /> {analysis.selectedVariants.length ? variantName(analysis.selectedVariants[0]) : 'Nameplate model pending'}</span>
                  <span><BookOpen size={15} /> Russell pages {analysis.evaluations.map(({ variant }) => variant.capacityTable.sourcePage).join(', ') || '20 / 28'}</span>
                  {signals.ambiguousAliasCount ? <span><CircleAlert size={15} /> Assign a production telemetry device ID</span> : null}
                </footer>
              </article>
            );
          })}
        </div>
      </section>

      <section className="salinas-dashboard__performance-summary">
        <div>
          <p className="eyebrow">System estimate</p>
          <h2>{draft.arrangement === 'multiple_parallel_same_system' ? 'Parallel capacity context' : 'Configuration capacity context'}</h2>
          <p>
            Capacity changes with entering-air and suction conditions. This result is derived from the manufacturer
            tables and is not a measurement of process load or condenser heat rejection.
          </p>
        </div>
        <div className="salinas-dashboard__capacity-figure">
          <span>{usesFreshRunStateForCapacity ? 'Active-unit estimate' : 'Configured potential'}</span>
          <strong>{formatCapacityRange(systemCapacityRange)}</strong>
          <b>{formatTonsRange(systemCapacityRange)}</b>
          <small>
            {exactParallelEvaluation
              ? hasCurrentRunStates
                ? exactParallelEvaluation.message
                : exactParallelEvaluation.status === 'ok'
                  ? 'Configured scenario assumes all condensers are active; live run states are not available.'
                  : exactParallelEvaluation.message
              : draft.arrangement === 'multiple_separate_systems' || draft.arrangement === 'multiple_high_side_subcooling'
                ? 'A combined capacity total is intentionally unavailable for this arrangement.'
                : firstCapacityBlock ?? 'Complete the per-unit confirmations to enable the checked calculation.'}
          </small>
        </div>
        <div className="salinas-dashboard__performance-meta">
          <div><span>Arrangement</span><strong>{equipmentRecord.selectionOptions.condenserArrangement.find((option) => option.value === draft.arrangement)?.label}</strong></div>
          <div><span>Model basis</span><strong>{confirmedModelCount} of {analyses.length} models selected in draft</strong></div>
          <div><span>Power calculation</span><strong>Awaiting measured 3-phase kW</strong></div>
        </div>
      </section>
        </>
      ) : null}

      <section className="salinas-dashboard__context-grid is-single">
        {view === 'overview' ? (
        <article className="salinas-dashboard__panel">
          <div className="salinas-dashboard__panel-heading">
            <span className="salinas-dashboard__panel-icon"><Database size={22} /></span>
            <div><p className="eyebrow">Signal readiness</p><h3>{readyCount} of {readinessRows.length} diagnostic inputs ready</h3></div>
          </div>
          <div className="salinas-dashboard__readiness-list">
            {readinessRows.map((row) => (
              <div key={row.label}>
                <DataStatus available={row.available}>{row.label}</DataStatus>
                <span>{row.unlocks}</span>
              </div>
            ))}
          </div>
        </article>
        ) : null}

        {view === 'specs' ? (
        <article className="salinas-dashboard__panel">
          <div className="salinas-dashboard__panel-heading">
            <span className="salinas-dashboard__panel-icon"><Zap size={22} /></span>
            <div><p className="eyebrow">Electrical reference</p><h3>Nameplate-dependent limits</h3></div>
          </div>
          <div className="salinas-dashboard__electrical-list">
            {analyses.map((analysis) => {
              const variants = analysis.selectedVariants.length
                ? analysis.selectedVariants
                : analysis.asset.catalogVariantCandidates
                    .map((candidateId) => variantById.get(candidateId))
                    .filter((variant): variant is CondenserCatalogVariant => Boolean(variant));
              const ratings =
                analysis.configuration.voltage === 'unconfirmed' ||
                analysis.configuration.frequencyHz === 'unconfirmed'
                  ? []
                  : variants
                      .map((variant) =>
                        variant.electricalRatings.find((candidate) =>
                          candidate.supplyOptions.some(
                            (supply) =>
                              supply.voltage === analysis.configuration.voltage &&
                              supply.frequencyHz === analysis.configuration.frequencyHz
                          )
                        )
                      )
                      .filter((rating): rating is CatalogElectricalRating => Boolean(rating));
              return (
                <div key={analysis.asset.assetId}>
                  <strong>
                    {analysis.asset.displayName} - {analysis.selectedVariants.length
                      ? variantName(analysis.selectedVariants[0])
                      : 'candidate models'}
                  </strong>
                  {ratings.length ? (
                    <span>
                      RLA {formatNumericRange(ratings.map((rating) => rating.compressorRlaA))} A - LRA{' '}
                      {formatNumericRange(ratings.map((rating) => rating.compressorLraA))} A - fan FLA{' '}
                      {formatNumericRange(
                        ratings.flatMap((rating) =>
                          rating.totalCondenserFanFlaA === null ? [] : [rating.totalCondenserFanFlaA]
                        )
                      )} A
                    </span>
                  ) : (
                    <span>Confirm this unit frequency and voltage to load RLA, LRA and fan FLA.</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="salinas-dashboard__source-note">
            Amperage ratings are not real power. kW, COP and EER stay unavailable until a power meter or a validated manufacturer power map is added.
          </p>
        </article>
        ) : null}
      </section>

      {view === 'specs' ? (
        <>
      <section className="salinas-dashboard__section">
        <div className="salinas-dashboard__section-heading">
          <div>
            <p className="eyebrow">Manufacturer source data</p>
            <h2>Complete R404A cooling tables</h2>
          </div>
          <span className="salinas-dashboard__manual-badge"><BookOpen size={15} /> RU-NG2-0617A</span>
        </div>
        <p className="salinas-dashboard__table-intro">
          All 64 published rating points are retained below. Values are BTU/h at 60 Hz with 20 °F compressor
          superheat. The evaluator interpolates only inside this envelope and never silently extrapolates.
        </p>

        <div className="salinas-dashboard__rating-tables">
          {catalog.modelVariants.map((variant) => (
            <details
              key={variant.catalogVariantId}
              open={analyses.some((analysis) => analysis.configuration.variant === variant.catalogVariantId)}
            >
              <summary>
                <div>
                  <strong>{variantName(variant)} · {variant.compressor.model}</strong>
                  <span>{variant.baseModelPattern} · Manual page {variant.capacityTable.sourcePage}</span>
                </div>
                <span>View 32 points</span>
              </summary>
              <div className="salinas-dashboard__table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Ambient / suction</th>
                      {variant.capacityTable.suctionTemperaturesF.map((temperature) => <th key={temperature}>{temperature} °F</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {variant.capacityTable.rows.map((row) => (
                      <tr key={row.ambientTemperatureF}>
                        <th>{row.ambientTemperatureF} °F</th>
                        {row.capacityBtuPerHour.map((capacity, index) => (
                          <td key={`${row.ambientTemperatureF}-${variant.capacityTable.suctionTemperaturesF[index]}`}>
                            {capacity === null ? '--' : numberFormatter.format(capacity)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="salinas-dashboard__spec-strip">
        <div><span>Cabinet</span><strong>FD3</strong></div>
        <div><span>Condenser fans</span><strong>2 per unit</strong></div>
        <div><span>Connections</span><strong>2-1/8 in suction · 7/8 in liquid</strong></div>
        <div><span>Dimensions</span><strong>49 x 68-5/16 x 43-7/8 in</strong></div>
        <div><span>Approx. ship weight</span><strong>1,420 lb each</strong></div>
      </section>
        </>
      ) : null}
    </div>
  );
}

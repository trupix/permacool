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
  Power,
  RefreshCw,
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
import { resolveTelemetryPoint } from '@/lib/equipment/telemetry';
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

type WeatherData = {
  locationLabel: string;
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
  source: string;
  sourceUrl: string;
  sourceUpdatedAt: string | null;
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

const TELEMETRY_REFRESH_MS = 15_000;
const WEATHER_REFRESH_MS = 15 * 60_000;
const SIGNAL_STALE_MS = 5 * 60_000;
const SIGNAL_FUTURE_TOLERANCE_MS = 60_000;
const BTU_PER_TON_HOUR = 12_000;
const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const oneDecimalFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

function signalIsFresh(point: TelemetryPoint, referenceTimestamp: string | null): boolean {
  const capturedAt = Date.parse(point.latestTimestamp);
  const referenceTime = referenceTimestamp ? Date.parse(referenceTimestamp) : Date.now();

  if (!Number.isFinite(capturedAt) || !Number.isFinite(referenceTime)) return false;
  return (
    referenceTime - capturedAt <= SIGNAL_STALE_MS &&
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
    `${prefix}_inlet_air_temp_f`
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

function formatTimestamp(value: string | null): string {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
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
  if (status === 'outside_published_envelope') return 'Conditions outside the published 90-110 F envelope';
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

function RangeGauge({
  label,
  value,
  unit,
  minimum,
  maximum,
  detail,
  accent = 'cyan'
}: {
  label: string;
  value: number | null;
  unit: string;
  minimum: number;
  maximum: number;
  detail: string;
  accent?: 'cyan' | 'lime' | 'gold' | 'violet';
}) {
  const percentage = value === null ? 0 : Math.max(0, Math.min(100, ((value - minimum) / (maximum - minimum)) * 100));
  const style = { '--gauge-position': `${percentage}%` } as CSSProperties;

  return (
    <div className={`salinas-dashboard__gauge salinas-dashboard__gauge--${accent}`} style={style}>
      <div className="salinas-dashboard__gauge-heading">
        <span>{label}</span>
        <strong>{value === null ? '--' : oneDecimalFormatter.format(value)}{value === null ? '' : ` ${unit}`}</strong>
      </div>
      <div className="salinas-dashboard__gauge-track" aria-hidden="true">
        {value === null ? null : <span className="salinas-dashboard__gauge-marker" />}
      </div>
      <div className="salinas-dashboard__gauge-scale">
        <span>{minimum}</span>
        <small>{detail}</small>
        <span>{maximum}</span>
      </div>
    </div>
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

function TelemetryRefreshCountdown({ dueAt }: { dueAt: number | null }) {
  const [remainingMs, setRemainingMs] = useState(TELEMETRY_REFRESH_MS);

  useEffect(() => {
    function updateRemaining() {
      setRemainingMs(dueAt === null ? TELEMETRY_REFRESH_MS : Math.max(0, dueAt - Date.now()));
    }

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 100);
    return () => window.clearInterval(timer);
  }, [dueAt]);

  const secondsRemaining = Math.max(0, Math.ceil(remainingMs / 1000));
  const progress = Math.max(0, Math.min(1, remainingMs / TELEMETRY_REFRESH_MS));
  const ringStyle = {
    '--telemetry-countdown-progress': `${progress * 360}deg`
  } as CSSProperties;

  return (
    <span
      className="salinas-dashboard__refresh-label salinas-dashboard__countdown"
      role="timer"
      aria-label={`Telemetry refreshes in ${secondsRemaining} seconds`}
    >
      <span className="salinas-dashboard__countdown-ring" style={ringStyle} aria-hidden="true">
        <b>{secondsRemaining}</b>
      </span>
      <span className="salinas-dashboard__countdown-copy">
        <strong>Next telemetry refresh</strong>
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
  const [weather, setWeather] = useState<WeatherState>({ status: 'loading', data: null, error: null });
  const storageKey = `permacool:equipment-draft:${siteId}`;

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

    async function loadTelemetry() {
      if (mounted) setTelemetryRefreshDueAt(Date.now() + TELEMETRY_REFRESH_MS);
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
        setTelemetry({
          status: 'ready',
          points: payload.points as TelemetryPoint[],
          source: typeof payload.source === 'string' ? payload.source : 'unknown',
          fetchedAt: typeof payload.fetchedAt === 'string' ? payload.fetchedAt : new Date().toISOString(),
          error: null
        });
      } catch (error) {
        if (!mounted) return;
        setTelemetry((current) => ({
          ...current,
          status: 'error',
          fetchedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Telemetry unavailable.'
        }));
      }
    }

    void loadTelemetry();
    const timer = window.setInterval(loadTelemetry, TELEMETRY_REFRESH_MS);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [siteId, telemetryRefreshVersion]);

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
      const automaticAmbient = freshInletAir?.value ?? finiteOrNull(weather.data?.temperatureF);
      const ambientTemperatureF =
        draft.ambientMode === 'automatic' && automaticAmbient !== null
          ? automaticAmbient
          : draft.manualAmbientF;
      const ambientSource: AmbientTemperatureSource =
        draft.ambientMode === 'manual'
          ? 'manual_entry'
          : freshInletAir
            ? 'condenser_entering_air_sensor'
            : weather.data?.temperatureF !== null && weather.data?.temperatureF !== undefined
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
        !freshInletAir && ambientSource === 'local_weather' ? weather.data?.fetchedAt : undefined
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
          <small>Refreshes every 15 seconds</small>
          <span>Newest signal: {formatTimestamp(newestMappedSignalTimestamp)}</span>
          <span>Feed check: {formatTimestamp(telemetry.fetchedAt)}</span>
        </div>
      </section>

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

      <section className="salinas-dashboard__context-grid is-single">
        {view === 'overview' ? (
        <article className="salinas-dashboard__panel salinas-dashboard__weather-panel">
          <div className="salinas-dashboard__panel-heading">
            <span className="salinas-dashboard__panel-icon"><CloudSun size={22} /></span>
            <div>
              <p className="eyebrow">Operating context</p>
              <h3>Local weather</h3>
            </div>
            {weather.status === 'loading' ? <RefreshCw className="salinas-dashboard__spin" size={18} /> : null}
          </div>
          {weather.data ? (
            <>
              <div className="salinas-dashboard__weather-grid">
                <MetricTile icon={<Thermometer size={18} />} label="Ambient" value={formatValue(weather.data.temperatureF, ' F')} detail={weather.data.locationLabel} />
                <MetricTile icon={<Droplets size={18} />} label="Humidity" value={formatValue(weather.data.humidityPercent, '%')} detail="Relative humidity" />
                <MetricTile icon={<Sun size={18} />} label="Sunlight" value={formatValue(weather.data.sunlightEstimatePercent, '%')} detail="Daylight / cloud estimate" />
                <MetricTile icon={<CloudRain size={18} />} label="Rain chance" value={formatValue(weather.data.rainChancePercent, '%')} detail={weather.data.condition ?? 'Current forecast'} />
                <MetricTile icon={<Wind size={18} />} label="Wind" value={weather.data.windSpeed ?? '--'} detail={weather.data.windDirection ?? 'Direction unavailable'} />
              </div>
              <p className="salinas-dashboard__source-note">
                {weather.data.source}. Sunlight is contextual—not measured W/m2. Updated {formatTimestamp(weather.data.sourceUpdatedAt ?? weather.data.fetchedAt)}.
              </p>
            </>
          ) : (
            <div className="salinas-dashboard__empty-panel">
              <CircleAlert size={22} />
              <div><strong>Weather context unavailable</strong><p>{weather.error ?? 'Waiting for the NWS feed.'}</p></div>
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
                <option value="automatic">Sensor, then weather</option>
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
                <b>F</b>
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
                <b>F</b>
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
        <>
      <section className="salinas-dashboard__section">
        <div className="salinas-dashboard__section-heading">
          <div>
            <p className="eyebrow">Live operating units</p>
            <h2>CH1 and CH2 condenser performance</h2>
          </div>
          <TelemetryRefreshCountdown dueAt={telemetryRefreshDueAt} />
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
            const ampsMaximum = ampsReference.length ? Math.max(80, Math.max(...ampsReference) * 1.25) : 80;
            const unitIsCurrent = unitHasCurrentTelemetry(signals);
            const status = signals.running && unitIsCurrent ? signals.running.value : null;
            const highPressureStop = signals.highPressureStop?.value === true &&
              (signals.highPressureStop.isFresh || unitIsCurrent);
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
                  <RangeGauge label="Chiller temperature" value={signals.temperature?.value ?? null} unit="F" minimum={-50} maximum={100} detail={signalDetail(signals.temperature, 'Verified display range', telemetry.status === 'error')} accent="cyan" />
                  <RangeGauge label="High pressure" value={signals.highPressure?.value ?? null} unit="PSI" minimum={0} maximum={500} detail={signalDetail(signals.highPressure, 'High-side range', telemetry.status === 'error')} accent="gold" />
                  <RangeGauge label="Low pressure" value={signals.lowPressure?.value ?? null} unit="PSI" minimum={-14.7} maximum={300} detail={signalDetail(signals.lowPressure, 'Low-side range', telemetry.status === 'error')} accent="violet" />
                  <RangeGauge label="Compressor current" value={signals.compressorAmps?.value ?? null} unit="A" minimum={0} maximum={ampsMaximum} detail={signalDetail(signals.compressorAmps, ampsReference.length ? `Catalog RLA ${ampsReference.join('-')} A` : 'Select frequency + voltage for RLA', telemetry.status === 'error')} accent="lime" />
                </div>

                <div className="salinas-dashboard__unit-analysis">
                  <div>
                    <span>Entering-air input</span>
                    <strong>{oneDecimalFormatter.format(analysis.ambientTemperatureF)} F</strong>
                    <small>{analysis.ambientSource.replaceAll('_', ' ')}</small>
                  </div>
                  <div>
                    <span>Suction-table input</span>
                    <strong>{oneDecimalFormatter.format(analysis.suctionTemperatureF)} F</strong>
                    <small>{analysis.suctionSource.replaceAll('_', ' ')}</small>
                  </div>
                  <div>
                    <span>Total compressor runtime</span>
                    <strong>{formatRuntimeMinutes(signals.compressorRuntimeMinutes?.value ?? null)}</strong>
                    <small>PLC accumulated minutes</small>
                  </div>
                  <div>
                    <span>Temperature setpoint</span>
                    <strong>{formatValue(signals.setpoint?.value ?? null, ` ${signals.setpoint?.point.unit || 'F'}`, 1)}</strong>
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
                      {formatNumericRange(ratings.map((rating) => rating.totalCondenserFanFlaA))} A
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
          All 64 published rating points are retained below. Values are BTU/h at 60 Hz with 20 F compressor
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
                      {variant.capacityTable.suctionTemperaturesF.map((temperature) => <th key={temperature}>{temperature} F</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {variant.capacityTable.rows.map((row) => (
                      <tr key={row.ambientTemperatureF}>
                        <th>{row.ambientTemperatureF} F</th>
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

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSite } from '@/server/repositories/sites';

const NWS_GRID_URL = 'https://api.weather.gov/gridpoints/LOX/156,43';
const NWS_HOURLY_URL = `${NWS_GRID_URL}/forecast/hourly`;
const NWS_STATION_ID = process.env.NWS_SALINAS_STATION_ID ?? 'FHMC1';
const NWS_OBSERVATION_URL = `https://api.weather.gov/stations/${NWS_STATION_ID}/observations/latest`;
const NWS_USER_AGENT = process.env.NWS_USER_AGENT ?? 'PermaCoolOps/1.0 (operations@perma.cool)';
const OBSERVATION_CURRENT_MS = 90 * 60_000;

type GridValue = {
  validTime?: unknown;
  value?: unknown;
};

type QuantitativeValue = {
  unitCode?: unknown;
  value?: unknown;
};

type HourlyPeriod = {
  number?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  isDaytime?: unknown;
  temperature?: unknown;
  temperatureUnit?: unknown;
  relativeHumidity?: QuantitativeValue;
  probabilityOfPrecipitation?: QuantitativeValue;
  windSpeed?: unknown;
  windDirection?: unknown;
  shortForecast?: unknown;
};

type ObservationProperties = {
  stationId?: unknown;
  stationName?: unknown;
  timestamp?: unknown;
  textDescription?: unknown;
  temperature?: QuantitativeValue;
  dewpoint?: QuantitativeValue;
  relativeHumidity?: QuantitativeValue;
  windSpeed?: QuantitativeValue;
  windGust?: QuantitativeValue;
  windDirection?: QuantitativeValue;
  barometricPressure?: QuantitativeValue;
  seaLevelPressure?: QuantitativeValue;
  precipitationLastHour?: QuantitativeValue;
  precipitationLast3Hours?: QuantitativeValue;
};

function asFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function quantityValue(quantity: QuantitativeValue | undefined): number | null {
  return asFiniteNumber(quantity?.value);
}

function temperatureF(quantity: QuantitativeValue | undefined): number | null {
  const value = quantityValue(quantity);
  if (value === null) return null;

  const unit = typeof quantity?.unitCode === 'string' ? quantity.unitCode : '';
  if (unit.endsWith(':degC')) return (value * 9) / 5 + 32;
  if (unit.endsWith(':K')) return ((value - 273.15) * 9) / 5 + 32;
  return value;
}

function windMph(quantity: QuantitativeValue | undefined): number | null {
  const value = quantityValue(quantity);
  if (value === null) return null;

  const unit = typeof quantity?.unitCode === 'string' ? quantity.unitCode : '';
  if (unit.includes('km_h-1')) return value * 0.621371;
  if (unit.endsWith(':m_s-1')) return value * 2.23694;
  return value;
}

function precipitationIn(quantity: QuantitativeValue | undefined): number | null {
  const value = quantityValue(quantity);
  if (value === null) return null;

  const unit = typeof quantity?.unitCode === 'string' ? quantity.unitCode : '';
  if (unit.endsWith(':mm')) return value / 25.4;
  if (unit.endsWith(':m')) return value * 39.3701;
  return value;
}

function pressureInHg(quantity: QuantitativeValue | undefined): number | null {
  const value = quantityValue(quantity);
  if (value === null) return null;

  const unit = typeof quantity?.unitCode === 'string' ? quantity.unitCode : '';
  if (unit.endsWith(':Pa')) return value * 0.000295299830714;
  if (unit.endsWith(':hPa')) return value * 0.0295299830714;
  return value;
}

function directionCardinal(degrees: number | null): string | null {
  if (degrees === null) return null;
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round((((degrees % 360) + 360) % 360) / 22.5) % directions.length];
}

function parseDurationMilliseconds(duration: string): number | null {
  const match = duration.match(/^P(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/);

  if (!match) return null;

  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  const seconds = Number(match[4] ?? 0);

  return (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000;
}

function currentGridValue(values: unknown, now = Date.now()): number | null {
  if (!Array.isArray(values)) return null;

  let fallback: number | null = null;

  for (const entry of values as GridValue[]) {
    const value = asFiniteNumber(entry.value);
    if (value === null || typeof entry.validTime !== 'string') continue;

    const [startText, durationText] = entry.validTime.split('/');
    const start = Date.parse(startText);
    const duration = durationText ? parseDurationMilliseconds(durationText) : null;

    if (!Number.isFinite(start)) continue;
    if (fallback === null && start >= now) fallback = value;
    if (start <= now && (duration === null || now < start + duration)) return value;
  }

  return fallback;
}

function firstCurrentPeriod(periods: unknown): HourlyPeriod | null {
  if (!Array.isArray(periods)) return null;
  const now = Date.now();

  return (
    (periods as HourlyPeriod[]).find((period) => {
      if (typeof period.startTime !== 'string' || typeof period.endTime !== 'string') return false;
      return Date.parse(period.startTime) <= now && now < Date.parse(period.endTime);
    }) ??
    (periods as HourlyPeriod[])[0] ??
    null
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteid: string }> }
) {
  const { siteid } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const site = await getSite(siteid);

  if (!site) {
    return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
  }

  if (!user.organizationIds.includes(site.organizationId)) {
    return NextResponse.json({ error: 'Site access denied.' }, { status: 403 });
  }

  if (site.id !== 'site-salinas') {
    return NextResponse.json({ error: 'Weather location is not configured for this site.' }, { status: 404 });
  }

  try {
    const headers = {
      Accept: 'application/geo+json',
      'User-Agent': NWS_USER_AGENT
    };
    const signal = AbortSignal.timeout(8_000);

    const [observationResult, hourlyResult, gridResult] = await Promise.allSettled([
      fetch(NWS_OBSERVATION_URL, { headers, signal, next: { revalidate: 300 } }),
      fetch(NWS_HOURLY_URL, { headers, signal, next: { revalidate: 900 } }),
      fetch(NWS_GRID_URL, { headers, signal, next: { revalidate: 900 } })
    ]);

    const observationResponse = observationResult.status === 'fulfilled' ? observationResult.value : null;
    const hourlyResponse = hourlyResult.status === 'fulfilled' ? hourlyResult.value : null;
    const gridResponse = gridResult.status === 'fulfilled' ? gridResult.value : null;

    if (!observationResponse?.ok) {
      throw new Error(`NWS observation request failed${observationResponse ? ` with ${observationResponse.status}` : ''}.`);
    }

    const observation = (await observationResponse.json()) as { properties?: ObservationProperties };
    const hourly = hourlyResponse?.ok
      ? ((await hourlyResponse.json()) as {
          properties?: { updated?: unknown; generatedAt?: unknown; periods?: unknown };
        })
      : null;
    const grid = gridResponse?.ok
      ? ((await gridResponse.json()) as {
          properties?: {
            updateTime?: unknown;
            skyCover?: { values?: unknown };
            quantitativePrecipitation?: { values?: unknown };
          };
        })
      : null;
    const observed = observation.properties;
    const period = firstCurrentPeriod(hourly?.properties?.periods);

    if (!observed || typeof observed.timestamp !== 'string') {
      throw new Error('NWS returned no current station observation.');
    }

    const now = Date.now();
    const observedAtMs = Date.parse(observed.timestamp);
    const observationAgeMinutes = Number.isFinite(observedAtMs)
      ? Math.max(0, Math.round((now - observedAtMs) / 60_000))
      : null;
    const observationIsCurrent = observationAgeMinutes !== null && now - observedAtMs <= OBSERVATION_CURRENT_MS;
    const observedTemperatureF = temperatureF(observed.temperature);
    const observedWindDirectionDegrees = quantityValue(observed.windDirection);
    const observedPressureInHg = pressureInHg(observed.barometricPressure) ?? pressureInHg(observed.seaLevelPressure);
    const observedPrecipitationLastHourIn = precipitationIn(observed.precipitationLastHour);
    const observedPrecipitationLast3HoursIn = precipitationIn(observed.precipitationLast3Hours);

    const forecast = period
      ? (() => {
          const skyCoverPercent = currentGridValue(grid?.properties?.skyCover?.values);
          const precipitationMm = currentGridValue(grid?.properties?.quantitativePrecipitation?.values);
          const isDaytime = period.isDaytime === true;
          const forecastTemperature = asFiniteNumber(period.temperature);
          const forecastTemperatureF = period.temperatureUnit === 'C' && forecastTemperature !== null
            ? (forecastTemperature * 9) / 5 + 32
            : forecastTemperature;

          return {
            temperatureF: forecastTemperatureF,
            humidityPercent: asFiniteNumber(period.relativeHumidity?.value),
            rainChancePercent: asFiniteNumber(period.probabilityOfPrecipitation?.value),
            precipitationAmountIn: precipitationMm === null ? null : precipitationMm / 25.4,
            skyCoverPercent,
            sunlightEstimatePercent: isDaytime
              ? Math.max(0, Math.min(100, 100 - (skyCoverPercent ?? 50)))
              : 0,
            sunlightMethod: 'Daylight adjusted by inverse NWS cloud cover; not measured solar radiation.',
            isDaytime,
            windSpeed: typeof period.windSpeed === 'string' ? period.windSpeed : null,
            windDirection: typeof period.windDirection === 'string' ? period.windDirection : null,
            condition: typeof period.shortForecast === 'string' ? period.shortForecast : null,
            periodStartAt: typeof period.startTime === 'string' ? period.startTime : null,
            source: 'National Weather Service hourly forecast',
            sourceUrl: NWS_HOURLY_URL,
            sourceUpdatedAt:
              typeof hourly?.properties?.generatedAt === 'string'
                ? hourly.properties.generatedAt
                : typeof hourly?.properties?.updated === 'string'
                  ? hourly.properties.updated
                  : typeof grid?.properties?.updateTime === 'string'
                    ? grid.properties.updateTime
                    : null
          };
        })()
      : null;

    return NextResponse.json(
      {
        locationLabel: '3558 E 8th St, Los Angeles, CA',
        observation: {
          stationId: typeof observed.stationId === 'string' ? observed.stationId : NWS_STATION_ID,
          stationName: typeof observed.stationName === 'string' ? observed.stationName : 'Los Angeles Downtown',
          temperatureF: observedTemperatureF,
          humidityPercent: quantityValue(observed.relativeHumidity),
          dewpointF: temperatureF(observed.dewpoint),
          windSpeedMph: windMph(observed.windSpeed),
          windGustMph: windMph(observed.windGust),
          windDirectionDegrees: observedWindDirectionDegrees,
          windDirectionCardinal: directionCardinal(observedWindDirectionDegrees),
          pressureInHg: observedPressureInHg,
          precipitationLastHourIn: observedPrecipitationLastHourIn,
          precipitationLast3HoursIn: observedPrecipitationLast3HoursIn,
          condition: typeof observed.textDescription === 'string' && observed.textDescription.trim()
            ? observed.textDescription
            : null,
          observedAt: observed.timestamp,
          ageMinutes: observationAgeMinutes,
          isCurrent: observationIsCurrent,
          source: 'National Weather Service station observation',
          sourceUrl: NWS_OBSERVATION_URL
        },
        forecast,
        ambientFallback: {
          temperatureF: observationIsCurrent ? observedTemperatureF : null,
          source: 'nws_observation',
          observedAt: observed.timestamp
        },
        fetchedAt: new Date(now).toISOString()
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=300, stale-while-revalidate=1800'
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Weather service unavailable.',
        source: 'National Weather Service'
      },
      { status: 502 }
    );
  }
}

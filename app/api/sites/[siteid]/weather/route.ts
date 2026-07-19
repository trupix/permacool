import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSite } from '@/server/repositories/sites';

const NWS_GRID_URL = 'https://api.weather.gov/gridpoints/LOX/156,43';
const NWS_HOURLY_URL = `${NWS_GRID_URL}/forecast/hourly`;
const NWS_USER_AGENT = process.env.NWS_USER_AGENT ?? 'PermaCoolOps/1.0 (operations@perma.cool)';

type GridValue = {
  validTime?: unknown;
  value?: unknown;
};

type HourlyPeriod = {
  number?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  isDaytime?: unknown;
  temperature?: unknown;
  temperatureUnit?: unknown;
  relativeHumidity?: { value?: unknown };
  probabilityOfPrecipitation?: { value?: unknown };
  windSpeed?: unknown;
  windDirection?: unknown;
  shortForecast?: unknown;
};

function asFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
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

    const [hourlyResponse, gridResponse] = await Promise.all([
      fetch(NWS_HOURLY_URL, { headers, signal, next: { revalidate: 900 } }),
      fetch(NWS_GRID_URL, { headers, signal, next: { revalidate: 900 } })
    ]);

    if (!hourlyResponse.ok) {
      throw new Error(`NWS hourly request failed with ${hourlyResponse.status}.`);
    }

    const hourly = (await hourlyResponse.json()) as {
      properties?: { updated?: unknown; periods?: unknown };
    };
    const grid = gridResponse.ok
      ? ((await gridResponse.json()) as {
          properties?: {
            updateTime?: unknown;
            skyCover?: { values?: unknown };
            quantitativePrecipitation?: { values?: unknown };
          };
        })
      : null;
    const period = firstCurrentPeriod(hourly.properties?.periods);

    if (!period) {
      throw new Error('NWS returned no hourly weather period.');
    }

    const skyCoverPercent = currentGridValue(grid?.properties?.skyCover?.values);
    const precipitationMm = currentGridValue(grid?.properties?.quantitativePrecipitation?.values);
    const isDaytime = period.isDaytime === true;
    const temperature = asFiniteNumber(period.temperature);
    const temperatureF = period.temperatureUnit === 'C' && temperature !== null ? (temperature * 9) / 5 + 32 : temperature;
    const humidityPercent = asFiniteNumber(period.relativeHumidity?.value);
    const rainChancePercent = asFiniteNumber(period.probabilityOfPrecipitation?.value);
    const sunlightEstimatePercent = isDaytime
      ? Math.max(0, Math.min(100, 100 - (skyCoverPercent ?? 50)))
      : 0;

    return NextResponse.json(
      {
        locationLabel: 'Los Angeles, CA',
        temperatureF,
        humidityPercent,
        rainChancePercent,
        precipitationAmountIn: precipitationMm === null ? null : precipitationMm / 25.4,
        skyCoverPercent,
        sunlightEstimatePercent,
        sunlightMethod: 'Daylight adjusted by inverse NWS cloud cover; not measured solar radiation.',
        isDaytime,
        windSpeed: typeof period.windSpeed === 'string' ? period.windSpeed : null,
        windDirection: typeof period.windDirection === 'string' ? period.windDirection : null,
        condition: typeof period.shortForecast === 'string' ? period.shortForecast : null,
        source: 'National Weather Service grid forecast',
        sourceUrl: NWS_HOURLY_URL,
        sourceUpdatedAt:
          typeof hourly.properties?.updated === 'string'
            ? hourly.properties.updated
            : typeof grid?.properties?.updateTime === 'string'
              ? grid.properties.updateTime
              : null,
        fetchedAt: new Date().toISOString()
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=900, stale-while-revalidate=21600'
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

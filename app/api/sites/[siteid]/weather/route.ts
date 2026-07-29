import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSite } from '@/server/repositories/sites';
import type { Site } from '@/types/domain';

const NWS_USER_AGENT = process.env.NWS_USER_AGENT ?? 'PermaCoolOps/1.0 (operations@perma.cool)';
const OBSERVATION_CURRENT_MS = 90 * 60_000;
const SALINAS_FALLBACK_ADDRESS = '3558 E 8th St, Los Angeles, CA 90023';
const SALINAS_FALLBACK_COORDINATES = {
  latitude: 34.01948668358,
  longitude: -118.200198666354
};

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

type CensusGeocoderResponse = {
  result?: {
    addressMatches?: Array<{
      matchedAddress?: unknown;
      coordinates?: {
        x?: unknown;
        y?: unknown;
      };
    }>;
  };
};

type NwsPointProperties = {
  forecastHourly?: unknown;
  forecastGridData?: unknown;
  observationStations?: unknown;
};

type NwsStationFeature = {
  id?: unknown;
  properties?: {
    stationIdentifier?: unknown;
    name?: unknown;
  };
};

type ResolvedWeatherLocation = {
  locationLabel: string;
  latitude: number;
  longitude: number;
  hourlyUrl: string;
  gridUrl: string;
  stationId: string;
  stationName: string | null;
  observationUrl: string;
  imageryUrl: string;
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

function siteAddressLabel(site: Site): string | null {
  if (site.addressLine1 && site.city && site.state && site.postalCode) {
    return `${site.addressLine1}, ${site.city}, ${site.state} ${site.postalCode}`;
  }
  return site.id === 'site-salinas' ? SALINAS_FALLBACK_ADDRESS : null;
}

async function geocodeAddress(
  address: string,
  siteId: string
): Promise<{ latitude: number; longitude: number; locationLabel: string }> {
  const url = new URL('https://geocoding.geo.census.gov/geocoder/locations/onelineaddress');
  url.searchParams.set('address', address);
  url.searchParams.set('benchmark', 'Public_AR_Current');
  url.searchParams.set('format', 'json');

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8_000),
      next: { revalidate: 86_400 }
    });
    if (!response.ok) throw new Error(`Census geocoder returned ${response.status}.`);
    const payload = (await response.json()) as CensusGeocoderResponse;
    const match = payload.result?.addressMatches?.[0];
    const longitude = asFiniteNumber(match?.coordinates?.x);
    const latitude = asFiniteNumber(match?.coordinates?.y);
    if (latitude === null || longitude === null) throw new Error('No address match was returned.');
    return {
      latitude,
      longitude,
      locationLabel: address
    };
  } catch (error) {
    if (siteId !== 'site-salinas') throw error;
    return { ...SALINAS_FALLBACK_COORDINATES, locationLabel: SALINAS_FALLBACK_ADDRESS };
  }
}

function satelliteImageryUrl(latitude: number, longitude: number) {
  const latitudeHalfSpan = 0.0011;
  const longitudeHalfSpan =
    (latitudeHalfSpan * (16 / 9)) /
    Math.max(0.25, Math.cos((latitude * Math.PI) / 180));
  const bbox = [
    longitude - longitudeHalfSpan,
    latitude - latitudeHalfSpan,
    longitude + longitudeHalfSpan,
    latitude + latitudeHalfSpan
  ].map((value) => value.toFixed(6)).join(',');
  const url = new URL(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export'
  );
  url.searchParams.set('bbox', bbox);
  url.searchParams.set('bboxSR', '4326');
  url.searchParams.set('imageSR', '4326');
  url.searchParams.set('size', '1600,900');
  url.searchParams.set('format', 'jpg');
  url.searchParams.set('f', 'image');
  return url.toString();
}

async function resolveWeatherLocation(site: Site): Promise<ResolvedWeatherLocation> {
  const address = siteAddressLabel(site);
  if (!address) throw new Error('Add a complete facility address in Location Specs.');

  const geocoded = await geocodeAddress(address, site.id);
  const headers = {
    Accept: 'application/geo+json',
    'User-Agent': NWS_USER_AGENT
  };
  const pointsUrl =
    `https://api.weather.gov/points/${geocoded.latitude.toFixed(4)},${geocoded.longitude.toFixed(4)}`;
  const pointsResponse = await fetch(pointsUrl, {
    headers,
    signal: AbortSignal.timeout(8_000),
    next: { revalidate: 86_400 }
  });
  if (!pointsResponse.ok) {
    throw new Error(`NWS location lookup failed with ${pointsResponse.status}.`);
  }
  const pointsPayload = (await pointsResponse.json()) as { properties?: NwsPointProperties };
  const properties = pointsPayload.properties;
  const hourlyUrl = typeof properties?.forecastHourly === 'string' ? properties.forecastHourly : null;
  const gridUrl = typeof properties?.forecastGridData === 'string' ? properties.forecastGridData : null;
  const stationsUrl =
    typeof properties?.observationStations === 'string' ? properties.observationStations : null;
  if (!hourlyUrl || !gridUrl || !stationsUrl) {
    throw new Error('NWS did not return forecast and station links for this address.');
  }

  const stationsResponse = await fetch(stationsUrl, {
    headers,
    signal: AbortSignal.timeout(8_000),
    next: { revalidate: 86_400 }
  });
  if (!stationsResponse.ok) {
    throw new Error(`NWS station lookup failed with ${stationsResponse.status}.`);
  }
  const stationsPayload = (await stationsResponse.json()) as { features?: NwsStationFeature[] };
  const station = stationsPayload.features?.[0];
  const stationId =
    typeof station?.properties?.stationIdentifier === 'string'
      ? station.properties.stationIdentifier
      : typeof station?.id === 'string'
        ? station.id.split('/').filter(Boolean).at(-1) ?? null
        : null;
  if (!stationId) throw new Error('NWS returned no observation station for this address.');

  return {
    locationLabel: geocoded.locationLabel,
    latitude: geocoded.latitude,
    longitude: geocoded.longitude,
    hourlyUrl,
    gridUrl,
    stationId,
    stationName:
      typeof station?.properties?.name === 'string' ? station.properties.name : null,
    observationUrl: `https://api.weather.gov/stations/${stationId}/observations/latest`,
    imageryUrl: satelliteImageryUrl(geocoded.latitude, geocoded.longitude)
  };
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

  const site = await getSite(user, siteid);

  if (!site) {
    return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
  }

  try {
    const location = await resolveWeatherLocation(site);
    const headers = {
      Accept: 'application/geo+json',
      'User-Agent': NWS_USER_AGENT
    };
    const signal = AbortSignal.timeout(8_000);

    const [observationResult, hourlyResult, gridResult] = await Promise.allSettled([
      fetch(location.observationUrl, { headers, signal, next: { revalidate: 300 } }),
      fetch(location.hourlyUrl, { headers, signal, next: { revalidate: 900 } }),
      fetch(location.gridUrl, { headers, signal, next: { revalidate: 900 } })
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
            sourceUrl: location.hourlyUrl,
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
        locationLabel: location.locationLabel,
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        imageryUrl: location.imageryUrl,
        observation: {
          stationId: typeof observed.stationId === 'string' ? observed.stationId : location.stationId,
          stationName:
            typeof observed.stationName === 'string'
              ? observed.stationName
              : location.stationName ?? location.stationId,
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
          sourceUrl: location.observationUrl
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

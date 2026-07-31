'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CircleAlert,
  CloudRain,
  CloudSun,
  Cpu,
  Droplets,
  MapPin,
  RefreshCw,
  Satellite,
  Sun,
  Thermometer,
  Wind
} from 'lucide-react';
import {
  FACILITY_ADDRESS_UPDATED_EVENT,
  facilityAddressDraftKey,
  formatFacilityAddress,
  hasCompleteFacilityAddress,
  parseFacilityAddressDraft,
  type FacilityAddress
} from '@/lib/site-location';
import type { SiteWeatherData } from '@/lib/site-weather';

const WEATHER_REFRESH_MS = 5 * 60_000;

type WeatherState = {
  status: 'loading' | 'ready' | 'error';
  data: SiteWeatherData | null;
  error: string | null;
};

function formatValue(value: number | null, suffix = '', digits = 0) {
  return value === null
    ? '—'
    : `${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
      }).format(value)}${suffix}`;
}

function formatTimestamp(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? 'time unavailable'
    : parsed.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
}

function formatObservationAge(minutes: number | null) {
  if (minutes === null) return 'age unavailable';
  if (minutes < 2) return 'just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}

export function LocationWeatherHero({
  siteId,
  siteName,
  address,
  allowBrowserDraft = false
}: {
  siteId: string;
  siteName: string;
  address: FacilityAddress;
  allowBrowserDraft?: boolean;
}) {
  const [resolvedAddress, setResolvedAddress] = useState(address);
  const addressReady = hasCompleteFacilityAddress(resolvedAddress);
  const addressLabel = formatFacilityAddress(resolvedAddress);
  const [weather, setWeather] = useState<WeatherState>({
    status: 'loading',
    data: null,
    error: null
  });

  useEffect(() => {
    if (!allowBrowserDraft) {
      setResolvedAddress(address);
      return;
    }

    setResolvedAddress(address);
    const storageKey = facilityAddressDraftKey(siteId);

    try {
      const saved = window.localStorage.getItem(storageKey);
      const parsed = saved ? parseFacilityAddressDraft(JSON.parse(saved)) : null;
      if (parsed) setResolvedAddress(parsed);
    } catch {
      // Ignore a damaged browser draft and keep the server/default address.
    }

    function handleAddressUpdate(event: Event) {
      const detail = (event as CustomEvent<{
        siteId?: unknown;
        address?: unknown;
      }>).detail;
      if (detail?.siteId !== siteId) return;
      const parsed = parseFacilityAddressDraft(detail.address);
      if (parsed) setResolvedAddress(parsed);
    }

    window.addEventListener(FACILITY_ADDRESS_UPDATED_EVENT, handleAddressUpdate);
    return () => {
      window.removeEventListener(FACILITY_ADDRESS_UPDATED_EVENT, handleAddressUpdate);
    };
  }, [address, allowBrowserDraft, siteId]);

  useEffect(() => {
    if (!addressReady) return;
    let mounted = true;

    async function loadWeather() {
      setWeather((current) => ({ ...current, status: 'loading', error: null }));
      try {
        const query = allowBrowserDraft
          ? `?${new URLSearchParams(resolvedAddress).toString()}`
          : '';
        const response = await fetch(`/api/sites/${encodeURIComponent(siteId)}/weather${query}`, {
          cache: 'no-store'
        });
        const payload = (await response.json()) as SiteWeatherData & { error?: string };
        if (!response.ok) throw new Error(payload.error ?? 'Weather unavailable.');
        if (mounted) setWeather({ status: 'ready', data: payload, error: null });
      } catch (error) {
        if (mounted) {
          setWeather({
            status: 'error',
            data: null,
            error: error instanceof Error ? error.message : 'Weather unavailable.'
          });
        }
      }
    }

    void loadWeather();
    const timer = window.setInterval(loadWeather, WEATHER_REFRESH_MS);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [addressReady, allowBrowserDraft, resolvedAddress, siteId]);

  return (
    <article className="salinas-dashboard__weather-hero location-equipment-weather-hero">
      <div
        className="salinas-dashboard__weather-hero-imagery"
        role="img"
        aria-label={addressReady
          ? `Aerial satellite view centered on ${addressLabel}`
          : `Facility aerial view for ${siteName}`}
        style={{
          backgroundImage: weather.data?.imageryUrl
            ? `url("${weather.data.imageryUrl}")`
            : 'linear-gradient(145deg, #234b42 0%, #10251e 52%, #07130f 100%)'
        }}
      />
      <div className="salinas-dashboard__weather-hero-shade" aria-hidden="true" />

      <header className="salinas-dashboard__weather-hero-header">
        <span className="salinas-dashboard__weather-hero-kicker">
          <Satellite size={15} /> Facility weather
        </span>
        {weather.data?.imageryUrl ? (
          <span className="salinas-dashboard__weather-hero-attribution">
            Imagery: Esri, Vantor, Earthstar Geographics, GIS User Community
          </span>
        ) : null}
      </header>

      <div className="salinas-dashboard__weather-location">
        <span className="salinas-dashboard__weather-location-pin" aria-hidden="true">
          <MapPin size={18} />
        </span>
        <div>
          <strong>{siteName} operating site</strong>
          <small>{addressReady ? addressLabel : 'Facility address not entered'}</small>
        </div>
      </div>

      {!addressReady ? (
        <div className="salinas-dashboard__weather-dock is-empty">
          <MapPin size={22} />
          <div>
            <strong>Add the facility address</strong>
            <p>The satellite hero and local NWS weather will appear automatically after the address is saved.</p>
            <Link href={`/sites/${siteId}/specs`}>Open Location Specs</Link>
          </div>
        </div>
      ) : weather.data ? (
        <div className="salinas-dashboard__weather-dock">
          <div className="salinas-dashboard__weather-now">
            <span>
              Latest observed conditions
              {weather.status === 'loading' ? <RefreshCw className="salinas-dashboard__spin" size={14} /> : null}
            </span>
            <div>
              <strong>{formatValue(weather.data.observation.temperatureF)}</strong>
              <sup>°F</sup>
            </div>
            <p>{weather.data.observation.stationName}</p>
            <small>
              Observed {formatTimestamp(weather.data.observation.observedAt)} ·{' '}
              {formatObservationAge(weather.data.observation.ageMinutes)}
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
              <strong>
                {formatValue(
                  weather.data.observation.precipitationLastHourIn ??
                    weather.data.observation.precipitationLast3HoursIn,
                  ' in',
                  2
                )}
              </strong>
            </div>
          </div>

          {weather.data.forecast ? (
            <div className="salinas-dashboard__weather-forecast-strip">
              <div>
                <CloudSun size={17} />
                <span>
                  <small>Next-hour forecast</small>
                  <strong>
                    {formatValue(weather.data.forecast.temperatureF, ' °F')} ·{' '}
                    {weather.data.forecast.condition ?? 'Conditions pending'}
                  </strong>
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
            <small>
              Station {weather.data.observation.stationId} · Dashboard checked {formatTimestamp(weather.data.fetchedAt)}
            </small>
          </footer>
        </div>
      ) : (
        <div className="salinas-dashboard__weather-dock is-empty">
          <CircleAlert size={22} />
          <div>
            <strong>Preparing facility weather</strong>
            <p>{weather.error ?? 'Locating the nearest NWS observation station and satellite image.'}</p>
          </div>
        </div>
      )}
    </article>
  );
}

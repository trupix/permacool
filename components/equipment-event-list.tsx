'use client';
import { useEffect, useState } from 'react';
import { CircleAlert, Clock3, Gauge, Power, Thermometer, Zap } from 'lucide-react';
import { displayTelemetryText, displayTelemetryUnit } from '@/lib/telemetry-units';
import type { EquipmentEvent } from '@/types/domain';

function formatEventTime(value: string, timezone: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}

function formatValue(value: number | null, unit: string) {
  if (value === null) return '--';
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)} ${unit}`;
}

function formatRuntime(minutes: number | null) {
  if (minutes === null) return '--';
  const wholeMinutes = Math.max(0, Math.round(minutes));
  return `${Math.floor(wholeMinutes / 60).toLocaleString()}h ${wholeMinutes % 60}m`;
}

function EventIcon({ type }: { type: string }) {
  if (type === 'high_pressure_stop') return <CircleAlert size={17} />;
  if (type === 'reached_temperature') return <Thermometer size={17} />;
  if (type === 'compressor_started' || type === 'compressor_stopped') return <Zap size={17} />;
  if (type === 'system_on' || type === 'system_off') return <Power size={17} />;
  return <Clock3 size={17} />;
}

function formatCycleDuration(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return `${hours ? `${hours}h ` : ''}${minutes}m ${total % 60}s`;
}

export function EquipmentEventList({
  events,
  timezone,
  emptyMessage = 'No operating events have been recorded yet.'
}: {
  events: EquipmentEvent[];
  timezone: string;
  emptyMessage?: string;
}) {
  const [weather, setWeather] = useState<Record<string, { temperatureF: number; observedAt: string; station: string } | null>>({});
  const [weatherLoading, setWeatherLoading] = useState(true);
  const eventIds = JSON.stringify(events.map(event => event.id));
  const siteId = events[0]?.siteId;
  useEffect(() => {
    const controller = new AbortController();
    setWeather({}); setWeatherLoading(true);
    if (!siteId) { setWeatherLoading(false); return; }
    fetch(`/api/sites/${encodeURIComponent(siteId)}/event-weather`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: JSON.parse(eventIds) }), signal: controller.signal
    }).then(response => response.ok ? response.json() : Promise.reject())
      .then(data => { if (!controller.signal.aborted) setWeather(data.readings ?? {}); })
      .catch(() => {}).finally(() => { if (!controller.signal.aborted) setWeatherLoading(false); });
    return () => controller.abort();
  }, [eventIds, siteId]);
  if (!events.length) return <p className="empty-state">{emptyMessage}</p>;

  return (
    <div className="equipment-event-list">
      {events.map((event) => (
        <article
          key={event.id}
          className={`equipment-event-row equipment-event-row--${event.eventType.replaceAll('_', '-')}`}
        >
          <div className="equipment-event-icon" aria-hidden="true"><EventIcon type={event.eventType} /></div>
          <div className="equipment-event-copy">
            <div className="equipment-event-title">
              <strong>{displayTelemetryText(event.message)}</strong>
              <span>{event.channel}</span>
            </div>
            <p>{formatEventTime(event.occurredAt, timezone)} · {event.deviceName ?? event.deviceId}</p>
            {event.offCycleSeconds != null && (
              <div className="cycle-summary-boxes" title="Recorded time from reaching temperature to the next compressor start. Approximate to the telemetry sampling interval.">
                <div className="equipment-off-cycle cycle-summary-average">
                  <span><Clock3 size={15} aria-hidden="true" /> Off cycle</span>
                  <strong>{formatCycleDuration(event.offCycleSeconds)}</strong>
                </div>
                <div className="equipment-off-cycle"><span>Reached temperature → cooling resumed</span></div>
                <div className="equipment-off-cycle" title="Highest recorded fluid temperature during the preceding compressor-on run, from compressor start through reaching temperature. Based on saved telemetry samples, not outdoor weather.">
                  <span><Thermometer size={15} aria-hidden="true" /> Cycle high temp</span>
                  <strong>{formatValue(event.cycleHighTemperatureF ?? null, '°F')}</strong>
                </div>
              </div>
            )}
            {event.sincePreviousOffCycleSeconds != null && (
              <div className="cycle-summary-boxes" title="Recorded time between successive reached-temperature events, with cooling resumed in between.">
                <div className="equipment-off-cycle equipment-off-cycle--interval cycle-summary-average">
                  <span><Clock3 size={15} aria-hidden="true" /> Since previous off cycle</span>
                  <strong>{formatCycleDuration(event.sincePreviousOffCycleSeconds)}</strong>
                </div>
              </div>
            )}
            {event.onCycleSeconds != null && (
              <div className="cycle-summary-boxes" title="Completed compressor-on run, from compressor start through reaching temperature. Peak fluid temperature is based on saved telemetry samples.">
                <div className="equipment-off-cycle equipment-off-cycle--interval cycle-summary-average">
                  <span><Zap size={15} aria-hidden="true" /> Cycle on</span>
                  <strong>{formatCycleDuration(event.onCycleSeconds)}</strong>
                </div>
                <div className="equipment-off-cycle equipment-off-cycle--interval">
                  <span><Thermometer size={15} aria-hidden="true" /> Cycle high temp</span>
                  <strong>{formatValue(event.cycleHighTemperatureF ?? null, '°F')}</strong>
                </div>
              </div>
            )}
            <div className="equipment-event-snapshot">
              <span><Gauge size={13} /> High {formatValue(event.highPressure, 'PSI')}</span>
              <span><Gauge size={13} /> Low {formatValue(event.lowPressure, 'PSI')}</span>
              <span><Thermometer size={13} /> Fluid {formatValue(event.processTemperature, displayTelemetryUnit(event.temperatureUnit, { temperature: true }))}</span>
              <span title={weather[event.id] ? `Nearby outdoor weather observation · NWS ${weather[event.id]!.station} · ${formatEventTime(weather[event.id]!.observedAt, timezone)} · at or before event, no more than 90 minutes old` : 'No matching historical outdoor weather observation available. Current weather is never substituted.'}><Thermometer size={13} /> Outdoor {weatherLoading ? 'Loading…' : weather[event.id] ? formatValue(weather[event.id]!.temperatureF, '°F') : 'unavailable'}</span>
              <span><Zap size={13} /> Current {formatValue(event.compressorAmps, 'A')}</span>
              <span><Clock3 size={13} /> Runtime {formatRuntime(event.runtimeMinutes)}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

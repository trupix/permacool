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
  if (type === 'system_on' || type === 'system_off') return <Power size={17} />;
  return <Clock3 size={17} />;
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
            <div className="equipment-event-snapshot">
              <span><Gauge size={13} /> High {formatValue(event.highPressure, 'PSI')}</span>
              <span><Gauge size={13} /> Low {formatValue(event.lowPressure, 'PSI')}</span>
              <span><Thermometer size={13} /> Fluid {formatValue(event.processTemperature, displayTelemetryUnit(event.temperatureUnit, { temperature: true }))}</span>
              <span><Zap size={13} /> Current {formatValue(event.compressorAmps, 'A')}</span>
              <span><Clock3 size={13} /> Runtime {formatRuntime(event.runtimeMinutes)}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

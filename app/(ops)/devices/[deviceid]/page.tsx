import { notFound } from 'next/navigation';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { requireUser } from '@/lib/auth';
import { displayTelemetryUnit, isTemperatureTelemetryKey } from '@/lib/telemetry-units';
import { getDevice, getDeviceTelemetry } from '@/server/repositories/devices';
import { getSite } from '@/server/repositories/sites';

function formatControllerDateTime(value: string, timeZone: string) {
  const timestamp = new Date(value);

  if (!Number.isFinite(timestamp.getTime())) {
    return { time: 'Not available', date: 'Not available' };
  }

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).formatToParts(timestamp);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? '--';

  return {
    time: `${part('hour')}:${part('minute')}:${part('second')}`,
    date: `${part('day')}-${part('month')}-${part('year')}`
  };
}

export default async function DeviceDetailPage({ params }: { params: Promise<{ deviceid: string }> }) {
  const { deviceid: deviceId } = await params;
  const user = await requireUser();
  const device = await getDevice(user, deviceId);

  if (!device) notFound();

  const [site, telemetry] = await Promise.all([
    getSite(user, device.siteId),
    getDeviceTelemetry(user, device.id)
  ]);

  if (!site) notFound();
  const lastSeen = formatControllerDateTime(device.lastSeenAt, site.timezone);

  return (
    <main className="page-stack">
      <header>
        <p className="eyebrow">Device detail</p>
        <h1>{device.name}</h1>
        <p className="page-copy">
          {device.plcModel} · {device.protocol} · {device.firmwareVersion}
        </p>
      </header>

      <SectionCard title="Health status" eyebrow="Controller">
        <div className="list-row">
          <div className="controller-last-seen">
            <strong>Last seen</strong>
            <p><span>Time:</span> {lastSeen.time}</p>
            <p><span>Date:</span> {lastSeen.date}</p>
            <small>{site.timezone}</small>
          </div>
          <StatusBadge tone={device.status} />
        </div>
      </SectionCard>

      <SectionCard title="Latest telemetry" eyebrow="Read-only values">
        <div className="table-like">
          {telemetry.map((point) => (
            <div key={point.id} className="table-row">
              <div>
                <strong>{point.label}</strong>
                <p>{point.key}</p>
              </div>
              <span>
                {point.latestValue}{' '}
                {displayTelemetryUnit(point.unit, { temperature: isTemperatureTelemetryKey(point.key) })}
              </span>
              <span>{point.latestTimestamp}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}

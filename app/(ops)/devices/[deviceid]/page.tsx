import { notFound } from 'next/navigation';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { requireUser } from '@/lib/auth';
import { getDevice, getDeviceTelemetry } from '@/server/repositories/devices';
import { getSite } from '@/server/repositories/sites';

export default async function DeviceDetailPage({ params }: { params: Promise<{ deviceid: string }> }) {
  const { deviceid: deviceId } = await params;
  const user = await requireUser();
  const device = await getDevice(deviceId);

  if (!device) notFound();

  const [site, telemetry] = await Promise.all([
    getSite(device.siteId),
    getDeviceTelemetry(device.id)
  ]);

  if (!site || !user.organizationIds.includes(site.organizationId)) notFound();

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
          <div>
            <strong>Last seen</strong>
            <p>{device.lastSeenAt}</p>
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
                {point.latestValue} {point.unit}
              </span>
              <span>{point.latestTimestamp}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}

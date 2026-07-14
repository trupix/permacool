import { notFound } from 'next/navigation';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { getDevice, getDeviceTelemetry } from '@/server/repositories/devices';

export default async function DeviceDetailPage({ params }: { params: Promise<{ deviceId: string }> }) {
  const { deviceId } = await params;
  const device = await getDevice(deviceId);

  if (!device) notFound();

  const telemetry = await getDeviceTelemetry(device.id);

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
              <span>{point.label}</span>
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

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { env } from '@/lib/env';
import { getDevices } from '@/server/repositories/devices';
import type { TelemetryIngestPayload } from '@/types/domain';
import { requireStaff } from '@/lib/auth';

function endpointUrl() {
  return `${env.appUrl.replace(/\/$/, '')}/api/ingest/telemetry`;
}

function buildPayload(deviceId: string, siteId: string): TelemetryIngestPayload {
  const now = new Date();
  const wobble = Math.sin(now.getTime() / 30_000);

  return {
    gatewayId: 'groov-epic-sim-01',
    siteId,
    deviceId,
    capturedAt: now.toISOString(),
    points: [
      { key: 'ch1_temperature_c', value: Number((-42 + wobble * 3).toFixed(1)), unit: 'F' },
      { key: 'ch1_setpoint_c', value: -40, unit: 'F' },
      { key: 'ch1_chiller_run', value: 1, unit: 'bool' },
      { key: 'ch1_system_on', value: 1, unit: 'bool' },
      { key: 'ch1_high_pressure', value: Number((215 + wobble * 8).toFixed(1)), unit: 'psi' },
      { key: 'ch1_low_pressure', value: Number((38 + wobble * 2).toFixed(1)), unit: 'psi' },
      { key: 'ch1_compressor_amps', value: Number((51 + wobble * 2).toFixed(1)), unit: 'A' },
      { key: 'ch1_compressor_runtime_min', value: 12_045, unit: 'min' },
      { key: 'ch1_high_pressure_stop', value: 0, unit: 'bool' },
      { key: 'high_pressure_stop', value: 0, unit: 'bool' }
    ]
  };
}

async function sendTestTelemetry(formData: FormData) {
  'use server';

  const user = await requireStaff(['staff_admin']);
  const deviceId = String(formData.get('deviceId') ?? '');
  const devices = await getDevices(user);
  const device = devices.find((candidate) => candidate.id === deviceId) ?? devices[0];

  if (!device) {
    redirect('/ingest-test?status=error&message=No%20device%20records%20exist');
  }

  const payload = buildPayload(device.id, device.siteId);
  const response = await fetch(endpointUrl(), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-telemetry-token': env.telemetryIngestToken
    },
    body: JSON.stringify(payload),
    cache: 'no-store'
  });

  const body = await response.json().catch(() => ({}));
  const status = response.ok ? 'sent' : 'error';
  const message = response.ok
    ? `Accepted ${body.pointCount ?? payload.points.length} test points for ${device.id}${body.persisted ? '' : ' (not persisted: database not configured)'}`
    : body.error ?? `Ingest endpoint returned ${response.status}`;

  redirect(`/ingest-test?status=${status}&message=${encodeURIComponent(message)}&deviceId=${encodeURIComponent(device.id)}`);
}

export default async function IngestTestPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; message?: string; deviceId?: string }>;
}) {
  const user = await requireStaff();
  const [devices, params] = await Promise.all([getDevices(user), searchParams]);
  const selectedDeviceId = params.deviceId ?? devices[0]?.id;
  const selectedDevice = devices.find((device) => device.id === selectedDeviceId) ?? devices[0];

  return (
    <main className="page-stack">
      <header>
        <p className="eyebrow">Dashboard-side simulator</p>
        <h1>Telemetry ingest test</h1>
        <p className="page-copy">
          Prove the Ops API, token, database persistence, and device page updates before wiring the groov EPIC Node-RED flow.
        </p>
      </header>

      {params.message ? (
        <SectionCard title={params.status === 'sent' ? 'Test payload sent' : 'Test failed'} eyebrow="Result">
          <div className="list-row">
            <div>
              <strong>{params.message}</strong>
              {selectedDevice ? <p>Check the device detail page for updated latest telemetry.</p> : null}
            </div>
            <StatusBadge tone={params.status === 'sent' ? 'online' : 'critical'} label={params.status === 'sent' ? 'accepted' : 'error'} />
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="Send synthetic groov EPIC telemetry" eyebrow="HTTP POST → /api/ingest/telemetry">
        <form action={sendTestTelemetry} className="auth-form">
          <label>
            Target device
            <select name="deviceId" defaultValue={selectedDevice?.id}>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} · {device.id}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="button-primary">
            Send test telemetry
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Current ingest contract" eyebrow="Node-RED target">
        <div className="table-like">
          <div className="table-row">
            <span>Endpoint</span>
            <span>{endpointUrl()}</span>
          </div>
          <div className="table-row">
            <span>Header</span>
            <span>x-telemetry-token: configured server-side</span>
          </div>
          <div className="table-row">
            <span>Gateway ID</span>
            <span>groov-epic-sim-01</span>
          </div>
          {selectedDevice ? (
            <>
              <div className="table-row">
                <span>Site ID</span>
                <span>{selectedDevice.siteId}</span>
              </div>
              <div className="table-row">
                <span>Device ID</span>
                <span>{selectedDevice.id}</span>
              </div>
            </>
          ) : null}
        </div>
      </SectionCard>

      {selectedDevice ? (
        <Link href={`/devices/${selectedDevice.id}`} className="button-secondary">
          Open selected device detail
        </Link>
      ) : null}
    </main>
  );
}

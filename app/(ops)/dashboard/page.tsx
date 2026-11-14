import type { Metadata } from 'next';
import Link from 'next/link';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { getDashboardSnapshot } from '@/server/repositories/dashboard';
import { DashboardSnapshotRefresh } from '@/components/dashboard-snapshot-refresh';
import { requireUser } from '@/lib/auth';
import { isStaffScope } from '@/lib/access';
import { canAccessPlcOperations } from '@/lib/plc-operations-access';

export const metadata: Metadata = {
  title: 'SOUL Matrix',
  description: 'Signals, Operations, Unity & Logic — the living state of every connected system.'
};

export default async function DashboardPage() {
  const user = await requireUser();
  const { alerts, devices, sites, dashboardSummary, capturedAt, nextRefreshAt } = await getDashboardSnapshot(user);
  return (
    <main className="page-stack">
      <header>
        <p className="eyebrow">{isStaffScope(user) ? 'Agenticly.Cool' : 'Customer portal'}</p>
        <h1>{isStaffScope(user) ? 'SOUL Matrix' : 'My equipment overview'}</h1>
        <p className="page-copy">
          Signals, Operations, Unity &amp; Logic — the living state of every connected system.
        </p>
      </header>

      {canAccessPlcOperations(user) ? (
        <Link href="/dashboard/plc-operations" className="list-row link-row">
          <div><strong>PLC Operations</strong><p>Private planning, standards, maintenance history and controller records</p></div>
          <span aria-hidden="true">→</span>
        </Link>
      ) : null}

      <DashboardSnapshotRefresh capturedAt={capturedAt} nextRefreshAt={nextRefreshAt} />
      <section className="metric-grid">
        <MetricCard label="Sites" value={dashboardSummary.totalSites} detail="Customer locations onboarded" />
        <MetricCard label="Online Devices" value={dashboardSummary.onlineDevices} detail="Controllers reporting normally" />
        <MetricCard label="Open Alerts" value={dashboardSummary.openAlerts} detail="Requires review or acknowledgement" />
        <MetricCard label="Degraded Sites" value={dashboardSummary.degradedSites} detail="Connectivity or telemetry lag detected" />
      </section>

      <div className="content-grid">
        <SectionCard title="Site health" eyebrow="Locations">
          <div className="list-stack">
            {sites.map((site) => (
              <Link key={site.id} href={`/sites/${site.id}`} className="list-row link-row">
                <div>
                  <strong>{site.name}</strong>
                  <p>{site.region}</p>
                </div>
                <StatusBadge tone={site.gatewayStatus} />
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent alerts" eyebrow="Attention">
          <div className="list-stack">
            {alerts.map((alert) => (
              <div key={alert.id} className="list-row list-row-start">
                <div>
                  <strong>{alert.message}</strong>
                  <p>{alert.deviceId}</p>
                </div>
                <StatusBadge tone={alert.severity} label={alert.status} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Device snapshot" eyebrow="Controllers">
        <div className="table-like">
          {devices.map((device) => (
            <Link key={device.id} href={`/devices/${device.id}`} className="table-row link-row">
              <span>{device.name}</span>
              <span>{device.protocol}</span>
              <span>{device.firmwareVersion}</span>
              <StatusBadge tone={device.status} />
            </Link>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}

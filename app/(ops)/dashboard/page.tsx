import type { Metadata } from 'next';
import Link from 'next/link';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { getAlerts } from '@/server/repositories/alerts';
import { getDevices } from '@/server/repositories/devices';
import { getOverviewMetrics } from '@/server/repositories/overview';
import { getSites } from '@/server/repositories/sites';

export const metadata: Metadata = {
  title: 'SOUL Matrix',
  description: 'Signals, Operations, Unity & Logic — the living state of every connected system.'
};

export default async function DashboardPage() {
  const [alerts, devices, sites, dashboardSummary] = await Promise.all([
    getAlerts(),
    getDevices(),
    getSites(),
    getOverviewMetrics()
  ]);
  return (
    <main className="page-stack">
      <header>
        <p className="eyebrow">Agenticly Control</p>
        <h1>SOUL Matrix</h1>
        <p className="page-copy">
          Signals, Operations, Unity &amp; Logic — the living state of every connected system.
        </p>
      </header>

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

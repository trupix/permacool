import type { Metadata } from 'next';
import Link from 'next/link';
import { MetricCard } from '@/components/metric-card';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { getAlerts, getOpenAlertCount } from '@/server/repositories/alerts';
import { getDevices } from '@/server/repositories/devices';
import { getDashboardSites } from '@/server/repositories/sites';
import { requireUser } from '@/lib/auth';
import { isStaffScope } from '@/lib/access';
import { telemetryFreshness } from '@/lib/telemetry-freshness';
import { latestSiteActivity } from '@/lib/site-activity';

export const metadata: Metadata = {
  title: 'SOUL Matrix',
  description: 'Signals, Operations, Unity & Logic — the living state of every connected system.'
};

export default async function DashboardPage() {
  const user = await requireUser();
  const [alerts, devices, sites, openAlerts] = await Promise.all([
    getAlerts(user, 10),
    getDevices(user),
    getDashboardSites(user),
    getOpenAlertCount(user)
  ]);
  const now = Date.now();
  const siteFreshness = (siteId: string) => telemetryFreshness(latestSiteActivity(
    devices.filter((device) => device.siteId === siteId).map((device) => device.lastSeenAt)
  ), now);
  const dashboardSummary = {
    totalSites: sites.length,
    onlineDevices: devices.filter((device) => telemetryFreshness(device.lastSeenAt, now).tone === 'online').length,
    openAlerts,
    degradedSites: sites.filter((site) => siteFreshness(site.id).tone !== 'online').length
  };
  return (
    <main className="page-stack">
      <header>
        <p className="eyebrow">{isStaffScope(user) ? 'Agenticly.Cool' : 'Customer portal'}</p>
        <h1>{isStaffScope(user) ? 'SOUL Matrix' : 'My equipment overview'}</h1>
        <p className="page-copy">
          Signals, Operations, Unity &amp; Logic — the living state of every connected system.
        </p>
      </header>

      <Link href="/dashboard/telemetry-flow" className="list-row link-row">
        <div><strong>Explore the telemetry flow →</strong><p>Animated guide to sampling, resting mode, safe uploads, and Degrees Per Min. Planned system—not live status.</p></div>
      </Link>

      <section className="metric-grid">
        <MetricCard label="Sites" value={dashboardSummary.totalSites} detail="Customer locations onboarded" />
        <MetricCard label="Reporting Devices" value={dashboardSummary.onlineDevices} detail="Telemetry received within five minutes" />
        <MetricCard label="Open Alerts" value={dashboardSummary.openAlerts} detail="Requires review or acknowledgement" />
        <MetricCard label="Stale / Unreported Sites" value={dashboardSummary.degradedSites} detail="No telemetry received within five minutes" />
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
                <StatusBadge {...siteFreshness(site.id)} />
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent alerts" eyebrow="Latest 10" action={<Link href="/alerts">View all alerts</Link>}>
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
              <StatusBadge {...telemetryFreshness(device.lastSeenAt, now)} />
            </Link>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}

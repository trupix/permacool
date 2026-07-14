import { notFound } from 'next/navigation';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { getDevicesBySite } from '@/server/repositories/devices';
import { getSite, getSiteAlerts } from '@/server/repositories/sites';

export default async function SiteDetailPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await getSite(siteId);

  if (!site) notFound();

  const [siteDevices, siteAlerts] = await Promise.all([getDevicesBySite(site.id), getSiteAlerts(site.id)]);

  return (
    <main className="page-stack">
      <header>
        <p className="eyebrow">Site detail</p>
        <h1>{site.name}</h1>
        <p className="page-copy">
          {site.region} · {site.timezone}
        </p>
      </header>

      <SectionCard title="Gateway status" eyebrow="Connectivity">
        <div className="list-row">
          <div>
            <strong>Primary edge gateway</strong>
            <p>Outbound secure tunnel expected for all telemetry traffic.</p>
          </div>
          <StatusBadge tone={site.gatewayStatus} />
        </div>
      </SectionCard>

      <div className="content-grid">
        <SectionCard title="Devices" eyebrow="Controllers">
          <div className="table-like">
            {siteDevices.map((device) => (
              <div key={device.id} className="table-row">
                <span>{device.name}</span>
                <span>{device.protocol}</span>
                <StatusBadge tone={device.status} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Alerts" eyebrow="Recent activity">
          <div className="list-stack">
            {siteAlerts.length ? (
              siteAlerts.map((alert) => (
                <div key={alert.id} className="list-row list-row-start">
                  <div>
                    <strong>{alert.message}</strong>
                    <p>{alert.startedAt}</p>
                  </div>
                  <StatusBadge tone={alert.severity} label={alert.status} />
                </div>
              ))
            ) : (
              <p className="empty-state">No active site alerts.</p>
            )}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}

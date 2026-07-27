import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SalinasEquipmentDashboard } from '@/components/salinas-equipment-dashboard';
import { SectionCard } from '@/components/section-card';
import { SiteSectionNav } from '@/components/site-section-nav';
import { StatusBadge } from '@/components/status-badge';
import { requireUser } from '@/lib/auth';
import { getEquipmentCatalogRecord, getSiteEquipmentRecord } from '@/lib/equipment/data';
import { getDevicesBySite } from '@/server/repositories/devices';
import { getSite } from '@/server/repositories/sites';

export const metadata: Metadata = {
  title: 'Connectivity',
  description: 'Gateway, controller, device, and telemetry signal connectivity for a site.'
};

export default async function SiteConnectivityPage({
  params
}: {
  params: Promise<{ siteid: string }>;
}) {
  const { siteid: siteId } = await params;
  const user = await requireUser();
  const site = await getSite(user, siteId);

  if (!site) notFound();

  const siteDevices = await getDevicesBySite(user, site.id);
  const equipmentRecord = getSiteEquipmentRecord(site.id);
  const catalogRecordId = equipmentRecord?.processSystems[0]?.condensers[0]?.catalogRecordId;
  const equipmentCatalog = catalogRecordId ? getEquipmentCatalogRecord(catalogRecordId) : undefined;

  return (
    <main className="page-stack">
      <SiteSectionNav siteId={site.id} siteName={site.name} active="connectivity" />

      <header className="site-detail-heading">
        <p className="eyebrow">{site.name}</p>
        <h1>Connectivity</h1>
        <p className="page-copy">
          Gateway availability, connected controllers, and live telemetry signal readiness.
        </p>
      </header>

      <div className="content-grid">
        <SectionCard title="Gateway status" eyebrow="Connectivity">
          <div className="list-row">
            <div>
              <strong>Primary edge gateway</strong>
              <p>Outbound secure tunnel expected for all telemetry traffic.</p>
            </div>
            <StatusBadge tone={site.gatewayStatus} />
          </div>
        </SectionCard>

        <SectionCard title="Devices" eyebrow="Controllers">
          {siteDevices.length ? (
            <div className="table-like">
              {siteDevices.map((device) => (
                <Link key={device.id} href={`/devices/${device.id}`} className="table-row link-row">
                  <span>{device.name}</span>
                  <span>{device.protocol}</span>
                  <StatusBadge tone={device.status} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-state">No controllers are registered for this site.</p>
          )}
        </SectionCard>
      </div>

      {equipmentRecord && equipmentCatalog ? (
        <SalinasEquipmentDashboard
          siteId={site.id}
          equipmentRecord={equipmentRecord}
          catalog={equipmentCatalog}
          view="connectivity"
        />
      ) : (
        <SectionCard title="Signal readiness unavailable" eyebrow="Telemetry">
          <p className="empty-state">Add the site equipment record to map diagnostic signal readiness.</p>
        </SectionCard>
      )}
    </main>
  );
}

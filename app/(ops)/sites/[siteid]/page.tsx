import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { EquipmentEventList } from '@/components/equipment-event-list';
import { SiteEquipmentDashboard } from '@/components/site-equipment-dashboard';
import { SectionCard } from '@/components/section-card';
import { SiteSectionNav } from '@/components/site-section-nav';
import { StatusBadge } from '@/components/status-badge';
import { requireUser } from '@/lib/auth';
import { groovManageUrlForDevices, nodeRedUrlForDevices } from '@/lib/controller-links';
import { equipmentCatalogRecords, getSiteEquipmentRecord } from '@/lib/equipment/data';
import { resolveSiteDashboardFoundation } from '@/lib/equipment/site-foundation';
import { getDevicesBySite } from '@/server/repositories/devices';
import { getSiteEquipmentEvents } from '@/server/repositories/equipment-events';
import { getEquipmentConfiguration } from '@/server/repositories/equipment-configurations';
import { getSite, getSiteAlerts } from '@/server/repositories/sites';

export default async function SiteDetailPage({ params }: { params: Promise<{ siteid: string }> }) {
  const { siteid: siteId } = await params;
  const user = await requireUser();
  const site = await getSite(user, siteId);

  if (!site) notFound();

  const [siteDevices, siteAlerts, siteEvents, equipmentConfiguration] = await Promise.all([
    getDevicesBySite(user, site.id),
    getSiteAlerts(user, site.id),
    getSiteEquipmentEvents(site.id, { limit: 5 }),
    getEquipmentConfiguration(site.id)
  ]);
  const controllerManageUrl = groovManageUrlForDevices(siteDevices);
  const nodeRedUrl = nodeRedUrlForDevices(siteDevices);
  const siteFoundation = resolveSiteDashboardFoundation({
    siteId: site.id,
    siteName: site.name,
    storedConfiguration: equipmentConfiguration.configuration,
    verifiedRecord: getSiteEquipmentRecord(site.id),
    catalogRecords: equipmentCatalogRecords
  });

  return (
    <main className="page-stack">
      <SiteSectionNav
        siteId={site.id}
        siteName={site.name}
        active="overview"
        controllerManageUrl={controllerManageUrl}
        nodeRedUrl={nodeRedUrl}
      />

      <header className="site-detail-heading">
        <p className="eyebrow">Site detail</p>
        <h1>{site.name}</h1>
        <p className="page-copy">
          {site.region} · {site.timezone}
        </p>
      </header>

      <SiteEquipmentDashboard
        siteId={site.id}
        siteName={site.name}
        equipmentRecord={siteFoundation.equipmentRecord}
        catalog={siteFoundation.primaryCatalog}
        catalogs={equipmentCatalogRecords}
        initialConfiguration={siteFoundation.dashboardConfiguration}
        equipmentStorageReady={equipmentConfiguration.storageReady}
        canEdit={false}
      />

      <SectionCard
        title="Recent events"
        eyebrow="Operating history"
        action={
          <Link href={`/sites/${site.id}/events`} className="ops-text-link">
            Open event history <ArrowRight size={14} />
          </Link>
        }
      >
        <EquipmentEventList events={siteEvents.events} timezone={site.timezone} />
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
    </main>
  );
}

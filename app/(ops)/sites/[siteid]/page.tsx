import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { CycleAverages } from '@/components/cycle-averages';
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
import { getInitialSiteTelemetry } from '@/server/repositories/initial-site-telemetry';
import type { AppUser } from '@/types/domain';

export default async function SiteDetailPage({ params }: { params: Promise<{ siteid: string }> }) {
  const { siteid: siteId } = await params;
  const user = await requireUser();
  const site = await getSite(user, siteId);

  if (!site) notFound();

  const [siteDevices, equipmentConfiguration, initialTelemetry] = await Promise.all([
    getDevicesBySite(user, site.id),
    getEquipmentConfiguration(site.id),
    getInitialSiteTelemetry(user, site.id)
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
        <h1>{site.id === 'site-golddrop' ? <Image src="/images/customers/golddrop.svg" alt="GoldDrop" width={1500} height={260} className="site-company-logo" priority /> : site.name}</h1>
        <p className="page-copy">
          {site.region} · {site.timezone}
        </p>
      </header>

      <SiteEquipmentDashboard
        key={site.id}
        siteId={site.id}
        siteName={site.name}
        siteDeviceIds={siteDevices.map((device) => device.id)}
        facilityAddress={{
          addressLine1: site.addressLine1 ?? '',
          city: site.city ?? '',
          state: site.state ?? '',
          postalCode: site.postalCode ?? '',
          country: site.country ?? 'US'
        }}
        equipmentRecord={siteFoundation.equipmentRecord}
        catalog={siteFoundation.primaryCatalog}
        catalogs={equipmentCatalogRecords}
        initialConfiguration={siteFoundation.dashboardConfiguration}
        equipmentStorageReady={equipmentConfiguration.storageReady}
        initialTelemetry={initialTelemetry}
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
        <Suspense fallback={<p>Loading cycle averages…</p>}><CycleAverages siteId={site.id} timezone={site.timezone} /></Suspense>
        <Suspense fallback={<p>Loading recent events…</p>}>
          <RecentSiteEvents siteId={site.id} timezone={site.timezone} />
        </Suspense>
      </SectionCard>

      <SectionCard title="Alerts" eyebrow="Recent activity">
        <Suspense fallback={<p>Loading alerts…</p>}><SiteAlerts user={user} siteId={site.id} /></Suspense>
      </SectionCard>
    </main>
  );
}

async function RecentSiteEvents({ siteId, timezone }: { siteId: string; timezone: string }) {
  try {
    const siteEvents = await getSiteEquipmentEvents(siteId, { limit: 5 });
    return <EquipmentEventList events={siteEvents.events} timezone={timezone} />;
  } catch {
    return <p>Recent events are temporarily unavailable. Telemetry updates continue independently.</p>;
  }
}

async function SiteAlerts({ user, siteId }: { user: AppUser; siteId: string }) {
  const siteAlerts = await getSiteAlerts(user, siteId).catch(() => null);
  if (!siteAlerts) return <p>Alerts are temporarily unavailable; this does not mean there are no alerts.</p>;
  return (
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
  );
}

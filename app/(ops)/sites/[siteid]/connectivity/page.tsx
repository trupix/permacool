import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { SiteEquipmentDashboard } from '@/components/site-equipment-dashboard';
import { SectionCard } from '@/components/section-card';
import { SiteSectionNav } from '@/components/site-section-nav';
import { StatusBadge } from '@/components/status-badge';
import { requireUser } from '@/lib/auth';
import { groovManageUrlForDevices, nodeRedUrlForDevices } from '@/lib/controller-links';
import { canManageSiteEquipment } from '@/lib/workspace-access';
import { equipmentCatalogRecords, getSiteEquipmentRecord } from '@/lib/equipment/data';
import { resolveSiteDashboardFoundation } from '@/lib/equipment/site-foundation';
import { getInitialSiteTelemetry } from '@/server/repositories/initial-site-telemetry';
import { getDevicesBySite } from '@/server/repositories/devices';
import { getEquipmentConfiguration } from '@/server/repositories/equipment-configurations';
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

  const [siteDevices, equipmentConfiguration, initialTelemetry] = await Promise.all([
    getDevicesBySite(user, site.id),
    getEquipmentConfiguration(site.id),
    getInitialSiteTelemetry(user, site.id)
  ]);
  const canEditEquipment = canManageSiteEquipment(user, site.organizationId);
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
        active="connectivity"
        controllerManageUrl={controllerManageUrl}
        nodeRedUrl={nodeRedUrl}
      />

      <header className="site-detail-heading">
        {site.id === 'site-golddrop' ? <Image src="/images/customers/golddrop.svg" alt="GoldDrop" width={1500} height={260} className="site-company-logo" priority /> : <p className="eyebrow">{site.name}</p>}
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
              <p>Saved gateway status. Telemetry delivery and VPN access are checked separately below.</p>
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

        <SiteEquipmentDashboard
          key={site.id}
          siteId={site.id}
          siteName={site.name}
          siteDeviceIds={siteDevices.map((device) => device.id)}
          equipmentRecord={siteFoundation.equipmentRecord}
          catalog={siteFoundation.primaryCatalog}
          catalogs={equipmentCatalogRecords}
          view="connectivity"
          initialConfiguration={siteFoundation.dashboardConfiguration}
          initialTelemetry={initialTelemetry}
          equipmentStorageReady={equipmentConfiguration.storageReady}
          canEdit={canEditEquipment}
        />
    </main>
  );
}

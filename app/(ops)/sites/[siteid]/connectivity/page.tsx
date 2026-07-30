import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LocationEquipmentWorkspace } from '@/components/location-equipment-workspace';
import { SalinasEquipmentDashboard } from '@/components/salinas-equipment-dashboard';
import { SectionCard } from '@/components/section-card';
import { SiteSectionNav } from '@/components/site-section-nav';
import { StatusBadge } from '@/components/status-badge';
import { requireUser } from '@/lib/auth';
import { canManageSiteEquipment } from '@/lib/workspace-access';
import { getEquipmentCatalogRecord, getSiteEquipmentRecord } from '@/lib/equipment/data';
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

  const [siteDevices, equipmentConfiguration] = await Promise.all([
    getDevicesBySite(user, site.id),
    getEquipmentConfiguration(site.id)
  ]);
  const canEditEquipment = canManageSiteEquipment(user, site.organizationId);
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
          initialConfiguration={equipmentConfiguration.configuration}
          equipmentStorageReady={equipmentConfiguration.storageReady}
          canEdit={canEditEquipment}
        />
      ) : (
        <LocationEquipmentWorkspace
          siteId={site.id}
          siteName={site.name}
          view="connectivity"
          initialConfiguration={equipmentConfiguration.configuration}
          equipmentStorageReady={equipmentConfiguration.storageReady}
          canEdit={canEditEquipment}
          controller={{
            name: siteDevices[0]?.name ?? 'No PLC registered',
            status: siteDevices[0]?.status ?? 'offline',
            vpnIdentity: siteDevices[0]?.vpnIdentity ?? 'Not assigned',
            tunnelIp: siteDevices[0]?.vpnTunnelIp ?? 'Not assigned'
          }}
        />
      )}
    </main>
  );
}

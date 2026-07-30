import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { EquipmentEventList } from '@/components/equipment-event-list';
import { LocationEquipmentWorkspace } from '@/components/location-equipment-workspace';
import { SalinasEquipmentDashboard } from '@/components/salinas-equipment-dashboard';
import { SectionCard } from '@/components/section-card';
import { SiteSectionNav } from '@/components/site-section-nav';
import { StatusBadge } from '@/components/status-badge';
import { SiteTelemetryPanel } from '@/components/site-telemetry-panel';
import { requireUser } from '@/lib/auth';
import { canManageSiteEquipment } from '@/lib/workspace-access';
import { getEquipmentCatalogRecord, getSiteEquipmentRecord } from '@/lib/equipment/data';
import { getDeviceTelemetry, getDevicesBySite } from '@/server/repositories/devices';
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
  const canEditEquipment = canManageSiteEquipment(user, site.organizationId);
  const equipmentRecord = getSiteEquipmentRecord(site.id);
  const catalogRecordId = equipmentRecord?.processSystems[0]?.condensers[0]?.catalogRecordId;
  const equipmentCatalog = catalogRecordId ? getEquipmentCatalogRecord(catalogRecordId) : undefined;
  const hasEquipmentDashboard = Boolean(equipmentRecord && equipmentCatalog);
  const telemetryByDevice = hasEquipmentDashboard
    ? []
    : await Promise.all(
        siteDevices.map(async (device) => ({
          device,
          points: await getDeviceTelemetry(user, device.id)
        }))
      );

  return (
    <main className="page-stack">
      <SiteSectionNav siteId={site.id} siteName={site.name} active="overview" />

      <header className="site-detail-heading">
        <p className="eyebrow">Site detail</p>
        <h1>{site.name}</h1>
        <p className="page-copy">
          {site.region} · {site.timezone}
        </p>
      </header>

      {equipmentRecord && equipmentCatalog ? (
        <SalinasEquipmentDashboard
          siteId={site.id}
          equipmentRecord={equipmentRecord}
          catalog={equipmentCatalog}
          initialConfiguration={equipmentConfiguration.configuration}
          equipmentStorageReady={equipmentConfiguration.storageReady}
          canEdit={canEditEquipment}
        />
      ) : null}

      {!hasEquipmentDashboard ? (
        <LocationEquipmentWorkspace
          siteId={site.id}
          siteName={site.name}
          view="overview"
          initialConfiguration={equipmentConfiguration.configuration}
          equipmentStorageReady={equipmentConfiguration.storageReady}
          canEdit={canEditEquipment}
          initialAddress={{
            addressLine1: site.addressLine1 ?? '',
            city: site.city ?? '',
            state: site.state ?? '',
            postalCode: site.postalCode ?? '',
            country: site.country ?? 'US'
          }}
          controller={{
            name: siteDevices[0]?.name ?? 'No PLC registered',
            status: siteDevices[0]?.status ?? 'offline',
            vpnIdentity: siteDevices[0]?.vpnIdentity ?? 'Not assigned',
            tunnelIp: siteDevices[0]?.vpnTunnelIp ?? 'Not assigned'
          }}
        />
      ) : null}

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

      {!hasEquipmentDashboard ? (
        <SiteTelemetryPanel
          siteId={site.id}
          initialPoints={telemetryByDevice.flatMap(({ device, points }) =>
            points.map((point) => ({ ...point, deviceName: device.name }))
          )}
        />
      ) : null}
    </main>
  );
}

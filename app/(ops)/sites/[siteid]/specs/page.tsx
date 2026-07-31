import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FacilityAddressEditor } from '@/components/facility-address-editor';
import { LocationEquipmentWorkspace } from '@/components/location-equipment-workspace';
import { SalinasEquipmentDashboard } from '@/components/salinas-equipment-dashboard';
import { SiteSectionNav } from '@/components/site-section-nav';
import { requireUser } from '@/lib/auth';
import { groovManageUrlForDevices, nodeRedUrlForDevices } from '@/lib/controller-links';
import { canManageSiteEquipment } from '@/lib/workspace-access';
import { getEquipmentCatalogRecord, getSiteEquipmentRecord } from '@/lib/equipment/data';
import { getDevicesBySite } from '@/server/repositories/devices';
import { getEquipmentConfiguration } from '@/server/repositories/equipment-configurations';
import { getSite } from '@/server/repositories/sites';

export const metadata: Metadata = {
  title: 'Location Specs',
  description: 'System configuration, capacity inputs, electrical references, and manufacturer data for a site.'
};

export default async function LocationSpecsPage({ params }: { params: Promise<{ siteid: string }> }) {
  const { siteid: siteId } = await params;
  const user = await requireUser();
  const site = await getSite(user, siteId);

  if (!site) notFound();

  const [siteDevices, equipmentConfiguration] = await Promise.all([
    getDevicesBySite(user, site.id),
    getEquipmentConfiguration(site.id)
  ]);
  const canEditEquipment = canManageSiteEquipment(user, site.organizationId);
  const controllerManageUrl = groovManageUrlForDevices(siteDevices);
  const nodeRedUrl = nodeRedUrlForDevices(siteDevices);
  const equipmentRecord = getSiteEquipmentRecord(site.id);
  const catalogRecordId = equipmentRecord?.processSystems[0]?.condensers[0]?.catalogRecordId;
  const equipmentCatalog = catalogRecordId ? getEquipmentCatalogRecord(catalogRecordId) : undefined;

  return (
    <main className="page-stack">
      <SiteSectionNav
        siteId={site.id}
        siteName={site.name}
        active="specs"
        controllerManageUrl={controllerManageUrl}
        nodeRedUrl={nodeRedUrl}
      />

      <header className="site-detail-heading">
        <p className="eyebrow">{site.name}</p>
        <h1>Location Specs</h1>
        <p className="page-copy">
          System configuration, capacity inputs, electrical references, and verified manufacturer data.
        </p>
      </header>

      {equipmentRecord && equipmentCatalog ? (
        <>
          <FacilityAddressEditor
            siteId={site.id}
            canEdit={canEditEquipment}
            storageReady={equipmentConfiguration.storageReady}
            initialAddress={{
              addressLine1: site.addressLine1 ?? '',
              city: site.city ?? '',
              state: site.state ?? '',
              postalCode: site.postalCode ?? '',
              country: site.country ?? 'US'
            }}
          />
          <SalinasEquipmentDashboard
            siteId={site.id}
            equipmentRecord={equipmentRecord}
            catalog={equipmentCatalog}
            view="specs"
            initialConfiguration={equipmentConfiguration.configuration}
            equipmentStorageReady={equipmentConfiguration.storageReady}
            canEdit={canEditEquipment}
          />
        </>
      ) : (
        <LocationEquipmentWorkspace
          siteId={site.id}
          siteName={site.name}
          view="specs"
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
      )}
    </main>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SalinasEquipmentDashboard } from '@/components/salinas-equipment-dashboard';
import { SectionCard } from '@/components/section-card';
import { SiteSectionNav } from '@/components/site-section-nav';
import { requireUser } from '@/lib/auth';
import { getEquipmentCatalogRecord, getSiteEquipmentRecord } from '@/lib/equipment/data';
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

  const equipmentRecord = getSiteEquipmentRecord(site.id);
  const catalogRecordId = equipmentRecord?.processSystems[0]?.condensers[0]?.catalogRecordId;
  const equipmentCatalog = catalogRecordId ? getEquipmentCatalogRecord(catalogRecordId) : undefined;

  return (
    <main className="page-stack">
      <SiteSectionNav siteId={site.id} siteName={site.name} active="specs" />

      <header className="site-detail-heading">
        <p className="eyebrow">{site.name}</p>
        <h1>Location Specs</h1>
        <p className="page-copy">
          System configuration, capacity inputs, electrical references, and verified manufacturer data.
        </p>
      </header>

      {equipmentRecord && equipmentCatalog ? (
        <SalinasEquipmentDashboard
          siteId={site.id}
          equipmentRecord={equipmentRecord}
          catalog={equipmentCatalog}
          view="specs"
        />
      ) : (
        <SectionCard title="No equipment specifications recorded" eyebrow="Location Specs">
          <p className="empty-state">Add the site equipment record to populate this workspace.</p>
        </SectionCard>
      )}
    </main>
  );
}

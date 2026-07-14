import Link from 'next/link';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { getOrganizations } from '@/server/repositories/organizations';
import { getSites } from '@/server/repositories/sites';

export default async function SitesPage() {
  const [organizations, sites] = await Promise.all([getOrganizations(), getSites()]);
  return (
    <main className="page-stack">
      <header>
        <p className="eyebrow">Sites</p>
        <h1>Locations and gateways</h1>
      </header>

      <SectionCard title="Managed sites" eyebrow={organizations[0]?.name}>
        <div className="list-stack">
          {sites.map((site) => (
            <Link href={`/sites/${site.id}`} key={site.id} className="list-row link-row">
              <div>
                <strong>{site.name}</strong>
                <p>
                  {site.region} · {site.deviceIds.length} devices
                </p>
              </div>
              <StatusBadge tone={site.gatewayStatus} />
            </Link>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}

import Link from 'next/link';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { getOrganizations } from '@/server/repositories/organizations';
import { getSites } from '@/server/repositories/sites';
import { requireUser } from '@/lib/auth';
import { formatSiteActivity } from '@/lib/site-activity';
import { SiteOperatingActivityIcon } from '@/components/site-operating-activity';
import { deriveSiteOperatingActivity } from '@/lib/site-operating-activity';

export default async function SitesPage() {
  const user = await requireUser();
  const [organizations, sites] = await Promise.all([getOrganizations(user), getSites(user)]);
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
                <p className="site-last-active">
                  Last active {formatSiteActivity(site.lastActiveAt, site.timezone)}
                </p>
              </div>
              <div className="site-card-indicators">
                <SiteOperatingActivityIcon activity={site.operatingActivity ?? deriveSiteOperatingActivity({})} />
                <StatusBadge tone={site.gatewayStatus} label={`Gateway ${site.gatewayStatus}`} />
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}

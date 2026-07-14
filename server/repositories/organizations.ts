import { db } from '@/lib/db';
import { organizations } from '@/lib/mock-data';
import type { Organization } from '@/types/domain';
import { shouldUseDatabase } from './shared';

export async function getOrganizations(): Promise<Organization[]> {
  if (!shouldUseDatabase()) return organizations;

  const rows = await db.organization.findMany({
    include: { sites: { select: { id: true } } },
    orderBy: { name: 'asc' }
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    siteIds: row.sites.map((site) => site.id)
  }));
}

import { db } from '@/lib/db';
import { organizations } from '@/lib/mock-data';
import type { Organization } from '@/types/domain';
import { shouldUseDatabase } from './shared';
import { isStaffScope, organizationWhere, type AccessScope } from '@/lib/access';

export async function getOrganizations(scope: AccessScope): Promise<Organization[]> {
  if (!shouldUseDatabase()) {
    return isStaffScope(scope) ? organizations : organizations.filter((row) => scope.organizationIds.includes(row.id));
  }

  const rows = await db.organization.findMany({
    where: organizationWhere(scope),
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

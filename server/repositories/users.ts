import { db } from '@/lib/db';
import { users } from '@/lib/mock-data';
import type { AppUser } from '@/types/domain';
import { shouldUseDatabase } from './shared';

export async function getUsers(): Promise<AppUser[]> {
  if (!shouldUseDatabase()) return users;

  const rows = await db.user.findMany({
    include: { memberships: true },
    orderBy: { name: 'asc' }
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    organizationIds: row.memberships.map((membership) => membership.organizationId)
  }));
}

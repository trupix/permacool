import { db } from '@/lib/db';
import { users } from '@/lib/mock-data';
import type { AppUser } from '@/types/domain';
import { shouldUseDatabase } from './shared';
import { type AccessScope } from '@/lib/access';
import { userRoleForMembership } from '@/lib/workspace-access';

export async function getUsers(scope: AccessScope): Promise<AppUser[]> {
  if (scope.platformRole !== 'staff_admin') throw new Error('Forbidden');
  if (!shouldUseDatabase()) return users;

  const rows = await db.user.findMany({
    include: { memberships: true, deviceAccess: true },
    orderBy: { name: 'asc' }
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    platformRole: row.platformRole,
    status: row.status,
    companyName: row.companyName ?? undefined,
    accessNote: row.accessNote ?? undefined,
    organizationIds: row.memberships.map((membership) => membership.organizationId),
    organizationRoles: Object.fromEntries(
      row.memberships.map((membership) => [
        membership.organizationId,
        userRoleForMembership(membership.role)
      ])
    ),
    allDeviceOrganizationIds: row.memberships
      .filter((membership) => membership.allDevices)
      .map((membership) => membership.organizationId),
    deviceIds: row.deviceAccess.map((assignment) => assignment.deviceId)
  }));
}

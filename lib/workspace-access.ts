import type { AppUser } from '@/types/domain';

export const PERMACOOL_OPERATOR_ORGANIZATION_ID = 'org-permacool';

export function isPlatformStaff(user: AppUser) {
  return user.platformRole === 'staff_admin' || user.platformRole === 'staff_support';
}

export function canAccessProvisioning(user: AppUser) {
  if (isPlatformStaff(user)) return true;

  return (
    user.platformRole === 'customer' &&
    user.role !== 'viewer' &&
    user.organizationIds.length > 0
  );
}

export function canManageLogicDefinitions(user: AppUser) {
  if (isPlatformStaff(user)) return true;

  return (
    user.platformRole === 'customer' &&
    user.role === 'owner' &&
    user.organizationIds.includes(PERMACOOL_OPERATOR_ORGANIZATION_ID)
  );
}

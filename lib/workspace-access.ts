import type { AppUser, MembershipRole, UserRole } from '@/types/domain';

export const PERMACOOL_OPERATOR_ORGANIZATION_ID = 'org-permacool';

export function userRoleForMembership(role: MembershipRole): UserRole {
  return role === 'customer_admin' ? 'owner' : role;
}

export function isPlatformStaff(user: AppUser) {
  return user.platformRole === 'staff_admin' || user.platformRole === 'staff_support';
}

export function roleForOrganization(user: AppUser, organizationId: string): UserRole | undefined {
  return isPlatformStaff(user) ? user.role : user.organizationRoles[organizationId];
}

export function canAccessProvisioning(user: AppUser) {
  if (isPlatformStaff(user)) return true;

  return (
    user.platformRole === 'customer' &&
    user.organizationIds.some((organizationId) => {
      const role = roleForOrganization(user, organizationId);
      return role === 'owner' || role === 'operator';
    })
  );
}

export function canManageLogicDefinitions(user: AppUser) {
  if (isPlatformStaff(user)) return true;

  return (
    user.platformRole === 'customer' &&
    roleForOrganization(user, PERMACOOL_OPERATOR_ORGANIZATION_ID) === 'owner'
  );
}

export function canManageSiteEquipment(user: AppUser, organizationId: string) {
  const role = roleForOrganization(user, organizationId);
  return role === 'owner' || role === 'operator';
}

export function canIssueVpnProfile(user: AppUser, organizationId: string) {
  return roleForOrganization(user, organizationId) === 'owner';
}

import type { Prisma } from '@prisma/client';
import type { AppUser } from '@/types/domain';

export type AccessScope = AppUser;

export function isStaffScope(scope: AccessScope) {
  return scope.platformRole === 'staff_admin' || scope.platformRole === 'staff_support';
}

export function organizationWhere(scope: AccessScope): Prisma.OrganizationWhereInput {
  return isStaffScope(scope) ? {} : { id: { in: scope.organizationIds } };
}

export function deviceWhere(scope: AccessScope): Prisma.DeviceWhereInput {
  if (isStaffScope(scope)) return {};

  return {
    OR: [
      { site: { organizationId: { in: scope.allDeviceOrganizationIds } } },
      { id: { in: scope.deviceIds } }
    ]
  };
}

export function siteWhere(scope: AccessScope): Prisma.SiteWhereInput {
  if (isStaffScope(scope)) return {};

  return {
    OR: [
      { organizationId: { in: scope.allDeviceOrganizationIds } },
      { devices: { some: { id: { in: scope.deviceIds } } } }
    ]
  };
}

export function alertWhere(scope: AccessScope): Prisma.AlertWhereInput {
  return isStaffScope(scope) ? {} : { device: deviceWhere(scope) };
}

export function canAccessOrganization(scope: AccessScope, organizationId: string) {
  return isStaffScope(scope) || scope.organizationIds.includes(organizationId);
}

export function canAccessDevice(scope: AccessScope, deviceId: string, organizationId: string) {
  return (
    isStaffScope(scope) ||
    scope.allDeviceOrganizationIds.includes(organizationId) ||
    scope.deviceIds.includes(deviceId)
  );
}

import type { AppUser } from '@/types/domain';

export type ScopedProvisioningSite = {
  id: string;
  organizationId: string;
};

export type ScopedProvisioningDevice = {
  id: string;
  siteId: string;
};

export function canAccessProvisioningSite(user: AppUser, site: ScopedProvisioningSite) {
  return (
    user.platformRole === 'staff_admin' ||
    user.platformRole === 'staff_support' ||
    user.allDeviceOrganizationIds.includes(site.organizationId)
  );
}

export function scopeProvisioningFallback<
  TSite extends ScopedProvisioningSite,
  TDevice extends ScopedProvisioningDevice
>(user: AppUser, sites: TSite[], devices: TDevice[]) {
  const visibleSites = sites.filter((site) =>
    canAccessProvisioningSite(user, site) ||
    devices.some((device) => device.siteId === site.id && user.deviceIds.includes(device.id))
  );
  const visibleSiteIds = new Set(visibleSites.map((site) => site.id));
  const visibleOrganizationIds = new Set(
    visibleSites
      .filter((site) => canAccessProvisioningSite(user, site))
      .map((site) => site.organizationId)
  );
  const staff = user.platformRole === 'staff_admin' || user.platformRole === 'staff_support';
  return {
    sites: visibleSites,
    devices: devices.filter((device) => {
      if (!visibleSiteIds.has(device.siteId)) return false;
      const site = visibleSites.find((candidate) => candidate.id === device.siteId);
      return (
        staff ||
        (site ? visibleOrganizationIds.has(site.organizationId) : false) ||
        user.deviceIds.includes(device.id)
      );
    })
  };
}

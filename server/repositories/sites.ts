import { db } from '@/lib/db';
import { getAlertsForSite, getDevicesForSite, getSiteById, sites } from '@/lib/mock-data';
import type { Alert, Site } from '@/types/domain';
import { shouldUseDatabase } from './shared';
import { alertWhere, deviceWhere, isStaffScope, siteWhere, type AccessScope } from '@/lib/access';

function filterMockSites(scope: AccessScope) {
  if (isStaffScope(scope)) return sites;
  return sites.filter((site) =>
    scope.allDeviceOrganizationIds.includes(site.organizationId) ||
    getDevicesForSite(site.id).some((device) => scope.deviceIds.includes(device.id))
  );
}

export async function getSites(scope: AccessScope): Promise<Site[]> {
  if (!shouldUseDatabase()) return filterMockSites(scope);

  const rows = await db.site.findMany({
    where: siteWhere(scope),
    include: { devices: { select: { id: true } } },
    orderBy: { name: 'asc' }
  });

  return rows.map((row) => ({
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    region: row.region,
    timezone: row.timezone,
    gatewayStatus: row.gatewayStatus,
    deviceIds: row.devices.map((device) => device.id)
  }));
}

export async function getSite(scope: AccessScope, siteId: string): Promise<Site | undefined> {
  if (!shouldUseDatabase()) return filterMockSites(scope).find((site) => site.id === siteId);

  const row = await db.site.findFirst({
    where: { AND: [{ id: siteId }, siteWhere(scope)] },
    include: { devices: { select: { id: true } } }
  });

  if (!row) return undefined;

  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    region: row.region,
    timezone: row.timezone,
    gatewayStatus: row.gatewayStatus,
    deviceIds: row.devices.map((device) => device.id)
  };
}

export async function getSiteAlerts(scope: AccessScope, siteId: string): Promise<Alert[]> {
  if (!shouldUseDatabase()) {
    const allowedDeviceIds = isStaffScope(scope)
      ? undefined
      : new Set(getDevicesForSite(siteId).filter((device) => scope.allDeviceOrganizationIds.includes(
          sites.find((site) => site.id === siteId)?.organizationId ?? ''
        ) || scope.deviceIds.includes(device.id)).map((device) => device.id));
    return getAlertsForSite(siteId).filter((alert) => !allowedDeviceIds || allowedDeviceIds.has(alert.deviceId));
  }

  const rows = await db.alert.findMany({
    where: { AND: [{ siteId }, alertWhere(scope)] },
    orderBy: { startedAt: 'desc' }
  });

  return rows.map((row) => ({
    id: row.id,
    siteId: row.siteId,
    deviceId: row.deviceId,
    severity: row.severity,
    status: row.status,
    message: row.message,
    startedAt: row.startedAt.toISOString()
  }));
}

export async function getSiteIds(scope: AccessScope): Promise<string[]> {
  if (!shouldUseDatabase()) return filterMockSites(scope).map((site) => site.id);
  const rows = await db.site.findMany({ where: siteWhere(scope), select: { id: true } });
  return rows.map((row) => row.id);
}

export async function getSiteDeviceCount(scope: AccessScope, siteId: string): Promise<number> {
  if (!shouldUseDatabase()) {
    const organizationId = sites.find((site) => site.id === siteId)?.organizationId ?? '';
    return getDevicesForSite(siteId).filter((device) => isStaffScope(scope) ||
      scope.allDeviceOrganizationIds.includes(organizationId) || scope.deviceIds.includes(device.id)).length;
  }
  return db.device.count({ where: { AND: [{ siteId }, deviceWhere(scope)] } });
}

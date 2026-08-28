import { db } from '@/lib/db';
import {
  getAlertsForSite,
  getDevicesForSite,
  getEquipmentEventsForSite,
  getSiteById,
  getTelemetryForDevice,
  sites
} from '@/lib/mock-data';
import type { Alert, Site } from '@/types/domain';
import { latestSiteActivity } from '@/lib/site-activity';
import {
  deriveSiteOperatingActivity,
  isEquipmentRunKey,
  latestOperatingTimestamp,
  RUNNING_NOW_FRESHNESS_MS
} from '@/lib/site-operating-activity';
import { shouldUseDatabase } from './shared';
import { alertWhere, deviceWhere, isStaffScope, siteWhere, type AccessScope } from '@/lib/access';

function filterMockSites(scope: AccessScope) {
  const filtered = isStaffScope(scope) ? sites : sites.filter((site) =>
    scope.allDeviceOrganizationIds.includes(site.organizationId) ||
    getDevicesForSite(site.id).some((device) => scope.deviceIds.includes(device.id))
  );
  return filtered.map((site) => {
    const runPoints = getDevicesForSite(site.id)
      .flatMap((device) => getTelemetryForDevice(device.id))
      .filter((point) => isEquipmentRunKey(point.key) && point.latestValue > 0.5);
    const freshRunningSignalAt = latestOperatingTimestamp(
      runPoints
        .filter((point) => Date.now() - Date.parse(point.latestTimestamp) <= RUNNING_NOW_FRESHNESS_MS)
        .map((point) => point.latestTimestamp)
    );
    const lastStartedAt = latestOperatingTimestamp([
      ...runPoints.map((point) => point.latestTimestamp),
      ...getEquipmentEventsForSite(site.id)
        .filter((event) => event.eventType === 'compressor_started')
        .map((event) => event.occurredAt)
    ]);

    return {
      ...site,
      lastActiveAt: latestSiteActivity(getDevicesForSite(site.id).map((device) => device.lastSeenAt)),
      operatingActivity: deriveSiteOperatingActivity({ freshRunningSignalAt, lastRanAt: lastStartedAt })
    };
  });
}

export async function getSites(scope: AccessScope): Promise<Site[]> {
  if (!shouldUseDatabase()) return filterMockSites(scope);

  const rows = await db.site.findMany({
    where: siteWhere(scope),
    include: {
      provisioningDetails: true,
      devices: {
        select: {
          id: true,
          lastSeenAt: true,
          telemetryPoints: { select: { key: true, latestValue: true, latestTimestamp: true } }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  const deviceToSite = new Map(rows.flatMap((row) => row.devices.map((device) => [device.id, row.id] as const)));
  const deviceIds = [...deviceToSite.keys()];
  const historicalRuns = deviceIds.length
    ? await db.telemetrySample.groupBy({
        by: ['deviceId', 'key'],
        where: {
          deviceId: { in: deviceIds },
          value: { gt: 0.5 },
          OR: [
            { key: { contains: 'chiller', mode: 'insensitive' } },
            { key: { contains: 'compressor', mode: 'insensitive' } }
          ]
        },
        _max: { capturedAt: true }
      })
    : [];
  const historicalRunsBySite = new Map<string, Date[]>();
  for (const run of historicalRuns) {
    if (!isEquipmentRunKey(run.key) || !run._max.capturedAt) continue;
    const siteId = deviceToSite.get(run.deviceId);
    if (!siteId) continue;
    historicalRunsBySite.set(siteId, [...(historicalRunsBySite.get(siteId) ?? []), run._max.capturedAt]);
  }

  return rows.map((row) => {
    const runPoints = row.devices
      .flatMap((device) => device.telemetryPoints)
      .filter((point) => isEquipmentRunKey(point.key) && point.latestValue > 0.5);
    const freshRunningSignalAt = latestOperatingTimestamp(
      runPoints
        .filter((point) => Date.now() - point.latestTimestamp.getTime() <= RUNNING_NOW_FRESHNESS_MS)
        .map((point) => point.latestTimestamp)
    );
    const lastRanAt = latestOperatingTimestamp([
      ...runPoints.map((point) => point.latestTimestamp),
      ...(historicalRunsBySite.get(row.id) ?? [])
    ]);

    return {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      region: row.region,
      timezone: row.timezone,
      gatewayStatus: row.gatewayStatus,
      deviceIds: row.devices.map((device) => device.id),
      lastActiveAt: latestSiteActivity(row.devices.map((device) => device.lastSeenAt)),
      operatingActivity: deriveSiteOperatingActivity({ freshRunningSignalAt, lastRanAt }),
      addressLine1: row.provisioningDetails?.addressLine1 ?? null,
      city: row.provisioningDetails?.city ?? null,
      state: row.provisioningDetails?.state ?? null,
      postalCode: row.provisioningDetails?.postalCode ?? null,
      country: row.provisioningDetails?.country ?? null
    };
  });
}

export async function getSite(scope: AccessScope, siteId: string): Promise<Site | undefined> {
  if (!shouldUseDatabase()) return filterMockSites(scope).find((site) => site.id === siteId);

  const row = await db.site.findFirst({
    where: { AND: [{ id: siteId }, siteWhere(scope)] },
    include: {
      provisioningDetails: true,
      devices: { select: { id: true, lastSeenAt: true } }
    }
  });

  if (!row) return undefined;

  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    region: row.region,
    timezone: row.timezone,
    gatewayStatus: row.gatewayStatus,
    deviceIds: row.devices.map((device) => device.id),
    lastActiveAt: latestSiteActivity(row.devices.map((device) => device.lastSeenAt)),
    addressLine1: row.provisioningDetails?.addressLine1 ?? null,
    city: row.provisioningDetails?.city ?? null,
    state: row.provisioningDetails?.state ?? null,
    postalCode: row.provisioningDetails?.postalCode ?? null,
    country: row.provisioningDetails?.country ?? null
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

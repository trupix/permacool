import { db } from '@/lib/db';
import { getAlertsForSite, getDevicesForSite, getSiteById, sites } from '@/lib/mock-data';
import type { Alert, Site } from '@/types/domain';
import { shouldUseDatabase } from './shared';

export async function getSites(): Promise<Site[]> {
  if (!shouldUseDatabase()) return sites;

  const rows = await db.site.findMany({
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

export async function getSite(siteId: string): Promise<Site | undefined> {
  if (!shouldUseDatabase()) return getSiteById(siteId);

  const row = await db.site.findUnique({
    where: { id: siteId },
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

export async function getSiteAlerts(siteId: string): Promise<Alert[]> {
  if (!shouldUseDatabase()) return getAlertsForSite(siteId);

  const rows = await db.alert.findMany({
    where: { siteId },
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

export async function getSiteIds(): Promise<string[]> {
  if (!shouldUseDatabase()) return sites.map((site) => site.id);
  const rows = await db.site.findMany({ select: { id: true } });
  return rows.map((row) => row.id);
}

export async function getSiteDeviceCount(siteId: string): Promise<number> {
  if (!shouldUseDatabase()) return getDevicesForSite(siteId).length;
  return db.device.count({ where: { siteId } });
}

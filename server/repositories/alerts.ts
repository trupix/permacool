import { db } from '@/lib/db';
import { alerts } from '@/lib/mock-data';
import type { Alert } from '@/types/domain';
import { shouldUseDatabase } from './shared';
import { alertWhere, isStaffScope, type AccessScope } from '@/lib/access';
import { devices, sites } from '@/lib/mock-data';

export async function getAlerts(scope: AccessScope, limit?: number): Promise<Alert[]> {
  if (!shouldUseDatabase()) {
    const scopedAlerts = isStaffScope(scope) ? alerts : alerts.filter((alert) => {
      const device = devices.find((row) => row.id === alert.deviceId);
      const site = sites.find((row) => row.id === device?.siteId);
      return Boolean(device && site && (scope.allDeviceOrganizationIds.includes(site.organizationId) || scope.deviceIds.includes(device.id)));
    });
    return limit === undefined ? scopedAlerts : [...scopedAlerts]
      .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt)).slice(0, limit);
  }
  const rows = await db.alert.findMany({ where: alertWhere(scope), orderBy: { startedAt: 'desc' }, take: limit });
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

export async function getOpenAlertCount(scope: AccessScope): Promise<number> {
  if (!shouldUseDatabase()) return (await getAlerts(scope)).filter((alert) => alert.status === 'open').length;
  return db.alert.count({ where: { AND: [{ status: 'open' }, alertWhere(scope)] } });
}

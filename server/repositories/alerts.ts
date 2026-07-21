import { db } from '@/lib/db';
import { alerts } from '@/lib/mock-data';
import type { Alert } from '@/types/domain';
import { shouldUseDatabase } from './shared';
import { alertWhere, isStaffScope, type AccessScope } from '@/lib/access';
import { devices, sites } from '@/lib/mock-data';

export async function getAlerts(scope: AccessScope): Promise<Alert[]> {
  if (!shouldUseDatabase()) {
    if (isStaffScope(scope)) return alerts;
    return alerts.filter((alert) => {
      const device = devices.find((row) => row.id === alert.deviceId);
      const site = sites.find((row) => row.id === device?.siteId);
      return Boolean(device && site && (scope.allDeviceOrganizationIds.includes(site.organizationId) || scope.deviceIds.includes(device.id)));
    });
  }
  const rows = await db.alert.findMany({ where: alertWhere(scope), orderBy: { startedAt: 'desc' } });
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

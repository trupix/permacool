import { db } from '@/lib/db';
import { dashboardSummary } from '@/lib/mock-data';
import { shouldUseDatabase } from './shared';
import { alertWhere, deviceWhere, isStaffScope, siteWhere, type AccessScope } from '@/lib/access';
import { getAlerts } from './alerts';
import { getDevices } from './devices';
import { getSites } from './sites';

export async function getOverviewMetrics(scope: AccessScope) {
  if (!shouldUseDatabase()) {
    if (isStaffScope(scope)) return dashboardSummary;
    const [scopedSites, scopedDevices, scopedAlerts] = await Promise.all([
      getSites(scope), getDevices(scope), getAlerts(scope)
    ]);
    return {
      totalSites: scopedSites.length,
      onlineDevices: scopedDevices.filter((device) => device.status === 'online').length,
      openAlerts: scopedAlerts.filter((alert) => alert.status === 'open').length,
      degradedSites: scopedSites.filter((site) => site.gatewayStatus !== 'online').length
    };
  }

  const [totalSites, onlineDevices, openAlerts, degradedSites] = await Promise.all([
    db.site.count({ where: siteWhere(scope) }),
    db.device.count({ where: { AND: [{ status: 'online' }, deviceWhere(scope)] } }),
    db.alert.count({ where: { AND: [{ status: 'open' }, alertWhere(scope)] } }),
    db.site.count({ where: { AND: [{ gatewayStatus: { not: 'online' } }, siteWhere(scope)] } })
  ]);

  return {
    totalSites,
    onlineDevices,
    openAlerts,
    degradedSites
  };
}

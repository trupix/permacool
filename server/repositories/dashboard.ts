import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import { alertWhere, siteWhere, type AccessScope } from '@/lib/access';
import { sites as mockSites } from '@/lib/mock-data';
import { getDevices } from './devices';
import { getAlerts } from './alerts';
import { shouldUseDatabase } from './shared';

// Only stored database state is read. Never poll controllers or scan sample history.
const readSnapshot = unstable_cache(async (scope: AccessScope, window: number) => {
  const [devices, sites, alerts, openAlerts] = await Promise.all([
    getDevices(scope),
    shouldUseDatabase() ? db.site.findMany({ where: siteWhere(scope),
      select: { id: true, name: true, region: true, gatewayStatus: true }, orderBy: { name: 'asc' } }) : Promise.resolve(mockSites),
    shouldUseDatabase() ? db.alert.findMany({ where: alertWhere(scope), orderBy: { startedAt: 'desc' }, take: 10 }) : getAlerts(scope),
    shouldUseDatabase() ? db.alert.count({ where: { AND: [alertWhere(scope), { status: 'open' }] } }) : Promise.resolve(0)
  ]);
  const capturedAt = Date.now();
  const fresh = (value: string) => Number.isFinite(Date.parse(value)) && capturedAt - Date.parse(value) <= 300000;
  const deviceRows = devices.map(d => ({ ...d, status: fresh(d.lastSeenAt) ? 'online' as const : 'offline' as const }));
  const allowedSites = new Set(devices.map(d => d.siteId));
  const siteRows = sites.filter(s => shouldUseDatabase() || allowedSites.has(s.id)).map(s => ({ ...s,
    gatewayStatus: deviceRows.some(d => d.siteId === s.id && d.status === 'online') ? 'online' as const : 'offline' as const }));
  return { devices: deviceRows, sites: siteRows, alerts, capturedAt,
    nextRefreshAt: (window + 1) * 600000,
    dashboardSummary: { totalSites: siteRows.length, onlineDevices: deviceRows.filter(d => d.status === 'online').length,
      openAlerts, degradedSites: siteRows.filter(s => s.gatewayStatus !== 'online').length } };
}, ['dashboard-stored-snapshot-v1'], { revalidate: 600 });

export function getDashboardSnapshot(scope: AccessScope) {
  // Permissions are part of the cache key: never reuse another account's view.
  return readSnapshot(scope, Math.floor(Date.now() / 600000));
}

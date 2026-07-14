import { db } from '@/lib/db';
import { dashboardSummary } from '@/lib/mock-data';
import { shouldUseDatabase } from './shared';

export async function getOverviewMetrics() {
  if (!shouldUseDatabase()) {
    return dashboardSummary;
  }

  const [totalSites, onlineDevices, openAlerts, degradedSites] = await Promise.all([
    db.site.count(),
    db.device.count({ where: { status: 'online' } }),
    db.alert.count({ where: { status: 'open' } }),
    db.site.count({ where: { gatewayStatus: { not: 'online' } } })
  ]);

  return {
    totalSites,
    onlineDevices,
    openAlerts,
    degradedSites
  };
}

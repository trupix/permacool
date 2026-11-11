import { db } from '@/lib/db';
import { deviceWhere, siteWhere, type AccessScope } from '@/lib/access';
import { deriveSiteOperatingActivity, latestOperatingTimestamp, RUNNING_NOW_FRESHNESS_MS } from '@/lib/site-operating-activity';
import { latestSiteActivity } from '@/lib/site-activity';

export async function getSavedSiteDisplay(scope: AccessScope) {
  const rows = await db.site.findMany({ where: siteWhere(scope), orderBy: { name: 'asc' },
    select: { id: true, name: true, region: true, timezone: true,
      devices: { where: deviceWhere(scope), select: { id: true, displaySnapshot: true } } } });
  const snapshots = rows.flatMap(s => s.devices.flatMap(d => d.displaySnapshot?.capturedAt ? [d.displaySnapshot] : []));
  const capturedAt = snapshots.length ? Math.min(...snapshots.map(s => s.capturedAt!.getTime())) : null;
  return { capturedAt, sites: rows.map(site => {
    const saved = site.devices.flatMap(d => d.displaySnapshot ? [d.displaySnapshot] : []);
    const at = saved.find(s => s.capturedAt)?.capturedAt ?? new Date();
    const lastActiveAt = latestSiteActivity(saved.map(s => s.lastSeenAt));
    const age = lastActiveAt ? at.getTime() - Date.parse(lastActiveAt) : Infinity;
    return { ...site, deviceIds: site.devices.map(d => d.id), lastActiveAt,
      gatewayStatus: age >= -RUNNING_NOW_FRESHNESS_MS && age <= RUNNING_NOW_FRESHNESS_MS ? 'online' as const : 'offline' as const,
      operatingActivity: deriveSiteOperatingActivity({ now: at,
        freshRunningSignalAt: latestOperatingTimestamp(saved.map(s => s.runningSignalAt)),
        lastRanAt: latestOperatingTimestamp(saved.map(s => s.lastRanAt)) }) };
  }) };
}

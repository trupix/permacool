import { db } from '@/lib/db';
import { alerts } from '@/lib/mock-data';
import type { Alert } from '@/types/domain';
import { shouldUseDatabase } from './shared';

export async function getAlerts(): Promise<Alert[]> {
  if (!shouldUseDatabase()) return alerts;
  const rows = await db.alert.findMany({ orderBy: { startedAt: 'desc' } });
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

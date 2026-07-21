import { db } from '@/lib/db';
import { auditLog } from '@/lib/mock-data';
import type { AuditLogEntry } from '@/types/domain';
import { shouldUseDatabase } from './shared';
import { isStaffScope, type AccessScope } from '@/lib/access';

export async function getAuditLogEntries(scope: AccessScope): Promise<AuditLogEntry[]> {
  if (!isStaffScope(scope)) throw new Error('Forbidden');
  if (!shouldUseDatabase()) return auditLog;

  const rows = await db.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: 'desc' }
  });

  return rows.map((row) => ({
    id: row.id,
    actorName: row.actor.name,
    action: row.action,
    entityType: row.entityType as AuditLogEntry['entityType'],
    entityLabel: row.entityId,
    createdAt: row.createdAt.toISOString()
  }));
}

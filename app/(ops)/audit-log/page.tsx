import { SectionCard } from '@/components/section-card';
import { getAuditLogEntries } from '@/server/repositories/audit-log';
import { requireStaff } from '@/lib/auth';

export default async function AuditLogPage() {
  const staff = await requireStaff();
  const auditLog = await getAuditLogEntries(staff);
  return (
    <main className="page-stack">
      <header>
        <p className="eyebrow">Audit log</p>
        <h1>Tracked admin actions</h1>
      </header>

      <SectionCard title="Recent activity" eyebrow="Writes must be traceable">
        <div className="list-stack">
          {auditLog.map((entry) => (
            <div key={entry.id} className="list-row list-row-start">
              <div>
                <strong>{entry.action}</strong>
                <p>
                  {entry.actorName} · {entry.entityType} · {entry.entityLabel}
                </p>
              </div>
              <span className="timestamp">{entry.createdAt}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}

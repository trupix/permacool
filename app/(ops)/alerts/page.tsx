import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { getAlerts } from '@/server/repositories/alerts';

export default async function AlertsPage() {
  const alerts = await getAlerts();
  return (
    <main className="page-stack">
      <header>
        <p className="eyebrow">Alerts</p>
        <h1>Alarm and alert feed</h1>
      </header>

      <SectionCard title="Current feed" eyebrow="Review queue">
        <div className="list-stack">
          {alerts.map((alert) => (
            <div key={alert.id} className="list-row list-row-start">
              <div>
                <strong>{alert.message}</strong>
                <p>
                  {alert.siteId} · {alert.deviceId}
                </p>
              </div>
              <div className="badge-group">
                <StatusBadge tone={alert.severity} />
                <StatusBadge tone={alert.status} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}

import type { AlertSeverity, AlertStatus, DeviceStatus } from '@/types/domain';

type StatusTone = DeviceStatus | AlertSeverity | AlertStatus;

export function StatusBadge({ tone, label }: { tone: StatusTone; label?: string }) {
  return (
    <span className={`status-badge status-${tone}`}>
      <i aria-hidden="true" />
      {label ?? tone}
    </span>
  );
}

export function telemetryFreshness(value: string | null | undefined, now = Date.now()) {
  const timestamp = value ? Date.parse(value) : NaN;
  if (!Number.isFinite(timestamp)) return { tone: 'offline' as const, label: 'No telemetry' };
  if (timestamp > now + 5 * 60_000) return { tone: 'degraded' as const, label: 'Timestamp unverified' };
  return now - timestamp <= 5 * 60_000
    ? { tone: 'online' as const, label: 'Telemetry current' }
    : { tone: 'degraded' as const, label: 'Telemetry stale' };
}

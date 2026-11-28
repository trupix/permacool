type ActivityValue = Date | string | null | undefined;

// Website receipt freshness, not VPN reachability or mechanical operating state.
export function telemetryReceiptStatus(value: ActivityValue, now = Date.now()): 'online' | 'offline' {
  const time = value instanceof Date ? value.getTime() : value ? Date.parse(value) : NaN;
  const age = now - time;
  return Math.abs(age) <= 5 * 60_000 ? 'online' : 'offline';
}

export function latestSiteActivity(values: ActivityValue[]): string | null {
  const latest = values.reduce<number | null>((current, value) => {
    if (!value) return current;
    const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
    if (!Number.isFinite(timestamp)) return current;
    return current === null || timestamp > current ? timestamp : current;
  }, null);

  return latest === null ? null : new Date(latest).toISOString();
}

export function formatSiteActivity(value: string | null | undefined, timeZone: string): string {
  if (!value) return 'Never';
  const timestamp = new Date(value);
  if (!Number.isFinite(timestamp.getTime())) return 'Never';

  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(timestamp);
}

type ActivityValue = Date | string | null | undefined;

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

export type SiteOperatingActivityState =
  | 'running_now'
  | 'ran_within_12h'
  | 'idle_12_to_24h'
  | 'idle_over_24h'
  | 'never_observed';

export type SiteOperatingActivity = {
  state: SiteOperatingActivityState;
  lastRanAt: string | null;
};

type ActivityValue = Date | string | null | undefined;

export const RUNNING_NOW_FRESHNESS_MS = 5 * 60 * 1000;
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function validTimestamp(value: ActivityValue): number | null {
  if (!value) return null;
  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function isEquipmentRunKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  return (
    normalized === 'compressorstatus' ||
    /^(?:ch\d+)?(?:chiller|compressor)run(?:output)?$/.test(normalized) ||
    /^(?:ch\d+)?do(?:chiller|compressor)run$/.test(normalized)
  );
}

export function latestOperatingTimestamp(values: ActivityValue[]): string | null {
  const latest = values.reduce<number | null>((current, value) => {
    const timestamp = validTimestamp(value);
    if (timestamp === null) return current;
    return current === null || timestamp > current ? timestamp : current;
  }, null);
  return latest === null ? null : new Date(latest).toISOString();
}

export function deriveSiteOperatingActivity(input: {
  now?: Date;
  freshRunningSignalAt?: ActivityValue;
  lastRanAt?: ActivityValue;
}): SiteOperatingActivity {
  const now = (input.now ?? new Date()).getTime();
  const runningAt = validTimestamp(input.freshRunningSignalAt);
  const lastRanAt = latestOperatingTimestamp([input.freshRunningSignalAt, input.lastRanAt]);

  if (runningAt !== null && now - runningAt <= RUNNING_NOW_FRESHNESS_MS && runningAt <= now + RUNNING_NOW_FRESHNESS_MS) {
    return { state: 'running_now', lastRanAt };
  }
  const lastRanTimestamp = validTimestamp(lastRanAt);
  if (lastRanTimestamp === null) return { state: 'never_observed', lastRanAt: null };
  const age = Math.max(0, now - lastRanTimestamp);
  if (age < TWELVE_HOURS_MS) return { state: 'ran_within_12h', lastRanAt };
  if (age < TWENTY_FOUR_HOURS_MS) return { state: 'idle_12_to_24h', lastRanAt };
  return { state: 'idle_over_24h', lastRanAt };
}

export const SITE_OPERATING_ACTIVITY_LABELS: Record<SiteOperatingActivityState, string> = {
  running_now: 'Running now',
  ran_within_12h: 'Ran within 12h',
  idle_12_to_24h: 'Idle 12–24h',
  idle_over_24h: 'Idle over 24h',
  never_observed: 'No run recorded'
};

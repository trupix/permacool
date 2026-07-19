export type TelemetryPointIdentity = {
  deviceId: string;
  key: string;
  latestTimestamp: string;
};

export function normalizeTelemetryKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function resolveTelemetryPoint<T extends TelemetryPointIdentity>(
  points: T[],
  aliases: string[]
): { point?: T; ambiguous: boolean } {
  const normalizedAliases = new Set(aliases.map(normalizeTelemetryKey));
  const matches = points.filter((point) => normalizedAliases.has(normalizeTelemetryKey(point.key)));

  if (!matches.length) return { point: undefined, ambiguous: false };

  const matchedDeviceIds = new Set(matches.map((point) => point.deviceId));
  if (matchedDeviceIds.size > 1) return { point: undefined, ambiguous: true };

  const newestPoint = [...matches].sort(
    (left, right) => Date.parse(right.latestTimestamp) - Date.parse(left.latestTimestamp)
  )[0];

  return { point: newestPoint, ambiguous: false };
}

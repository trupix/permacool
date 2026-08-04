export type TelemetryPointIdentity = {
  deviceId: string;
  key: string;
  latestTimestamp: string;
};

const FAST_TELEMETRY_KEY_PATTERN =
  /^ch[1-5](?:ai)?(temperature[fc]?|highpressure(psi)?|highsidepressure|lowpressure(psi)?|lowsidepressure|compressoramps|pumpamps|amps)$/;

function normalizeTelemetryKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function isFastTelemetryKey(key: string): boolean {
  return FAST_TELEMETRY_KEY_PATTERN.test(normalizeTelemetryKey(key));
}

export function mergeTelemetryPoints<T extends TelemetryPointIdentity>(
  current: T[],
  incoming: T[]
): T[] {
  const merged = new Map(
    current.map((point) => [
      `${point.deviceId}:${normalizeTelemetryKey(point.key)}`,
      point
    ])
  );

  for (const point of incoming) {
    const identity = `${point.deviceId}:${normalizeTelemetryKey(point.key)}`;
    const existing = merged.get(identity);
    const existingTimestamp = existing ? Date.parse(existing.latestTimestamp) : Number.NaN;
    const incomingTimestamp = Date.parse(point.latestTimestamp);

    if (
      !existing ||
      !Number.isFinite(existingTimestamp) ||
      (Number.isFinite(incomingTimestamp) && incomingTimestamp >= existingTimestamp)
    ) {
      merged.set(identity, point);
    }
  }

  return [...merged.values()];
}

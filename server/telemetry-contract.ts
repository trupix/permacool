import type { TelemetryIngestPayload } from '@/types/domain';

export function validateTelemetryPayload(payload: TelemetryIngestPayload) {
  if (!payload || typeof payload !== 'object') return false;

  const capturedAt = new Date(payload.capturedAt);

  return Boolean(
    payload.gatewayId &&
      payload.siteId &&
      payload.deviceId &&
      Number.isFinite(capturedAt.getTime()) &&
      Array.isArray(payload.points) &&
      payload.points.length > 0 &&
      payload.points.every(
        (point) => point && typeof point.key === 'string' && point.key.length > 0 && typeof point.value === 'number' && typeof point.unit === 'string'
      )
  );
}

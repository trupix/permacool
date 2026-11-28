import type { TelemetryIngestPayload } from '@/types/domain';

export function firstInvalidTelemetryPoint(points: TelemetryIngestPayload['points']) {
  return points.findIndex(point => !point || typeof point.key !== 'string' || !point.key.length ||
    typeof point.value !== 'number' || typeof point.unit !== 'string');
}

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
      firstInvalidTelemetryPoint(payload.points) === -1
  );
}

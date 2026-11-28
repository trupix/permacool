import { randomUUID } from 'node:crypto';
import type { DbStep } from './ingest-db-timing';
import type { TelemetryIngestPayload } from '@/types/domain';

const safeId = (v: unknown) => typeof v === 'string' && /^[A-Za-z0-9_.:-]{1,100}$/.test(v) ? v : null;
const time = (v: unknown) => {
  const n = typeof v === 'string' ? Date.parse(v) : NaN;
  return Number.isFinite(n) ? new Date(n).toISOString() : null;
};
export function makeUploadLog(input: unknown, requestStarted: number, batchId: string | null = null) {
  const p = (typeof input === 'object' && input ? input : {}) as Partial<TelemetryIngestPayload>;
  const siteId = safeId(p.siteId), deviceId = safeId(p.deviceId), capturedAt = time(p.capturedAt);
  const points = Array.isArray(p.points) ? p.points : [];
  const steps: DbStep[] = [];
  const attemptId = randomUUID();
  return { steps, finish(outcome: 'saved'|'partial'|'failed'|'rejected'|'not_saved', phase: string,
    {code,pointIndex,historyRowsInserted}: {code?: string | null; pointIndex?: number; historyRowsInserted?: number} = {}) {
    const failure = outcome !== 'saved';
    const keys = failure ? [...new Set(points.map(v => safeId(v?.key)).filter(k=>k !== null))] : [];
    const sum = (key: 'waitMs'|'heldMinMs'|'heldMaxMs') =>
      steps.some(s=>s[key]===null) ? null : Math.round(steps.reduce((n,s)=>n+(s[key] ?? 0),0)*10)/10;
    const record = {event:'telemetry.upload', v:1, outcome, phase, attemptId, batchId, siteId, deviceId, capturedAt,
      points:points.length, elapsedMs:Math.round((performance.now()-requestStarted)*10)/10,
      ...(historyRowsInserted === undefined ? {} : {historyRowsInserted, historyRowsAlreadySaved:points.length-historyRowsInserted}),
      waitMs:sum('waitMs'), heldMinMs:sum('heldMinMs'), heldMaxMs:sum('heldMaxMs'), db:steps,
      ...(code ? {code} : {}), ...(failure ? {readingKeys:keys.slice(0,64), extraKeys:Math.max(0,keys.length-64)} : {}),
      ...(pointIndex === undefined ? {} : {failedPointIndex:pointIndex, failedPointKey:safeId(points[pointIndex]?.key)})};
    (outcome === 'failed' ? console.error : failure ? console.warn : console.info)(JSON.stringify(record));
  }};
}

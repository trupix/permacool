import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { persistTelemetryPayload } from '@/server/telemetry-ingest';
import { firstInvalidTelemetryPoint, validateTelemetryPayload } from '@/server/telemetry-contract';
import type { TelemetryIngestPayload } from '@/types/domain';
import { dbErrorCode, initializeIngestTiming } from '@/server/ingest-db-timing';
import { makeUploadLog } from '@/server/ingest-upload-log';

initializeIngestTiming();

function telemetryTokenMatches(candidate: string | null) {
  if (!candidate || !env.telemetryIngestToken) return false;

  const candidateBytes = new TextEncoder().encode(candidate);
  const expectedBytes = new TextEncoder().encode(env.telemetryIngestToken);

  if (candidateBytes.length !== expectedBytes.length) return false;

  let difference = 0;
  for (let index = 0; index < candidateBytes.length; index += 1) {
    difference |= candidateBytes[index] ^ expectedBytes[index];
  }

  return difference === 0;
}

export async function POST(request: NextRequest) {
  const started = performance.now();
  if (!env.telemetryIngestToken) {
    return NextResponse.json({ ok: false, error: 'Telemetry ingest is not configured.' }, { status: 503 });
  }

  const token = request.headers.get('x-telemetry-token');

  if (!telemetryTokenMatches(token)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized ingest token.' }, { status: 401 });
  }

  let payload: TelemetryIngestPayload;

  try {
    payload = (await request.json()) as TelemetryIngestPayload;
  } catch {
    makeUploadLog(null, started).finish('rejected', 'invalid_json');
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!validateTelemetryPayload(payload)) {
    const i = Array.isArray(payload?.points) ? firstInvalidTelemetryPoint(payload.points) : -1;
    makeUploadLog(payload, started, false).finish('rejected', 'validation', null, i < 0 ? undefined : i);
    return NextResponse.json({ ok: false, error: 'Invalid telemetry payload.' }, { status: 400 });
  }

  const log = makeUploadLog(payload, started);
  let result: Awaited<ReturnType<typeof persistTelemetryPayload>>;
  try {
    result = await persistTelemetryPayload(payload, log.steps);
  } catch (error) {
    const lastStep = log.steps.at(-1);
    const phase = lastStep?.failed ? lastStep.phase : 'prepare';
    const code = dbErrorCode(error);
    // A transaction operation index identifies a batch statement, not a sensor.
    // Validation above can still identify a particular malformed input.
    log.finish('failed', phase, code);
    return NextResponse.json({ok:false, error:'Telemetry upload failed.'}, {status:500});
  }

  if ('reason' in result && result.reason === 'unknown-device') {
    log.finish('rejected', 'unknown_device');
    return NextResponse.json({ ok: false, error: 'Unknown device for site.' }, { status: 404 });
  }

  if (!result.persisted) log.finish('not_saved', 'database_not_configured');
  else if (!result.eventsPersisted) log.finish('partial', 'event_history');
  else log.finish('saved', 'complete');
  return NextResponse.json({
    ok: true,
    accepted: true,
    persisted: result.persisted,
    pointCount: result.pointCount,
    eventCount: 'eventCount' in result ? result.eventCount : 0,
    eventsPersisted: 'eventsPersisted' in result ? result.eventsPersisted : false
  });
}

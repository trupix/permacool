import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { persistTelemetryPayload } from '@/server/telemetry-ingest';
import { validateTelemetryPayload } from '@/server/telemetry-contract';
import type { TelemetryIngestPayload } from '@/types/domain';

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
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!validateTelemetryPayload(payload)) {
    return NextResponse.json({ ok: false, error: 'Invalid telemetry payload.' }, { status: 400 });
  }

  const result = await persistTelemetryPayload(payload);

  if ('reason' in result && result.reason === 'unknown-device') {
    return NextResponse.json({ ok: false, error: 'Unknown device for site.' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    accepted: true,
    persisted: result.persisted,
    pointCount: result.pointCount,
    eventCount: 'eventCount' in result ? result.eventCount : 0,
    eventsPersisted: 'eventsPersisted' in result ? result.eventsPersisted : false
  });
}

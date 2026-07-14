import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { persistTelemetryPayload } from '@/server/telemetry-ingest';
import { validateTelemetryPayload } from '@/server/telemetry-contract';
import type { TelemetryIngestPayload } from '@/types/domain';

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-telemetry-token');

  if (!token || token !== env.telemetryIngestToken) {
    return NextResponse.json({ ok: false, error: 'Unauthorized ingest token.' }, { status: 401 });
  }

  const payload = (await request.json()) as TelemetryIngestPayload;

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
    pointCount: result.pointCount
  });
}

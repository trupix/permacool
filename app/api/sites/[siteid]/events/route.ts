import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSiteEquipmentEvents } from '@/server/repositories/equipment-events';
import { getSite } from '@/server/repositories/sites';
import type { EquipmentEvent } from '@/types/domain';

export const dynamic = 'force-dynamic';

function csvCell(value: string | number | null | undefined) {
  if (typeof value === 'number') return `"${value}"`;
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function eventsToCsv(events: EquipmentEvent[]) {
  const headers = [
    'occurred_at',
    'channel',
    'event_type',
    'message',
    'device',
    'high_pressure_psi',
    'low_pressure_psi',
    'process_temperature',
    'temperature_unit',
    'compressor_amps',
    'runtime_minutes',
    'setpoint',
    'setpoint_unit'
  ];
  const rows = events.map((event) => [
    event.occurredAt,
    event.channel,
    event.eventType,
    event.message,
    event.deviceName ?? event.deviceId,
    event.highPressure,
    event.lowPressure,
    event.processTemperature,
    event.temperatureUnit,
    event.compressorAmps,
    event.runtimeMinutes,
    event.setpoint,
    event.setpointUnit
  ]);
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
}

export async function GET(request: Request, { params }: { params: Promise<{ siteid: string }> }) {
  const { siteid: siteId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const site = await getSite(user, siteId);
  if (!site) return NextResponse.json({ error: 'Site not found.' }, { status: 404 });

  const url = new URL(request.url);
  const download = url.searchParams.get('download') === 'csv';
  const requestedLimit = Number(url.searchParams.get('limit') ?? (download ? 10_000 : 250));
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 10_000) : 250;
  const page = await getSiteEquipmentEvents(site.id, { limit });

  if (download) {
    const filename = `${site.id}-equipment-events.csv`;
    return new Response(eventsToCsv(page.events), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Event-Persistence': page.persistenceReady ? 'ready' : 'pending'
      }
    });
  }

  return NextResponse.json(page, { headers: { 'Cache-Control': 'private, no-store' } });
}

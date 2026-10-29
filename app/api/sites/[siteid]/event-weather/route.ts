import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getSite } from '@/server/repositories/sites';
import { resolveWeatherLocation } from '@/server/site-weather-service';

export async function POST(request: Request, { params }: { params: Promise<{ siteid: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({}, { status: 401 });
  const { siteid } = await params;
  const site = await getSite(user, siteid);
  if (!site) return NextResponse.json({}, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.ids) || body.ids.length > 250 || !body.ids.every((id: unknown) => typeof id === 'string')) return NextResponse.json({}, { status: 400 });
  const events = await db.equipmentEvent.findMany({ where: { siteId: siteid, id: { in: body.ids } }, select: { id: true, occurredAt: true } });
  const observations: Array<{ at: number; temperatureF: number; station: string }> = [];
  try {
    if (!events.length) return NextResponse.json({ readings: {} });
    const location = await resolveWeatherLocation(site);
    const start = new Date(Math.min(...events.map(e => e.occurredAt.getTime())) - 90 * 60000);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(Math.max(...events.map(e => e.occurredAt.getTime())));
    end.setUTCHours(23, 59, 59, 999);
    const query = new URLSearchParams({ limit: '500', start: start.toISOString(), end: end.toISOString() });
    // NWS observations have limited retention. Never substitute today's weather.
    // Fetch a bounded, cached recent history once per station, not once per event.
    await Promise.allSettled(location.stations.slice(0, 2).map(async station => {
      const response = await fetch(`https://api.weather.gov/stations/${encodeURIComponent(station.stationId)}/observations?${query}`, {
        headers: { Accept: 'application/geo+json', 'User-Agent': 'PermaCoolOps/1.0 (operations@perma.cool)' },
        signal: AbortSignal.timeout(8000), next: { revalidate: 900 }
      });
      if (!response.ok) return;
      const data = await response.json();
      for (const feature of data.features ?? []) {
        const p = feature.properties;
        const value = p?.temperature?.value;
        const unit = p?.temperature?.unitCode;
        const at = Date.parse(p?.timestamp);
        if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isFinite(at)) continue;
        const temperatureF = unit === 'wmoUnit:degC' ? value * 9 / 5 + 32 : unit === 'wmoUnit:degF' ? value : null;
        if (temperatureF !== null) observations.push({ at, temperatureF, station: station.stationId });
      }
    }));
    const readings = Object.fromEntries(events.map(event => {
      const time = event.occurredAt.getTime();
      const nearest = observations.filter(o => o.at <= time && time - o.at <= 90 * 60000).sort((a, b) => b.at - a.at)[0];
      return [event.id, nearest ? { temperatureF: nearest.temperatureF, observedAt: new Date(nearest.at).toISOString(), station: nearest.station } : null];
    }));
    return NextResponse.json({ readings }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ readings: {}, unavailable: true }, { headers: { 'Cache-Control': 'private, no-store' } });
  }
}

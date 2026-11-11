import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getSite } from '@/server/repositories/sites';
import { attachSavedEventWeather } from '@/server/saved-event-weather';

export async function POST(request: Request, { params }: { params: Promise<{ siteid: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({}, { status: 401 });
  const { siteid } = await params;
  const site = await getSite(user, siteid);
  if (!site) return NextResponse.json({}, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.ids) || body.ids.length > 250 || !body.ids.every((id: unknown) => typeof id === 'string')) return NextResponse.json({}, { status: 400 });
  if (!body.ids.length) return NextResponse.json({ readings: {} });
  try {
    await attachSavedEventWeather(siteid);
    const rows = await db.$queryRaw<Array<{ eventId: string; temperatureF: number; observedAt: Date; station: string }>>(Prisma.sql`
      SELECT a.* FROM "EventAmbientWeather" a JOIN "EquipmentEvent" e ON e.id = a."eventId"
      WHERE e."siteId" = ${siteid} AND e.id IN (${Prisma.join(body.ids)})`);
    return NextResponse.json({ readings: Object.fromEntries(rows.map(r => [r.eventId, { temperatureF: r.temperatureF, observedAt: r.observedAt.toISOString(), station: r.station }])) }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch { return NextResponse.json({ readings: {}, unavailable: true }, { status: 503 }); }
}

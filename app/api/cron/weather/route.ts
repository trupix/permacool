import { NextResponse } from 'next/server';
import { collectSiteWeather } from '@/server/saved-event-weather';
export const maxDuration = 60;
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({}, { status: 401 });
  const results = await collectSiteWeather();
  return NextResponse.json({ results }, { status: results.every(r => r.status === 'weather_unavailable') ? 503 : 200 });
}

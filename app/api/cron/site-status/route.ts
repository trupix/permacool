import { NextResponse } from 'next/server';
import { refreshSiteDisplaySnapshots } from '@/server/site-display-snapshots';
export const maxDuration = 60;
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({}, { status: 401 });
  }
  return NextResponse.json(await refreshSiteDisplaySnapshots());
}

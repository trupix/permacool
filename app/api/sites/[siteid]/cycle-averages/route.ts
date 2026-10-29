import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSite } from '@/server/repositories/sites';
import { getSiteCycleAverages } from '@/server/repositories/cycle-averages';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ siteid: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { siteid } = await params;
  const site = await getSite(user, siteid);
  if (!site) return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
  try {
    return NextResponse.json({ rows: await getSiteCycleAverages(site.id) }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Cycle averages temporarily unavailable.' }, { status: 503 });
  }
}

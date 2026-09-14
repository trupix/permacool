import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasDatabaseUrl } from '@/lib/env';
import { deviceWhere, siteWhere } from '@/lib/access';
import { readVpnSessionStatus } from '@/server/vpn-session-status';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
const unknown = { source: 'openvpn-session', state: 'unknown', observedAt: null };

export async function GET(_request: Request, { params }: {params: Promise<{siteid: string}>}) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  if (!hasDatabaseUrl()) return NextResponse.json(unknown, { headers });
  const { siteid } = await params;
  const site = await db.site.findFirst({ where: { AND: [{ id: siteid }, siteWhere(user)] }, select: { id: true } });
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404, headers });
  const devices = await db.device.findMany({
    where: { AND: [{siteId: siteid}, deviceWhere(user)] },
    select: { vpnEnrollment: { select: { identity: true, profileStatus: true } } }
  });
  // Missing or uncertain mappings never become an inferred disconnect. No enrollment writes.
  if (!devices.length || devices.some(device => !device.vpnEnrollment ||
      !['external', 'issued'].includes(device.vpnEnrollment.profileStatus))) return NextResponse.json(unknown, {headers});
  const identities = devices.map(device => device.vpnEnrollment!.identity);
  return NextResponse.json(await readVpnSessionStatus(identities), { headers });
}

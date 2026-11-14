import { getCurrentUser } from '@/lib/auth';
import { canAccessPlcOperations } from '@/lib/plc-operations-access';
import { isSupabaseAuthEnabled } from '@/lib/env';
import { getPlcLibrary } from '@/server/plc-library';

export const dynamic = 'force-dynamic';
export async function GET() {
  const headers = { 'Cache-Control': 'private, no-store' };
  if (process.env.NODE_ENV === 'production' && !isSupabaseAuthEnabled()) return Response.json({ error: 'Unavailable' }, { status: 503, headers });
  const user = await getCurrentUser();
  if (!user || !canAccessPlcOperations(user)) return Response.json({ error: 'Not authorized' }, { status: 403, headers });
  const state = await getPlcLibrary();
  return Response.json({ revision: state.snapshot?.revision ?? null, receivedAt: state.receivedAt, lastAttemptAt: state.lastAttemptAt, lastError: state.lastError, unavailable: state.unavailable }, { headers });
}

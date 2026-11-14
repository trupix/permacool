import { createRemoteJWKSet, jwtVerify } from 'jose';
import { LIBRARY_AUDIENCE, LIBRARY_REPOSITORY, LIBRARY_WORKFLOW, validateLibrarySnapshot } from '@/lib/plc-library-contract';
import { savePlcLibrary } from '@/server/plc-library';

export const runtime = 'nodejs';
const keys = createRemoteJWKSet(new URL('https://token.actions.githubusercontent.com/.well-known/jwks'), { timeoutDuration: 5000 });
const headers = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
  let identity;
  try {
    const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];
    if (!token) throw new Error('Missing identity');
    const { payload } = await jwtVerify(token, keys, { issuer: 'https://token.actions.githubusercontent.com', audience: LIBRARY_AUDIENCE, algorithms: ['RS256'], maxTokenAge: '5m', requiredClaims: ['exp', 'iat', 'jti'] });
    if (payload.repository !== LIBRARY_REPOSITORY || payload.repository_id !== '1435072754' || payload.repository_owner_id !== '268321130' || payload.ref !== 'refs/heads/main' || payload.ref_type !== 'branch' || payload.workflow_ref !== LIBRARY_WORKFLOW || !['push', 'schedule', 'workflow_dispatch'].includes(String(payload.event_name))) throw new Error('Wrong publisher');
    const run = Number(payload.run_number), attempt = Number(payload.run_attempt);
    if (!Number.isSafeInteger(run) || run < 1 || !Number.isSafeInteger(attempt) || attempt < 1) throw new Error('Invalid run');
    identity = { sha: payload.sha, run, attempt };
  } catch { return Response.json({ error: 'Publisher authentication failed' }, { status: 401, headers }); }

  try {
    // Bound body reads before parsing; do not log private document contents or JWTs.
    if (Number(request.headers.get('content-length') ?? 0) > 2_000_000) return Response.json({ error: 'Snapshot too large' }, { status: 413, headers });
    const reader = request.body?.getReader();
    if (!reader) throw new Error('Missing body');
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 2_000_000) { await reader.cancel(); return Response.json({ error: 'Snapshot too large' }, { status: 413, headers }); } chunks.push(value); }
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (body.revision !== identity.sha) throw new Error('Revision mismatch');
    const failure = body.failure === true;
    const snapshot = failure ? null : validateLibrarySnapshot(body);
    const changed = await savePlcLibrary(snapshot, identity.run, identity.attempt, failure);
    return Response.json({ accepted: true, changed, revision: body.revision }, { headers });
  } catch { return Response.json({ error: 'Snapshot rejected or storage unavailable' }, { status: 422, headers }); }
}

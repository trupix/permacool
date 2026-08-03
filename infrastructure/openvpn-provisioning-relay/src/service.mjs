const IDENTITY_PATTERN = /^[a-z0-9][a-z0-9-]{2,71}$/;
const IDEMPOTENCY_PATTERN = /^[a-f0-9]{64}$/;
const TUNNEL_IP_PATTERN = /^(?:10|172\.(?:1[6-9]|2\d|3[01])|192\.168)\.\d{1,3}\.\d{1,3}$/;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

async function parseProfileRequest(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 4096) throw new Error('REQUEST_TOO_LARGE');
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > 4096) throw new Error('REQUEST_TOO_LARGE');
  const payload = JSON.parse(rawBody);
  if (!payload || typeof payload !== 'object') throw new Error('INVALID_REQUEST');
  const identity = typeof payload.identity === 'string' ? payload.identity : '';
  const tunnelIp = payload.tunnelIp === null ? null :
    typeof payload.tunnelIp === 'string' ? payload.tunnelIp : undefined;
  if (!IDENTITY_PATTERN.test(identity)) throw new Error('INVALID_IDENTITY');
  if (tunnelIp === undefined || (tunnelIp !== null && !TUNNEL_IP_PATTERN.test(tunnelIp))) {
    throw new Error('INVALID_TUNNEL_IP');
  }
  return { identity, tunnelIp };
}

export function createRelayHandler({ openVpn, stateStore, generationEnabled = false }) {
  return async function handle(request) {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/health') {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        await openVpn.health(controller.signal);
        return json(200, { healthy: true });
      } catch {
        return json(503, { healthy: false });
      } finally {
        clearTimeout(timeout);
      }
    }

    if (request.method !== 'POST' || url.pathname !== '/v1/profiles') {
      return json(404, { error: 'Not found.' });
    }
    if (!generationEnabled) {
      return json(503, { error: 'Profile generation is disabled.' });
    }

    const idempotencyKey = request.headers.get('idempotency-key') || '';
    if (!IDEMPOTENCY_PATTERN.test(idempotencyKey)) {
      return json(400, { error: 'A valid idempotency key is required.' });
    }

    let profileRequest;
    try {
      profileRequest = await parseProfileRequest(request);
    } catch {
      return json(400, { error: 'The profile request is invalid.' });
    }

    try {
      const reserved = await stateStore.reserve({ key: idempotencyKey, ...profileRequest });
      if (!reserved) {
        return json(409, {
          error: 'This operation is already reserved and requires manual reconciliation.'
        });
      }
    } catch {
      return json(503, { error: 'The operation could not be reserved safely.' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const profile = await openVpn.generateProfile(profileRequest, controller.signal);
      await stateStore.mark(idempotencyKey, 'profile-generated');
      return new Response(profile, {
        status: 200,
        headers: {
          'Content-Type': 'application/x-openvpn-profile',
          'Cache-Control': 'private, no-store, max-age=0',
          Pragma: 'no-cache',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    } catch (error) {
      const marker = error?.code === 'IDENTITY_EXISTS' ? 'identity-conflict' : 'manual-reconciliation';
      await stateStore.mark(idempotencyKey, marker).catch(() => false);
      if (error?.code === 'IDENTITY_EXISTS') {
        return json(409, { error: 'The OpenVPN identity already exists.' });
      }
      return json(502, {
        error: 'The VPN operation is uncertain and must be reconciled manually. Do not retry.'
      });
    } finally {
      clearTimeout(timeout);
    }
  };
}

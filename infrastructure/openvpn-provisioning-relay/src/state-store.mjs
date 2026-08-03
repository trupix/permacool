import { createHash } from 'node:crypto';

function operationName(key) {
  return `operations/${key}.json`;
}

function markerName(key, marker) {
  return `operations/${key}/${marker}.json`;
}

async function metadataAccessToken(fetchImpl) {
  const response = await fetchImpl(
    'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
    { headers: { 'Metadata-Flavor': 'Google' } }
  );
  if (!response.ok) throw new Error('Relay state authentication failed.');
  const payload = await response.json();
  if (!payload.access_token) throw new Error('Relay state authentication returned no token.');
  return payload.access_token;
}

async function createObject({ bucket, name, payload, fetchImpl, tokenProvider }) {
  const token = await tokenProvider(fetchImpl);
  const url = new URL(`https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o`);
  url.searchParams.set('uploadType', 'media');
  url.searchParams.set('name', name);
  url.searchParams.set('ifGenerationMatch', '0');
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (response.status === 412) return false;
  if (!response.ok) throw new Error('Relay state reservation failed.');
  return true;
}

export function createStateStore({ bucket, fetchImpl = fetch, tokenProvider = metadataAccessToken }) {
  if (!bucket) throw new Error('IDEMPOTENCY_BUCKET is required.');
  return {
    async reserve({ key, identity, tunnelIp }) {
      const requestHash = createHash('sha256')
        .update(JSON.stringify({ identity, tunnelIp }))
        .digest('hex');
      return createObject({
        bucket,
        name: operationName(key),
        payload: {
          version: 1,
          status: 'reserved',
          requestHash,
          reservedAt: new Date().toISOString()
        },
        fetchImpl,
        tokenProvider
      });
    },

    async mark(key, marker) {
      return createObject({
        bucket,
        name: markerName(key, marker),
        payload: { version: 1, marker, recordedAt: new Date().toISOString() },
        fetchImpl,
        tokenProvider
      });
    }
  };
}

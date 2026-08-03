export type OpenVpnProfileRequest = {
  identity: string;
  tunnelIp: string | null;
};

export type OpenVpnConfig = {
  url: string;
  workloadIdentityAudience: string;
  serviceAccountEmail: string;
};

export type OpenVpnClientOptions = {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

export type OpenVpnProvisioningStatus = {
  configured: boolean;
  healthy: boolean;
  host: string | null;
};

const HEALTH_TIMEOUT_MS = 8_000;
const OPERATION_TIMEOUT_MS = 45_000;
const STS_ENDPOINT = 'https://sts.googleapis.com/v1/token';
const IAM_CREDENTIALS_ENDPOINT = 'https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts';

function configuredStatus(config: OpenVpnConfig, oidcToken: string): OpenVpnProvisioningStatus {
  let host: string | null = null;
  try {
    const url = new URL(config.url);
    if (url.protocol === 'https:') host = 'Secure Google Cloud relay';
  } catch {
    host = null;
  }

  return {
    configured: Boolean(
      host &&
      oidcToken &&
      config.workloadIdentityAudience &&
      config.serviceAccountEmail
    ),
    healthy: false,
    host
  };
}

async function withTimeout<T>(timeoutMs: number, operation: (signal: AbortSignal) => Promise<T>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await operation(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

async function exchangeVercelOidcToken(
  config: OpenVpnConfig,
  oidcToken: string,
  fetchImpl: typeof fetch,
  signal: AbortSignal
) {
  const response = await fetchImpl(STS_ENDPOINT, {
    method: 'POST',
    cache: 'no-store',
    signal,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      audience: config.workloadIdentityAudience,
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
      subject_token: oidcToken
    })
  });
  if (!response.ok) throw new Error('Google workload identity exchange failed.');
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error('Google workload identity exchange returned no token.');
  return payload.access_token;
}

async function generateRelayIdentityToken(
  config: OpenVpnConfig,
  accessToken: string,
  fetchImpl: typeof fetch,
  signal: AbortSignal
) {
  const serviceAccount = encodeURIComponent(config.serviceAccountEmail);
  const response = await fetchImpl(
    `${IAM_CREDENTIALS_ENDPOINT}/${serviceAccount}:generateIdToken`,
    {
      method: 'POST',
      cache: 'no-store',
      signal,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ audience: config.url, includeEmail: true })
    }
  );
  if (!response.ok) throw new Error('Google relay identity token generation failed.');
  const payload = await response.json() as { token?: string };
  if (!payload.token) throw new Error('Google relay identity token generation returned no token.');
  return payload.token;
}

async function authenticatedRelayRequest(
  config: OpenVpnConfig,
  oidcToken: string,
  path: string,
  init: RequestInit,
  fetchImpl: typeof fetch,
  signal: AbortSignal
) {
  const accessToken = await exchangeVercelOidcToken(config, oidcToken, fetchImpl, signal);
  const identityToken = await generateRelayIdentityToken(config, accessToken, fetchImpl, signal);
  return fetchImpl(`${config.url.replace(/\/+$/, '')}${path}`, {
    ...init,
    cache: 'no-store',
    signal,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${identityToken}`
    }
  });
}

export async function getOpenVpnProvisioningStatusFor(
  config: OpenVpnConfig,
  oidcToken: string,
  options: OpenVpnClientOptions = {}
): Promise<OpenVpnProvisioningStatus> {
  const status = configuredStatus(config, oidcToken);
  if (!status.configured) return status;

  const fetchImpl = options.fetchImpl ?? fetch;
  try {
    const response = await withTimeout(options.timeoutMs ?? HEALTH_TIMEOUT_MS, (signal) =>
      authenticatedRelayRequest(
        config,
        oidcToken,
        '/health',
        { method: 'GET', headers: { Accept: 'application/json' } },
        fetchImpl,
        signal
      )
    );
    if (!response.ok) return status;
    const payload = await response.json() as { healthy?: boolean };
    return payload.healthy ? { ...status, healthy: true } : status;
  } catch {
    return status;
  }
}

export async function generateOpenVpnProfileFor(
  config: OpenVpnConfig,
  request: OpenVpnProfileRequest,
  oidcToken: string,
  idempotencyKey: string,
  options: OpenVpnClientOptions = {}
) {
  const status = configuredStatus(config, oidcToken);
  if (!status.configured) throw new Error('OpenVPN profile generation is not connected yet.');
  if (!/^[a-f0-9]{64}$/.test(idempotencyKey)) {
    throw new Error('A valid VPN operation idempotency key is required.');
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  return withTimeout(options.timeoutMs ?? OPERATION_TIMEOUT_MS, async (signal) => {
    const response = await authenticatedRelayRequest(
      config,
      oidcToken,
      '/v1/profiles',
      {
        method: 'POST',
        headers: {
          Accept: 'application/x-openvpn-profile',
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(request)
      },
      fetchImpl,
      signal
    );
    if (!response.ok) {
      throw new Error(
        response.status === 409
          ? 'The VPN operation is already reserved and requires manual reconciliation.'
          : 'The secure OpenVPN relay did not complete profile generation.'
      );
    }

    const profile = await response.text();
    if (!profile.includes('<key>') || !profile.includes('<cert>') || !profile.includes('remote ')) {
      throw new Error('The secure OpenVPN relay returned an invalid connection profile.');
    }

    return { profile, serverHost: 'secure-google-cloud-relay' };
  });
}

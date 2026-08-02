export type OpenVpnProfileRequest = {
  identity: string;
  tunnelIp: string | null;
};

export type OpenVpnConfig = {
  url: string;
  username: string;
  password: string;
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

const HEALTH_TIMEOUT_MS = 5_000;
const OPERATION_TIMEOUT_MS = 30_000;
const HEALTH_PROBE_IDENTITY = '__permacool_health_probe__';

function baseUrl(config: OpenVpnConfig) {
  return config.url.replace(/\/+$/, '');
}

function configuredStatus(config: OpenVpnConfig): OpenVpnProvisioningStatus {
  const hasCredentials = Boolean(config.url && config.username && config.password);
  let host: string | null = null;
  try {
    host = config.url ? new URL(config.url).host : null;
  } catch {
    host = null;
  }
  const configured = hasCredentials && Boolean(host);
  return { configured, healthy: false, host };
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

async function login(config: OpenVpnConfig, fetchImpl: typeof fetch, signal: AbortSignal) {
  const response = await fetchImpl(`${baseUrl(config)}/api/auth/login/userpassword`, {
    method: 'POST',
    cache: 'no-store',
    signal,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request_admin: true,
      username: config.username,
      password: config.password
    })
  });
  if (!response.ok) throw new Error(`OpenVPN admin authentication failed (${response.status}).`);
  const payload = await response.json() as { auth_token?: string };
  if (!payload.auth_token) throw new Error('OpenVPN Access Server did not return an admin token.');
  return payload.auth_token;
}

async function apiRequest(
  config: OpenVpnConfig,
  path: string,
  token: string,
  body: unknown,
  fetchImpl: typeof fetch,
  signal: AbortSignal
) {
  return fetchImpl(`${baseUrl(config)}${path}`, {
    method: 'POST',
    cache: 'no-store',
    signal,
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
      'X-OpenVPN-As-AuthToken': token
    },
    body: JSON.stringify(body)
  });
}

export async function getOpenVpnProvisioningStatusFor(
  config: OpenVpnConfig,
  options: OpenVpnClientOptions = {}
): Promise<OpenVpnProvisioningStatus> {
  const status = configuredStatus(config);
  if (!status.configured || !status.host) return status;

  const url = new URL(config.url);
  if (url.protocol !== 'https:') return status;

  const fetchImpl = options.fetchImpl ?? fetch;
  try {
    await withTimeout(options.timeoutMs ?? HEALTH_TIMEOUT_MS, async (signal) => {
      const token = await login(config, fetchImpl, signal);
      const response = await apiRequest(
        config,
        '/api/users/list',
        token,
        { users: [HEALTH_PROBE_IDENTITY] },
        fetchImpl,
        signal
      );
      if (!response.ok) {
        throw new Error(`OpenVPN read-only health probe failed (${response.status}).`);
      }
    });
    return { ...status, healthy: true };
  } catch {
    return status;
  }
}

export async function generateOpenVpnProfileFor(
  config: OpenVpnConfig,
  request: OpenVpnProfileRequest,
  options: OpenVpnClientOptions = {}
) {
  const status = configuredStatus(config);
  if (!status.configured || !status.host) {
    throw new Error('OpenVPN profile generation is not connected yet.');
  }
  const serverHost = status.host;

  const url = new URL(config.url);
  if (url.protocol !== 'https:') throw new Error('OpenVPN provisioning requires HTTPS.');

  const fetchImpl = options.fetchImpl ?? fetch;
  return withTimeout(options.timeoutMs ?? OPERATION_TIMEOUT_MS, async (signal) => {
    const token = await login(config, fetchImpl, signal);
    const listResponse = await apiRequest(
      config,
      '/api/users/list',
      token,
      { users: [request.identity] },
      fetchImpl,
      signal
    );
    if (!listResponse.ok) {
      throw new Error(`OpenVPN user lookup failed (${listResponse.status}).`);
    }
    const listBody = await listResponse.text();

    if (listBody.includes(request.identity)) {
      throw new Error(
        'The OpenVPN identity already exists. Generation is locked until it is reconciled manually.'
      );
    }

    const createResponse = await apiRequest(
      config,
      '/api/users/create',
      token,
      { name: request.identity },
      fetchImpl,
      signal
    );
    if (!createResponse.ok) {
      throw new Error(`OpenVPN user creation failed (${createResponse.status}).`);
    }

    const properties: Record<string, string> = {
      name: request.identity,
      autologin: 'true',
      allow_generate_profiles: 'true'
    };
    if (request.tunnelIp) properties.static_ipv4 = request.tunnelIp;

    const permissionResponse = await apiRequest(
      config,
      '/api/userprop/set',
      token,
      [properties],
      fetchImpl,
      signal
    );
    if (!permissionResponse.ok) {
      throw new Error(`OpenVPN device permissions failed (${permissionResponse.status}).`);
    }

    const profileResponse = await apiRequest(
      config,
      '/api/profiles/create',
      token,
      { profile_type: 'autologin', user: request.identity },
      fetchImpl,
      signal
    );
    if (!profileResponse.ok) {
      throw new Error(`OpenVPN profile generation failed (${profileResponse.status}).`);
    }

    let profile = await profileResponse.text();
    if (profile.startsWith('"') && profile.endsWith('"')) {
      try {
        profile = JSON.parse(profile) as string;
      } catch {
        // The raw response may legitimately begin with a quote in a comment; validate below.
      }
    }
    if (!profile.includes('<key>') || !profile.includes('<cert>') || !profile.includes('remote ')) {
      throw new Error('OpenVPN Access Server returned an invalid connection profile.');
    }

    return { profile, serverHost };
  });
}

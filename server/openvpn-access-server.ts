import { env } from '@/lib/env';

type ProfileRequest = {
  identity: string;
  tunnelIp: string | null;
};

function baseUrl() {
  return env.openVpnAccessServerUrl.replace(/\/+$/, '');
}

export function getOpenVpnProvisioningStatus() {
  const hasCredentials = Boolean(
    env.openVpnAccessServerUrl &&
    env.openVpnAccessServerUsername &&
    env.openVpnAccessServerPassword
  );
  let host: string | null = null;
  try {
    host = env.openVpnAccessServerUrl ? new URL(env.openVpnAccessServerUrl).host : null;
  } catch {
    host = null;
  }
  return { configured: hasCredentials && Boolean(host), host };
}

async function login() {
  const response = await fetch(`${baseUrl()}/api/auth/login/userpassword`, {
    method: 'POST',
    cache: 'no-store',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request_admin: true,
      username: env.openVpnAccessServerUsername,
      password: env.openVpnAccessServerPassword
    })
  });
  if (!response.ok) throw new Error(`OpenVPN admin authentication failed (${response.status}).`);
  const payload = await response.json() as { auth_token?: string };
  if (!payload.auth_token) throw new Error('OpenVPN Access Server did not return an admin token.');
  return payload.auth_token;
}

async function apiRequest(path: string, token: string, body: unknown) {
  return fetch(`${baseUrl()}${path}`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
      'X-OpenVPN-As-AuthToken': token
    },
    body: JSON.stringify(body)
  });
}

export async function generateOpenVpnProfile(request: ProfileRequest) {
  const status = getOpenVpnProvisioningStatus();
  if (!status.configured || !status.host) {
    throw new Error('OpenVPN profile generation is not connected yet.');
  }

  const url = new URL(env.openVpnAccessServerUrl);
  if (url.protocol !== 'https:') throw new Error('OpenVPN provisioning requires HTTPS.');

  const token = await login();
  const listResponse = await apiRequest('/api/users/list', token, { users: [request.identity] });
  if (!listResponse.ok) {
    throw new Error(`OpenVPN user lookup failed (${listResponse.status}).`);
  }
  const listBody = await listResponse.text();

  if (!listBody.includes(request.identity)) {
    const createResponse = await apiRequest('/api/users/create', token, { name: request.identity });
    if (!createResponse.ok && createResponse.status !== 409) {
      throw new Error(`OpenVPN user creation failed (${createResponse.status}).`);
    }
  }

  const properties: Record<string, string> = {
    name: request.identity,
    autologin: 'true',
    allow_generate_profiles: 'true'
  };
  if (request.tunnelIp) properties.static_ipv4 = request.tunnelIp;

  const permissionResponse = await apiRequest('/api/userprop/set', token, [properties]);
  if (!permissionResponse.ok) {
    throw new Error(`OpenVPN device permissions failed (${permissionResponse.status}).`);
  }

  const profileResponse = await apiRequest('/api/profiles/create', token, {
    profile_type: 'autologin',
    username: request.identity
  });
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

  return { profile, serverHost: status.host };
}

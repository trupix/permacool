import https from 'node:https';
import tls from 'node:tls';

const HEALTH_PROBE_IDENTITY = '__permacool_health_probe__';

function required(value, name) {
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

export function openVpnConfigFromEnv(environment = process.env) {
  const url = new URL(required(environment.OPENVPN_ACCESS_SERVER_URL, 'OPENVPN_ACCESS_SERVER_URL'));
  if (url.protocol !== 'https:') throw new Error('OpenVPN Access Server requires HTTPS.');
  return {
    url,
    connectHost: required(environment.OPENVPN_CONNECT_HOST, 'OPENVPN_CONNECT_HOST'),
    tlsServerName: required(environment.OPENVPN_TLS_SERVER_NAME, 'OPENVPN_TLS_SERVER_NAME'),
    username: required(environment.OPENVPN_ACCESS_SERVER_USERNAME, 'OPENVPN_ACCESS_SERVER_USERNAME'),
    password: required(environment.OPENVPN_ACCESS_SERVER_PASSWORD, 'OPENVPN_ACCESS_SERVER_PASSWORD'),
    caPem: required(environment.OPENVPN_ACCESS_SERVER_CA_PEM, 'OPENVPN_ACCESS_SERVER_CA_PEM'),
    timeoutMs: Number(environment.OPENVPN_REQUEST_TIMEOUT_MS || 20_000)
  };
}

function productionTransport(config) {
  return ({ path, body, token, signal }) => new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const request = https.request({
      protocol: 'https:',
      hostname: config.connectHost,
      port: config.url.port || 443,
      method: 'POST',
      path,
      ca: config.caPem,
      rejectUnauthorized: true,
      checkServerIdentity: (_host, certificate) => {
        const standardError = tls.checkServerIdentity(config.tlsServerName, certificate);
        if (!standardError) return undefined;

        // Access Server encoded its numeric host as a DNS SAN instead of an IP SAN.
        // The private CA chain is still verified by Node. Permit only an exact DNS
        // SAN match for the separately configured expected server identity.
        const expectedDnsSan = `DNS:${config.tlsServerName}`;
        const dnsSans = String(certificate.subjectaltname || '')
          .split(',')
          .map((value) => value.trim());
        return dnsSans.includes(expectedDnsSan) ? undefined : standardError;
      },
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Host: config.url.host,
        ...(token ? { 'X-OpenVPN-As-AuthToken': token } : {})
      },
      signal,
      timeout: config.timeoutMs
    }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({
        status: response.statusCode || 500,
        body: Buffer.concat(chunks).toString('utf8')
      }));
    });
    request.on('timeout', () => request.destroy(new Error('OpenVPN request timed out.')));
    request.on('error', reject);
    request.end(payload);
  });
}

function parseProfile(body) {
  let profile = body;
  if (profile.startsWith('"') && profile.endsWith('"')) {
    try {
      profile = JSON.parse(profile);
    } catch {
      // Validate the original body below.
    }
  }
  if (
    typeof profile !== 'string' ||
    !profile.includes('<key>') ||
    !profile.includes('<cert>') ||
    !profile.includes('remote ')
  ) {
    throw new Error('OpenVPN returned an invalid profile.');
  }
  return profile;
}

function responseContainsIdentity(body, identity) {
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error('OpenVPN returned an invalid identity lookup response.');
  }

  const pending = [payload];
  while (pending.length) {
    const value = pending.pop();
    if (value === identity) return true;
    if (Array.isArray(value)) pending.push(...value);
    else if (value && typeof value === 'object') pending.push(...Object.values(value));
  }
  return false;
}

export function createOpenVpnClient(config, options = {}) {
  const transport = options.transport || productionTransport(config);

  async function call(path, body, token, signal) {
    const result = await transport({ path, body, token, signal });
    if (result.status < 200 || result.status >= 300) {
      throw new Error(`OpenVPN request failed at ${path}.`);
    }
    return result.body;
  }

  async function login(signal) {
    const body = await call('/api/auth/login/userpassword', {
      request_admin: true,
      username: config.username,
      password: config.password
    }, null, signal);
    const payload = JSON.parse(body);
    if (!payload.auth_token) throw new Error('OpenVPN returned no admin token.');
    return payload.auth_token;
  }

  return {
    async health(signal) {
      const token = await login(signal);
      await call('/api/users/list', { users: [HEALTH_PROBE_IDENTITY] }, token, signal);
      return true;
    },

    async generateProfile({ identity, tunnelIp }, signal) {
      const token = await login(signal);
      const listBody = await call('/api/users/list', { users: [identity] }, token, signal);
      if (responseContainsIdentity(listBody, identity)) {
        const error = new Error('OpenVPN identity already exists.');
        error.code = 'IDENTITY_EXISTS';
        throw error;
      }

      await call('/api/users/create', { name: identity }, token, signal);
      const properties = {
        name: identity,
        autologin: 'true',
        allow_generate_profiles: 'true'
      };
      if (tunnelIp) properties.static_ipv4 = tunnelIp;
      await call('/api/userprop/set', [properties], token, signal);
      const profile = await call('/api/profiles/create', {
        profile_type: 'autologin',
        user: identity
      }, token, signal);
      return parseProfile(profile);
    }
  };
}

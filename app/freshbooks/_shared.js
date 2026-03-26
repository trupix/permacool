import crypto from 'node:crypto'

export const REDIRECT_URI = 'https://permacool.vercel.app/freshbooks/callback'

export const CLIENT_ID = process.env.FRESHBOOKS_CLIENT_ID
export const CLIENT_SECRET = process.env.FRESHBOOKS_CLIENT_SECRET

export const AUTH_URL = 'https://auth.freshbooks.com/service/auth/oauth/authorize'
export const TOKEN_URL = 'https://api.freshbooks.com/auth/oauth/token'
export const IDENTITY_URL = 'https://api.freshbooks.com/auth/api/v1/users/me'

export function assertFreshbooksEnv() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('missing_freshbooks_env')
  }
}

export function randomToken(size = 32) {
  return crypto.randomBytes(size).toString('hex')
}

export function toB64(jsonObj) {
  return Buffer.from(JSON.stringify(jsonObj), 'utf8').toString('base64url')
}

export function fromB64(raw) {
  return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
}

export function normalizeIdentity(identityJson) {
  const bizMemberships = identityJson?.response?.business_memberships || []
  const firstBiz = bizMemberships[0] || null

  return {
    user_id: identityJson?.response?.id ?? null,
    email: identityJson?.response?.email ?? null,
    business_memberships: bizMemberships.map((m) => ({
      business_id: m.business?.id ?? null,
      account_id: m.business?.account_id ?? null,
      role: m.role ?? null
    })),
    default_business_id: firstBiz?.business?.id ?? null,
    default_account_id: firstBiz?.business?.account_id ?? null
  }
}

export function buildSavedPayload(tokenJson, identity = null, connectedAt = new Date().toISOString()) {
  const expiresIn = Number(tokenJson?.expires_in || 0)
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

  return {
    access_token: tokenJson?.access_token ?? '',
    refresh_token: tokenJson?.refresh_token ?? '',
    expires_in: expiresIn,
    expires_at: expiresAt,
    token_type: tokenJson?.token_type ?? 'Bearer',
    scope: tokenJson?.scope ?? null,
    identity,
    connected_at: connectedAt
  }
}

export async function fetchIdentity(accessToken) {
  const idRes = await fetch(IDENTITY_URL, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      'api-version': 'alpha'
    }
  })

  const identityJson = await idRes.json()
  if (!idRes.ok) {
    throw new Error(identityJson?.error?.message || identityJson?.error || 'identity_lookup_failed')
  }

  return normalizeIdentity(identityJson)
}

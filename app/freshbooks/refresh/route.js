import { NextResponse } from 'next/server'
import {
  CLIENT_ID,
  CLIENT_SECRET,
  TOKEN_URL,
  assertFreshbooksEnv,
  buildSavedPayload,
  fetchIdentity
} from '../_shared'

export async function POST(req) {
  try {
    assertFreshbooksEnv()
  } catch {
    return NextResponse.json({ error: 'missing_freshbooks_env' }, { status: 500 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const refreshToken = body?.refresh_token
  if (!refreshToken) {
    return NextResponse.json({ error: 'missing_refresh_token' }, { status: 400 })
  }

  let tokenJson
  try {
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      })
    })

    tokenJson = await tokenRes.json()
    if (!tokenRes.ok || !tokenJson?.access_token) {
      return NextResponse.json({ error: tokenJson?.error_description || tokenJson?.error || 'refresh_failed' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'refresh_request_failed' }, { status: 500 })
  }

  let identity = null
  try {
    identity = await fetchIdentity(tokenJson.access_token)
  } catch {
    identity = null
  }

  const payload = buildSavedPayload(tokenJson, identity)
  return NextResponse.json(payload)
}

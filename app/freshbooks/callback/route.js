import { NextResponse } from 'next/server'
import {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  TOKEN_URL,
  assertFreshbooksEnv,
  buildSavedPayload,
  fetchIdentity,
  randomToken,
  toB64
} from '../_shared'

export async function GET(req) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const providerError = url.searchParams.get('error')

  try {
    assertFreshbooksEnv()
  } catch {
    return NextResponse.redirect(new URL('/freshbooks/success?token=0&identity=0&error=missing_freshbooks_env', url.origin))
  }

  if (providerError) {
    return NextResponse.redirect(new URL(`/freshbooks/success?token=0&identity=0&error=${encodeURIComponent(providerError)}`, url.origin))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/freshbooks/success?token=0&identity=0&error=missing_code_or_state', url.origin))
  }

  const cookieState = req.cookies.get('fb_oauth_state')?.value
  if (!cookieState || cookieState !== state) {
    return NextResponse.redirect(new URL('/freshbooks/success?token=0&identity=0&error=invalid_state', url.origin))
  }

  let tokenJson
  try {
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI
      })
    })

    tokenJson = await tokenRes.json()
    if (!tokenRes.ok || !tokenJson?.access_token) {
      throw new Error(tokenJson?.error_description || tokenJson?.error || 'token_exchange_failed')
    }
  } catch (e) {
    return NextResponse.redirect(new URL(`/freshbooks/success?token=0&identity=0&error=${encodeURIComponent(String(e.message || e))}`, url.origin))
  }

  let identity = null
  let identityOk = 0
  try {
    identity = await fetchIdentity(tokenJson.access_token)
    identityOk = 1
  } catch {
    identityOk = 0
  }

  const saved = buildSavedPayload(tokenJson, identity)
  const viewKey = randomToken(18)
  const payload = toB64(saved)

  const successUrl = new URL(`/freshbooks/success?token=1&identity=${identityOk}&view=${viewKey}&data=${encodeURIComponent(payload)}`, url.origin)
  const res = NextResponse.redirect(successUrl)

  res.cookies.set('fb_oauth_state', '', { path: '/', maxAge: 0 })
  res.cookies.set('fb_tokens_once', payload, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 30,
    path: '/'
  })
  res.cookies.set('fb_view_key', viewKey, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 30,
    path: '/'
  })

  return res
}

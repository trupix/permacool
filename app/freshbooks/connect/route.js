import { NextResponse } from 'next/server'
import { AUTH_URL, CLIENT_ID, REDIRECT_URI, assertFreshbooksEnv, randomToken } from '../_shared'
import { isFreshbooksAdmin } from '../_auth'

export async function GET(req) {
  if (!(await isFreshbooksAdmin())) return new NextResponse('Forbidden', { status: 403 })
  try {
    assertFreshbooksEnv()
  } catch {
    return new NextResponse('FreshBooks env vars are missing. Add FRESHBOOKS_CLIENT_ID and FRESHBOOKS_CLIENT_SECRET.', { status: 500 })
  }

  const state = randomToken(24)

  const url = new URL(AUTH_URL)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', CLIENT_ID)
  url.searchParams.set('redirect_uri', REDIRECT_URI)
  url.searchParams.set('state', state)

  const res = NextResponse.redirect(url)
  res.cookies.set('fb_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/'
  })

  return res
}

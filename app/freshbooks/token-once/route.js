import { NextResponse } from 'next/server'
import { fromB64 } from '../_shared'
import { isFreshbooksAdmin } from '../_auth'

export async function GET(req) {
  if (!(await isFreshbooksAdmin())) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const view = url.searchParams.get('view')

  const cookieView = req.cookies.get('fb_view_key')?.value
  const cookiePayload = req.cookies.get('fb_tokens_once')?.value

  let payloadRaw = null

  if (view && cookieView && view === cookieView && cookiePayload) {
    payloadRaw = cookiePayload
  }

  if (!payloadRaw) {
    return new NextResponse('Token payload unavailable or expired.', { status: 404 })
  }

  try {
    const payload = fromB64(payloadRaw)
    return NextResponse.json(payload)
  } catch {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }
}

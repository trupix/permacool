import { NextResponse } from 'next/server'
import { fromB64 } from '../_shared'

export async function GET(req) {
  const url = new URL(req.url)
  const view = url.searchParams.get('view')
  const data = url.searchParams.get('data')

  const cookieView = req.cookies.get('fb_view_key')?.value
  const cookiePayload = req.cookies.get('fb_tokens_once')?.value

  let payloadRaw = null

  if (view && cookieView && view === cookieView && cookiePayload) {
    payloadRaw = cookiePayload
  } else if (data) {
    payloadRaw = data
  }

  if (!payloadRaw) {
    return new NextResponse('Token payload unavailable (missing/expired session and no data fallback).', { status: 404 })
  }

  try {
    const payload = fromB64(payloadRaw)
    return NextResponse.json(payload)
  } catch {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }
}

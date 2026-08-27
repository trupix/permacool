import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { escapeContactHtml, isValidContactEmail, normalizeContactPayload } from '../../../lib/contact'

const MAX_BODY_BYTES = 32 * 1024
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 5
const submissionWindows = new Map()

function redirectWithError(req, errorCode, context = {}) {
  const requestUrl = new URL(req.url)
  const destination = new URL('/contact-us', req.url)
  destination.searchParams.set('error', errorCode)

  for (const key of ['request_type', 'product', 'source']) {
    const value = requestUrl.searchParams.get(key)
    if (value) destination.searchParams.set(key, value)
  }

  if (context.interest) destination.searchParams.set('interest', context.interest)
  if (context.cooling_method) destination.searchParams.set('cooling_method', context.cooling_method)

  return NextResponse.redirect(destination, 303)
}

function requestIp(req) {
  return (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown')
    .split(',')[0]
    .trim()
    .slice(0, 80)
}

function exceedsRateLimit(key, now = Date.now()) {
  for (const [storedKey, window] of submissionWindows) {
    if (now - window.startedAt >= RATE_LIMIT_WINDOW_MS) submissionWindows.delete(storedKey)
  }

  const current = submissionWindows.get(key)
  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    submissionWindows.set(key, { count: 1, startedAt: now })
    return false
  }

  current.count += 1
  return current.count > RATE_LIMIT_MAX_REQUESTS
}

function isSameOrigin(req) {
  const origin = req.headers.get('origin')
  return !origin || origin === new URL(req.url).origin
}

export async function POST(req) {
  try {
    const resendKey = process.env.RESEND_API_KEY
    const toEmail = 'david@perma.cool'
    const fromEmail = 'david@perma.cool'

    if (!resendKey) {
      console.error('Contact form is unavailable: RESEND_API_KEY is not configured')
      return redirectWithError(req, 'submit_failed')
    }

    if (!isSameOrigin(req)) return redirectWithError(req, 'invalid_submission')

    const contentLength = Number(req.headers.get('content-length') || 0)
    if (contentLength > MAX_BODY_BYTES) return redirectWithError(req, 'invalid_submission')

    if (exceedsRateLimit(requestIp(req))) return redirectWithError(req, 'too_many_requests')

    const formData = await req.formData()
    const requestUrl = new URL(req.url)
    formData.set('request_type', requestUrl.searchParams.get('request_type') || formData.get('request_type') || '')
    formData.set('product', requestUrl.searchParams.get('product') || formData.get('product') || '')
    formData.set('source', requestUrl.searchParams.get('source') || formData.get('source') || '')
    const payload = normalizeContactPayload(formData)

    if (payload.website) return NextResponse.redirect(new URL('/thank-you', req.url), 303)

    if (!payload.name || !isValidContactEmail(payload.email) || !payload.interest) {
      return redirectWithError(req, 'invalid_submission', payload)
    }

    const resend = new Resend(resendKey)

    const text = [
      'New Perma Cool contact form submission',
      '',
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Company: ${payload.company}`,
      `Phone: ${payload.phone}`,
      `Primary Interest: ${payload.interest}`,
      `Request Type: ${payload.request_type}`,
      `Product: ${payload.product || '(not specified)'}`,
      `Source Page: ${payload.source || '(not specified)'}`,
      `Current Cooling Method: ${payload.cooling_method}`,
      `Target Process Temperature: ${payload.target_temp}`,
      `Estimated Throughput: ${payload.throughput}`,
      '',
      'Message:',
      payload.message || '(none)'
    ].join('\n')

    const html = `
      <h2>New Perma Cool contact form submission</h2>
      <p><strong>Name:</strong> ${escapeContactHtml(payload.name)}</p>
      <p><strong>Email:</strong> ${escapeContactHtml(payload.email)}</p>
      <p><strong>Company:</strong> ${escapeContactHtml(payload.company)}</p>
      <p><strong>Phone:</strong> ${escapeContactHtml(payload.phone)}</p>
      <p><strong>Primary Interest:</strong> ${escapeContactHtml(payload.interest)}</p>
      <p><strong>Request Type:</strong> ${escapeContactHtml(payload.request_type)}</p>
      <p><strong>Product:</strong> ${escapeContactHtml(payload.product || '(not specified)')}</p>
      <p><strong>Source Page:</strong> ${escapeContactHtml(payload.source || '(not specified)')}</p>
      <p><strong>Current Cooling Method:</strong> ${escapeContactHtml(payload.cooling_method)}</p>
      <p><strong>Target Process Temperature:</strong> ${escapeContactHtml(payload.target_temp)}</p>
      <p><strong>Estimated Throughput:</strong> ${escapeContactHtml(payload.throughput)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeContactHtml(payload.message || '(none)').replace(/\n/g, '<br/>')}</p>
    `

    const sendResult = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: payload.email || undefined,
      subject: `Perma Cool ${payload.request_type}${payload.product ? ` — ${payload.product}` : ''} from ${payload.name}`,
      text,
      html
    })

    if (sendResult.error) {
      console.error('Resend email send failed:', sendResult.error)
      return redirectWithError(req, 'submit_failed', payload)
    }

    console.log('Contact form email sent:', sendResult.data?.id)

    return NextResponse.redirect(new URL('/thank-you', req.url), 303)
  } catch (error) {
    console.error('Contact form submit failed:', error)
    return redirectWithError(req, 'submit_failed')
  }
}

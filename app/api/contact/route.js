import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req) {
  try {
    const resendKey = process.env.RESEND_API_KEY
    const toEmail = 'david@perma.cool'
    const fromEmail = process.env.CONTACT_FORM_FROM || 'PermaCool Contact <onboarding@resend.dev>'

    if (!resendKey) {
      return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 })
    }

    const formData = await req.formData()
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      company: String(formData.get('company') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      interest: String(formData.get('interest') || '').trim(),
      cooling_method: String(formData.get('cooling_method') || '').trim(),
      target_temp: String(formData.get('target_temp') || '').trim(),
      throughput: String(formData.get('throughput') || '').trim(),
      message: String(formData.get('message') || '').trim()
    }

    const resend = new Resend(resendKey)

    const text = [
      'New PermaCool contact form submission',
      '',
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Company: ${payload.company}`,
      `Phone: ${payload.phone}`,
      `Primary Interest: ${payload.interest}`,
      `Current Cooling Method: ${payload.cooling_method}`,
      `Target Process Temperature: ${payload.target_temp}`,
      `Estimated Throughput: ${payload.throughput}`,
      '',
      'Message:',
      payload.message || '(none)'
    ].join('\n')

    const html = `
      <h2>New PermaCool contact form submission</h2>
      <p><strong>Name:</strong> ${payload.name || ''}</p>
      <p><strong>Email:</strong> ${payload.email || ''}</p>
      <p><strong>Company:</strong> ${payload.company || ''}</p>
      <p><strong>Phone:</strong> ${payload.phone || ''}</p>
      <p><strong>Primary Interest:</strong> ${payload.interest || ''}</p>
      <p><strong>Current Cooling Method:</strong> ${payload.cooling_method || ''}</p>
      <p><strong>Target Process Temperature:</strong> ${payload.target_temp || ''}</p>
      <p><strong>Estimated Throughput:</strong> ${payload.throughput || ''}</p>
      <p><strong>Message:</strong></p>
      <p>${(payload.message || '(none)').replace(/\n/g, '<br/>')}</p>
    `

    await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: payload.email || undefined,
      subject: `PermaCool Quote Request${payload.name ? ` from ${payload.name}` : ''}`,
      text,
      html
    })

    return NextResponse.redirect(new URL('/thank-you', req.url), 303)
  } catch (error) {
    console.error('Contact form submit failed:', error)
    return NextResponse.redirect(new URL('/contact-us?error=submit_failed', req.url), 303)
  }
}

export const dynamic = 'force-dynamic'

import { requireStaff } from '@/lib/auth'

export const metadata = {
  title: 'FreshBooks Connection Result | Perma Cool',
  description: 'FreshBooks OAuth connection status.',
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
}

export default async function FreshbooksSuccessPage({ searchParams }) {
  await requireStaff(['staff_admin'])
  const params = await searchParams
  const tokenOk = String(params?.token || '0') === '1'
  const identityOk = String(params?.identity || '0') === '1'
  const error = params?.error || ''
  const view = params?.view || ''

  return (
    <section className="container section">
      <p className="eyebrow">Integration</p>
      <h1>FreshBooks connected successfully</h1>
      <div className="card mt">
        <p><strong>Token exchange:</strong> {tokenOk ? 'worked ✅' : 'failed ❌'}</p>
        <p><strong>Identity lookup:</strong> {identityOk ? 'worked ✅' : 'failed ❌'}</p>
        {error ? <p><strong>Error:</strong> {String(error)}</p> : null}
      </div>

      {tokenOk ? (
        <div className="card mt">
          <h3>One-time token payload</h3>
          <p>Open this once to view/copy tokens for your Freshprince bot:</p>
          <p><a href={`/freshbooks/token-once?view=${encodeURIComponent(String(view))}`}>View the one-time token payload</a></p>
        </div>
      ) : null}
    </section>
  )
}

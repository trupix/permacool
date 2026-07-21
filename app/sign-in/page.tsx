import Link from 'next/link';
import { requestAccess, sendMagicLink, signOut } from './actions';
import { getAuthStatus } from '@/lib/auth';
import { isSupabaseAuthEnabled } from '@/lib/env';

export const metadata = {
  title: 'Sign In | Perma Cool',
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

function statusMessage(status?: string) {
  switch (status) {
    case 'check-email':
      return 'If this email is approved, a sign-in link will arrive shortly. New customers can request access below.';
    case 'missing-email':
      return 'Enter an email address to request a magic link.';
    case 'auth-error':
      return 'Supabase could not send the magic link. Check the auth settings and allowed redirect URL.';
    case 'callback-error':
      return 'The sign-in callback could not create a session. Try requesting a fresh link.';
    case 'signed-out':
      return 'Signed out.';
    case 'mock-fallback':
      return 'Supabase auth is not configured, so the app is using local fallback mode.';
    case 'request-received':
      return 'Your access request was received. PermaCool will verify your company and equipment assignment before enabling sign-in.';
    case 'missing-registration':
      return 'Name, company, and work email are required to request access.';
    default:
      return undefined;
  }
}

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ status?: string; next?: string }> }) {
  const auth = getAuthStatus();
  const { status, next = '/dashboard' } = await searchParams;
  const message = statusMessage(status);

  return (
    <main className="marketing-shell">
      <section className="panel sign-in-panel">
        <p className="eyebrow">PermaCool Ops Auth</p>
        <h1>{isSupabaseAuthEnabled() ? 'Supabase Auth is ready for UI wiring.' : 'Auth is running in local fallback mode.'}</h1>
        <p className="lede">
          Supabase is now the selected auth and database platform. Protected routes use the Supabase session when
          project keys are configured, and signed-in Supabase users map into the app user model.
        </p>

        {message ? <p className="auth-callout">{message}</p> : null}

        {isSupabaseAuthEnabled() ? (
          <div className="content-grid">
            <section>
              <h2>Sign in</h2>
              <form action={sendMagicLink} className="auth-form">
                <input type="hidden" name="next" value={next} />
                <label>
                  Email
                  <input name="email" type="email" placeholder="operator@company.com" required />
                </label>
                <button className="button-primary" type="submit">Send magic link</button>
              </form>
            </section>
            <section>
              <h2>Request customer access</h2>
              <form action={requestAccess} className="auth-form">
                <label>Name<input name="name" required /></label>
                <label>Work email<input name="email" type="email" required /></label>
                <label>Company<input name="companyName" required /></label>
                <label>
                  Site or machine information
                  <input name="accessNote" placeholder="Location, model, or serial number" />
                </label>
                <button className="button-secondary" type="submit">Request access</button>
              </form>
            </section>
          </div>
        ) : (
          <div className="auth-callout">
            <strong>Fallback mode active</strong>
            <ul>
              <li>Add Supabase URL + anon key to enable real sessions.</li>
              <li>Use Supabase Postgres as the Prisma database via `DATABASE_URL`.</li>
              <li>Repository reads continue using mock data until a database URL is configured.</li>
            </ul>
          </div>
        )}

        <p className="page-copy">Current auth mode: {auth.provider} / {auth.mode}</p>
        <div className="button-row">
          <Link href="/dashboard" className="button-primary">
            Continue into scaffolded app
          </Link>
          {isSupabaseAuthEnabled() ? (
            <form action={signOut}>
              <button className="button-secondary" type="submit">
                Sign out
              </button>
            </form>
          ) : null}
        </div>
      </section>
    </main>
  );
}

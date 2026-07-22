import { requestAccess, sendMagicLink, signOut } from './actions';
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
  const { status, next = '/dashboard' } = await searchParams;
  const message = statusMessage(status);

  return (
    <main className="marketing-shell">
      <section className="panel sign-in-panel">
        <p className="eyebrow">PermaCool customer portal</p>
        <h1>Monitor and support your equipment.</h1>
        <p className="lede">
          Sign in to view machine status, telemetry, alerts, support requests, documents, and invoices assigned to
          your company.
        </p>

        {message ? <p className="auth-callout">{message}</p> : null}

        {isSupabaseAuthEnabled() ? (
          <div className="sign-in-options">
            <section className="sign-in-option">
              <h2>Sign in</h2>
              <p>Approved customers and PermaCool staff can request a secure sign-in link.</p>
              <form action={sendMagicLink} className="auth-form">
                <input type="hidden" name="next" value={next} />
                <label>
                  Email
                  <input name="email" type="email" placeholder="operator@company.com" required />
                </label>
                <button className="button-primary" type="submit">Send magic link</button>
              </form>
            </section>
            <section className="sign-in-option sign-in-option--request">
              <h2>Request customer access</h2>
              <p>New here? Tell us who you are and which equipment your company owns.</p>
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

        {isSupabaseAuthEnabled() ? (
          <div className="sign-in-footer">
            <form action={signOut}>
              <button className="sign-in-text-button" type="submit">Clear an existing session</button>
            </form>
          </div>
        ) : null}
      </section>
    </main>
  );
}

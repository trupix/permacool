import { redirect } from 'next/navigation';
import { MIN_PASSWORD_LENGTH } from '@/lib/auth-forms';
import { isSupabaseAuthEnabled } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { updatePassword } from './actions';

export const metadata = {
  title: 'Set Password | Perma Cool',
  robots: { index: false, follow: false, nocache: true }
};

export const dynamic = 'force-dynamic';

function statusMessage(status?: string) {
  switch (status) {
    case 'password-too-short':
      return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    case 'password-mismatch':
      return 'The passwords do not match.';
    case 'password-update-error':
      return 'The password could not be updated. Request a fresh setup link and try again.';
    default:
      return undefined;
  }
}

export default async function SetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (!isSupabaseAuthEnabled()) redirect('/sign-in?status=mock-fallback');

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in?status=callback-error');

  const { status } = await searchParams;
  const message = statusMessage(status);

  return (
    <main className="marketing-shell">
      <section className="panel sign-in-panel sign-in-panel--compact">
        <p className="eyebrow">PermaCool account security</p>
        <h1>Set your password.</h1>
        <p className="lede">
          This password replaces routine email-link sign-in. Store it in your password manager and do not share it.
        </p>
        {message ? <p className="auth-callout">{message}</p> : null}
        <form action={updatePassword} className="auth-form">
          <label>
            New password
            <input name="password" type="password" minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" required />
          </label>
          <label>
            Confirm new password
            <input name="confirmation" type="password" minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" required />
          </label>
          <button className="button-primary" type="submit">Save password and continue</button>
        </form>
      </section>
    </main>
  );
}

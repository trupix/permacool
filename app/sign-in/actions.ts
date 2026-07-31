'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { isEligiblePortalUser, safeNextPath } from '@/lib/auth-forms';
import { env, hasDatabaseUrl, isSupabaseAuthEnabled } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function signInRedirect(status: string, next: string) {
  const params = new URLSearchParams({ status, next: safeNextPath(next) });
  redirect(`/sign-in?${params.toString()}`);
}

async function approvedPortalUser(email: string) {
  const user = await db.user.findUnique({
    where: { email },
    select: {
      status: true,
      platformRole: true,
      memberships: { select: { id: true }, take: 1 }
    }
  });

  return isEligiblePortalUser(
    user
      ? {
          status: user.status,
          platformRole: user.platformRole,
          membershipCount: user.memberships.length
        }
      : undefined
  );
}

export async function signInWithPassword(formData: FormData) {
  if (!isSupabaseAuthEnabled()) {
    redirect('/sign-in?status=mock-fallback');
  }

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = safeNextPath(formData.get('next'));

  if (!email || !password) {
    signInRedirect('missing-credentials', next);
  }

  if (!hasDatabaseUrl()) {
    signInRedirect('auth-error', next);
  }

  if (!(await approvedPortalUser(email))) {
    signInRedirect('invalid-credentials', next);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    signInRedirect('invalid-credentials', next);
  }

  redirect(next);
}

export async function sendMagicLink(formData: FormData) {
  if (!isSupabaseAuthEnabled()) {
    redirect('/sign-in?status=mock-fallback');
  }

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const next = safeNextPath(formData.get('next'));

  if (!email) {
    redirect('/sign-in?status=missing-email');
  }

  if (!hasDatabaseUrl()) {
    redirect('/sign-in?status=auth-error');
  }

  if (!(await approvedPortalUser(email))) {
    redirect('/sign-in?status=check-email');
  }

  const supabase = await createSupabaseServerClient();
  const redirectTo = new URL('/auth/callback', env.appUrl);
  redirectTo.searchParams.set('next', next);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo.toString(),
      shouldCreateUser: true
    }
  });

  if (error) {
    redirect('/sign-in?status=auth-error');
  }

  redirect('/sign-in?status=check-email');
}

export async function requestPasswordReset(formData: FormData) {
  if (!isSupabaseAuthEnabled()) {
    redirect('/sign-in?status=mock-fallback');
  }

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const next = safeNextPath(formData.get('next'));

  if (!email) {
    signInRedirect('missing-email', next);
  }

  if (!hasDatabaseUrl()) {
    signInRedirect('auth-error', next);
  }

  if (await approvedPortalUser(email)) {
    const supabase = await createSupabaseServerClient();
    const redirectTo = new URL('/auth/callback', env.appUrl);
    redirectTo.searchParams.set('next', '/set-password');

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo.toString()
    });
  }

  signInRedirect('password-email-sent', next);
}

export async function requestAccess(formData: FormData) {
  if (!hasDatabaseUrl()) {
    redirect('/sign-in?status=auth-error');
  }

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const name = String(formData.get('name') ?? '').trim();
  const companyName = String(formData.get('companyName') ?? '').trim();
  const accessNote = String(formData.get('accessNote') ?? '').trim();

  if (!email || !name || !companyName) {
    redirect('/sign-in?status=missing-registration');
  }

  const existing = await db.user.findUnique({ where: { email }, select: { id: true, status: true } });

  if (!existing) {
    await db.user.create({
      data: {
        email,
        name,
        companyName,
        accessNote: accessNote || null,
        role: 'viewer',
        platformRole: 'customer',
        status: 'pending'
      }
    });
  } else if (existing.status === 'pending') {
    await db.user.update({
      where: { id: existing.id },
      data: { name, companyName, accessNote: accessNote || null }
    });
  }

  redirect('/sign-in?status=request-received');
}

export async function signOut() {
  if (isSupabaseAuthEnabled()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect('/sign-in?status=signed-out');
}

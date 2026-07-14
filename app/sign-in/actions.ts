'use server';

import { redirect } from 'next/navigation';
import { env, isSupabaseAuthEnabled } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function sendMagicLink(formData: FormData) {
  if (!isSupabaseAuthEnabled()) {
    redirect('/sign-in?status=mock-fallback');
  }

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const next = String(formData.get('next') ?? '/dashboard');

  if (!email) {
    redirect('/sign-in?status=missing-email');
  }

  const supabase = await createSupabaseServerClient();
  const redirectTo = new URL('/auth/callback', env.appUrl);
  redirectTo.searchParams.set('next', next.startsWith('/') ? next : '/dashboard');

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo.toString()
    }
  });

  if (error) {
    redirect('/sign-in?status=auth-error');
  }

  redirect('/sign-in?status=check-email');
}

export async function signOut() {
  if (isSupabaseAuthEnabled()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect('/sign-in?status=signed-out');
}

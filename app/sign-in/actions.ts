'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { env, hasDatabaseUrl, isSupabaseAuthEnabled } from '@/lib/env';
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

  if (!hasDatabaseUrl()) {
    redirect('/sign-in?status=auth-error');
  }

  const approvedUser = await db.user.findUnique({
    where: { email },
    select: { memberships: { select: { id: true }, take: 1 } }
  });

  if (!approvedUser || approvedUser.memberships.length === 0) {
    redirect('/sign-in?status=check-email');
  }

  const supabase = await createSupabaseServerClient();
  const redirectTo = new URL('/auth/callback', env.appUrl);
  redirectTo.searchParams.set('next', next.startsWith('/') ? next : '/dashboard');

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

'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { isEligiblePortalUser, newPasswordError } from '@/lib/auth-forms';
import { hasDatabaseUrl, isSupabaseAuthEnabled } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function updatePassword(formData: FormData) {
  if (!isSupabaseAuthEnabled() || !hasDatabaseUrl()) {
    redirect('/sign-in?status=auth-error');
  }

  const password = String(formData.get('password') ?? '');
  const confirmation = String(formData.get('confirmation') ?? '');
  const validationError = newPasswordError(password, confirmation);

  if (validationError) {
    redirect(`/set-password?status=${validationError}`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user: supabaseUser }
  } = await supabase.auth.getUser();

  const email = supabaseUser?.email?.trim().toLowerCase();
  if (!email) redirect('/sign-in?status=callback-error');

  const user = await db.user.findUnique({
    where: { email },
    select: {
      status: true,
      platformRole: true,
      memberships: { select: { id: true }, take: 1 }
    }
  });

  const isEligible = isEligiblePortalUser(
    user
      ? {
          status: user.status,
          platformRole: user.platformRole,
          membershipCount: user.memberships.length
        }
      : undefined
  );

  if (!isEligible) {
    await supabase.auth.signOut();
    redirect('/sign-in?status=invalid-credentials');
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect('/set-password?status=password-update-error');

  redirect('/dashboard?status=password-updated');
}

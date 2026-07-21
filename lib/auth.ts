import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { env, isSupabaseAuthEnabled, hasDatabaseUrl } from '@/lib/env';
import { currentUser } from '@/lib/mock-data';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AppUser } from '@/types/domain';

export async function getCurrentUser(): Promise<AppUser | undefined> {
  if (!isSupabaseAuthEnabled()) {
    return currentUser;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user: supabaseUser }
  } = await supabase.auth.getUser();

  if (!supabaseUser) return undefined;

  const email = supabaseUser.email ?? '';
  const metadata = supabaseUser.user_metadata ?? {};
  const name =
    (typeof metadata.full_name === 'string' && metadata.full_name) ||
    (typeof metadata.name === 'string' && metadata.name) ||
    email ||
    'PermaCool user';

  if (!hasDatabaseUrl() || !email) return undefined;

  const existingUser = await db.user.findUnique({
    where: { email },
    include: { memberships: true, deviceAccess: true }
  });

  if (!existingUser || existingUser.status !== 'approved') return undefined;
  if (existingUser.platformRole === 'customer' && existingUser.memberships.length === 0) return undefined;

  const user = await db.user.update({
    where: { id: existingUser.id },
    data: { name },
    include: { memberships: true, deviceAccess: true }
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    platformRole: user.platformRole,
    status: user.status,
    organizationIds: user.memberships.map((membership) => membership.organizationId),
    allDeviceOrganizationIds: user.memberships
      .filter((membership) => membership.allDevices)
      .map((membership) => membership.organizationId),
    deviceIds: user.deviceAccess.map((assignment) => assignment.deviceId)
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return user;
}

export function isStaff(user: AppUser) {
  return user.platformRole === 'staff_admin' || user.platformRole === 'staff_support';
}

export async function requireStaff(roles: Array<AppUser['platformRole']> = ['staff_admin', 'staff_support']) {
  const user = await requireUser();

  if (!roles.includes(user.platformRole)) {
    redirect('/dashboard');
  }

  return user;
}

export function getAuthStatus() {
  return {
    provider: env.authProvider,
    mode: isSupabaseAuthEnabled() ? 'supabase-live' : 'mock-fallback'
  } as const;
}

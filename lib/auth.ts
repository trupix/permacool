import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { env, hasDatabaseUrl, isSupabaseAuthEnabled } from '@/lib/env';
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

  if (!hasDatabaseUrl()) {
    return {
      ...currentUser,
      id: supabaseUser.id,
      name,
      email: email || currentUser.email
    };
  }

  const defaultOrganization = await db.organization.upsert({
    where: { id: env.defaultOrganizationId },
    update: {},
    create: {
      id: env.defaultOrganizationId,
      name: 'PermaCool Operations',
      status: 'active'
    }
  });

  const existingUser = email ? await db.user.findUnique({ where: { email }, include: { memberships: true } }) : null;

  const user = existingUser
    ? await db.user.update({
        where: { id: existingUser.id },
        data: { name },
        include: { memberships: true }
      })
    : await db.user.create({
        data: {
          id: supabaseUser.id,
          email,
          name,
          role: 'viewer',
          memberships: {
            create: { organizationId: defaultOrganization.id }
          }
        },
        include: { memberships: true }
      });

  const organizationIds = user.memberships.map((membership) => membership.organizationId);

  if (!organizationIds.includes(defaultOrganization.id)) {
    await db.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: defaultOrganization.id
        }
      },
      update: {},
      create: { userId: user.id, organizationId: defaultOrganization.id }
    });
    organizationIds.push(defaultOrganization.id);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationIds
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return user;
}

export function getAuthStatus() {
  return {
    provider: env.authProvider,
    mode: isSupabaseAuthEnabled() ? 'supabase-live' : 'mock-fallback'
  } as const;
}

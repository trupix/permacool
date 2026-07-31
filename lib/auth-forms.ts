export const MIN_PASSWORD_LENGTH = 12;

type PortalUserEligibility = {
  status: string;
  platformRole: string;
  membershipCount: number;
};

export function safeNextPath(value: unknown, fallback = '/dashboard') {
  const candidate = typeof value === 'string' ? value.trim() : '';

  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\')) {
    return fallback;
  }

  try {
    const base = new URL('https://portal.invalid');
    const resolved = new URL(candidate, base);

    if (resolved.origin !== base.origin) return fallback;

    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}

export function isEligiblePortalUser(user: PortalUserEligibility | null | undefined) {
  if (!user || user.status !== 'approved') return false;

  return user.platformRole === 'staff_admin' || user.platformRole === 'staff_support' || user.membershipCount > 0;
}

export function newPasswordError(password: string, confirmation: string) {
  if (password.length < MIN_PASSWORD_LENGTH) return 'password-too-short';
  if (password !== confirmation) return 'password-mismatch';
  return undefined;
}

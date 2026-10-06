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

type PortalDestinationUser = {
  status?: string;
  platformRole: string;
  organizationIds: string[];
};

export function isLabPortalCustomer(user: PortalDestinationUser | undefined, labOrganizationId: string) {
  return Boolean(labOrganizationId && user?.status === 'approved' &&
    user.platformRole === 'customer' && user.organizationIds.includes(labOrganizationId));
}

export function portalNextPath(user: PortalDestinationUser | undefined, labOrganizationId: string, requested: unknown) {
  const next = safeNextPath(requested);
  if (!isLabPortalCustomer(user, labOrganizationId)) return next;
  const pathname = new URL(next, 'https://portal.invalid').pathname;
  // Password recovery must finish before routing to the customer's workspace.
  if (pathname === '/set-password') return next;
  if (pathname === '/lab' || pathname.startsWith('/lab/')) return next;
  return '/lab';
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

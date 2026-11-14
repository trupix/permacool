import { isStaffScope } from '@/lib/access';
import type { AppUser } from '@/types/domain';

// Page-scoped owner access, not a platform-role promotion. Use the authenticated
// database identity returned by requireUser(), never browser-supplied metadata.
export function canAccessPlcOperations(user: AppUser) {
  return user.status === 'approved' && (
    isStaffScope(user) ||
    (user.email.toLowerCase() === 'david@perma.cool' && user.role === 'owner')
  );
}

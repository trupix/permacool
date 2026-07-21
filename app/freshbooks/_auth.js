import { getCurrentUser } from '@/lib/auth'

export async function isFreshbooksAdmin() {
  const user = await getCurrentUser()
  return user?.platformRole === 'staff_admin'
}

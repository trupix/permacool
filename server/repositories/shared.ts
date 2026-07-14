import { hasDatabaseUrl } from '@/lib/env';

export function shouldUseDatabase() {
  return hasDatabaseUrl();
}

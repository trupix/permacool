import { NextResponse, type NextRequest } from 'next/server';
import { safeNextPath, portalNextPath } from '@/lib/auth-forms';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = safeNextPath(requestUrl.searchParams.get('next'));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const user = await getCurrentUser();
      if (!user) {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/sign-in?status=invalid-credentials', requestUrl.origin));
      }
      const destination = portalNextPath(user, process.env.LAB_ORGANIZATION_ID ?? '', next);
      return NextResponse.redirect(new URL(destination, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL('/sign-in?status=callback-error', requestUrl.origin));
}

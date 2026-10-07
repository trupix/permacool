import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isSupabaseAuthEnabled } from '@/lib/env';
import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  if (request.headers.get('host')?.toLowerCase() === 'lab.perma.cool' && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/lab', 'https://lab.perma.cool'));
  }
  if (!isSupabaseAuthEnabled()) {
    return NextResponse.next({ request });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|xml|txt|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
};

import { NextResponse } from 'next/server';
import { env, hasDatabaseUrl, isSupabaseConfigured } from '@/lib/env';

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: 'permacool',
    authProvider: env.authProvider,
    databaseConfigured: hasDatabaseUrl(),
    supabaseConfigured: isSupabaseConfigured()
  });
}

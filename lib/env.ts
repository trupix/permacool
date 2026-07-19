export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  authProvider: process.env.AUTH_PROVIDER ?? 'supabase',
  telemetryIngestToken: process.env.TELEMETRY_INGEST_TOKEN ?? 'change-me',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  defaultOrganizationId: process.env.DEFAULT_ORGANIZATION_ID ?? 'org-permacool'
};

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function isSiteTelemetryApiEnabled() {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.SITE_TELEMETRY_API_ENABLED === 'true'
  );
}

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isSupabaseAuthEnabled() {
  return env.authProvider === 'supabase' && isSupabaseConfigured();
}

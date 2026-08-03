export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  authProvider: process.env.AUTH_PROVIDER ?? 'supabase',
  telemetryIngestToken: process.env.TELEMETRY_INGEST_TOKEN ?? '',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  defaultOrganizationId: process.env.DEFAULT_ORGANIZATION_ID ?? 'org-permacool',
  openVpnProvisioningRelayUrl: process.env.OPENVPN_PROVISIONING_RELAY_URL ?? '',
  gcpProvisioningWorkloadIdentityAudience:
    process.env.GCP_PROVISIONING_WORKLOAD_IDENTITY_AUDIENCE ?? '',
  gcpProvisioningServiceAccountEmail:
    process.env.GCP_PROVISIONING_SERVICE_ACCOUNT_EMAIL ?? ''
};

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function isSiteTelemetryApiEnabled() {
  return process.env.SITE_TELEMETRY_API_ENABLED !== 'false';
}

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isSupabaseAuthEnabled() {
  return env.authProvider === 'supabase' && isSupabaseConfigured();
}

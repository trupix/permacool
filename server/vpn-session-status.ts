import 'server-only';
import { unstable_cache } from 'next/cache';
import { env } from '@/lib/env';
import { getVercelOidcToken } from '@/lib/vercel-oidc';
import { getOpenVpnSessionsFor } from './openvpn-access-server-client';
import { validVpnSessionStatus, type VpnSessionStatus } from '@/lib/equipment/vpn-session-status';

export async function readVpnSessionStatus(identities: string[]): Promise<VpnSessionStatus> {
  const unknown: VpnSessionStatus = { source: 'openvpn-session', state: 'unknown', observedAt: null };
  if (process.env.VPN_SESSION_MONITORING_ENABLED !== 'true' || !identities.length || identities.length > 32) return unknown;
  const sorted = [...new Set(identities)].sort();
  const token = await getVercelOidcToken();
  if (!token) return unknown;
  // Authorization happens BEFORE this function. Cache only the exact authorized identity set.
  // The credential is closure-only: never a cache argument, key, stored response or log field.
  const read = unstable_cache(async () => {
    try {
      const result = await getOpenVpnSessionsFor({
        url: env.openVpnProvisioningRelayUrl,
        workloadIdentityAudience: env.gcpProvisioningWorkloadIdentityAudience,
        serviceAccountEmail: env.gcpProvisioningServiceAccountEmail
      }, sorted, token);
      return { source: 'openvpn-session' as const,
        state: result.sessions.every(session => session.connected) ? 'connected' as const : 'disconnected' as const,
        observedAt: result.observedAt };
    } catch { return unknown; }
  }, ['vpn-session-status-v1', ...sorted], { revalidate: 30 });
  return validVpnSessionStatus(await read());
}

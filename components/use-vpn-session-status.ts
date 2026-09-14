'use client';
import { useEffect, useState } from 'react';
import { validVpnSessionStatus, type VpnSessionStatus } from '@/lib/equipment/vpn-session-status';

export function useVpnSessionStatus(siteId: string, enabled: boolean): VpnSessionStatus | undefined {
  const [result, setResult] = useState<{siteId: string; status: VpnSessionStatus}>();
  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    let controller: AbortController;
    async function check() {
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12_000);
      let status = validVpnSessionStatus(null);
      try {
        const response = await fetch(`/api/sites/${encodeURIComponent(siteId)}/vpn-status`, { cache: 'no-store', signal: controller.signal });
        if (response.ok) status = validVpnSessionStatus(await response.json());
      } catch { /* Never show an old green/red status after a failed request. */ }
      finally { clearTimeout(timeout); }
      if (!stopped) { setResult({ siteId, status }); timer = setTimeout(check, 30_000); }
    }
    void check();
    return () => { stopped = true; clearTimeout(timer); controller?.abort(); };
  }, [siteId, enabled]);
  return enabled && result?.siteId === siteId ? result.status : undefined;
}

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function PlcLibraryRefresh({ revision, receivedAt, lastAttemptAt, lastError }: { revision: string | null; receivedAt: string | null; lastAttemptAt: string | null; lastError: string | null }) {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [stale, setStale] = useState(false);
  useEffect(() => {
    let busy = false; let disposed = false; let controller: AbortController | undefined;
    const check = async () => {
      setStale(!receivedAt || Date.now() - Date.parse(receivedAt) > 3 * 60 * 60 * 1000);
      if (document.hidden || busy) return;
      busy = true; controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 10_000);
      try {
        const response = await fetch('/api/plc-operations/status', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Status unavailable');
        const data = await response.json();
        if (!disposed) { setError(Boolean(data.unavailable)); if (data.revision !== revision || data.receivedAt !== receivedAt || data.lastAttemptAt !== lastAttemptAt || data.lastError !== lastError) router.refresh(); }
      } catch { if (!disposed) setError(true); }
      finally { clearTimeout(timeout); busy = false; }
    };
    void check();
    const timer = setInterval(check, 60_000);
    document.addEventListener('visibilitychange', check);
    return () => { disposed = true; clearInterval(timer); controller?.abort(); document.removeEventListener('visibilitychange', check); };
  }, [revision, receivedAt, lastAttemptAt, lastError, router]);
  return <p role="status">{error ? 'Update check failed. Displayed records may be out of date.' : stale ? 'No recent library confirmation. Treat these records as potentially stale.' : 'Automatic updates enabled · this page checks every minute.'}</p>;
}

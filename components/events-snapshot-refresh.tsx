'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/** Refresh server-rendered history without blanking the existing event list. */
export function EventsSnapshotRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    const refresh = () => {
      if (!pending && document.visibilityState === 'visible') {
        startTransition(() => router.refresh());
      }
    };
    const timer = window.setInterval(refresh, 30_000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [router, pending]);
  return <p className="page-copy">Saved event details · checking for updates every 30 seconds</p>;
}

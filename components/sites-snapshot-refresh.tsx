'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function SitesSnapshotRefresh({ capturedAt }: { capturedAt: number | null }) {
  const router = useRouter();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const refresh = () => { setNow(Date.now()); router.refresh(); };
    const delay = 600000 - (Date.now() % 600000) + 15000;
    let repeat: ReturnType<typeof setInterval> | undefined;
    const timer = setTimeout(() => { refresh(); repeat = setInterval(refresh, 600000); }, delay);
    return () => { clearTimeout(timer); if (repeat) clearInterval(repeat); };
  }, [router]);
  const stale = !capturedAt || now - capturedAt > 20 * 60000;
  return <p className="page-copy" role="status">Saved site status · refreshed every 10 minutes · {capturedAt
    ? <>last saved <time dateTime={new Date(capturedAt).toISOString()}>{new Date(capturedAt).toISOString().replace('T', ' ').slice(0, 19)} UTC</time></>
    : 'awaiting first summary'}{stale ? ' · Summary delayed—these are not current connection readings.' : ''}</p>;
}

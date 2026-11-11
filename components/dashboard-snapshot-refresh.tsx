'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function DashboardSnapshotRefresh({ capturedAt, nextRefreshAt }: { capturedAt: number; nextRefreshAt: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => router.refresh(), Math.max(1000, nextRefreshAt - Date.now() + 500));
    return () => clearTimeout(timer);
  }, [nextRefreshAt, router]);
  return <p className="page-copy">Saved telemetry summary · updates every 10 minutes · last updated <time dateTime={new Date(capturedAt).toISOString()} suppressHydrationWarning>{new Date(capturedAt).toLocaleTimeString()}</time></p>;
}

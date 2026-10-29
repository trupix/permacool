'use client';
import { useEffect, useState } from 'react';
import type { CycleAverageRows } from '@/server/repositories/cycle-averages';

function duration(value: number | null) {
  if (value === null) return 'Not enough completed cycles';
  const seconds = Math.round(value);
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export function CycleAveragesLive({ siteId, timezone, initialRows, initialError = false }: { siteId: string; timezone: string; initialRows: CycleAverageRows; initialError?: boolean }) {
  const [rows, setRows] = useState(initialRows);
  const [error, setError] = useState(initialError);
  const [checked, setChecked] = useState<string | null>(null);
  useEffect(() => {
    let stopped = false, busy = false;
    const controller = new AbortController();
    async function update() {
      if (stopped || busy || document.visibilityState === 'hidden') return;
      busy = true;
      try {
        const response = await fetch('/api/sites/' + encodeURIComponent(siteId) + '/cycle-averages', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Refresh failed');
        const data = await response.json();
        if (!Array.isArray(data.rows)) throw new Error('Invalid response');
        if (!stopped) { setRows(data.rows); setError(false); setChecked(new Date().toISOString()); }
      } catch { if (!stopped) setError(true); }
      finally { busy = false; }
    }
    const interval = setInterval(update, 60000);
    const visible = () => { if (document.visibilityState === 'visible') void update(); };
    document.addEventListener('visibilitychange', visible);
    if (initialError) void update();
    return () => { stopped = true; controller.abort(); clearInterval(interval); document.removeEventListener('visibilitychange', visible); };
  }, [siteId, initialError]);
  return <section aria-label="Cycle averages">
    <h3>Cycle averages · Last 8 system-on hours</h3>
    <p>Shutdown time and telemetry gaps are excluded. Completed, uninterrupted cycles only. Uses the latest 50,000 system-state samples per unit, within 30 days. Updates automatically every minute while this page is visible; results are cached for one minute.</p>
    <p role="status">{error ? 'Automatic update delayed — showing the last available results; retrying automatically.' : checked ? 'Automatically checked at ' + new Date(checked).toLocaleTimeString('en-US', { timeZone: timezone }) : 'Automatic updates enabled'}</p>
    {!rows.length && <p>Waiting for recorded system-on history.</p>}
    {rows.map(row => <div key={row.id}>
      <h4>{row.deviceName} · {row.channel}</h4>
      <div className="equipment-off-cycle"><strong>Average off cycle: {duration(row.off)}</strong><span><b>Low: {duration(row.offLow)} · High: {duration(row.offHigh)}</b></span><span>{row.offCount} completed cycles</span></div>
      <div className="equipment-off-cycle equipment-off-cycle--interval"><strong>Average between off cycles: {duration(row.between)}</strong><span><b>Low: {duration(row.betweenLow)} · High: {duration(row.betweenHigh)}</b></span><span>{row.betweenCount} intervals · reached temperature → next reached temperature</span></div>
      <p>{row.hours >= 7.999 ? 'Full 8-hour window' : `Partial history: ${row.hours.toFixed(2)} of 8 system-on hours`}{row.asOf ? ` · Last included on-time: ${new Date(row.asOf).toLocaleString('en-US', { timeZone: timezone })}` : ' · No observed on-time available'}</p>
    </div>)}
  </section>;
}

'use client';
import { useEffect, useState } from 'react';
import { Clock3, ArrowDown, ArrowUp } from 'lucide-react';
import type { CycleAverageRows } from '@/server/repositories/cycle-averages';

function duration(value: number | null) {
  if (value === null) return 'Not enough completed cycles';
  const seconds = Math.round(value);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours ? `${hours}h ` : ''}${minutes}m ${seconds % 60}s`;
}

export function CycleAveragesLive({ siteId, timezone, initialRows, initialError = false }: { siteId: string; timezone: string; initialRows: CycleAverageRows; initialError?: boolean }) {
  const [rows, setRows] = useState(initialRows);
  const [error, setError] = useState(initialError);
  const [checked, setChecked] = useState<string | null>(null);
  useEffect(() => {
    let stopped = false, busy = false;
    const refreshMs = 30 * 60 * 1000;
    let lastAttempt = initialError ? 0 : Date.now();
    const controller = new AbortController();
    async function update() {
      if (stopped || busy || document.visibilityState === 'hidden') return;
      if (Date.now() - lastAttempt < refreshMs) return;
      lastAttempt = Date.now();
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
    const interval = setInterval(update, refreshMs);
    const visible = () => { if (document.visibilityState === 'visible') void update(); };
    document.addEventListener('visibilitychange', visible);
    if (initialError) void update();
    return () => { stopped = true; controller.abort(); clearInterval(interval); document.removeEventListener('visibilitychange', visible); };
  }, [siteId, initialError]);
  return <section aria-label="Cycle averages">
    <h3>Cycle averages · Last 8 system-on hours</h3>
    <details className="cycle-summary-details"><summary>How these numbers are calculated</summary><p>Shutdown time and telemetry gaps are excluded. Completed, uninterrupted cycles only. Uses the latest 50,000 system-state samples per unit, within 30 days. Average, low, and high update every 30 minutes while this page is visible; results are cached for 30 minutes. Returning to a hidden tab only checks when the interval is due.</p></details>
    <p role="status">{error ? 'Automatic update delayed — showing the last available results; retrying at the next 30-minute interval.' : checked ? '30-minute updates · Last checked at ' + new Date(checked).toLocaleTimeString('en-US', { timeZone: timezone }) : 'Updates automatically every 30 minutes'}</p>
    {!rows.length && <p>Waiting for recorded system-on history.</p>}
    {rows.map(row => <div key={row.id}>
      <h4>{row.deviceName} · {row.channel}</h4>
      <p className="cycle-summary-label">Off cycle <span>· {row.offCount} completed cycles</span></p>
      <div className="cycle-summary-boxes" role="group" aria-label="Off-cycle statistics">
        <div className="equipment-off-cycle cycle-summary-average"><span><Clock3 size={15} aria-hidden="true" /> Average</span><strong>{duration(row.off)}</strong></div>
        <div className="equipment-off-cycle"><span><ArrowDown size={15} aria-hidden="true" /> Low</span><strong>{duration(row.offLow)}</strong></div>
        <div className="equipment-off-cycle"><span><ArrowUp size={15} aria-hidden="true" /> High</span><strong>{duration(row.offHigh)}</strong></div>
      </div>
      <p className="cycle-summary-label">Between off cycles <span>· {row.betweenCount} intervals</span></p>
      <div className="cycle-summary-boxes" role="group" aria-label="Time between off-cycle statistics">
        <div className="equipment-off-cycle equipment-off-cycle--interval cycle-summary-average"><span><Clock3 size={15} aria-hidden="true" /> Average</span><strong>{duration(row.between)}</strong></div>
        <div className="equipment-off-cycle equipment-off-cycle--interval"><span><ArrowDown size={15} aria-hidden="true" /> Low</span><strong>{duration(row.betweenLow)}</strong></div>
        <div className="equipment-off-cycle equipment-off-cycle--interval"><span><ArrowUp size={15} aria-hidden="true" /> High</span><strong>{duration(row.betweenHigh)}</strong></div>
      </div>
      <p>{row.hours >= 7.999 ? 'Full 8-hour window' : `Partial history: ${row.hours.toFixed(2)} of 8 system-on hours`}{row.asOf ? ` · Last included on-time: ${new Date(row.asOf).toLocaleString('en-US', { timeZone: timezone })}` : ' · No observed on-time available'}</p>
    </div>)}
  </section>;
}

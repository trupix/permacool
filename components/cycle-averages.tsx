import { getSiteCycleAverages } from '@/server/repositories/cycle-averages';

function duration(value: number | null) {
  if (value === null) return 'Not enough completed cycles';
  const seconds = Math.round(value);
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export async function CycleAverages({ siteId, timezone }: { siteId: string; timezone: string }) {
  let rows;
  try { rows = await getSiteCycleAverages(siteId); }
  catch { return <p>Cycle averages temporarily unavailable. Event history is still shown below.</p>; }
  return <section aria-label="Cycle averages">
    <h3>Cycle averages · Last 8 system-on hours</h3>
    <p>Shutdown time and telemetry gaps are excluded. Completed, uninterrupted cycles only. Uses the latest 50,000 system-state samples per unit, within 30 days. Refresh the page for updated averages; cached for one minute.</p>
    {!rows.length && <p>Waiting for recorded system-on history.</p>}
    {rows.map(row => <div key={row.id}>
      <h4>{row.deviceName} · {row.channel}</h4>
      <div className="equipment-off-cycle"><strong>Average off cycle: {duration(row.off)}</strong><span>{row.offCount} completed cycles</span></div>
      <div className="equipment-off-cycle equipment-off-cycle--interval"><strong>Average between off cycles: {duration(row.between)}</strong><span>{row.betweenCount} intervals · reached temperature → next reached temperature</span></div>
      <p>{row.hours >= 7.999 ? 'Full 8-hour window' : `Partial history: ${row.hours.toFixed(2)} of 8 system-on hours`} · Last included on-time: {new Date(row.asOf).toLocaleString('en-US', { timeZone: timezone })}</p>
    </div>)}
  </section>;
}

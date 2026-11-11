'use client';

import { useEffect, useState } from 'react';
import { Activity, CircleAlert, Gauge, Power } from 'lucide-react';
import { readKe2Telemetry, type Ke2Point } from '@/lib/equipment/ke2-telemetry';
import styles from './ke2-dashboard-section.module.css';

export function Ke2DashboardSection({ points, fetchFailed }: { points: Ke2Point[]; fetchFailed: boolean }) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const state = readKe2Telemetry(points, now, fetchFailed);
  return (
    <section className={styles.section} aria-labelledby="ke2-title">
      <header className={styles.header}>
        <div className={styles.identity}><span className={styles.icon}><Gauge size={26} /></span><div>
          <p className={styles.eyebrow}>REFRIGERATION CONTROL</p><h2 id="ke2-title">KE2 Temp + Valve</h2>
          <p className={styles.subtitle}>Live controller readings · updates every 15 seconds</p>
        </div></div>
        <div className={styles.statuses}>
          <span className={`${styles.badge} ${state.connected ? styles.connected : ''}`}><Activity size={15} />{state.communication}</span>
          <span className={`${styles.badge} ${state.externalOff ? styles.off : ''}`}><Power size={15} />{state.controller}</span>
          <span className={styles.badge}>Fahrenheit</span>
        </div>
      </header>
      {state.externalOff && <p className={styles.external}>External system off from channel 3. Communication remains connected.</p>}
      <div className={styles.metrics}>
        {state.metrics.map(metric => <article className={styles.metric} key={metric.key}>
          <h3>{metric.label}</h3><div className={styles.value}>{metric.value === null ? '—' : metric.value.toFixed(1)}</div>
          <span className={styles.unit}>{metric.unit}</span>
          <small>{metric.value === null ? metric.unavailable : metric.key === 'valve_position' && state.manualValve ? 'Manual valve position' : 'KE2 reading'}</small>
        </article>)}
      </div>
      <footer className={styles.footer}>
        <div className={styles.alarms}><CircleAlert size={17} /><div><strong>Alarms</strong>
          {!state.alarmsKnown ? <span>Unknown — awaiting verified readings</span> : state.alarms.length ?
            <ul>{state.alarms.map(alarm => <li key={alarm}>{alarm}</li>)}</ul> : <span>No active alarms</span>}
        </div></div>
        <span className={styles.updated}>{state.observedAt === null ? 'Waiting for the first update' :
          `Last observed ${new Date(state.observedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}`}</span>
      </footer>
    </section>
  );
}

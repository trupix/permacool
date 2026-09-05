'use client';

import { useEffect, useState } from 'react';
import type { ConnectionStage } from '@/lib/equipment/controller-connection-path';
import { connectionIconState } from '@/lib/equipment/connection-icon-state';

const icons = [
  { id: 'vpn', label: 'VPN / EPIC', file: 'vpn' },
  { id: 'strategy', label: 'PAC', file: 'pac' },
  { id: 'io', label: 'I/O', file: 'io' },
  { id: 'pacRead', label: 'Node-RED', file: 'node-red' },
  { id: 'delivery', label: 'Cloud', file: 'cloud' },
  { id: 'website', label: 'PermaCool', file: 'website' }
] as const;

export function ConnectionHealthNav({ stages }: { stages: ConnectionStage[] }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 5_000);
    return () => window.clearInterval(timer);
  }, []);
  return <nav className="connection-health-nav" aria-label="Cannon Falls operating connections">
    {icons.map(({ id, label, file }) => {
      const stage = stages.find((item) => item.id === id);
      const state = stage ? connectionIconState(stage, now) : 'checking';
      const status = id === 'vpn' ? 'VPN session unverified' : state === 'checking' ? (stage?.state === 'fault' || stage?.state === 'healthy' ? 'Stale reading' : stage?.status ?? 'Checking') : stage?.status;
      const detail = id === 'vpn' ? 'Direct VPN session health is not published. PAC API reachability is shown under Node-RED.' : stage?.detail ?? 'Waiting for this page’s health readings.';
      return <a key={id} className={`connection-health-nav__item is-${state}`} href="#controller-connection-path-title"
        aria-label={`${label}: ${status}. ${detail}`}>
        <span className="connection-health-nav__art" aria-hidden="true">
          <img src={file === 'website' ? '/images/brand/perma-cool-wordmark.png' : `/images/connection-health/${file}.svg`} alt="" width={76} height={38} />
        </span>
        <span className="connection-health-nav__name">{label}</span>
        <span className="connection-health-nav__detail"><strong>{status}</strong><span>{detail}</span>{stage?.observedAt ? <small>Observed: {new Date(stage.observedAt).toLocaleString()}</small> : null}</span>
      </a>;
    })}
  </nav>;
}

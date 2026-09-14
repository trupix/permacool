import type { ConnectionStage } from './controller-connection-path';

export function connectionIconState(stage: ConnectionStage, now: number): 'checking' | 'connected' | 'disconnected' {
  // A PAC read can be local to EPIC; it does not establish VPN-session status.
  if (stage.id === 'vpn' && stage.source !== 'openvpn-session') return 'checking';
  if (stage.state === 'checking' || stage.state === 'stale' || stage.state === 'unmonitored') return 'checking';
  const observed = stage.observedAt ? Date.parse(stage.observedAt) : NaN;
  if (!Number.isFinite(observed) || now - observed > (stage.id === 'vpn' ? 60_000 : 45_000) || observed - now > (stage.id === 'vpn' ? 5_000 : 60_000)) return 'checking';
  return stage.state === 'healthy' ? 'connected' : 'disconnected';
}

export type VpnSessionStatus = {
  source: 'openvpn-session';
  state: 'connected' | 'disconnected' | 'unknown';
  observedAt: string | null;
};

export function validVpnSessionStatus(value: unknown, now = Date.now()): VpnSessionStatus {
  const unknown: VpnSessionStatus = { source: 'openvpn-session', state: 'unknown', observedAt: null };
  if (!value || typeof value !== 'object') return unknown;
  const status = value as VpnSessionStatus;
  const time = typeof status.observedAt === 'string' ? Date.parse(status.observedAt) : NaN;
  if (status.source !== 'openvpn-session' || !['connected', 'disconnected'].includes(status.state) ||
      !Number.isFinite(time) || now - time > 60_000 || time - now > 5_000) return unknown;
  return { source: 'openvpn-session', state: status.state, observedAt: status.observedAt };
}

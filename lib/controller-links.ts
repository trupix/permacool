const nodeRedFlowByVpnIdentity: Record<string, string> = {
  'cannon-falls-groov-epic-01': '#flow/a39a54de197f6707'
};

function isPermacoolVpnAddress(tunnelIp: string | null | undefined): tunnelIp is string {
  if (!tunnelIp) return false;
  const octets = tunnelIp.split('.');
  if (
    octets.length !== 4 ||
    octets.some((octet) => !/^\d{1,3}$/.test(octet) || Number(octet) > 255)
  ) {
    return false;
  }
  return octets[0] === '172' && octets[1] === '28';
}

function isGroovEpic(controllerName: string) {
  return controllerName.toLowerCase().includes('groov epic');
}

export function groovManageUrl(controllerName: string, tunnelIp: string | null | undefined) {
  if (!isGroovEpic(controllerName) || !isPermacoolVpnAddress(tunnelIp)) return null;

  return `https://${tunnelIp}/manage/`;
}

export function groovManageUrlForDevices(
  devices: Array<{ name: string; vpnTunnelIp?: string | null }>
) {
  for (const device of devices) {
    const url = groovManageUrl(device.name, device.vpnTunnelIp);
    if (url) return url;
  }
  return null;
}

export function nodeRedUrlForDevices(
  devices: Array<{
    name: string;
    protocol: string;
    vpnIdentity?: string | null;
    vpnTunnelIp?: string | null;
  }>
) {
  for (const device of devices) {
    if (
      !isGroovEpic(device.name) ||
      !device.protocol.toLowerCase().includes('node-red') ||
      !isPermacoolVpnAddress(device.vpnTunnelIp)
    ) {
      continue;
    }

    const flowFragment = device.vpnIdentity
      ? nodeRedFlowByVpnIdentity[device.vpnIdentity] ?? ''
      : '';
    return `https://${device.vpnTunnelIp}/node-red/${flowFragment}`;
  }
  return null;
}

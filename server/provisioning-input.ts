export type NewSiteInput = {
  organizationId: string;
  name: string;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  region: string;
  timezone: string;
};

export type NewPlcInput = {
  siteId: string;
  name: string;
  plcModel: string;
  serialNumber: string | null;
  firmwareVersion: string | null;
  protocol: string;
  localIpAddress: string | null;
  tunnelIp: string | null;
};

export type UpdatePlcInput = {
  name: string;
  plcModel: string;
  protocol: string;
  serialNumber: string | null;
  firmwareVersion: string | null;
  localIpAddress: string | null;
  tunnelIp: string | null;
};

export type SiteAddressInput = {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type ExternalVpnProfileInput = {
  identity: string;
};

function text(value: unknown, maximum: number) {
  if (typeof value !== 'string') return null;
  const result = value.trim();
  return result && result.length <= maximum ? result : null;
}

function optionalText(value: unknown, maximum: number) {
  if (value === undefined || value === null || value === '') return null;
  return text(value, maximum);
}

function isIpv4(value: string) {
  const parts = value.split('.');
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

export function parseNewSiteInput(value: unknown): NewSiteInput | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  const organizationId = text(input.organizationId, 100);
  const name = text(input.name, 120);
  const timezone = text(input.timezone, 80);
  const country = text(input.country, 60) ?? 'US';
  const state = optionalText(input.state, 80);
  const city = optionalText(input.city, 100);
  const region = optionalText(input.region, 120) ?? [state, country].filter(Boolean).join(', ');

  if (!organizationId || !name || !timezone || !region || !/^[A-Za-z_]+\/[A-Za-z0-9_+\-/]+$/.test(timezone)) return null;

  return {
    organizationId,
    name,
    addressLine1: optionalText(input.addressLine1, 180),
    city,
    state,
    postalCode: optionalText(input.postalCode, 24),
    country,
    region,
    timezone
  };
}

export function parseNewPlcInput(value: unknown): NewPlcInput | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  const siteId = text(input.siteId, 100);
  const name = text(input.name, 120);
  const plcModel = text(input.plcModel, 120);
  const protocol = text(input.protocol, 120) ?? 'Node-RED HTTPS telemetry';
  const localIpAddress = optionalText(input.localIpAddress, 45);
  const tunnelIp = optionalText(input.tunnelIp, 45);

  if (!siteId || !name || !plcModel) return null;
  if (localIpAddress && !isIpv4(localIpAddress)) return null;
  if (tunnelIp && !isIpv4(tunnelIp)) return null;

  return {
    siteId,
    name,
    plcModel,
    protocol,
    serialNumber: optionalText(input.serialNumber, 100),
    firmwareVersion: optionalText(input.firmwareVersion, 100),
    localIpAddress,
    tunnelIp
  };
}

export function parseUpdatePlcInput(value: unknown): UpdatePlcInput | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  const name = text(input.name, 120);
  const plcModel = text(input.plcModel, 120);
  const protocol = text(input.protocol, 120);
  const localIpAddress = optionalText(input.localIpAddress, 45);
  const tunnelIp = optionalText(input.tunnelIp, 45);

  if (!name || !plcModel || !protocol) return null;
  if (localIpAddress && !isIpv4(localIpAddress)) return null;
  if (tunnelIp && !isIpv4(tunnelIp)) return null;

  return {
    name,
    plcModel,
    protocol,
    serialNumber: optionalText(input.serialNumber, 100),
    firmwareVersion: optionalText(input.firmwareVersion, 100),
    localIpAddress,
    tunnelIp
  };
}

export function parseSiteAddressInput(value: unknown): SiteAddressInput | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  const addressLine1 = text(input.addressLine1, 180);
  const city = text(input.city, 100);
  const state = text(input.state, 80);
  const postalCode = text(input.postalCode, 24);
  const country = text(input.country, 60) ?? 'US';

  if (!addressLine1 || !city || !state || !postalCode) return null;
  return { addressLine1, city, state, postalCode, country };
}

export function parseExternalVpnProfileInput(value: unknown): ExternalVpnProfileInput | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  const identity = text(input.identity, 100);
  if (!identity || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(identity)) return null;
  return { identity };
}

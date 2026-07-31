import { db } from '@/lib/db';
import { devices, getDevicesForSite, getTelemetryForDevice, sites } from '@/lib/mock-data';
import type { Device, TelemetryPoint } from '@/types/domain';
import { shouldUseDatabase } from './shared';
import { deviceWhere, isStaffScope, type AccessScope } from '@/lib/access';

function filterMockDevices(scope: AccessScope, rows: Device[]) {
  if (isStaffScope(scope)) return rows;
  return rows.filter((device) => {
    return scope.deviceIds.includes(device.id) || scope.allDeviceOrganizationIds.some((orgId) =>
      requireMockSiteOrganization(device.siteId) === orgId
    );
  });
}

function requireMockSiteOrganization(siteId: string) {
  const site = sites.find((candidate) => candidate.id === siteId);
  return site?.organizationId ?? '';
}

export async function getDevices(scope: AccessScope): Promise<Device[]> {
  if (!shouldUseDatabase()) return filterMockDevices(scope, devices);

  const rows = await db.device.findMany({
    where: deviceWhere(scope),
    include: { vpnEnrollment: true },
    orderBy: { name: 'asc' }
  });
  return rows.map(mapDevice);
}

export async function getDevicesBySite(scope: AccessScope, siteId: string): Promise<Device[]> {
  if (!shouldUseDatabase()) return filterMockDevices(scope, getDevicesForSite(siteId));
  const rows = await db.device.findMany({
    where: { AND: [{ siteId }, deviceWhere(scope)] },
    include: { vpnEnrollment: true },
    orderBy: { name: 'asc' }
  });
  return rows.map(mapDevice);
}

export async function getDevice(scope: AccessScope, deviceId: string): Promise<Device | undefined> {
  if (!shouldUseDatabase()) return filterMockDevices(scope, devices).find((device) => device.id === deviceId);
  const row = await db.device.findFirst({
    where: { AND: [{ id: deviceId }, deviceWhere(scope)] },
    include: { vpnEnrollment: true }
  });
  return row ? mapDevice(row) : undefined;
}

export async function getDeviceTelemetry(scope: AccessScope, deviceId: string): Promise<TelemetryPoint[]> {
  const allowedDevice = await getDevice(scope, deviceId);
  if (!allowedDevice) return [];
  if (!shouldUseDatabase()) return getTelemetryForDevice(deviceId);
  const rows = await db.telemetryPoint.findMany({ where: { deviceId }, orderBy: { label: 'asc' } });

  return rows.map((row) => ({
    id: row.id,
    deviceId: row.deviceId,
    key: row.key,
    label: row.label,
    unit: row.unit,
    latestValue: row.latestValue,
    latestTimestamp: row.latestTimestamp.toISOString()
  }));
}

export async function getDeviceIds(scope: AccessScope): Promise<string[]> {
  if (!shouldUseDatabase()) return filterMockDevices(scope, devices).map((device) => device.id);
  const rows = await db.device.findMany({ where: deviceWhere(scope), select: { id: true } });
  return rows.map((row) => row.id);
}

function mapDevice(row: {
  id: string;
  siteId: string;
  name: string;
  plcModel: string;
  protocol: string;
  status: Device['status'];
  lastSeenAt: Date | null;
  firmwareVersion: string | null;
  serialNumber: string | null;
  vpnEnrollment?: {
    identity: string;
    tunnelIp: string | null;
    localIpAddress: string | null;
    profileStatus: string;
    lastProfileIssuedAt: Date | null;
  } | null;
}): Device {
  return {
    id: row.id,
    siteId: row.siteId,
    name: row.name,
    plcModel: row.plcModel,
    protocol: row.protocol,
    status: row.status,
    lastSeenAt: row.lastSeenAt?.toISOString() ?? 'Never',
    firmwareVersion: row.firmwareVersion ?? 'Unknown',
    serialNumber: row.serialNumber,
    vpnIdentity: row.vpnEnrollment?.identity ?? null,
    vpnTunnelIp: row.vpnEnrollment?.tunnelIp ?? null,
    localIpAddress: row.vpnEnrollment?.localIpAddress ?? null,
    vpnProfileStatus:
      (row.vpnEnrollment?.profileStatus as Device['vpnProfileStatus'] | undefined) ?? 'external',
    vpnProfileIssuedAt: row.vpnEnrollment?.lastProfileIssuedAt?.toISOString() ?? null
  };
}

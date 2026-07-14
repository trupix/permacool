import { db } from '@/lib/db';
import { devices, getDeviceById, getDevicesForSite, getTelemetryForDevice } from '@/lib/mock-data';
import type { Device, TelemetryPoint } from '@/types/domain';
import { shouldUseDatabase } from './shared';

export async function getDevices(): Promise<Device[]> {
  if (!shouldUseDatabase()) return devices;

  const rows = await db.device.findMany({ orderBy: { name: 'asc' } });
  return rows.map(mapDevice);
}

export async function getDevicesBySite(siteId: string): Promise<Device[]> {
  if (!shouldUseDatabase()) return getDevicesForSite(siteId);
  const rows = await db.device.findMany({ where: { siteId }, orderBy: { name: 'asc' } });
  return rows.map(mapDevice);
}

export async function getDevice(deviceId: string): Promise<Device | undefined> {
  if (!shouldUseDatabase()) return getDeviceById(deviceId);
  const row = await db.device.findUnique({ where: { id: deviceId } });
  return row ? mapDevice(row) : undefined;
}

export async function getDeviceTelemetry(deviceId: string): Promise<TelemetryPoint[]> {
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

export async function getDeviceIds(): Promise<string[]> {
  if (!shouldUseDatabase()) return devices.map((device) => device.id);
  const rows = await db.device.findMany({ select: { id: true } });
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
}): Device {
  return {
    id: row.id,
    siteId: row.siteId,
    name: row.name,
    plcModel: row.plcModel,
    protocol: row.protocol,
    status: row.status,
    lastSeenAt: row.lastSeenAt?.toISOString() ?? 'Never',
    firmwareVersion: row.firmwareVersion ?? 'Unknown'
  };
}

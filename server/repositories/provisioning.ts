import { db } from '@/lib/db';
import { devices as fallbackDevices, sites as fallbackSites } from '@/lib/mock-data';
import { ensureProvisioningStorage } from '@/server/provisioning-storage';
import type { NewPlcInput, NewSiteInput } from '@/server/provisioning-input';
import type { AppUser, VpnProfileStatus } from '@/types/domain';
import { shouldUseDatabase } from './shared';

export type ProvisioningDevice = {
  id: string;
  siteId: string;
  name: string;
  plcModel: string;
  serialNumber: string | null;
  firmwareVersion: string | null;
  status: 'online' | 'offline' | 'degraded';
  vpnIdentity: string | null;
  tunnelIp: string | null;
  localIpAddress: string | null;
  vpnProfileStatus: VpnProfileStatus;
  vpnProfileIssuedAt: string | null;
};

export type ProvisioningSite = {
  id: string;
  organizationId: string;
  name: string;
  region: string;
  timezone: string;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  devices: ProvisioningDevice[];
};

export type ProvisioningSnapshot = {
  sites: ProvisioningSite[];
  storageReady: boolean;
};

function slug(value: string) {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')
    .slice(0, 52) || 'controller';
}

function fallbackSnapshot(): ProvisioningSnapshot {
  return {
    storageReady: false,
    sites: fallbackSites.map((site) => ({
      ...site,
      addressLine1: null,
      city: null,
      state: null,
      postalCode: null,
      country: null,
      devices: fallbackDevices.filter((device) => device.siteId === site.id).map((device) => ({
        ...device,
        serialNumber: device.serialNumber ?? null,
        firmwareVersion: device.firmwareVersion || null,
        vpnIdentity: device.vpnIdentity ?? null,
        tunnelIp: device.vpnTunnelIp ?? null,
        localIpAddress: null,
        vpnProfileStatus: device.vpnProfileStatus ?? 'external',
        vpnProfileIssuedAt: null
      }))
    }))
  };
}

export async function getProvisioningSnapshot(user: AppUser): Promise<ProvisioningSnapshot> {
  if (!shouldUseDatabase() || !(await ensureProvisioningStorage())) return fallbackSnapshot();

  const rows = await db.site.findMany({
    where: { organizationId: { in: user.organizationIds } },
    include: {
      provisioningDetails: true,
      devices: {
        include: { vpnEnrollment: true },
        orderBy: { name: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  return {
    storageReady: true,
    sites: rows.map((site) => ({
      id: site.id,
      organizationId: site.organizationId,
      name: site.name,
      region: site.region,
      timezone: site.timezone,
      addressLine1: site.provisioningDetails?.addressLine1 ?? null,
      city: site.provisioningDetails?.city ?? null,
      state: site.provisioningDetails?.state ?? null,
      postalCode: site.provisioningDetails?.postalCode ?? null,
      country: site.provisioningDetails?.country ?? null,
      devices: site.devices.map((device) => ({
        id: device.id,
        siteId: device.siteId,
        name: device.name,
        plcModel: device.plcModel,
        serialNumber: device.serialNumber,
        firmwareVersion: device.firmwareVersion,
        status: device.status,
        vpnIdentity: device.vpnEnrollment?.identity ?? null,
        tunnelIp: device.vpnEnrollment?.tunnelIp ?? null,
        localIpAddress: device.vpnEnrollment?.localIpAddress ?? null,
        vpnProfileStatus: (device.vpnEnrollment?.profileStatus as VpnProfileStatus | undefined) ?? 'external',
        vpnProfileIssuedAt: device.vpnEnrollment?.lastProfileIssuedAt?.toISOString() ?? null
      }))
    }))
  };
}

async function uniqueSiteId(name: string) {
  const base = `site-${slug(name)}`;
  if (!(await db.site.findUnique({ where: { id: base }, select: { id: true } }))) return base;
  return `${base}-${Date.now().toString(36).slice(-5)}`;
}

async function uniqueDeviceIdentity(siteName: string, deviceName: string) {
  const base = slug(`${siteName}-${deviceName}`);
  if (!(await db.vpnEnrollment.findUnique({ where: { identity: base }, select: { id: true } }))) return base;
  return `${base}-${Date.now().toString(36).slice(-5)}`;
}

export async function createProvisionedSite(input: NewSiteInput, actor: AppUser) {
  if (!shouldUseDatabase() || !(await ensureProvisioningStorage())) return null;
  const organizationId = actor.organizationIds[0];
  if (!organizationId) return null;
  const id = await uniqueSiteId(input.name);

  return db.$transaction(async (transaction) => {
    const site = await transaction.site.create({
      data: {
        id,
        organizationId,
        name: input.name,
        region: input.region,
        timezone: input.timezone,
        gatewayStatus: 'offline',
        provisioningDetails: {
          create: {
            addressLine1: input.addressLine1,
            city: input.city,
            state: input.state,
            postalCode: input.postalCode,
            country: input.country
          }
        }
      }
    });
    await transaction.auditLog.create({
      data: {
        actorUserId: actor.id,
        entityType: 'site',
        entityId: site.id,
        action: `Created site: ${site.name}`,
        metadata: { region: site.region, timezone: site.timezone }
      }
    });
    return site;
  });
}

export async function createProvisionedDevice(input: NewPlcInput, actor: AppUser) {
  if (!shouldUseDatabase() || !(await ensureProvisioningStorage())) return null;
  const site = await db.site.findFirst({
    where: { id: input.siteId, organizationId: { in: actor.organizationIds } },
    select: { id: true, name: true }
  });
  if (!site) return null;

  const identity = await uniqueDeviceIdentity(site.name, input.name);
  const id = `${input.plcModel.toLowerCase().includes('groov') ? 'epic' : 'plc'}-${identity}-${Date.now().toString(36).slice(-4)}`;

  return db.$transaction(async (transaction) => {
    const device = await transaction.device.create({
      data: {
        id,
        siteId: site.id,
        name: input.name,
        plcModel: input.plcModel,
        protocol: input.protocol,
        serialNumber: input.serialNumber,
        firmwareVersion: input.firmwareVersion,
        status: 'offline',
        vpnEnrollment: {
          create: {
            identity,
            tunnelIp: input.tunnelIp,
            localIpAddress: input.localIpAddress,
            profileStatus: 'not_generated'
          }
        }
      },
      include: { vpnEnrollment: true }
    });
    await transaction.auditLog.create({
      data: {
        actorUserId: actor.id,
        entityType: 'device',
        entityId: device.id,
        action: `Added PLC: ${device.name}`,
        metadata: { siteId: site.id, plcModel: device.plcModel, vpnIdentity: identity, tunnelIp: input.tunnelIp }
      }
    });
    return device;
  });
}

export async function getDeviceForVpnIssue(deviceId: string, actor: AppUser) {
  if (!shouldUseDatabase() || !(await ensureProvisioningStorage())) return null;
  return db.device.findFirst({
    where: { id: deviceId, site: { organizationId: { in: actor.organizationIds } } },
    include: { site: true, vpnEnrollment: true }
  });
}

export async function markVpnProfileIssued(deviceId: string, serverHost: string, actor: AppUser) {
  if (!(await ensureProvisioningStorage())) return;
  await db.$transaction(async (transaction) => {
    await transaction.vpnEnrollment.update({
      where: { deviceId },
      data: { profileStatus: 'issued', vpnServerHost: serverHost, lastProfileIssuedAt: new Date() }
    });
    await transaction.auditLog.create({
      data: {
        actorUserId: actor.id,
        entityType: 'vpnProfile',
        entityId: deviceId,
        action: 'Generated unique OpenVPN profile',
        metadata: { serverHost }
      }
    });
  });
}

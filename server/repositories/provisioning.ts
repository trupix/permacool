import { db } from '@/lib/db';
import { deviceWhere, siteWhere } from '@/lib/access';
import { devices as fallbackDevices, sites as fallbackSites } from '@/lib/mock-data';
import { scopeProvisioningFallback } from '@/lib/provisioning-scope';
import {
  canIssueVpnProfile,
  canManageSiteEquipment,
  canRegisterExternalVpnProfile
} from '@/lib/workspace-access';
import { ensureProvisioningStorage } from '@/server/provisioning-storage';
import type { NewPlcInput, NewSiteInput, SiteAddressInput, UpdatePlcInput } from '@/server/provisioning-input';
import {
  claimExternalVpnProfile,
  claimVpnProfileGeneration,
  completeVpnProfileGeneration,
  VpnOperationStateConflict
} from '@/server/vpn-operation-state';
import type { AppUser, VpnProfileStatus } from '@/types/domain';
import { shouldUseDatabase } from './shared';

export type ProvisioningDevice = {
  id: string;
  siteId: string;
  name: string;
  plcModel: string;
  protocol: string;
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

function fallbackSnapshot(user: AppUser): ProvisioningSnapshot {
  const scoped = scopeProvisioningFallback(user, fallbackSites, fallbackDevices);
  return {
    storageReady: false,
    sites: scoped.sites.map((site) => ({
      ...site,
      addressLine1: site.addressLine1 ?? null,
      city: site.city ?? null,
      state: site.state ?? null,
      postalCode: site.postalCode ?? null,
      country: site.country ?? null,
      devices: scoped.devices.filter((device) => device.siteId === site.id).map((device) => ({
        ...device,
        serialNumber: device.serialNumber ?? null,
        firmwareVersion: device.firmwareVersion || null,
        protocol: device.protocol,
        vpnIdentity: device.vpnIdentity ?? null,
        tunnelIp: device.vpnTunnelIp ?? null,
        localIpAddress: null,
        vpnProfileStatus: device.vpnProfileStatus ?? (device.vpnIdentity ? 'external' : 'not_generated'),
        vpnProfileIssuedAt: null
      }))
    }))
  };
}

export async function getProvisioningSnapshot(user: AppUser): Promise<ProvisioningSnapshot> {
  if (!shouldUseDatabase()) return fallbackSnapshot(user);
  if (!(await ensureProvisioningStorage())) return { storageReady: false, sites: [] };

  const rows = await db.site.findMany({
    where: siteWhere(user),
    include: {
      provisioningDetails: true,
      devices: {
        where: deviceWhere(user),
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
        protocol: device.protocol,
        serialNumber: device.serialNumber,
        firmwareVersion: device.firmwareVersion,
        status: device.status,
        vpnIdentity: device.vpnEnrollment?.identity ?? null,
        tunnelIp: device.vpnEnrollment?.tunnelIp ?? null,
        localIpAddress: device.vpnEnrollment?.localIpAddress ?? null,
        vpnProfileStatus: (device.vpnEnrollment?.profileStatus as VpnProfileStatus | undefined) ?? 'not_generated',
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
  if (!canManageSiteEquipment(actor, input.organizationId)) return null;
  const organizationId = input.organizationId;
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
    where: { AND: [{ id: input.siteId }, siteWhere(actor)] },
    select: { id: true, name: true, organizationId: true }
  });
  if (!site || !canManageSiteEquipment(actor, site.organizationId)) return null;

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

export class ProvisioningTunnelIpPermissionError extends Error {}

export async function updateProvisionedDevice(deviceId: string, input: UpdatePlcInput, actor: AppUser) {
  if (!shouldUseDatabase() || !(await ensureProvisioningStorage())) return null;

  return db.$transaction(async (transaction) => {
    const device = await transaction.device.findFirst({
      where: { AND: [{ id: deviceId }, deviceWhere(actor)] },
      include: { site: true, vpnEnrollment: true }
    });
    if (!device || !canManageSiteEquipment(actor, device.site.organizationId)) return null;

    const currentTunnelIp = device.vpnEnrollment?.tunnelIp ?? null;
    if (input.tunnelIp !== currentTunnelIp && !canIssueVpnProfile(actor, device.site.organizationId)) {
      throw new ProvisioningTunnelIpPermissionError('Owner role is required to change the VPN tunnel address.');
    }

    const updated = await transaction.device.update({
      where: { id: device.id },
      data: {
        name: input.name,
        plcModel: input.plcModel,
        protocol: input.protocol,
        serialNumber: input.serialNumber,
        firmwareVersion: input.firmwareVersion,
        vpnEnrollment: device.vpnEnrollment
          ? {
              update: {
                localIpAddress: input.localIpAddress,
                tunnelIp: input.tunnelIp
              }
            }
          : undefined
      },
      include: { vpnEnrollment: true }
    });

    await transaction.auditLog.create({
      data: {
        actorUserId: actor.id,
        entityType: 'device',
        entityId: device.id,
        action: `Updated PLC: ${updated.name}`,
        metadata: {
          siteId: device.siteId,
          organizationId: device.site.organizationId,
          plcModel: updated.plcModel,
          protocol: updated.protocol,
          tunnelIp: updated.vpnEnrollment?.tunnelIp ?? null
        }
      }
    });

    return updated;
  });
}

export async function updateProvisionedSiteAddress(
  siteId: string,
  input: SiteAddressInput,
  actor: AppUser
) {
  if (!shouldUseDatabase() || !(await ensureProvisioningStorage())) return null;
  const site = await db.site.findFirst({
    where: { AND: [{ id: siteId }, siteWhere(actor)] },
    select: { id: true, name: true, organizationId: true }
  });
  if (!site || !canManageSiteEquipment(actor, site.organizationId)) return null;

  return db.$transaction(async (transaction) => {
    const details = await transaction.siteProvisioningDetails.upsert({
      where: { siteId: site.id },
      update: input,
      create: { siteId: site.id, ...input }
    });
    await transaction.auditLog.create({
      data: {
        actorUserId: actor.id,
        entityType: 'site',
        entityId: site.id,
        action: `Updated facility address: ${site.name}`,
        metadata: input
      }
    });
    return details;
  });
}

export async function getDeviceForVpnIssue(deviceId: string, actor: AppUser) {
  if (!shouldUseDatabase() || !(await ensureProvisioningStorage())) return null;
  return db.device.findFirst({
    where: { AND: [{ id: deviceId }, deviceWhere(actor)] },
    include: { site: true, vpnEnrollment: true }
  });
}

export async function markVpnProfileIssued(deviceId: string, serverHost: string, actor: AppUser) {
  if (!(await ensureProvisioningStorage())) return;
  await db.$transaction(async (transaction) => {
    await completeVpnProfileGeneration(transaction, deviceId, serverHost, new Date());
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

export async function reserveVpnProfileGeneration(deviceId: string, actor: AppUser) {
  if (!shouldUseDatabase() || !(await ensureProvisioningStorage())) return null;

  return db.$transaction(async (transaction) => {
    const device = await transaction.device.findFirst({
      where: { AND: [{ id: deviceId }, deviceWhere(actor)] },
      include: { site: true, vpnEnrollment: true }
    });
    if (!device || !canIssueVpnProfile(actor, device.site.organizationId) || !device.vpnEnrollment) {
      return null;
    }

    const enrollment = await claimVpnProfileGeneration(transaction, device.id);
    return { device, enrollment };
  });
}

export class ExternalVpnRegistrationConflict extends Error {}

export async function registerExternalVpnProfile(deviceId: string, identity: string, actor: AppUser) {
  if (!shouldUseDatabase() || !(await ensureProvisioningStorage())) return null;

  return db.$transaction(async (transaction) => {
    const device = await transaction.device.findFirst({
      where: { AND: [{ id: deviceId }, deviceWhere(actor)] },
      include: { site: true, vpnEnrollment: true }
    });
    if (!device || !canRegisterExternalVpnProfile(actor, device.site.organizationId)) return null;

    let claimed;
    try {
      claimed = await claimExternalVpnProfile(transaction, device.id, identity, new Date());
    } catch (error) {
      if (error instanceof VpnOperationStateConflict) {
        throw new ExternalVpnRegistrationConflict(error.message);
      }
      throw error;
    }

    if (!claimed.changed) {
      return { device, enrollment: claimed.enrollment, changed: false };
    }

    await transaction.auditLog.create({
      data: {
        actorUserId: actor.id,
        entityType: 'vpnProfile',
        entityId: device.id,
        action: 'Registered externally issued OpenVPN profile',
        metadata: {
          identity,
          issuance: 'external_manual',
          tunnelAssignment: 'dynamic',
          siteId: device.siteId,
          organizationId: device.site.organizationId
        }
      }
    });

    return { device, enrollment: claimed.enrollment, changed: true };
  });
}

import type { Prisma } from '@prisma/client';

export const VPN_PROFILE_ISSUING_STATUS = 'issuing';

const GENERATION_ELIGIBLE_STATUSES = ['not_generated', 'revoked'];

export class VpnOperationStateConflict extends Error {}

function isUniqueConstraintError(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'P2002');
}

export async function claimVpnProfileGeneration(transaction: Prisma.TransactionClient, deviceId: string) {
  const claimed = await transaction.vpnEnrollment.updateMany({
    where: {
      deviceId,
      profileStatus: { in: GENERATION_ELIGIBLE_STATUSES }
    },
    data: { profileStatus: VPN_PROFILE_ISSUING_STATUS }
  });

  if (claimed.count !== 1) {
    throw new VpnOperationStateConflict(
      'Another VPN operation already owns this PLC. Refresh before trying again.'
    );
  }

  return transaction.vpnEnrollment.findUniqueOrThrow({ where: { deviceId } });
}

export async function completeVpnProfileGeneration(
  transaction: Prisma.TransactionClient,
  deviceId: string,
  serverHost: string,
  issuedAt: Date
) {
  const completed = await transaction.vpnEnrollment.updateMany({
    where: { deviceId, profileStatus: VPN_PROFILE_ISSUING_STATUS },
    data: {
      profileStatus: 'issued',
      vpnServerHost: serverHost,
      lastProfileIssuedAt: issuedAt,
      lastProfileRevokedAt: null
    }
  });

  if (completed.count !== 1) {
    throw new VpnOperationStateConflict(
      'VPN issuance could not be finalized safely. Inspect the existing OpenVPN identity before retrying.'
    );
  }

  return transaction.vpnEnrollment.findUniqueOrThrow({ where: { deviceId } });
}

export async function claimExternalVpnProfile(
  transaction: Prisma.TransactionClient,
  deviceId: string,
  identity: string,
  issuedAt: Date
) {
  const current = await transaction.vpnEnrollment.findUnique({ where: { deviceId } });

  if (current?.profileStatus === 'external' && current.identity === identity) {
    return { enrollment: current, changed: false };
  }

  if (!current) {
    try {
      const enrollment = await transaction.vpnEnrollment.create({
        data: {
          deviceId,
          identity,
          tunnelIp: null,
          profileStatus: 'external',
          lastProfileIssuedAt: issuedAt
        }
      });
      return { enrollment, changed: true };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new VpnOperationStateConflict('That VPN identity is already assigned to another PLC.');
      }
      throw error;
    }
  }

  if (current.profileStatus !== 'not_generated') {
    throw new VpnOperationStateConflict(
      'This PLC already has VPN profile history or another VPN operation in progress.'
    );
  }

  try {
    const claimed = await transaction.vpnEnrollment.updateMany({
      where: {
        deviceId,
        identity: current.identity,
        profileStatus: 'not_generated'
      },
      data: {
        identity,
        tunnelIp: null,
        profileStatus: 'external',
        vpnServerHost: null,
        lastProfileIssuedAt: issuedAt,
        lastProfileRevokedAt: null
      }
    });

    if (claimed.count !== 1) {
      const latest = await transaction.vpnEnrollment.findUnique({ where: { deviceId } });
      if (latest?.profileStatus === 'external' && latest.identity === identity) {
        return { enrollment: latest, changed: false };
      }
      throw new VpnOperationStateConflict(
        'Another VPN operation already owns this PLC. Refresh before trying again.'
      );
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new VpnOperationStateConflict('That VPN identity is already assigned to another PLC.');
    }
    throw error;
  }

  return {
    enrollment: await transaction.vpnEnrollment.findUniqueOrThrow({ where: { deviceId } }),
    changed: true
  };
}

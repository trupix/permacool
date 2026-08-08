import { createHash } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getVercelOidcToken } from '@/lib/vercel-oidc';
import { canIssueVpnProfile } from '@/lib/workspace-access';
import { generateOpenVpnProfile, getOpenVpnProvisioningStatus } from '@/server/openvpn-access-server';
import {
  getDeviceForVpnIssue,
  markVpnProfileIssued,
  reserveVpnProfileGeneration
} from '@/server/repositories/provisioning';
import { VpnOperationStateConflict } from '@/server/vpn-operation-state';

export const dynamic = 'force-dynamic';

function safeFilename(identity: string) {
  return `${identity.toLowerCase().replaceAll(/[^a-z0-9-]+/g, '-').slice(0, 72)}.ovpn`;
}

export async function POST(request: Request, { params }: { params: Promise<{ deviceid: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { deviceid } = await params;
  const device = await getDeviceForVpnIssue(deviceid, user);
  if (!device) return NextResponse.json({ error: 'PLC not found.' }, { status: 404 });
  if (!canIssueVpnProfile(user, device.site.organizationId)) {
    return NextResponse.json({ error: 'Only an owner in this organization can generate a VPN credential.' }, { status: 403 });
  }
  if (!device.vpnEnrollment) {
    return NextResponse.json({ error: 'This PLC was added outside the provisioning workflow.' }, { status: 409 });
  }
  if (
    device.vpnEnrollment.profileStatus === 'issued' ||
    device.vpnEnrollment.profileStatus === 'external' ||
    device.vpnEnrollment.profileStatus === 'issuing'
  ) {
    return NextResponse.json(
      { error: 'A VPN profile has already been recorded for this PLC. Revoke it before creating a replacement.' },
      { status: 409 }
    );
  }

  const oidcToken = await getVercelOidcToken();
  const bridge = await getOpenVpnProvisioningStatus(oidcToken);
  if (!bridge.healthy) {
    return NextResponse.json(
      { error: 'The OpenVPN provisioning bridge is not healthy. No VPN operation was started.' },
      { status: 503 }
    );
  }

  let reservation;
  try {
    reservation = await reserveVpnProfileGeneration(device.id, user);
    if (!reservation) {
      return NextResponse.json({ error: 'This PLC is no longer available for VPN issuance.' }, { status: 409 });
    }
  } catch (error) {
    if (error instanceof VpnOperationStateConflict) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('OpenVPN profile reservation failed.', error);
    return NextResponse.json({ error: 'The VPN operation could not be reserved safely.' }, { status: 500 });
  }

  let result;
  try {
    const idempotencyKey = createHash('sha256')
      .update(`${device.id}:${reservation.enrollment.updatedAt.toISOString()}`)
      .digest('hex');
    result = await generateOpenVpnProfile({
      identity: reservation.enrollment.identity,
      tunnelIp: reservation.enrollment.tunnelIp
    }, oidcToken, idempotencyKey);
  } catch (error) {
    console.error('OpenVPN profile generation failed after the operation was reserved.', error);
    return NextResponse.json(
      {
        error:
          'Profile generation did not complete. This PLC remains locked until the OpenVPN identity is inspected; do not retry automatically.'
      },
      { status: 502 }
    );
  }

  try {
    await markVpnProfileIssued(device.id, result.serverHost, user);
    revalidatePath('/provisioning');

    return new Response(result.profile, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-openvpn-profile',
        'Content-Disposition': `attachment; filename="${safeFilename(reservation.enrollment.identity)}"`,
        'Cache-Control': 'private, no-store, max-age=0',
        Pragma: 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    console.error('OpenVPN profile was generated but its database state could not be finalized.', error);
    return NextResponse.json(
      {
        error:
          'The profile may already exist on OpenVPN, but issuance could not be finalized. This PLC remains locked for manual inspection.'
      },
      { status: 502 }
    );
  }
}

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canIssueVpnProfile } from '@/lib/workspace-access';
import { generateOpenVpnProfile } from '@/server/openvpn-access-server';
import { getDeviceForVpnIssue, markVpnProfileIssued } from '@/server/repositories/provisioning';

export const dynamic = 'force-dynamic';

function safeFilename(identity: string) {
  return `${identity.toLowerCase().replaceAll(/[^a-z0-9-]+/g, '-').slice(0, 72)}.ovpn`;
}

export async function POST(_request: Request, { params }: { params: Promise<{ deviceid: string }> }) {
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
  if (device.vpnEnrollment.profileStatus === 'issued') {
    return NextResponse.json(
      { error: 'A VPN profile has already been issued for this PLC. Revoke it before creating a replacement.' },
      { status: 409 }
    );
  }

  try {
    const result = await generateOpenVpnProfile({
      identity: device.vpnEnrollment.identity,
      tunnelIp: device.vpnEnrollment.tunnelIp
    });
    await markVpnProfileIssued(device.id, result.serverHost, user);
    revalidatePath('/provisioning');

    return new Response(result.profile, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-openvpn-profile',
        'Content-Disposition': `attachment; filename="${safeFilename(device.vpnEnrollment.identity)}"`,
        'Cache-Control': 'private, no-store, max-age=0',
        Pragma: 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    console.error('OpenVPN profile issuance failed.', error);
    const message = error instanceof Error ? error.message : 'The VPN profile could not be generated.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

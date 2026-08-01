import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canRegisterExternalVpnProfile } from '@/lib/workspace-access';
import { parseExternalVpnProfileInput } from '@/server/provisioning-input';
import {
  ExternalVpnRegistrationConflict,
  getDeviceForVpnIssue,
  registerExternalVpnProfile
} from '@/server/repositories/provisioning';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ deviceid: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const { deviceid } = await params;
  const device = await getDeviceForVpnIssue(deviceid, user);
  if (!device) return NextResponse.json({ error: 'PLC not found.' }, { status: 404 });
  if (!canRegisterExternalVpnProfile(user, device.site.organizationId)) {
    return NextResponse.json(
      { error: 'Only an owner in this organization can register an existing VPN credential.' },
      { status: 403 }
    );
  }

  const input = parseExternalVpnProfileInput(await request.json().catch(() => null));
  if (!input) {
    return NextResponse.json({ error: 'Enter the exact existing OpenVPN identity.' }, { status: 400 });
  }

  try {
    const result = await registerExternalVpnProfile(device.id, input.identity, user);
    if (!result) return NextResponse.json({ error: 'PLC not found.' }, { status: 404 });

    revalidatePath('/provisioning');
    revalidatePath(`/sites/${device.siteId}/connectivity`);
    return NextResponse.json({
      profileStatus: 'external',
      tunnelAssignment: 'dynamic',
      changed: result.changed
    });
  } catch (error) {
    if (error instanceof ExternalVpnRegistrationConflict) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('External OpenVPN profile registration failed.', error);
    return NextResponse.json({ error: 'The existing profile could not be registered.' }, { status: 500 });
  }
}

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canAccessProvisioning } from '@/lib/workspace-access';
import { parseUpdatePlcInput } from '@/server/provisioning-input';
import {
  ProvisioningTunnelIpPermissionError,
  updateProvisionedDevice
} from '@/server/repositories/provisioning';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ deviceid: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  if (!canAccessProvisioning(user)) {
    return NextResponse.json({ error: 'An owner or operator role is required to edit PLCs.' }, { status: 403 });
  }

  const input = parseUpdatePlcInput(await request.json().catch(() => null));
  if (!input) return NextResponse.json({ error: 'Check the controller name, model, and IP addresses.' }, { status: 400 });

  const { deviceid } = await params;
  try {
    const device = await updateProvisionedDevice(deviceid, input, user);
    if (!device) return NextResponse.json({ error: 'The selected PLC is unavailable.' }, { status: 404 });

    revalidatePath('/dashboard');
    revalidatePath('/sites');
    revalidatePath('/provisioning');
    revalidatePath(`/sites/${device.siteId}`);
    revalidatePath(`/sites/${device.siteId}/connectivity`);

    return NextResponse.json({
      device: {
        id: device.id,
        name: device.name,
        plcModel: device.plcModel,
        tunnelIp: device.vpnEnrollment?.tunnelIp ?? null
      }
    });
  } catch (error) {
    if (error instanceof ProvisioningTunnelIpPermissionError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'That VPN tunnel IP is already assigned to another PLC.' }, { status: 409 });
    }
    console.error('PLC update failed.', error);
    return NextResponse.json({ error: 'The PLC could not be updated.' }, { status: 500 });
  }
}

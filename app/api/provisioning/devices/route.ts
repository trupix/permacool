import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canAccessProvisioning } from '@/lib/workspace-access';
import { parseNewPlcInput } from '@/server/provisioning-input';
import { createProvisionedDevice } from '@/server/repositories/provisioning';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  if (!canAccessProvisioning(user)) {
    return NextResponse.json({ error: 'An owner or operator role is required to add PLCs.' }, { status: 403 });
  }

  const input = parseNewPlcInput(await request.json().catch(() => null));
  if (!input) return NextResponse.json({ error: 'Check the site, controller name, model, and IP addresses.' }, { status: 400 });

  try {
    const device = await createProvisionedDevice(input, user);
    if (!device) return NextResponse.json({ error: 'The selected site or device storage is unavailable.' }, { status: 503 });
    revalidatePath('/dashboard');
    revalidatePath('/sites');
    revalidatePath('/provisioning');
    return NextResponse.json({ device: { id: device.id, name: device.name } }, { status: 201 });
  } catch (error) {
    console.error('PLC provisioning failed.', error);
    return NextResponse.json(
      { error: 'The PLC could not be added. Confirm that the tunnel IP is not already assigned.' },
      { status: 500 }
    );
  }
}

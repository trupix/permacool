import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canManageSiteEquipment } from '@/lib/workspace-access';
import { parseSiteAddressInput } from '@/server/provisioning-input';
import { updateProvisionedSiteAddress } from '@/server/repositories/provisioning';
import { getSite } from '@/server/repositories/sites';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ siteid: string }> }
) {
  const { siteid } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const site = await getSite(user, siteid);
  if (!site) return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
  if (!canManageSiteEquipment(user, site.organizationId)) {
    return NextResponse.json(
      { error: 'An owner or operator role in this organization is required to update the facility address.' },
      { status: 403 }
    );
  }

  const input = parseSiteAddressInput(await request.json().catch(() => null));
  if (!input) {
    return NextResponse.json(
      { error: 'Enter a complete street address, city, state, and ZIP code.' },
      { status: 400 }
    );
  }

  try {
    const details = await updateProvisionedSiteAddress(site.id, input, user);
    if (!details) {
      return NextResponse.json({ error: 'Site storage is not available.' }, { status: 503 });
    }
    revalidatePath(`/sites/${site.id}`);
    revalidatePath(`/sites/${site.id}/specs`);
    revalidatePath('/sites');
    revalidatePath('/dashboard');
    return NextResponse.json({
      address: {
        addressLine1: details.addressLine1 ?? '',
        city: details.city ?? '',
        state: details.state ?? '',
        postalCode: details.postalCode ?? '',
        country: details.country
      }
    });
  } catch (error) {
    console.error('Facility address update failed.', error);
    return NextResponse.json({ error: 'The facility address could not be saved.' }, { status: 500 });
  }
}

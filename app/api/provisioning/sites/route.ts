import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canAccessProvisioning, canManageSiteEquipment } from '@/lib/workspace-access';
import { parseNewSiteInput } from '@/server/provisioning-input';
import { createProvisionedSite } from '@/server/repositories/provisioning';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  if (!canAccessProvisioning(user)) {
    return NextResponse.json({ error: 'An owner or operator role is required to add sites.' }, { status: 403 });
  }

  const input = parseNewSiteInput(await request.json().catch(() => null));
  if (!input) return NextResponse.json({ error: 'Select an organization and check the site name, region, and time zone.' }, { status: 400 });
  if (!canManageSiteEquipment(user, input.organizationId)) {
    return NextResponse.json(
      { error: 'Owner or Operator access is required for the selected organization.' },
      { status: 403 }
    );
  }

  try {
    const site = await createProvisionedSite(input, user);
    if (!site) return NextResponse.json({ error: 'Site storage is not available.' }, { status: 503 });
    revalidatePath('/dashboard');
    revalidatePath('/sites');
    revalidatePath('/provisioning');
    return NextResponse.json({ site: { id: site.id, name: site.name } }, { status: 201 });
  } catch (error) {
    console.error('Site provisioning failed.', error);
    return NextResponse.json({ error: 'The site could not be created.' }, { status: 500 });
  }
}

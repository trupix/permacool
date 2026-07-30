import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canManageSiteEquipment } from '@/lib/workspace-access';
import {
  getEquipmentConfiguration,
  saveEquipmentConfiguration,
  type StoredEquipmentConfiguration
} from '@/server/repositories/equipment-configurations';
import { getSite } from '@/server/repositories/sites';

export const dynamic = 'force-dynamic';

function parseConfiguration(value: unknown): StoredEquipmentConfiguration | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (record.kind !== 'location' && record.kind !== 'salinas') return null;
  if (!record.draft || typeof record.draft !== 'object' || Array.isArray(record.draft)) return null;
  if (JSON.stringify(record).length > 100_000) return null;
  return { kind: record.kind, draft: record.draft };
}

export async function GET(_request: Request, { params }: { params: Promise<{ siteid: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { siteid } = await params;
  const site = await getSite(user, siteid);
  if (!site) return NextResponse.json({ error: 'Site not found.' }, { status: 404 });

  const result = await getEquipmentConfiguration(site.id);
  return NextResponse.json({
    ...result,
    canEdit: canManageSiteEquipment(user, site.organizationId)
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ siteid: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { siteid } = await params;
  const site = await getSite(user, siteid);
  if (!site) return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
  if (!canManageSiteEquipment(user, site.organizationId)) {
    return NextResponse.json({ error: 'Owner or Operator access is required to update equipment.' }, { status: 403 });
  }

  const configuration = parseConfiguration(await request.json().catch(() => null));
  if (!configuration) {
    return NextResponse.json({ error: 'The equipment configuration is invalid or too large.' }, { status: 400 });
  }

  try {
    const saved = await saveEquipmentConfiguration(site.id, configuration, user.id);
    if (!saved) return NextResponse.json({ error: 'Equipment storage is not available.' }, { status: 503 });
    revalidatePath(`/sites/${site.id}`);
    revalidatePath(`/sites/${site.id}/specs`);
    revalidatePath(`/sites/${site.id}/connectivity`);
    return NextResponse.json({ savedAt: saved.updatedAt.toISOString() });
  } catch (error) {
    console.error('Equipment configuration save failed.', error);
    return NextResponse.json({ error: 'The equipment configuration could not be saved.' }, { status: 500 });
  }
}

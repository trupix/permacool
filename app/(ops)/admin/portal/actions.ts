'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireStaff } from '@/lib/auth';

export async function publishDocument(formData: FormData) {
  const actor = await requireStaff(['staff_admin']);
  const title = String(formData.get('title') ?? '').trim();
  const url = String(formData.get('url') ?? '').trim();
  const category = String(formData.get('category') ?? 'other') as 'manual' | 'cutsheet' | 'wiring' | 'service' | 'other';
  const organizationId = String(formData.get('organizationId') ?? '') || null;
  const siteId = String(formData.get('siteId') ?? '') || null;
  const deviceId = String(formData.get('deviceId') ?? '') || null;
  if (!title || !url || !['manual', 'cutsheet', 'wiring', 'service', 'other'].includes(category)) return;

  if (siteId) {
    const site = await db.site.findUnique({ where: { id: siteId }, select: { organizationId: true } });
    if (!site || !organizationId || site.organizationId !== organizationId) return;
  }
  if (deviceId) {
    const device = await db.device.findUnique({ where: { id: deviceId }, select: { site: { select: { organizationId: true } } } });
    if (!device || !organizationId || device.site.organizationId !== organizationId) return;
  }

  const document = await db.portalDocument.create({ data: { title, url, category, organizationId, siteId, deviceId } });
  await db.auditLog.create({
    data: { actorUserId: actor.id, entityType: 'document', entityId: document.id, action: 'Published portal document', metadata: { organizationId, siteId, deviceId } }
  });
  revalidatePath('/documents');
  revalidatePath('/admin/portal');
}

export async function saveInvoiceReference(formData: FormData) {
  const actor = await requireStaff(['staff_admin']);
  const organizationId = String(formData.get('organizationId') ?? '');
  const freshbooksInvoiceId = String(formData.get('freshbooksInvoiceId') ?? '').trim();
  const invoiceNumber = String(formData.get('invoiceNumber') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();
  const amount = Number(formData.get('amount'));
  const issuedAt = new Date(String(formData.get('issuedAt') ?? ''));
  const dueValue = String(formData.get('dueAt') ?? '');
  const hostedUrl = String(formData.get('hostedUrl') ?? '').trim() || null;
  if (!organizationId || !freshbooksInvoiceId || !invoiceNumber || !status || !Number.isFinite(amount) || Number.isNaN(issuedAt.getTime())) return;

  const invoice = await db.invoiceReference.upsert({
    where: { freshbooksInvoiceId },
    update: { organizationId, invoiceNumber, status, amount, issuedAt, dueAt: dueValue ? new Date(dueValue) : null, hostedUrl, lastSyncedAt: new Date() },
    create: { organizationId, freshbooksInvoiceId, invoiceNumber, status, amount, issuedAt, dueAt: dueValue ? new Date(dueValue) : null, hostedUrl }
  });
  await db.auditLog.create({
    data: { actorUserId: actor.id, entityType: 'invoice', entityId: invoice.id, action: 'Updated customer invoice reference', metadata: { organizationId } }
  });
  revalidatePath('/billing');
  revalidatePath('/admin/portal');
}

'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { canAccessOrganization } from '@/lib/access';
import { requireStaff, requireUser } from '@/lib/auth';
import { getDevice } from '@/server/repositories/devices';
import { getSite } from '@/server/repositories/sites';

export async function createSupportTicket(formData: FormData) {
  const user = await requireUser();
  const organizationId = String(formData.get('organizationId') ?? '');
  const siteId = String(formData.get('siteId') ?? '') || null;
  const deviceId = String(formData.get('deviceId') ?? '') || null;
  const subject = String(formData.get('subject') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!organizationId || !subject || !description || !canAccessOrganization(user, organizationId)) {
    redirect('/support?status=invalid');
  }

  if (siteId) {
    const site = await getSite(user, siteId);
    if (!site || site.organizationId !== organizationId) redirect('/support?status=invalid');
  }

  if (deviceId) {
    const device = await getDevice(user, deviceId);
    const deviceSite = device ? await getSite(user, device.siteId) : undefined;
    if (!device || !deviceSite || deviceSite.organizationId !== organizationId) redirect('/support?status=invalid');
  }

  const ticket = await db.supportTicket.create({
    data: { organizationId, siteId, deviceId, createdById: user.id, subject, description }
  });

  await db.auditLog.create({
    data: { actorUserId: user.id, entityType: 'support_ticket', entityId: ticket.id, action: 'Created support ticket' }
  });

  redirect('/support?status=created');
}

export async function updateSupportTicketStatus(formData: FormData) {
  const actor = await requireStaff();
  const ticketId = String(formData.get('ticketId') ?? '');
  const status = String(formData.get('status') ?? '') as 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed';
  if (!ticketId || !['open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed'].includes(status)) return;
  await db.$transaction([
    db.supportTicket.update({ where: { id: ticketId }, data: { status } }),
    db.auditLog.create({ data: { actorUserId: actor.id, entityType: 'support_ticket', entityId: ticketId, action: 'Updated support ticket status', metadata: { status } } })
  ]);
  redirect('/support');
}

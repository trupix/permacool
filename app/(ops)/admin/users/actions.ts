'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireStaff } from '@/lib/auth';

export async function approveUser(formData: FormData) {
  const actor = await requireStaff(['staff_admin']);
  const userId = String(formData.get('userId') ?? '');
  const organizationId = String(formData.get('organizationId') ?? '');
  const membershipRole = String(formData.get('membershipRole') ?? 'viewer') as 'customer_admin' | 'operator' | 'viewer';
  const accessMode = String(formData.get('accessMode') ?? 'all');
  const requestedDeviceIds = formData.getAll('deviceIds').map(String);

  if (!userId || !organizationId || !['customer_admin', 'operator', 'viewer'].includes(membershipRole)) return;

  const validDevices = await db.device.findMany({
    where: { id: { in: requestedDeviceIds }, site: { organizationId } },
    select: { id: true }
  });
  const deviceIds = validDevices.map((device) => device.id);
  const allDevices = accessMode === 'all';

  await db.$transaction(async (tx) => {
    await tx.userOrganization.deleteMany({ where: { userId } });
    await tx.userDeviceAccess.deleteMany({ where: { userId } });
    await tx.user.update({
      where: { id: userId },
      data: {
        platformRole: 'customer',
        status: 'approved',
        role: membershipRole === 'customer_admin' ? 'owner' : membershipRole,
        approvedAt: new Date(),
        approvedById: actor.id,
        memberships: { create: { organizationId, role: membershipRole, allDevices } },
        deviceAccess: allDevices ? undefined : { create: deviceIds.map((deviceId) => ({ deviceId })) }
      }
    });
    await tx.auditLog.create({
      data: {
        actorUserId: actor.id,
        entityType: 'user',
        entityId: userId,
        action: 'Approved customer portal access',
        metadata: { organizationId, membershipRole, allDevices, deviceIds }
      }
    });
  });

  revalidatePath('/admin/users');
}

async function setUserStatus(formData: FormData, status: 'rejected' | 'suspended') {
  const actor = await requireStaff(['staff_admin']);
  const userId = String(formData.get('userId') ?? '');
  if (!userId || userId === actor.id) return;

  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { status } }),
    db.auditLog.create({
      data: { actorUserId: actor.id, entityType: 'user', entityId: userId, action: `${status} customer portal access` }
    })
  ]);
  revalidatePath('/admin/users');
}

export async function rejectUser(formData: FormData) {
  return setUserStatus(formData, 'rejected');
}

export async function suspendUser(formData: FormData) {
  return setUserStatus(formData, 'suspended');
}

export async function reactivateUser(formData: FormData) {
  const actor = await requireStaff(['staff_admin']);
  const userId = String(formData.get('userId') ?? '');
  if (!userId) return;
  const user = await db.user.findUnique({ where: { id: userId }, select: { memberships: { take: 1, select: { id: true } } } });
  if (!user?.memberships.length) return;
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { status: 'approved', approvedAt: new Date(), approvedById: actor.id } }),
    db.auditLog.create({ data: { actorUserId: actor.id, entityType: 'user', entityId: userId, action: 'Reactivated customer portal access' } })
  ]);
  revalidatePath('/admin/users');
}

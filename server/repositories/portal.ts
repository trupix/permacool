import { db } from '@/lib/db';
import { isStaffScope, siteWhere, type AccessScope } from '@/lib/access';
import { shouldUseDatabase } from './shared';

export async function getSupportTickets(scope: AccessScope) {
  if (!shouldUseDatabase()) return [];

  const accessibleSiteIds = isStaffScope(scope) ? [] : (await db.site.findMany({
    where: siteWhere(scope), select: { id: true }
  })).map((site) => site.id);

  return db.supportTicket.findMany({
    where: isStaffScope(scope) ? {} : {
      organizationId: { in: scope.organizationIds },
      OR: [
        { createdById: scope.id },
        { siteId: null, deviceId: null },
        { siteId: { in: accessibleSiteIds }, deviceId: null },
        { deviceId: { in: scope.deviceIds } },
        { organizationId: { in: scope.allDeviceOrganizationIds } }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getPortalDocuments(scope: AccessScope) {
  if (!shouldUseDatabase()) return [];

  const accessibleSiteIds = isStaffScope(scope) ? [] : (await db.site.findMany({
    where: siteWhere(scope), select: { id: true }
  })).map((site) => site.id);

  return db.portalDocument.findMany({
    where: isStaffScope(scope) ? {} : {
      OR: [
        { organizationId: null, siteId: null, deviceId: null },
        {
          organizationId: { in: scope.organizationIds },
          OR: [
            { siteId: null, deviceId: null },
            { siteId: { in: accessibleSiteIds }, deviceId: null },
            { deviceId: { in: scope.deviceIds } },
            { organizationId: { in: scope.allDeviceOrganizationIds } }
          ]
        }
      ]
    },
    orderBy: [{ category: 'asc' }, { title: 'asc' }]
  });
}

export async function getInvoices(scope: AccessScope) {
  if (!shouldUseDatabase()) return [];

  return db.invoiceReference.findMany({
    where: isStaffScope(scope) ? {} : { organizationId: { in: scope.organizationIds } },
    orderBy: { issuedAt: 'desc' }
  });
}

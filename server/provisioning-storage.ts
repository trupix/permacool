import { db } from '@/lib/db';
import { hasDatabaseUrl } from '@/lib/env';

let setupPromise: Promise<boolean> | null = null;

async function initializeProvisioningStorage() {
  if (!hasDatabaseUrl()) return false;

  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SiteProvisioningDetails" (
        "siteId" TEXT NOT NULL PRIMARY KEY,
        "addressLine1" TEXT,
        "city" TEXT,
        "state" TEXT,
        "postalCode" TEXT,
        "country" TEXT NOT NULL DEFAULT 'US',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "SiteProvisioningDetails_siteId_fkey"
          FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "VpnEnrollment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "deviceId" TEXT NOT NULL,
        "identity" TEXT NOT NULL,
        "tunnelIp" TEXT,
        "localIpAddress" TEXT,
        "profileStatus" TEXT NOT NULL DEFAULT 'not_generated',
        "vpnServerHost" TEXT,
        "lastProfileIssuedAt" TIMESTAMP(3),
        "lastProfileRevokedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "VpnEnrollment_deviceId_fkey"
          FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await db.$executeRawUnsafe(
      'CREATE UNIQUE INDEX IF NOT EXISTS "VpnEnrollment_deviceId_key" ON "VpnEnrollment"("deviceId")'
    );
    await db.$executeRawUnsafe(
      'CREATE UNIQUE INDEX IF NOT EXISTS "VpnEnrollment_identity_key" ON "VpnEnrollment"("identity")'
    );
    await db.$executeRawUnsafe(
      'CREATE UNIQUE INDEX IF NOT EXISTS "VpnEnrollment_tunnelIp_key" ON "VpnEnrollment"("tunnelIp")'
    );
    return true;
  } catch (error) {
    console.error('Site and PLC provisioning storage could not be initialized.', error);
    return false;
  }
}

export function ensureProvisioningStorage() {
  setupPromise ??= initializeProvisioningStorage();
  return setupPromise;
}

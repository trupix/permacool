import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { shouldUseDatabase } from './shared';

export type StoredEquipmentConfiguration = {
  kind: 'location' | 'salinas';
  draft: unknown;
};

export async function getEquipmentConfiguration(siteId: string) {
  if (!shouldUseDatabase()) {
    return { storageReady: false, configuration: null as StoredEquipmentConfiguration | null };
  }

  try {
    const row = await db.siteEquipmentConfiguration.findUnique({
      where: { siteId },
      select: { configuration: true }
    });
    return {
      storageReady: true,
      configuration: (row?.configuration ?? null) as StoredEquipmentConfiguration | null
    };
  } catch {
    // The app remains read-only until the reviewed production migration is deployed.
    return { storageReady: false, configuration: null as StoredEquipmentConfiguration | null };
  }
}

export async function saveEquipmentConfiguration(
  siteId: string,
  configuration: StoredEquipmentConfiguration,
  actorUserId: string
) {
  if (!shouldUseDatabase()) return null;

  return db.siteEquipmentConfiguration.upsert({
    where: { siteId },
    update: {
      schemaVersion: 1,
      configuration: configuration as unknown as Prisma.InputJsonValue,
      updatedById: actorUserId
    },
    create: {
      siteId,
      schemaVersion: 1,
      configuration: configuration as unknown as Prisma.InputJsonValue,
      updatedById: actorUserId
    },
    select: { updatedAt: true }
  });
}

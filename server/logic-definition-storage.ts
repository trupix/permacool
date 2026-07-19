import { db } from '@/lib/db';
import { hasDatabaseUrl } from '@/lib/env';
import { defaultLogicDefinitions } from '@/lib/equipment/logic-catalog';

let storageInitialization: Promise<boolean> | undefined;

async function initializeLogicDefinitionStorage() {
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LogicDefinition" (
        "id" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "signalKey" TEXT,
        "definition" TEXT NOT NULL,
        "behavior" TEXT NOT NULL,
        "implementationStatus" TEXT NOT NULL DEFAULT 'draft',
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "updatedBy" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "LogicDefinition_pkey" PRIMARY KEY ("id")
      )
    `);
    await db.$executeRawUnsafe(
      'CREATE UNIQUE INDEX IF NOT EXISTS "LogicDefinition_slug_key" ON "LogicDefinition"("slug")'
    );
    await db.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "LogicDefinition_category_sortOrder_idx" ON "LogicDefinition"("category", "sortOrder")'
    );

    await db.logicDefinition.createMany({
      data: defaultLogicDefinitions,
      skipDuplicates: true
    });
    return true;
  } catch (error) {
    console.error('Logic definition storage is not ready.', error);
    return false;
  }
}

export async function ensureLogicDefinitionStorage() {
  if (!hasDatabaseUrl()) return false;
  storageInitialization ??= initializeLogicDefinitionStorage();
  const ready = await storageInitialization;
  if (!ready) storageInitialization = undefined;
  return ready;
}

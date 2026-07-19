import { db } from '@/lib/db';
import { defaultLogicDefinitions } from '@/lib/equipment/logic-catalog';
import { ensureLogicDefinitionStorage } from '@/server/logic-definition-storage';
import type {
  LogicDefinition,
  LogicDefinitionCategory,
  LogicImplementationStatus
} from '@/types/domain';
import { shouldUseDatabase } from './shared';

export type LogicDefinitionInput = {
  category: LogicDefinitionCategory;
  title: string;
  signalKey: string | null;
  definition: string;
  behavior: string;
  implementationStatus: LogicImplementationStatus;
};

type LogicDefinitionRow = {
  id: string;
  slug: string;
  category: string;
  title: string;
  signalKey: string | null;
  definition: string;
  behavior: string;
  implementationStatus: string;
  sortOrder: number;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapDefinition(row: LogicDefinitionRow): LogicDefinition {
  return {
    ...row,
    category: row.category as LogicDefinitionCategory,
    implementationStatus: row.implementationStatus as LogicImplementationStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

function fallbackDefinitions(): LogicDefinition[] {
  const now = new Date(0).toISOString();
  return defaultLogicDefinitions.map((definition, index) => ({
    ...definition,
    id: `logic-fallback-${index + 1}`,
    createdAt: now,
    updatedAt: now
  }));
}

export async function getLogicDefinitions(): Promise<{
  definitions: LogicDefinition[];
  persistenceReady: boolean;
}> {
  if (!shouldUseDatabase()) {
    return { definitions: fallbackDefinitions(), persistenceReady: false };
  }

  if (!(await ensureLogicDefinitionStorage())) {
    return { definitions: fallbackDefinitions(), persistenceReady: false };
  }

  try {
    const rows = await db.logicDefinition.findMany({
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }]
    });
    return { definitions: rows.map(mapDefinition), persistenceReady: true };
  } catch (error) {
    console.error('Logic definitions could not be loaded.', error);
    return { definitions: fallbackDefinitions(), persistenceReady: false };
  }
}

function createSlug(input: LogicDefinitionInput) {
  const base = (input.signalKey || input.title)
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')
    .slice(0, 48) || 'logic-definition';
  return `${base}-${Date.now().toString(36)}`;
}

export async function createLogicDefinition(
  input: LogicDefinitionInput,
  actor: { id: string; name: string }
): Promise<LogicDefinition | null> {
  if (!(await ensureLogicDefinitionStorage())) return null;

  const aggregate = await db.logicDefinition.aggregate({ _max: { sortOrder: true } });
  const row = await db.$transaction(async (transaction) => {
    const created = await transaction.logicDefinition.create({
      data: {
        ...input,
        slug: createSlug(input),
        sortOrder: (aggregate._max.sortOrder ?? 0) + 10,
        updatedBy: actor.name
      }
    });
    await transaction.auditLog.create({
      data: {
        actorUserId: actor.id,
        entityType: 'logicDefinition',
        entityId: created.id,
        action: `Created logic definition: ${created.title}`,
        metadata: { after: input }
      }
    });
    return created;
  });
  return mapDefinition(row);
}

export async function updateLogicDefinition(
  id: string,
  input: LogicDefinitionInput,
  actor: { id: string; name: string }
): Promise<LogicDefinition | null> {
  if (!(await ensureLogicDefinitionStorage())) return null;
  const existing = await db.logicDefinition.findUnique({ where: { id } });
  if (!existing) return null;

  const row = await db.$transaction(async (transaction) => {
    const updated = await transaction.logicDefinition.update({
      where: { id },
      data: { ...input, updatedBy: actor.name }
    });
    await transaction.auditLog.create({
      data: {
        actorUserId: actor.id,
        entityType: 'logicDefinition',
        entityId: updated.id,
        action: `Updated logic definition: ${updated.title}`,
        metadata: {
          before: {
            category: existing.category,
            title: existing.title,
            signalKey: existing.signalKey,
            definition: existing.definition,
            behavior: existing.behavior,
            implementationStatus: existing.implementationStatus
          },
          after: input
        }
      }
    });
    return updated;
  });
  return mapDefinition(row);
}

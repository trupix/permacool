import type { LogicDefinitionInput } from '@/server/repositories/logic-definitions';
import type { LogicDefinitionCategory, LogicImplementationStatus } from '@/types/domain';

const categories = new Set<LogicDefinitionCategory>(['signal', 'operation', 'event', 'storage', 'display']);
const statuses = new Set<LogicImplementationStatus>(['deployed', 'draft', 'retired']);

export function parseLogicDefinitionInput(value: unknown): LogicDefinitionInput | null {
  if (!value || typeof value !== 'object') return null;
  const body = value as Record<string, unknown>;
  const category = typeof body.category === 'string' ? body.category : '';
  const implementationStatus = typeof body.implementationStatus === 'string' ? body.implementationStatus : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const signalKey = typeof body.signalKey === 'string' ? body.signalKey.trim() || null : null;
  const definition = typeof body.definition === 'string' ? body.definition.trim() : '';
  const behavior = typeof body.behavior === 'string' ? body.behavior.trim() : '';

  if (!categories.has(category as LogicDefinitionCategory)) return null;
  if (!statuses.has(implementationStatus as LogicImplementationStatus)) return null;
  if (!title || title.length > 120) return null;
  if (signalKey && signalKey.length > 240) return null;
  if (!definition || definition.length > 2_000) return null;
  if (!behavior || behavior.length > 3_000) return null;

  return {
    category: category as LogicDefinitionCategory,
    title,
    signalKey,
    definition,
    behavior,
    implementationStatus: implementationStatus as LogicImplementationStatus
  };
}

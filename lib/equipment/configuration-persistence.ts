import type { StoredEquipmentConfiguration } from '@/server/repositories/equipment-configurations';

export type EquipmentConfigurationKind = StoredEquipmentConfiguration['kind'];

export function resolveInitialEquipmentDraft<T>({
  initialConfiguration,
  kind,
  defaultValue,
  normalize
}: {
  initialConfiguration: StoredEquipmentConfiguration | null;
  kind: EquipmentConfigurationKind;
  defaultValue: T;
  normalize: (value: unknown) => T;
}) {
  return initialConfiguration?.kind === kind
    ? normalize(initialConfiguration.draft)
    : defaultValue;
}

export function equipmentDraftFingerprint(value: unknown) {
  return JSON.stringify(value);
}

export async function persistEquipmentConfiguration({
  siteId,
  kind,
  draft,
  fetcher = fetch
}: {
  siteId: string;
  kind: EquipmentConfigurationKind;
  draft: unknown;
  fetcher?: typeof fetch;
}) {
  const response = await fetcher(`/api/sites/${encodeURIComponent(siteId)}/equipment`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, draft })
  });

  if (!response.ok) throw new Error('Equipment configuration save failed.');
  return response.json() as Promise<{ savedAt: string }>;
}

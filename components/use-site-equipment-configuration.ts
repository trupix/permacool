'use client';

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { StoredEquipmentConfiguration } from '@/server/repositories/equipment-configurations';

type SaveState = 'loading' | 'saved' | 'saving' | 'browser-only' | 'read-only' | 'error';

export function useSiteEquipmentConfiguration<T>({
  siteId,
  kind,
  storageKey,
  initialConfiguration,
  defaultValue,
  normalize,
  canEdit,
  storageReady
}: {
  siteId: string;
  kind: StoredEquipmentConfiguration['kind'];
  storageKey: string;
  initialConfiguration: StoredEquipmentConfiguration | null;
  defaultValue: T;
  normalize: (value: unknown) => T;
  canEdit: boolean;
  storageReady: boolean;
}): [T, Dispatch<SetStateAction<T>>, SaveState] {
  const normalizeRef = useRef(normalize);
  normalizeRef.current = normalize;
  const [draft, setDraft] = useState<T>(() =>
    initialConfiguration?.kind === kind
      ? normalize(initialConfiguration.draft)
      : defaultValue
  );
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('loading');

  useEffect(() => {
    if (!initialConfiguration) {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) setDraft(normalizeRef.current(JSON.parse(saved)));
      } catch {
        // Ignore a damaged legacy browser draft. The validated default remains usable.
      }
    }
    setLoaded(true);
    setSaveState(canEdit ? (storageReady ? 'saved' : 'browser-only') : 'read-only');
  }, [canEdit, initialConfiguration, storageKey, storageReady]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // Database persistence remains authoritative when browser storage is unavailable.
    }
    if (!canEdit || !storageReady) return;

    setSaveState('saving');
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/sites/${encodeURIComponent(siteId)}/equipment`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind, draft })
        });
        if (!response.ok) throw new Error('Save failed');
        setSaveState('saved');
      } catch {
        setSaveState('error');
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [canEdit, draft, kind, loaded, siteId, storageKey, storageReady]);

  return [draft, setDraft, saveState];
}

'use client';

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import {
  equipmentDraftFingerprint,
  persistEquipmentConfiguration,
  resolveInitialEquipmentDraft
} from '@/lib/equipment/configuration-persistence';
import type { StoredEquipmentConfiguration } from '@/server/repositories/equipment-configurations';

export type EquipmentSaveState =
  | 'loading'
  | 'unchanged'
  | 'unsaved'
  | 'saved'
  | 'saving'
  | 'browser-only'
  | 'read-only'
  | 'error';

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
}) {
  const normalizeRef = useRef(normalize);
  normalizeRef.current = normalize;
  const initialDraft = resolveInitialEquipmentDraft({
    initialConfiguration,
    kind,
    defaultValue,
    normalize
  });
  const [draft, setDraftState] = useState<T>(initialDraft);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const persistedFingerprintRef = useRef(equipmentDraftFingerprint(initialDraft));
  const [loaded, setLoaded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveState, setSaveState] = useState<EquipmentSaveState>('loading');

  useEffect(() => {
    let nextDraft = draftRef.current;
    if (!initialConfiguration) {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          nextDraft = normalizeRef.current(JSON.parse(saved));
          setDraftState(nextDraft);
        }
      } catch {
        // Ignore a damaged legacy browser draft. The validated default remains usable.
      }
    }
    const isDirty = equipmentDraftFingerprint(nextDraft) !== persistedFingerprintRef.current;
    setHasUnsavedChanges(isDirty);
    setLoaded(true);
    setSaveState(
      !canEdit
        ? 'read-only'
        : isDirty
          ? 'unsaved'
          : initialConfiguration
            ? 'saved'
            : storageReady
              ? 'unchanged'
              : 'browser-only'
    );
  }, [canEdit, initialConfiguration, storageKey, storageReady]);

  const setDraft: Dispatch<SetStateAction<T>> = useCallback((value) => {
    setDraftState(value);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const isDirty = equipmentDraftFingerprint(draft) !== persistedFingerprintRef.current;
    setHasUnsavedChanges(isDirty);
    setSaveState(
      !canEdit
        ? 'read-only'
        : isDirty
          ? 'unsaved'
          : initialConfiguration
            ? 'saved'
            : storageReady
              ? 'unchanged'
              : 'browser-only'
    );
  }, [canEdit, draft, initialConfiguration, loaded, storageReady]);

  const save = useCallback(async () => {
    if (!loaded || !canEdit) return false;
    const draftToSave = draftRef.current;
    const fingerprint = equipmentDraftFingerprint(draftToSave);
    if (fingerprint === persistedFingerprintRef.current) return true;

    setSaveState('saving');
    try {
      if (storageReady) {
        await persistEquipmentConfiguration({ siteId, kind, draft: draftToSave });
      }
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(draftToSave));
      } catch {
        // A database save is still authoritative when browser storage is unavailable.
      }
      persistedFingerprintRef.current = fingerprint;
      const changedDuringSave = equipmentDraftFingerprint(draftRef.current) !== fingerprint;
      setHasUnsavedChanges(changedDuringSave);
      setSaveState(changedDuringSave ? 'unsaved' : storageReady ? 'saved' : 'browser-only');
      return true;
    } catch {
      setSaveState('error');
      return false;
    }
  }, [canEdit, kind, loaded, siteId, storageKey, storageReady]);

  return { draft, setDraft, saveState, save, hasUnsavedChanges };
}

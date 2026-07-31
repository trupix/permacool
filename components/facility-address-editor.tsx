'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { MapPin, Save } from 'lucide-react';
import {
  emptyFacilityAddress,
  FACILITY_ADDRESS_UPDATED_EVENT,
  facilityAddressDraftKey,
  hasCompleteFacilityAddress,
  parseFacilityAddressDraft,
  type FacilityAddress
} from '@/lib/site-location';

export function FacilityAddressEditor({
  siteId,
  initialAddress = emptyFacilityAddress,
  canEdit = false,
  storageReady = false
}: {
  siteId: string;
  initialAddress?: FacilityAddress;
  canEdit?: boolean;
  storageReady?: boolean;
}) {
  const storageKey = facilityAddressDraftKey(siteId);
  const [address, setAddress] = useState<FacilityAddress>(() => ({
    ...emptyFacilityAddress,
    ...initialAddress
  }));
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!canEdit || storageReady) return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) return;
      const parsed = parseFacilityAddressDraft(JSON.parse(saved));
      if (!parsed) return;
      setAddress(parsed);
      setSaveState('saved');
      setSaveMessage('Browser draft restored. Database storage is not connected to this local preview.');
    } catch {
      // Ignore a damaged browser draft and keep the validated server/default address.
    }
  }, [canEdit, storageKey, storageReady]);

  function updateAddress(field: keyof FacilityAddress, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
    setSaveState('idle');
    setSaveMessage('');
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) return;
    if (!hasCompleteFacilityAddress(address)) {
      setSaveState('error');
      setSaveMessage('Enter the street, city, state, and ZIP code.');
      return;
    }

    setSaveState('saving');
    setSaveMessage('');
    if (!storageReady) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(address));
        window.dispatchEvent(new CustomEvent(FACILITY_ADDRESS_UPDATED_EVENT, {
          detail: { siteId, address }
        }));
        setSaveState('saved');
        setSaveMessage('Browser draft saved for this local preview. Connect the staging database for shared storage.');
      } catch {
        setSaveState('error');
        setSaveMessage('Browser storage is not available. The address was not saved.');
      }
      return;
    }

    try {
      const response = await fetch(`/api/sites/${encodeURIComponent(siteId)}/details`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address)
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'The address could not be saved.');
      setSaveState('saved');
      setSaveMessage('Address saved. The overview can now build its weather and satellite view.');
    } catch (error) {
      setSaveState('error');
      setSaveMessage(error instanceof Error ? error.message : 'The address could not be saved.');
    }
  }

  return (
    <section className="panel location-equipment-system-form">
      <header className="location-equipment-panel-heading">
        <span><MapPin size={19} /></span>
        <div><p className="eyebrow">Facility location</p><h3>Address and local conditions</h3></div>
      </header>
      <form className="location-equipment-address-form" onSubmit={saveAddress}>
        <fieldset disabled={!canEdit || saveState === 'saving'}>
        <div className="location-equipment-form-grid">
          <label className="is-wide">
            <span>Street address</span>
            <input
              value={address.addressLine1}
              onChange={(event) => updateAddress('addressLine1', event.target.value)}
              placeholder="123 Example St"
              autoComplete="street-address"
            />
          </label>
          <label>
            <span>City</span>
            <input
              value={address.city}
              onChange={(event) => updateAddress('city', event.target.value)}
              placeholder="City"
              autoComplete="address-level2"
            />
          </label>
          <label>
            <span>State</span>
            <input
              value={address.state}
              onChange={(event) => updateAddress('state', event.target.value)}
              placeholder="ST"
              autoComplete="address-level1"
            />
          </label>
          <label>
            <span>ZIP code</span>
            <input
              value={address.postalCode}
              onChange={(event) => updateAddress('postalCode', event.target.value)}
              placeholder="00000"
              autoComplete="postal-code"
            />
          </label>
          <label>
            <span>Country</span>
            <select value={address.country} onChange={(event) => updateAddress('country', event.target.value)}>
              <option value="US">United States</option>
            </select>
          </label>
        </div>
        <div className="location-equipment-address-actions">
          <button
            className="location-equipment-address-save"
            type="submit"
            disabled={!canEdit || saveState === 'saving' || !hasCompleteFacilityAddress(address)}
          >
            <Save size={16} />
            {saveState === 'saving' ? 'Saving address…' : 'Save facility address'}
          </button>
          <span className={`is-${saveState}`}>
            {saveMessage || (canEdit
              ? storageReady
                ? 'Used to locate the nearest NWS station and center the satellite hero.'
                : 'Local preview: saves stay in this browser until staging storage is connected.'
              : 'Viewer access is read-only.')}
          </span>
        </div>
        </fieldset>
      </form>
    </section>
  );
}

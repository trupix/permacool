'use client';

import { useState, type FormEvent } from 'react';
import { MapPin, Save } from 'lucide-react';
import {
  emptyFacilityAddress,
  hasCompleteFacilityAddress,
  type FacilityAddress
} from '@/lib/site-location';

export function FacilityAddressEditor({
  siteId,
  initialAddress = emptyFacilityAddress,
  canEdit = false
}: {
  siteId: string;
  initialAddress?: FacilityAddress;
  canEdit?: boolean;
}) {
  const [address, setAddress] = useState<FacilityAddress>(() => ({
    ...emptyFacilityAddress,
    ...initialAddress
  }));
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

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
              placeholder="3558 E 8th St"
              autoComplete="street-address"
            />
          </label>
          <label>
            <span>City</span>
            <input
              value={address.city}
              onChange={(event) => updateAddress('city', event.target.value)}
              placeholder="Los Angeles"
              autoComplete="address-level2"
            />
          </label>
          <label>
            <span>State</span>
            <input
              value={address.state}
              onChange={(event) => updateAddress('state', event.target.value)}
              placeholder="CA"
              autoComplete="address-level1"
            />
          </label>
          <label>
            <span>ZIP code</span>
            <input
              value={address.postalCode}
              onChange={(event) => updateAddress('postalCode', event.target.value)}
              placeholder="90023"
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
              ? 'Used to locate the nearest NWS station and center the satellite hero.'
              : 'Viewer access is read-only.')}
          </span>
        </div>
        </fieldset>
      </form>
    </section>
  );
}

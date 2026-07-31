export type FacilityAddress = {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export const emptyFacilityAddress: FacilityAddress = {
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US'
};

export const FACILITY_ADDRESS_UPDATED_EVENT = 'permacool:facility-address-updated';

export function facilityAddressDraftKey(siteId: string): string {
  return `permacool:facility-address-draft:${siteId}`;
}

export function parseFacilityAddressDraft(value: unknown): FacilityAddress | null {
  if (!value || typeof value !== 'object') return null;

  const draft = value as Partial<Record<keyof FacilityAddress, unknown>>;
  return {
    addressLine1: typeof draft.addressLine1 === 'string' ? draft.addressLine1 : '',
    city: typeof draft.city === 'string' ? draft.city : '',
    state: typeof draft.state === 'string' ? draft.state : '',
    postalCode: typeof draft.postalCode === 'string' ? draft.postalCode : '',
    country: typeof draft.country === 'string' ? draft.country : 'US'
  };
}

export function formatFacilityAddress(address: FacilityAddress): string {
  const cityState = [address.city, address.state].filter(Boolean).join(', ');
  return [
    address.addressLine1,
    [cityState, address.postalCode].filter(Boolean).join(' ')
  ].filter(Boolean).join(', ');
}

export function hasCompleteFacilityAddress(address: FacilityAddress): boolean {
  return Boolean(
    address.addressLine1.trim() &&
    address.city.trim() &&
    address.state.trim() &&
    address.postalCode.trim()
  );
}

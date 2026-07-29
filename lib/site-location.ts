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

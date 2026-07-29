# Basic site template

Every site created through **Site & PLC provisioning** automatically receives the same four-page operating
foundation. No page copy is required when a new customer is added.

## Live

- Site and controller status
- Configured condenser count
- Equipment-record completion
- Reserved VPN address when assigned
- One operating card per configured condenser
- Empty high pressure, low pressure, process temperature, and compressor amperage positions
- Raw telemetry panel for signals that arrive before the equipment mapping is verified
- Recent events and alerts

## Connectivity

- Gateway state
- Registered controller list
- VPN identity and reserved tunnel address
- Expected fast, event-driven, slow, and heartbeat telemetry signals

## Location Specs

- One or two condensers
- Single, separate, parallel, or high-side subcooling orientation
- Ethanol, butane, or another process solvent
- Known condenser catalog selections or manual equipment entry
- Manufacturer, product family, exact model, serial number, horsepower, refrigerant, and charge
- Salinas-compatible refrigerant and installed-compressor dropdowns backed by the loaded equipment catalogs
- Compressor manufacturer, technology, model, and serial number
- Salinas-compatible frequency and frequency-dependent voltage dropdowns, plus phase, RLA, and LRA
- Capacity-model inputs for PLC/weather entering air and a suction-source priority of measured saturated suction temperature, fresh ethanol temperature estimate, then manual fallback
- Installation notes

The unverified equipment record is stored as a site-specific browser draft. The storage key and original fields
remain stable when new template options are added, so previously entered site data is preserved. A verified
manufacturer record can replace the basic template later without changing the page URLs or navigation.

## Events

- Empty permanent event history
- Pagination foundation
- CSV download route
- Automatic population when the PLC begins sending event transitions

## New-customer setup

1. Add the customer site and its basic address, region, and time zone.
2. Add each PLC and assign its unique VPN identity.
3. Open Location Specs and enter the installed equipment.
4. Import the unique VPN profile into the controller.
5. Map and publish telemetry using the site's and device's generated identifiers.

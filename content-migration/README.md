# PermaCool Legacy Copy Migration

This folder stores archived copy/content from the legacy site (`perma.cool`) so nothing is lost during rebuild.

## What is archived now

- Raw page HTML snapshots from legacy URLs:
  - `raw-html/contact-us.html`
  - `raw-html/ethanol-chilling-systems.html`
  - `raw-html/walk-in-freezers.html`
  - `raw-html/butane-recovery-systems.html`
  - `raw-html/terms-and-conditions.html`
  - `raw-html/privacy-policy.html`
  - `raw-html/become-a-permacool-wholesaler.html`
  - `raw-html/ethanol-chiller-blast-150.html`
  - `raw-html/ethanol-chillers-direct-refrigerant-chilling-systems.html`
  - `raw-html/blast-60-25.html`
  - `raw-html/dewax-cutsheet.html`

## Mapping / parity tracker

- `MAP.csv` contains URL-by-URL migration status and planned action.

## Next migration tasks

1. Build/redirect decisions for unresolved pages:
   - `butane-recovery-systems` (legacy plural -> singular canonical)
   - `blast-60-25`
   - `dewax-cutsheet`
   - `become-a-permacool-wholesaler`
2. Decide whether to host legal pages locally or keep external canonical links:
   - `terms-and-conditions`
   - `privacy-policy`
3. Extract cleaned copy snippets from `raw-html/` into reusable markdown/source docs.

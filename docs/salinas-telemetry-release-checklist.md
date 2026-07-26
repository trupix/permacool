# Salinas telemetry release checklist

Last updated: July 25, 2026

This is the release list for the Salinas telemetry work currently built and tested locally. Nothing in this checklist should be marked complete until the corresponding production change has been confirmed.

## Current release state

- [x] Local website changes are implemented.
- [x] Targeted telemetry, event, and logic tests pass.
- [x] The Next.js production build passes.
- [x] Local `main` matched `origin/main` before this pending work began.
- [ ] Pending work has been committed to a release branch.
- [ ] Pending work has been pushed to GitHub.
- [ ] A pull request has been reviewed and approved.
- [ ] The approved version has been deployed to Vercel.
- [ ] Production telemetry has been validated after deployment.

## Access required before release

- [ ] GitHub permission to create and push a branch to `trupix/permacool`.
- [ ] Permission to open and merge the release pull request.
- [ ] Vercel project access for the production deployment and deployment-log review.
- [ ] Production environment access to confirm required variable names and availability without copying secrets into this document.
- [ ] groov EPIC / Node-RED edit access for the Salinas controller flow.
- [ ] Authorization to deploy and restart the Salinas Node-RED flow if its payload schedule changes.

## Website changes to publish

- [ ] Add the fast-only telemetry API scope used by Live mode.
- [ ] Keep the normal complete dashboard check at 15 seconds.
- [ ] Check only high pressure, low pressure, process-fluid temperature, and compressor amps every 2 seconds while Live mode is enabled.
- [ ] Keep one facility-level Live control with automatic shutoff after one hour.
- [ ] Preserve the newest value from either the fast or standard telemetry response.
- [ ] Keep the Overview compact: Live control, countdown, current readings, and one small connection-status strip.
- [ ] Publish the Salinas aerial weather hero with the exact facility marker, NWS observation overlay, forecast strip, and visible Esri imagery attribution.
- [ ] Publish the full Fast / Immediate / Slow / Heartbeat explanation under Location Specs.
- [ ] Show compressor started and compressor stopped as permanent events.
- [ ] Keep reached-temperature cycles separate from generic compressor-stop events.
- [ ] Keep system enabled/disabled and high-pressure-stop transitions in the permanent event history.
- [ ] Attach high pressure, low pressure, process temperature, compressor amps, runtime, and setpoint to event records when available.
- [ ] Add the controller-heartbeat definition and connection-health display.
- [ ] Publish the updated Logic catalog entries and telemetry documentation.

## groov EPIC / Node-RED changes

### Fast operating readings

- [ ] Send `ch1_high_pressure` and `ch2_high_pressure`.
- [ ] Send `ch1_low_pressure` and `ch2_low_pressure`.
- [ ] Send `ch1_temperature_c` and `ch2_temperature_c` using the verified field convention and unit `F`.
- [ ] Send `ch1_compressor_amps` and `ch2_compressor_amps` as actual numeric values with unit `A`.
- [ ] Confirm how often the EPIC tags themselves update; the website's 2-second check does not force the PLC to produce a new value.
- [ ] During an approved Live test, publish the fast operating group often enough for a new value to be available approximately every 2 seconds.

### Immediate state-change events

- [ ] Send `ch1_chiller_run` and `ch2_chiller_run` whenever either state changes.
- [ ] Send `ch1_system_on` and `ch2_system_on` whenever either state changes.
- [ ] Send `ch1_high_pressure_stop` and `ch2_high_pressure_stop` whenever either state changes.
- [ ] Send the aggregate `high_pressure_stop` whenever it changes.
- [ ] Include the affected channel's current high pressure, low pressure, process temperature, and compressor amps in every state-change POST.
- [ ] Verify `0` means off/clear and `1` means on/active for every Boolean signal.

### Slow information

- [ ] Send `ch1_compressor_runtime_min` and `ch2_compressor_runtime_min` once per minute.
- [ ] Send `ch1_setpoint_c` and `ch2_setpoint_c` whenever either setpoint changes.
- [ ] Confirm runtime is accumulated minutes and does not reset during a normal power cycle.

### Controller heartbeat

- [ ] Add `controller_heartbeat` to the Node-RED telemetry payload.
- [ ] Send a new heartbeat timestamp every 15 seconds.
- [ ] Verify the dashboard displays **EPIC communicating** after the heartbeat arrives.
- [ ] Verify the heartbeat changes to unavailable after 45 seconds without a new message.

## Production configuration checks

- [ ] Confirm the production site ID is `site-salinas`.
- [ ] Confirm the EPIC telemetry device is associated with the Salinas site.
- [ ] Confirm Node-RED uses the production telemetry-ingest URL.
- [ ] Confirm the same telemetry-ingest credential is configured in Node-RED and the production environment.
- [ ] Confirm `DATABASE_URL` is available to the deployed application.
- [ ] Confirm site telemetry is not disabled by `SITE_TELEMETRY_API_ENABLED=false`.
- [ ] Confirm the production user has permission to view the Salinas organization and site.
- [ ] Do not place VPN profiles, credentials, tokens, or database connection strings in Git.

## Release sequence

- [ ] Review the complete working-tree diff and exclude generated or unrelated files.
- [ ] Create a focused release branch.
- [ ] Run the telemetry-group, equipment-event, and Logic catalog tests.
- [ ] Run the production build.
- [ ] Commit the approved release scope.
- [ ] Push the release branch.
- [ ] Open a pull request describing the website work and the separate Node-RED dependency.
- [ ] Review the Vercel preview before merging.
- [ ] Merge only after approval.
- [ ] Deploy the saved, approved commit to production.
- [ ] Review deployment health and application logs.

## Production acceptance test

- [ ] Open the Salinas Overview and confirm the detailed timing cards are not present there.
- [ ] Confirm the Live button and countdown remain visible on the Overview.
- [ ] Confirm the aerial weather hero loads, remains centered on the facility, and displays the required imagery attribution.
- [ ] Confirm observed weather remains visually distinct from forecast values in the aerial hero.
- [ ] Open Location Specs and confirm the telemetry configuration section is present.
- [ ] Confirm CH1 and CH2 high-pressure readings display correctly within the 0–500 PSI range.
- [ ] Confirm CH1 and CH2 low-pressure readings display correctly within the -14.7–300 PSI range.
- [ ] Confirm both process-fluid temperatures display in °F within the -50–100 °F range.
- [ ] Confirm CH1 and CH2 compressor amperage readings display.
- [ ] Turn on Live and confirm only the fast operating group is checked every 2 seconds.
- [ ] Confirm the normal complete dashboard check remains at 15 seconds.
- [ ] Confirm Live turns off when clicked again.
- [ ] Confirm the one-hour automatic Live shutoff remains configured.
- [ ] Trigger or safely simulate a compressor start and stop and verify both events are recorded.
- [ ] Safely simulate a reached-temperature cycle and verify it is not labeled as an alarm.
- [ ] Safely simulate a high-pressure stop through an approved test method and verify the alert text, channel, and condition snapshot.
- [ ] Confirm runtime updates on the one-minute schedule.
- [ ] Confirm a setpoint change is retained and logged correctly.
- [ ] Confirm the controller heartbeat displays as current and then unavailable when deliberately paused.
- [ ] Confirm current pressure or temperature readings keep the unit from being labeled stale merely because slow values have not changed.
- [ ] Confirm observed weather and forecast sections still update normally.
- [ ] Check the Overview, Location Specs, and Events pages at desktop and mobile widths.

## Known items to watch

- [ ] Compressor-amperage points were previously absent from the live PLC payload.
- [ ] The current local preview uses sample data rather than the production telemetry database.
- [ ] A 2-second website check can only display values as quickly as Node-RED publishes new PLC readings.
- [ ] The dedicated heartbeat is a new payload point and will remain pending until Node-RED sends it.
- [ ] Event snapshots are most accurate when Node-RED includes the current operating readings in the same POST as the state change.
- [ ] The aerial basemap is a reference image, not a live satellite feed; only the overlaid NWS weather data updates.

# Sites status snapshots

The Sites/My Equipment listing reads `DeviceDisplaySnapshot`, not `TelemetrySample` history. Site and device authorization is applied on every request. Device subsets are filtered before calculating activity.

Normal website telemetry ingestion records a monotonic `lastObservedRunAt` for recognized positive compressor/chiller command signals. This is a commanded-running observation, not physical motor feedback. This ancillary write occurs after telemetry is saved; failure is logged without rejecting saved telemetry. No PLC or Node-RED changes are required.

The authenticated `/api/cron/site-status` job projects current stored telemetry and the saved last-running timestamp into display snapshots every ten minutes. It does not scan history or contact controllers. The browser reloads the saved summary fifteen seconds after each ten-minute boundary. Connection freshness and activity are evaluated at the snapshot time. The page shows when the snapshot was saved and warns when it is over twenty minutes old.

The existing activity labels remain: Running now, Ran within 12h, Idle 12–24h, Idle over 24h, and No run recorded. Gateway online requires telemetry within five minutes of the snapshot, rather than a permanently stored online flag.

Apply the additive migration before deploying. `scripts/bootstrap-sites-snapshot.cjs [env-file]` creates the table with RLS enabled and performs the one-time historical backfill plus first snapshot. It is idempotent and must not be called from page requests or the recurring cron. No telemetry history is removed. Future schema migrations can safely reapply the guarded DDL.

If the job stops, retain and label the old snapshot; do not make the page fall back to an expensive history scan. Investigate cron errors and `Sites display last-running timestamp update failed` logs. Existing account authorization remains mandatory and is not cached across users.

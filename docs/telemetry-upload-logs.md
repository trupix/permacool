# Investigating telemetry uploads

In the PermaCool project's Vercel production Runtime Logs, filter the route to
`/api/ingest/telemetry` and search for `telemetry.upload`. One completion
record is emitted per authenticated attempt that returns normally or a handled
database error. A killed process may have no completion record. Unauthenticated
traffic does not produce this diagnostic.

- Match `siteId`, `deviceId`, original UTC `capturedAt` and `batchId`. Retries of
  identical readings have the same fingerprint but a new `attemptId`. A later
  `saved` for the same fingerprint is evidence of a successful save. This does
  not add a retry or change deduplication. An upload with a new capture time is
  a different batch, not proof that the original was recovered.
- `failed` means the handler did not acknowledge a save; an ambiguous connection
  loss at commit is not proof of rollback. A `partial/event_history` result
  means readings were saved but the separate event history operation failed.
  Rejections and configuration issues are distinct from DB errors.
- On failure, inspect `phase`, Prisma `code`, and `readingKeys` (up to 64 unique
  safe tag identifiers; `extraKeys` counts further safe keys). `failedPointKey`
  and zero-based index are only included for a specifically identified point.
  A checkout failure is a batch failure, not a sensor fault. Values, raw
  payloads, SQL parameters, headers and credentials are not emitted by this logger.
- `waitMs` is the sum of native Prisma engine checkout durations. `heldMinMs`
  and `heldMaxMs` bracket website-side pooled connection occupancy: checkout
  completion to the end of the last SQL command, and to engine query completion,
  respectively. Prisma has no separate release timestamp. An exhausted checkout
  (`P2024`) with no SQL holds the connection for **zero** during that attempt;
  prior stages may still have occupied a connection. `db` breaks these metrics
  down per step. A cold engine connection is separate when observed. These are
  not the number of seconds a physical Supabase backend session stays open.
- If an operation cannot be observed (e.g. an engine error before tracing,
  cached/shared work, or another Prisma tracer), the relevant timing is `null`,
  not a guess. The total is null if any step is unknown; the observed steps
  remain available. `elapsedMs` is wall time, not a substitute for either metric.
  Phase timing sums connection usage, not necessarily sequential wall time.

The private trace processor has no external exporter and runs no additional
database queries. It does not change transaction boundaries, connection limits
or controller behavior. No database migration is needed.

For the batched latest-value writer, compare `db[phase=save_batch].heldMinMs`
between releases for the same site and point count; compare `waitMs` separately.
History keeps every incoming point, including late readings and repeated keys.
The current dashboard row changes only for a strictly newer capture time for
that device and key. Within one packet the final occurrence of a key wins; at
the same timestamp across packets the first accepted current value stays.
The device's last-seen timestamp cannot go backwards. Existing point IDs and
custom labels are preserved. A bulk write error identifies the packet, not
an individual sensor; input validation can still identify a specific bad tag.

High-pressure stops have two separate records. The Events timeline can show a
late clear at its capture time; this is history, not an instruction to clear
the active alert. The Alerts page follows strictly newer stop-bit readings for
that device and channel (or the system bit when no channel is identified).
A delayed clear cannot resolve a newer stop, and a delayed stop cannot reopen a
newer clear. Replays do not reset an acknowledgment or the alert's start time.
This rule runs in the existing latest-reading write, without an additional
database round trip, a migration or a change to the connection limit.

Local regression: build the website, apply its schema to a disposable loopback
PostgreSQL fixture, then set `INGEST_TEST_DATABASE_URL` and run
`node scripts/test-ingest-diagnostics.cjs`. The test requires the dedicated
`trace_fixture` account, one local connection and a one-second local pool timeout.
It never posts to a deployed endpoint.

# Investigating telemetry uploads

In the PermaCool project's Vercel production Runtime Logs, filter the route to
`/api/ingest/telemetry` and search for `telemetry.upload`. One completion
record is emitted per authenticated attempt that returns normally or a handled
database error. A killed process may have no completion record. Unauthenticated
traffic does not produce this diagnostic.

- Match `siteId`, `deviceId`, original UTC `capturedAt` and `batchId`. Retries of
  identical readings have the same fingerprint but a new `attemptId`. A later
  `saved` for the same fingerprint is evidence of a successful acknowledgment.
  `historyRowsInserted` and `historyRowsAlreadySaved` on committed attempts
  distinguish a new save from an acknowledged replay. A failed attempt does not
  report committed row counts. An upload with a new capture time is
  a different batch, not proof that the original was recovered.
- `failed` means the handler did not acknowledge a save; an ambiguous connection
  loss at commit is not proof of rollback. A `partial/event_history` result
  means readings and original event details were saved, but timeline delivery
  for this batch was not confirmed. This returns HTTP 503 with `Retry-After: 15`,
  `persisted: true`, and `eventsPersisted: false`; retry the identical batch.
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
or controller behavior.

For the batched latest-value writer, compare `db[phase=save_batch].heldMinMs`
between releases for the same site and point count; compare `waitMs` separately.
History keeps every point in a distinct batch, including late readings and
repeated keys within that batch. A retry does not append a second copy.
The current dashboard row changes only for a strictly newer capture time for
that device and key. Within one packet the final occurrence of a key wins; at
the same timestamp across packets the first accepted current value stays.
The device's last-seen timestamp cannot go backwards. Existing point IDs and
custom labels are preserved. A bulk write error identifies the packet, not
an individual sensor; input validation can still identify a specific bad tag.

The website identifies a batch by site, device, normalized capture time and
the full collection of key/value/unit tuples, including their multiplicity.
Reordering the same points does not change its identity. Each sorted position
has a stable sample ID protected by the existing database primary key. There
is no expiring cache, new receipt table, change to the PLC packet, or extra
database round trip. At the rollout boundary the writer also checks for a whole
matching old-format receipt at the exact device and capture time. It does not
combine separate legacy receipts or remove any historical duplicates. The
existing `pointCount` acknowledgment still means points in the accepted upload;
event history continues to be reported separately via `eventsPersisted`.

### Timeline recovery

For new uploads, the database commits the detected event's original timestamp,
message and readings to a private pending table in the same transaction as
the sample history, latest readings and alert state. If that pending write fails,
none of the batch commits. Retries use these saved events, not the current state.
A later ordinary upload from the same device also attempts delivery, oldest
first, up to 32 pending batches per upload. A silent device's pending work stays
on disk until its next upload. The timeline's unique event key prevents duplicates;
pending work is removed only when every key is confirmed. Weather remains optional.
No records from before the release are rewritten or reconstructed.

In a committed upload log, `timelineEventsInserted` counts newly written events
for that device, including older pending work. `timelineDelivery: idle` means
there was nothing to drain; `checked` means delivery ran and this batch has no
unconfirmed events; `deferred` means delivery needs another attempt. An upload
with no events of its own may still succeed while older work is deferred.
Repeated deferred results warrant checking the event-storage and events phases.
The website build applies only the additive, server-private pending-table migration.

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

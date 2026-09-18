# MuhaMeds PAC I/O communication feed

The HealthIO schema-1 table is read using the existing read-only PAC connection.
Read entries 0–13 every 15 seconds, with a single request in flight. Pass the
result to the function body in `gateway/healthio-map.js.txt`, then to the existing
site-scoped telemetry mapper. Do not add credentials to this package.

The first completed snapshot is unverified. A subsequent changed even sequence
can verify communication only when real I/O communication is enabled, all three
diagnostic reads succeed, and the aggregate scan advances. Duplicate sequences
emit nothing, so the website's 45-second freshness limit expires a frozen check.
Errors, simulation, incomplete snapshots, and unsupported schemas emit -1
(unverified); confirmed communication failure emits 0; verified progress emits 1.

No channel-fault count is invented. This does not verify field wiring, every
sensor, physical contactors, or successful output actuation. No PAC variables,
outputs, strategy, credentials, or existing telemetry intervals are changed.

Local regression: `node scripts/test-healthio-map.cjs` and
`node scripts/test-controller-connection-path.ts`.

# Saved-first individual Live pages

The individual Live page loads the latest authorized `TelemetryPoint` rows on the server and includes them in its initial page payload. The display consumes this snapshot immediately on hydration, without waiting for a browser telemetry request; locale-dependent timestamp formatting therefore stays consistent. This is not the ten-minute overview snapshot: it uses the most recently stored individual readings and preserves every original sample timestamp.

The existing authenticated client request starts after hydration, then continues every fifteen seconds. Optional two-second fast mode is unchanged. Timestamp-aware merging prevents an older API response from overwriting a newer reading. No localStorage, shared cross-user cache, PLC request, or controller setting change is introduced.

While the first live request is pending, the feed description identifies the readings as saved. A successful request replaces that description through the existing feed state. Stale readings remain subject to the existing freshness checks; missing readings are not invented. If the initial read fails, normal polling can recover. API-disabled deployments do not receive a saved-data bypass.

Recent events, cycle averages, and alerts stream independently under Suspense, so their history work does not hold the telemetry panel. Site authorization remains mandatory before rendering, and the initial telemetry query applies device-level access filters. The shared implementation applies to all individual site Live pages, including KE2 data where present.

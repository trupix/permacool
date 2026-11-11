-- Keep the activity lookup's exact signal matching semantics. Build outside a
-- transaction so telemetry ingestion can continue while the index is created.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "TelemetrySample_equipment_run_history_idx"
ON "TelemetrySample" ("deviceId", "capturedAt" DESC)
WHERE value > 0.5
  AND (key ILIKE '%chiller%' OR key ILIKE '%compressor%')
  AND regexp_replace(lower(key), '[^a-z0-9]', '', 'g')
    ~ '^(compressorstatus|(ch[0-9]+)?(chiller|compressor)run(output)?|(ch[0-9]+)?do(chiller|compressor)run)$';

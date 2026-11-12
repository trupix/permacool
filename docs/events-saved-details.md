# Saved event details

Events reuse a server-side Next Data Cache snapshot keyed by site ID, page size, and offset. It contains the persisted event records plus their calculated off-cycle duration, time between cycles, on-cycle duration, and cycle high temperature. It is not a replacement for the permanent EquipmentEvent database record and does not change event detection or telemetry ingestion.

Snapshots revalidate after 30 seconds using stale-while-revalidate: ordinary visits use saved details while expired entries refresh in the background. The first request for an uncached page still calculates its details. The Events screen checks for refreshed content every 30 seconds while visible, preserves its page number, and keeps the old content visible during refresh. Because revalidation is asynchronous, new events may take an additional refresh to appear. No claim of instantaneous event delivery is made.

Site authorization happens before the snapshot is requested, on both the page and API route. Site IDs and pagination are cache key arguments. CSV downloads bypass this display cache. Original timestamps, cycle calculations, weather association, and the separate 30-minute averages remain unchanged. Streaming separates the event history from navigation and averages so one does not block the others.

This change makes no requests to PLCs and changes no PAC strategy, Node-RED flow, pump controls, or controller settings.

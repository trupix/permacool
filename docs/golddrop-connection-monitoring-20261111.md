# GoldDrop connection monitoring — 2026-11-11

CH1 telemetry could remain locked after a PAC busy response that did not reach Catch. The four changed functions now bound each batch to 30 seconds, reject expired responses, and prevent an old response from releasing a newer batch. The existing tags, intervals and payload remain unchanged.

The separate read-only I/O monitor polls local OptoMMP every 15 seconds. It sends only read-quadlet (tcode 4) requests to 127.0.0.1:2001: module IDs at FFFFF0100000 and FFFFF0103000, module presence at FFFFF030007C, aggregate analog/HDD scan at FFFFF0300060. Expected IDs are 94000017 (GRV-OACIS-12) and 60000001 (GRV-IMA-24). Both presence bits and advancing scans are required. The initial sample is unverified. A 2.5-second deadline closes the socket and reports failure; fragmented replies are assembled, invalid replies rejected. This does not prove every channel or physical relay actuation. See Opto22 Form 1465-260805, pages 27, 35, 105–106, 124.

The monitor publishes controller_io_communication_ok to the existing GoldDrop ingest using the existing telemetry credential. The exported flow deliberately leaves credentials empty. Restore only the intended tabs and retain the existing PAC device config and private telemetry credential; do not import duplicate CH1 nodes. The previous staged HealthIO/write-request flow remains disabled.

Website delivery freshness now uses the newest site-scoped health signal instead of letting an old heartbeat hide newer successful delivery. GoldDrop I/O explanatory text identifies the actual read-only diagnostic source.

No PAC strategy download, output write, controller restart, permission or network change. KE2 and Events implementation preserved. Before-flow and credential-free final exports are in C:\AgenticalyCool\Golddrop\connection-monitoring-2026-11-11.

VPN: direct relay and authenticated website API both confirmed the GoldDrop session connected. The dashboard compared independent VPN observation time to the older telemetry fetch time, so a new VPN result more than five seconds later was incorrectly classified as future/unverified. GoldDrop now assesses VPN freshness against current time; the 60-second expiry and future-date guard remain. No VPN relay or access settings changed.

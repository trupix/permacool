# Salinas groov EPIC Telemetry Inventory

Last verified: 2026-07-14 over the private OpenVPN connection.

## Device and Network Context

- Site ID: `site-salinas`
- Device ID: `epic-mvp-01`
- Gateway ID: `groov-epic-01`
- VPN identity: `salinas-groov-epic-01`
- Static VPN address: `172.28.0.10`
- groov Manage: `https://172.28.0.10/` (VPN access only)
- Controller: groov EPIC `GRV-EPIC-PR1`
- Firmware: `3.5.1-b.85`
- PAC Control strategy: `PermaCoolChiller_noTM`
- Strategy state at verification: running, four running charts, Auto Run enabled

The EPIC and groov services are not exposed directly to the public internet. Administrative access is through the Google Cloud OpenVPN Access Server.

## Read-Only REST Access

- groov account: `perma.cool`
- PAC Control REST API permission: **Read-Only**
- API base path: `https://172.28.0.10/pac/device/strategy`
- Authentication header: `apiKey`

The API key and account password are intentionally not recorded in this repository. The API key used during discovery was removed from the workstation clipboard after the inventory was collected.

## Telemetry Tags

The following tags were read successfully from the live strategy. Snapshot values are observations, not configuration defaults.

| PAC data type | PAC tag | Snapshot | Telemetry key | Unit | Notes |
| --- | --- | ---: | --- | --- | --- |
| FLOAT | `CH1_Temperature` | -15.607574 | `ch1_temperature_c` | `°C` | Process temperature |
| FLOAT | `CH1_TemperatureSetpointC_pstv` | -42.0 | `ch1_setpoint_c` | `°C` | Active temperature setpoint |
| FLOAT | `CH1_HighPressure` | 242.64786 | `ch1_high_pressure` | `psi`* | High-side pressure |
| FLOAT | `CH1_LowPressure` | 8.1096 | `ch1_low_pressure` | `psi`* | Low-side pressure |
| INT32 | `CH1_ChillerRun` | 1 | `ch1_chiller_run` | `bool` | 0/1 state |
| INT32 | `CH1_SystemOn` | 1 | `ch1_system_on` | `bool` | 0/1 state |
| INT32 | `CH1_HighPressureStop` | 0 | `ch1_high_pressure_stop` | `bool` | 0/1 alarm/interlock state |
| INT64 | `CH1_CompressorTotalRunTimeMin` | 25342 | `ch1_compressor_runtime_min` | `min` | Accumulated runtime |
| STRING | `CH1_SystemStatus` | `Running` | — | — | Not sent yet; the current ingest contract accepts numeric values only |
| FLOAT | `CH2_Temperature` | -15.607574 | `ch2_temperature_c` | `°C` | Process temperature |
| FLOAT | `CH2_TemperatureSetpointC_pstv` | -42.0 | `ch2_setpoint_c` | `°C` | Active temperature setpoint |
| FLOAT | `CH2_HighPressure` | 247.50995 | `ch2_high_pressure` | `psi`* | High-side pressure |
| FLOAT | `CH2_LowPressure` | 10.935801 | `ch2_low_pressure` | `psi`* | Low-side pressure |
| INT32 | `CH2_ChillerRun` | 1 | `ch2_chiller_run` | `bool` | 0/1 state |
| INT32 | `CH2_SystemOn` | 1 | `ch2_system_on` | `bool` | 0/1 state |
| INT32 | `CH2_HighPressureStop` | 0 | `ch2_high_pressure_stop` | `bool` | 0/1 alarm/interlock state |
| INT64 | `CH2_CompressorTotalRunTimeMin` | 23936 | `ch2_compressor_runtime_min` | `min` | Accumulated runtime |
| STRING | `CH2_SystemStatus` | `Running` | — | — | Not sent yet; the current ingest contract accepts numeric values only |

\* Pressure units are inferred from the chiller context and must be confirmed against the PAC Control strategy/I/O documentation before the dashboard labels are treated as authoritative.

Additional HMI mirrors were observed (`CH1_HMITemperature`, `CH1_HMITemperatureSetpoint`, `CH1_HMICompressorRuntimeHours`, and CH2 equivalents), but telemetry should use the primary strategy tags above to avoid duplicate measurements.

## Telemetry Destination

- Endpoint: `https://perma.cool/api/ingest/telemetry`
- Method: `POST`
- Authentication header: `x-telemetry-token`
- Token source on the EPIC: Node-RED environment variable `TELEMETRY_INGEST_TOKEN`
- Sampling target: every 15 seconds
- Storage behavior: the current backend upserts the latest value for each `(deviceId, key)` pair; it does not yet retain time-series history

## Safety Rules

- Use only `pac-read` nodes. Do not add `pac-write` nodes to the telemetry flow.
- Keep the periodic inject node disabled until a one-shot request succeeds.
- Never embed the PAC API key or telemetry ingest token in an exported flow or committed file.
- The previously embedded telemetry token must be rotated before live telemetry is enabled.
- Back up the PAC strategy and Node-RED project before deployment.

## Backups

- EPIC backup: `backups/groov-epic-backup.2026-07-14T23_20_26.zip`
- EPIC backup SHA-256: `98FC13671DDAE3E75B813D32B7E3FDAE13B66F2C7274D1090E0094ED1B19DD10`
- Pre-telemetry Node-RED export: `backups/node-red.project.pre-telemetry.2026-07-14.zip`

## Deployment Checklist

1. Confirm `node-red-contrib-pac` is installed on the EPIC.
2. Import `gateway/flows.json`.
3. Open the PAC device configuration node, use `localhost` over HTTPS, and enter the read-only `perma.cool` API key in its credential field.
4. Set `TELEMETRY_INGEST_TOKEN`, `PERMACOOL_GATEWAY_ID=groov-epic-01`, `PERMACOOL_SITE_ID=site-salinas`, and `PERMACOOL_DEVICE_ID=epic-mvp-01` in the Node-RED environment.
5. Deploy with the interval disabled, trigger one read manually, and confirm HTTP 2xx plus persisted values.
6. Enable the 15-second interval only after the one-shot test passes.

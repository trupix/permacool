# Salinas operating signal contract

The groov EPIC / Node-RED telemetry payload sends these points to `POST /api/ingest/telemetry` for both `ch1` and `ch2`.

| Signal | Meaning | Expected unit |
| --- | --- | --- |
| `chN_chiller_run` | Condenser/compressor is running (`0` off, `1` on) | `bool` |
| `chN_compressor_runtime_min` | Accumulated compressor runtime | `min` |
| `chN_high_pressure` | Current high-side pressure | `psi` |
| `chN_high_pressure_stop` | Channel stopped on high pressure (`0` normal, `1` stopped) | `bool` |
| `high_pressure_stop` | Site/system high-pressure-stop fallback | `bool` |
| `chN_low_pressure` | Current low-side pressure | `psi` |
| `chN_setpoint_c` | Normal cycle-off temperature setpoint | actual PLC engineering unit |
| `chN_system_on` | System enable state (`0` disabled, `1` enabled) | `bool` |
| `chN_temperature_c` | Process-fluid temperature | actual PLC engineering unit |
| `chN_compressor_amps` | Current compressor transducer reading | `A` |

`N` is `1` or `2`. The payload's `unit` value is authoritative. The existing Salinas `_c` points are displayed as Fahrenheit because that is the verified field convention; Node-RED must continue sending `F` unless the PLC value is actually converted to Celsius.

## Transition logic

- `chN_system_on` changing `0 → 1` records a system-on event.
- `chN_system_on` changing `1 → 0` records a system-off event.
- `chN_chiller_run` changing `1 → 0`, while the system remains enabled, no high-pressure stop is active, and process temperature is at or below setpoint, records `Reached Temperature (setpoint) - CHN`.
- `chN_high_pressure_stop` changing to `1` records a critical event and opens the alert `Location compressor - CHN - HIGH PRESSURE STOP`.
- `chN_high_pressure_stop` changing back to `0` records a cleared event and resolves the active alert.
- The aggregate `high_pressure_stop` signal creates a system-level fallback alarm when neither channel-specific stop flag identifies the stopped channel.
- Repeated unchanged states do not create duplicate events.

Every recorded event snapshots high pressure, low pressure, process-fluid temperature, temperature unit, compressor amps, runtime minutes, and setpoint from the latest available PLC values.

## Persistence and freshness

- `TelemetryPoint` stores the latest value for each signal.
- `EquipmentEvent` stores the permanent transition/event history in PostgreSQL.
- The application creates that table idempotently on first use; the tracked Prisma migration remains available for direct database deployment.
- `Alert` stores active, acknowledged, and resolved high-pressure alarms.
- The site is current when at least one operating pressure, temperature, amperage, run, or enable signal for a unit has arrived within five minutes. An unchanged discrete value does not make the unit stale while its other operating signals continue updating.
- `/sites/site-salinas/events` shows the latest 100 records per page. `/api/sites/site-salinas/events?download=csv` exports up to the latest 10,000 records.

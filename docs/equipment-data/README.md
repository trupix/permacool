# Refrigeration equipment records

This directory is the staging source of truth for refrigeration-system metadata that is separate from PLC telemetry.

## Dashboard selections

The system-arrangement selector should use these values:

| Stored value | Dashboard label | Required relationship |
| --- | --- | --- |
| `single` | Single condenser | One condenser on one refrigeration circuit |
| `multiple_separate_systems` | Multiple - separate systems | Each condenser belongs to its own independent circuit/system |
| `multiple_parallel_same_system` | Multiple - parallel on the same system | Two or more condensers share one refrigeration circuit and refrigerant |
| `multiple_high_side_subcooling` | Multiple - one subcools the other's high side | Each condenser has a named `primary` or `subcooler` role and its own circuit data |

The process-solvent selector starts with `ethanol` and `butane`, while allowing a future `other` value. Process solvent and refrigerant are different fields.

For every condenser, preserve:

- manufacturer, family, exact model number, serial number, nominal HP, and installed electrical data;
- refrigerant and refrigeration-circuit membership;
- compressor manufacturer, technology, model, RLA, and LRA;
- source-document revision and page for every catalog rating;
- condition-dependent cooling-capacity points rather than one misleading fixed capacity.

## Salinas record

`site-salinas-equipment.json` records the user-verified configuration as two 22 HP Russell Next-Gen II air-cooled condensing units in parallel on the same R404A refrigeration system, chilling ethanol.

The supplied 2017 Russell catalog contains two possible 22 HP R404A low-temperature models: Copeland Discus and Bitzer. The exact installed model, compressor, voltage, serial number, and nameplate amperage remain deliberately unassigned until a unit nameplate confirms them.

### Russell 22 HP candidates

| Base model pattern | Compressor | Staging | Manual pages |
| --- | --- | --- | --- |
| `R*DS22L4S**` | Copeland Discus `4DJNF76KE` | One binary compressor | Capacity 20; electrical 32-33; specifications 37-38 |
| `R*BS22L4S**` | Bitzer `4GE-23` | One binary compressor | Capacity 28; electrical 35-36; specifications 37-38 |

There is no 22 HP Scroll model in this publication.

### Electrical ratings from the manual

| Candidate | Supply | Compressor RLA | Compressor LRA | Total condenser-fan FLA | Electric-defrost MCA / MOPD |
| --- | --- | ---: | ---: | ---: | ---: |
| Discus | 208-230 V, 3 ph, 60 Hz | 57.7 A | 374 A | 7.5 A | 121 / 150 A |
| Discus | 460 V, 3 ph, 60 Hz | 28.8 A | 187 A | 3.7 A | 61 / 70 A |
| Discus | 575 V, 3 ph, 60 Hz | 26.1 A | 135 A | 3.7 A | 45.3 / 70 A |
| Bitzer | 208-230 V, 3 ph, 60 Hz | 57.7 A | 352 A | 7.5 A | 121 / 150 A |
| Bitzer | 460 V, 3 ph, 60 Hz | 28.8 A | 176 A | 3.7 A | 61 / 70 A |
| Bitzer | 575 V, 3 ph, 60 Hz | 23.1 A | 140 A | 3.7 A | 51 / 60 A |

The tables also group 200-220 V/3/50 Hz with the first row and 380 V/3/50 Hz with the second row. The manual says to multiply the published 60 Hz cooling capacity by `0.83` for 50 Hz operation.

### Cooling ratings from the manual

| Candidate | 95 F ambient / -20 F suction | 100 F ambient / -20 F suction | Full published-map range |
| --- | ---: | ---: | ---: |
| Discus | 78,840 BTU/h (6.57 tons) | 74,230 BTU/h (6.19 tons) | 30,330-129,720 BTU/h |
| Bitzer | 76,890 BTU/h (6.41 tons) | 72,110 BTU/h (6.01 tons) | 32,880-132,420 BTU/h |

For two identical active units in parallel, the simple catalog sum at 95 F ambient and -20 F suction is 157,680 BTU/h for the Discus candidate or 153,780 BTU/h for the Bitzer candidate. This is a derived estimate, not a guaranteed shared-system capacity.

## Catalog record

`russell-next-gen-ii-22hp-r404a.json` contains the complete 22 HP R404A capacity rows and electrical ratings from Russell publication `RU-NG2-0617A` for both catalog candidates. Manufacturer catalog values must remain visually distinct from live PLC measurements and derived calculations.

Important calculation rules:

- Capacity changes with ambient temperature and saturated suction temperature.
- The catalog's RLA, LRA, FLA, MCA, and MOPD fields are electrical ratings, not measured kW.
- The manual does not publish compressor input kW, COP, or EER for these 22 HP low-temperature models.
- Weather data may select or interpolate a catalog rating point, but it must never overwrite catalog data.
- Parallel capacity may be summed only when both units are operating at comparable conditions; the result is an estimate until validated against the shared evaporator, piping, controls, and refrigerant distribution.
- Operational capacity remains locked until each condenser's exact catalog variant and installed frequency are confirmed and the suction input is explicitly validated as saturated suction temperature.
- Dashboard signals older than five minutes remain identifiable as last-known readings but are excluded from run state, readiness, weather override, and capacity calculations.
- Each condenser can store a `telemetryDeviceId`. Until Jose supplies that production mapping, unique CH-key matching is allowed; duplicate aliases across devices are treated as ambiguous and never resolved by taking the first match.

## Turbo Air TS060XR404A3A option

`turbo-air-ts060xr404a3a-r404a.json` adds the exact Turbo Air `TS060XR404A3A` model to the condenser catalog. The supplied manufacturer sheet is revision `Ver.20201203` and its SHA-256 digest is retained in the record.

| Field | Verified value |
| --- | --- |
| Refrigerant | R404A |
| Compressor | Copeland scroll `ZF18K4E-TF5` |
| Supply | 208-230 V, 3 phase, 60 Hz |
| Compressor RLA / LRA | 21.8 A / 156 A |
| MCA / MOPD | 29.7 A / 50 A |
| Condenser airflow | One fan, 3,809 CFM |
| Receiver at 90% | 31 lb |
| Connections | 1-1/8 in suction, 1/2 in liquid |
| Dimensions | 42.4 D x 30.25 W x 29.75 H in |
| Net weight / sound | 353 lb / 79 dBA |
| R404A AWEF | 3.2 |
| R404A capacity map | 32 points; 90-110 F ambient and 0 to -40 F suction temperature |

The sheet does not publish nominal horsepower, fan-motor FLA, compressor input kW, COP, EER, superheat, return-gas temperature, subcooling, or a 50 Hz multiplier. Those values remain `null` rather than being inferred from the model number. The catalog schema permits source-specific page names and nullable, unreported nameplate fields so this record does not misuse Russell-specific defrost or receiver-pump-down fields.

## Production integration

Use additive production tables under a site/system/equipment domain. Do not store this information in `Device` or `TelemetryPoint`; those represent PLC identity and live readings. Before adding tables, inspect the actual deployed Supabase schema and use reviewed additive migrations only.

### Site telemetry API production gate

`GET /api/sites/[siteid]/telemetry` requires an authenticated user whose organization includes the requested site. It is enabled by default and can be disabled immediately with this server-only deployment kill switch:

```dotenv
SITE_TELEMETRY_API_ENABLED=false
```

The route returns `401` without a session, `403` when the signed-in user's organization does not own the site, and private no-store responses for authorized requests. The kill switch gates only this site telemetry endpoint; it does not change the application's global authentication or onboarding behavior.

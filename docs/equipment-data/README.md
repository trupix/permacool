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

PermaCool's supported-equipment rule is user verified: its 6 HP Russell and Turbo Air units use scroll compressors, while its 22 HP and 30 HP Russell units use Copeland Discus compressors. Bitzer data may remain archived as manufacturer reference material but must not appear as an installed-equipment choice.

The normal equipment setup path asks only for manufacturer, size (`6`, `22`, or `30` HP as supported by that manufacturer), installed voltage (`208-230 V` or `460 V equipment / 480 V service`), and refrigerant (`R404A` or the simplified dashboard label `R448`). The stored refrigerant identifier for `R448` is `R448A`. Product family, model pattern, compressor technology, compressor model, phase, frequency, RLA, LRA, and catalog curve are derived from those selections. Unknown values must remain blank rather than being inferred when a matching manufacturer sheet is not available.

## Salinas record

`site-salinas-equipment.json` records the user-verified configuration as two 22 HP Russell Next-Gen II air-cooled condensing units in parallel on the same R404A refrigeration system, chilling ethanol.

The supplied 2017 Russell catalog contains two possible 22 HP R404A low-temperature models: Copeland Discus and Bitzer. PermaCool has verified that its installed 22 HP units use the Copeland Discus configuration. Voltage, serial number, and installed nameplate amperage remain deliberately unassigned until the installation or nameplate confirms them. The Bitzer row remains archived as manufacturer source data, but it is intentionally excluded from the installed-compressor selector because PermaCool does not use that compressor.

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
| Discus R404A | 78,840 BTU/h (6.57 tons) | 74,230 BTU/h (6.19 tons) | 30,330-129,720 BTU/h |
| Discus R448A | 71,180 BTU/h (5.93 tons) | 67,250 BTU/h (5.60 tons) | 20,700-126,050 BTU/h |
| Bitzer | 76,890 BTU/h (6.41 tons) | 72,110 BTU/h (6.01 tons) | 32,880-132,420 BTU/h |

For two identical active units in parallel, the simple catalog sum at 95 F ambient and -20 F suction is 157,680 BTU/h for the Discus candidate or 153,780 BTU/h for the Bitzer candidate. This is a derived estimate, not a guaranteed shared-system capacity.

## Catalog record

`russell-next-gen-ii-22hp-r404a.json` contains the complete 22 HP R404A capacity rows and electrical ratings from Russell publication `RU-NG2-0617A`. `russell-next-gen-ii-22hp-r448a.json` contains the separate combined R448A/R449A manufacturer curve as the dashboard's R448 selection, with all eight suction-temperature points at 90, 95, 100, and 110 F ambient. Manufacturer catalog values must remain visually distinct from live PLC measurements and derived calculations.

Important calculation rules:

- Capacity changes with ambient temperature and saturated suction temperature.
- The catalog's RLA, LRA, FLA, MCA, and MOPD fields are electrical ratings, not measured kW.
- The manual does not publish compressor input kW, COP, or EER for these 22 HP low-temperature models.
- Weather data may select or interpolate a catalog rating point, but it must never overwrite catalog data.
- Parallel capacity may be summed only when both units are operating at comparable conditions; the result is an estimate until validated against the shared evaporator, piping, controls, and refrigerant distribution.
- Operational capacity remains locked until each condenser's exact catalog variant and installed frequency are confirmed and the suction input is explicitly validated as saturated suction temperature.
- Dashboard signals older than five minutes remain identifiable as last-known readings but are excluded from run state, readiness, weather override, and capacity calculations.
- Each condenser can store a `telemetryDeviceId`. Until Jose supplies that production mapping, unique CH-key matching is allowed; duplicate aliases across devices are treated as ambiguous and never resolved by taking the first match.

## Russell Next-Gen MiniCon 6 HP option

`russell-next-gen-minicon-6hp-zs45k4e-r404a.json` and
`russell-next-gen-minicon-6hp-zs45k4e-r448a.json` add the Russell
`R*O600E4S**` extended-medium-temperature unit with the Copeland
`ZS45K4E` scroll compressor. The two refrigerants remain separate selections because their published capacity tables use different suction-temperature columns.

| Field | Verified value |
| --- | --- |
| Nominal horsepower | 6 HP |
| Refrigerants | R404A or R448A |
| Compressor | Copeland scroll `ZS45K4E` |
| Connections | 1-1/8 in suction, 5/8 in liquid |
| Standard receiver at 90% | 28.0 lb R404A; 29.4 lb R448A |
| Oversized receiver at 90% | 37.9 lb R404A; 39.8 lb R448A |
| Cabinet / dimensions | FM4; 33 D x 43-7/8 W x 35 H in |
| Fans / shipping weight / sound | One fan; approximately 405 lb; 76 dBA |
| AWEF | 7.60 for R404A and R448A |
| Ambient rating | Up to 110 F |
| Published liquid subcooling | 3-5 F average |

### Electrical references

| Supply | Compressor RLA / LRA | Condenser fan FLA | Air-defrost MCA / MOPD | Electric-defrost MCA / MOPD |
| --- | ---: | ---: | ---: | ---: |
| 208-230 V / 3 / 60 or 200-220 V / 3 / 50 | 21.5 / 156 A | 5.2 A | 33.1 / 50 A | 45.1 / 60 A |
| 460 V / 3 / 60 or 380 V / 3 / 50 | 8.3 / 75 A | 3.1 A | 15 / 20 A | 26 / 30 A |

The R404A map contains 28 published positions across 90-110 F ambient and 45 to -20 F suction temperature, with unavailable cells retained as `null`; its published non-null range is 18,340-80,860 BTU/h. The R448A map contains 32 positions across 90-110 F ambient and 45 to -10 F suction temperature, also retaining unavailable cells; its published non-null range is 24,330-73,700 BTU/h. The manual instructs multiplying the 60 Hz capacities by `0.83` for 50 Hz operation. Never extrapolate outside either map, and do not treat RLA, LRA, MCA, MOPD, or AWEF as live telemetry.

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

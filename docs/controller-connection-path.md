# Controller connection path

The Cannon Falls dashboard separates six read-only health layers so a running PAC strategy is never mistaken for healthy physical I/O:

1. VPN and EPIC reachability, inferred only from a current successful PAC API read until a direct VPN-session signal is available.
2. PAC Control strategy running state.
3. Physical I/O communication and channel-fault state.
4. Node-RED read access to the PAC API.
5. Node-RED health delivery to PermaCool.
6. The authenticated PermaCool telemetry API response.

The controller health package should publish these site- and device-scoped signals every 15 seconds:

- `node_red_pac_read_ok`
- `pac_strategy_running`
- `pac_io_communication_ok`
- `io_channel_fault_count`
- `controller_heartbeat` when available

The website does not restart networking, PAC Control, Node-RED, or physical I/O. The previously discussed recovery watchdog remains deferred. Before it is implemented, its safe-state behavior and maximum 20-minute outage window must be reviewed against the installed controller strategy.

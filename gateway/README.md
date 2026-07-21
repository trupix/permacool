# PermaCool groov EPIC Telemetry

Import `flows.json` into Node-RED on the Salinas groov EPIC. The flow reads 16 verified CH1/CH2 PAC Control tags and posts them to the PermaCool telemetry endpoint.

Before deploying:

1. Install `node-red-contrib-pac` version 1.1.4 from **Manage palette**, if the PAC read nodes are not already available.
2. Configure **Local groov EPIC (read-only)** with address `localhost`, HTTPS, and the API key for the read-only `perma.cool` account.
3. Make the following environment variables available to Node-RED:
   - `TELEMETRY_INGEST_TOKEN`
   - `PERMACOOL_GATEWAY_ID=groov-epic-01`
   - `PERMACOOL_SITE_ID=site-salinas`
   - `PERMACOOL_DEVICE_ID=epic-mvp-01`
4. Keep the interval disabled for the first deploy. Trigger it once manually and require an HTTP 2xx result before enabling the 15-second schedule.

The flow contains no PAC write nodes. Credentials are not included in this bundle.

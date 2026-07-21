require('dotenv').config({ path: '.env.local', quiet: true });

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
const endpoint = `${appUrl}/api/ingest/telemetry`;
const token = process.env.TELEMETRY_INGEST_TOKEN;

if (!token) {
  throw new Error('TELEMETRY_INGEST_TOKEN is required.');
}
const siteId = process.env.TEST_SITE_ID || 'site-salinas';
const deviceId = process.env.TEST_DEVICE_ID || 'epic-mvp-01';
const now = new Date();
const wobble = Math.sin(now.getTime() / 30_000);

const payload = {
  gatewayId: process.env.TEST_GATEWAY_ID || 'groov-epic-sim-01',
  siteId,
  deviceId,
  capturedAt: now.toISOString(),
  points: [
    { key: 'ch1_temperature_c', value: Number((-42 + wobble * 3).toFixed(1)), unit: 'F' },
    { key: 'ch1_setpoint_c', value: -40, unit: 'F' },
    { key: 'ch1_chiller_run', value: 1, unit: 'bool' },
    { key: 'ch1_system_on', value: 1, unit: 'bool' },
    { key: 'ch1_high_pressure', value: Number((215 + wobble * 8).toFixed(1)), unit: 'psi' },
    { key: 'ch1_low_pressure', value: Number((38 + wobble * 2).toFixed(1)), unit: 'psi' },
    { key: 'ch1_compressor_amps', value: Number((51 + wobble * 2).toFixed(1)), unit: 'A' },
    { key: 'ch1_compressor_runtime_min', value: 12_045, unit: 'min' },
    { key: 'ch1_high_pressure_stop', value: 0, unit: 'bool' },
    { key: 'high_pressure_stop', value: 0, unit: 'bool' }
  ]
};

async function main() {
  console.log(`Sending test telemetry to ${endpoint}`);
  console.log(`siteId=${siteId} deviceId=${deviceId}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-telemetry-token': token
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log(`HTTP ${response.status}`);
  console.log(text);

  if (!response.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

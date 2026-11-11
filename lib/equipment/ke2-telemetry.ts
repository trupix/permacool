export const KE2_DEVICE_ID = 'epic-golddrop-golddrop-epic-01-4oic';
export type Ke2Point = { deviceId: string; key: string; latestValue: unknown; latestTimestamp: string };
export const KE2_METRICS = [
  { key: 'superheat', label: 'Superheat', unit: '°F difference' },
  { key: 'suction_pressure', label: 'Suction pressure', unit: 'psig' },
  { key: 'suction_temperature', label: 'Suction temperature', unit: '°F' },
  { key: 'saturation_temperature', label: 'Saturation temperature', unit: '°F' },
  { key: 'valve_position', label: 'Valve position', unit: '%' }
] as const;
const ALARMS = ['Pressure sensor fault', 'Inlet sensor fault', 'Suction sensor fault', 'Air sensor fault',
  'High superheat', 'Low superheat', 'High temperature', 'Low temperature', 'Pump down',
  'Compressor short cycle', 'Low-pressure cutout', 'Power failure'];

export function readKe2Telemetry(points: Ke2Point[], now: number, fetchFailed = false) {
  const scoped = points.filter(p => p.deviceId === KE2_DEVICE_ID && p.key.startsWith('ke2_'));
  const find = (key: string) => scoped.find(p => p.key === `ke2_${key}`);
  const observation = find('observed_at_ms');
  const observedAt = typeof observation?.latestValue === 'number' ? observation.latestValue : NaN;
  const age = now - observedAt;
  const fresh = !fetchFailed && Number.isFinite(observedAt) && age >= -5000 && age <= 45000 &&
    Date.parse(observation!.latestTimestamp) === observedAt;
  // Every value/quality flag must belong to the same observation batch. Omitted
  // measurements remain in the database and must never become current again.
  const value = (key: string) => {
    const p = find(key);
    return fresh && p && Date.parse(p.latestTimestamp) === observedAt &&
      typeof p.latestValue === 'number' && Number.isFinite(p.latestValue) ? p.latestValue : null;
  };
  const connected = value('communication_connected') === 1;
  const valid = connected && value('data_valid') === 1 && value('fahrenheit_verified') === 1;
  const controller = valid && value('status_valid') === 1 ? value('controller_on') : null;
  const mask = valid && value('alarms_valid') === 1 ? value('alarm_mask') : null;
  const alarmMask = mask !== null && Number.isInteger(mask) && mask >= 0 && mask <= 65535 ? mask : null;
  const alarms = alarmMask === null ? [] : ALARMS.filter((_, bit) => (alarmMask & (1 << bit)) !== 0);
  if (alarmMask !== null && (alarmMask & 0xf000)) alarms.push(`Unrecognized alarm (0x${(alarmMask & 0xf000).toString(16).toUpperCase()})`);
  const communication = !observation ? 'Waiting for KE2 data' : fetchFailed ? 'Communication unavailable' :
    !fresh ? 'Communication stale' : connected ? 'Communication connected' : 'Communication not verified';
  return {
    communication, connected: fresh && connected, fresh, observedAt: Number.isFinite(observedAt) ? observedAt : null,
    controller: controller === 1 ? 'Controller ON' : controller === 0 ? 'Controller Off' : 'Controller — Unknown',
    externalOff: valid && value('status_valid') === 1 && value('external_system_off_channel3') === 1,
    alarms, alarmsKnown: alarmMask !== null, manualValve: valid && value('valve_manual') === 1,
    metrics: KE2_METRICS.map(metric => ({ ...metric,
      value: valid && value(`${metric.key}_valid`) === 1 ? value(metric.key) : null,
      unavailable: !fresh ? 'Awaiting current data' : !valid ? 'Reading unavailable' :
        value(`${metric.key}_valid`) !== 1 ? 'Sensor / reading fault' : 'Reading unavailable'
    }))
  };
}

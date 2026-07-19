export type EquipmentSignalValue = {
  key: string;
  value: number;
  unit: string;
};

export type EquipmentEventSnapshot = {
  highPressure: number | null;
  lowPressure: number | null;
  processTemperature: number | null;
  temperatureUnit: string | null;
  compressorAmps: number | null;
  runtimeMinutes: number | null;
  setpoint: number | null;
  setpointUnit: string | null;
  chillerRun: boolean | null;
  systemOn: boolean | null;
};

export type EquipmentEventDraft = EquipmentEventSnapshot & {
  dedupeKey: string;
  siteId: string;
  deviceId: string;
  channel: 'CH1' | 'CH2' | 'SYSTEM';
  eventType:
    | 'system_on'
    | 'system_off'
    | 'reached_temperature'
    | 'high_pressure_stop'
    | 'high_pressure_cleared';
  message: string;
  occurredAt: Date;
};

export type HighPressureAlertAction = {
  action: 'open' | 'resolve';
  alertId: string;
  channel: 'CH1' | 'CH2' | 'SYSTEM';
  message: string;
  occurredAt: Date;
};

export type EquipmentTransitionResult = {
  events: EquipmentEventDraft[];
  alertActions: HighPressureAlertAction[];
};

type EvaluateEquipmentTransitionsInput = {
  siteId: string;
  siteName: string;
  deviceId: string;
  capturedAt: Date;
  previous: EquipmentSignalValue[];
  incoming: EquipmentSignalValue[];
};

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function asMap(points: EquipmentSignalValue[]) {
  return new Map(points.map((point) => [normalizeKey(point.key), point]));
}

function booleanValue(point: EquipmentSignalValue | undefined): boolean | null {
  if (!point || !Number.isFinite(point.value)) return null;
  return point.value !== 0;
}

function numericValue(point: EquipmentSignalValue | undefined): number | null {
  return point && Number.isFinite(point.value) ? point.value : null;
}

function transitioned(previous: boolean | null, current: boolean | null, to: boolean) {
  return previous !== null && current === to && previous !== current;
}

function becameActive(previous: boolean | null, current: boolean | null) {
  return current === true && previous !== true;
}

function formatReading(value: number, unit: string | null) {
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return `${rounded}${unit ? ` ${unit}` : ''}`;
}

function snapshotForChannel(
  current: Map<string, EquipmentSignalValue>,
  prefix: 'ch1' | 'ch2'
): EquipmentEventSnapshot {
  const temperature = current.get(normalizeKey(`${prefix}_temperature_c`));
  const setpoint = current.get(normalizeKey(`${prefix}_setpoint_c`));

  return {
    highPressure: numericValue(current.get(normalizeKey(`${prefix}_high_pressure`))),
    lowPressure: numericValue(current.get(normalizeKey(`${prefix}_low_pressure`))),
    processTemperature: numericValue(temperature),
    temperatureUnit: temperature?.unit || null,
    compressorAmps: numericValue(
      current.get(normalizeKey(`${prefix}_compressor_amps`)) ??
        current.get(normalizeKey(`${prefix}compressoramps`))
    ),
    runtimeMinutes: numericValue(current.get(normalizeKey(`${prefix}_compressor_runtime_min`))),
    setpoint: numericValue(setpoint),
    setpointUnit: setpoint?.unit || temperature?.unit || null,
    chillerRun: booleanValue(current.get(normalizeKey(`${prefix}_chiller_run`))),
    systemOn: booleanValue(current.get(normalizeKey(`${prefix}_system_on`)))
  };
}

function eventDraft(
  input: EvaluateEquipmentTransitionsInput,
  channel: 'CH1' | 'CH2' | 'SYSTEM',
  eventType: EquipmentEventDraft['eventType'],
  message: string,
  snapshot: EquipmentEventSnapshot
): EquipmentEventDraft {
  return {
    ...snapshot,
    dedupeKey: [input.siteId, input.deviceId, channel, eventType, input.capturedAt.toISOString()].join(':'),
    siteId: input.siteId,
    deviceId: input.deviceId,
    channel,
    eventType,
    message,
    occurredAt: input.capturedAt
  };
}

function alertAction(
  input: EvaluateEquipmentTransitionsInput,
  channel: 'CH1' | 'CH2' | 'SYSTEM',
  action: 'open' | 'resolve'
): HighPressureAlertAction {
  return {
    action,
    alertId: `high-pressure-stop:${input.siteId}:${input.deviceId}:${channel}`,
    channel,
    message:
      channel === 'SYSTEM'
        ? `${input.siteName} system - HIGH PRESSURE STOP`
        : `${input.siteName} compressor - ${channel} - HIGH PRESSURE STOP`,
    occurredAt: input.capturedAt
  };
}

export function evaluateEquipmentTransitions(
  input: EvaluateEquipmentTransitionsInput
): EquipmentTransitionResult {
  const previous = asMap(input.previous);
  const incoming = asMap(input.incoming);
  const current = new Map(previous);
  incoming.forEach((value, key) => current.set(key, value));
  const aggregateStopKey = normalizeKey('high_pressure_stop');
  const aggregateHighPressureStop = booleanValue(current.get(aggregateStopKey));
  const events: EquipmentEventDraft[] = [];
  const alertActions: HighPressureAlertAction[] = [];
  let activeChannelStopIdentified = false;

  for (const channelNumber of [1, 2] as const) {
    const prefix = `ch${channelNumber}` as const;
    const channel = prefix.toUpperCase() as 'CH1' | 'CH2';
    const snapshot = snapshotForChannel(current, prefix);
    const previousRun = booleanValue(previous.get(normalizeKey(`${prefix}_chiller_run`)));
    const currentRun = snapshot.chillerRun;
    const previousSystemOn = booleanValue(previous.get(normalizeKey(`${prefix}_system_on`)));
    const currentSystemOn = snapshot.systemOn;
    const stopKey = normalizeKey(`${prefix}_high_pressure_stop`);
    const previousHighPressureStop = booleanValue(previous.get(stopKey));
    const currentHighPressureStop = booleanValue(current.get(stopKey));
    if (currentHighPressureStop === true) activeChannelStopIdentified = true;

    if (incoming.has(normalizeKey(`${prefix}_system_on`))) {
      if (transitioned(previousSystemOn, currentSystemOn, true)) {
        events.push(eventDraft(input, channel, 'system_on', `${channel} system turned on`, snapshot));
      } else if (transitioned(previousSystemOn, currentSystemOn, false)) {
        events.push(eventDraft(input, channel, 'system_off', `${channel} system turned off`, snapshot));
      }
    }

    if (incoming.has(stopKey)) {
      if (becameActive(previousHighPressureStop, currentHighPressureStop)) {
        const alert = alertAction(input, channel, 'open');
        events.push(eventDraft(input, channel, 'high_pressure_stop', alert.message, snapshot));
        alertActions.push(alert);
      } else if (transitioned(previousHighPressureStop, currentHighPressureStop, false)) {
        events.push(
          eventDraft(input, channel, 'high_pressure_cleared', `${channel} high-pressure stop cleared`, snapshot)
        );
        alertActions.push(alertAction(input, channel, 'resolve'));
      }
    }

    const reachedSetpoint =
      incoming.has(normalizeKey(`${prefix}_chiller_run`)) &&
      transitioned(previousRun, currentRun, false) &&
      currentSystemOn !== false &&
      currentHighPressureStop !== true &&
      aggregateHighPressureStop !== true &&
      snapshot.processTemperature !== null &&
      snapshot.setpoint !== null &&
      snapshot.processTemperature <= snapshot.setpoint;

    if (reachedSetpoint && snapshot.setpoint !== null) {
      events.push(
        eventDraft(
          input,
          channel,
          'reached_temperature',
          `Reached Temperature (${formatReading(snapshot.setpoint, snapshot.setpointUnit)}) - ${channel}`,
          snapshot
        )
      );
    }
  }

  if (!activeChannelStopIdentified && incoming.has(aggregateStopKey)) {
    const previousAggregateStop = booleanValue(previous.get(aggregateStopKey));
    const currentAggregateStop = booleanValue(current.get(aggregateStopKey));
    const emptySnapshot: EquipmentEventSnapshot = {
      highPressure: null,
      lowPressure: null,
      processTemperature: null,
      temperatureUnit: null,
      compressorAmps: null,
      runtimeMinutes: null,
      setpoint: null,
      setpointUnit: null,
      chillerRun: null,
      systemOn: null
    };

    if (becameActive(previousAggregateStop, currentAggregateStop)) {
      const alert = alertAction(input, 'SYSTEM', 'open');
      events.push(eventDraft(input, 'SYSTEM', 'high_pressure_stop', alert.message, emptySnapshot));
      alertActions.push(alert);
    } else if (transitioned(previousAggregateStop, currentAggregateStop, false)) {
      events.push(
        eventDraft(input, 'SYSTEM', 'high_pressure_cleared', 'System high-pressure stop cleared', emptySnapshot)
      );
      alertActions.push(alertAction(input, 'SYSTEM', 'resolve'));
    }
  }

  return { events, alertActions };
}

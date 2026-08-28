export type ConnectionTelemetryPoint = {
  deviceId: string;
  key: string;
  latestValue: unknown;
  latestTimestamp: string;
};

export type ConnectionStageState = 'healthy' | 'fault' | 'stale' | 'unmonitored' | 'checking';

export type ConnectionStage = {
  id: 'vpn' | 'strategy' | 'io' | 'pacRead' | 'delivery' | 'website';
  label: string;
  state: ConnectionStageState;
  status: string;
  detail: string;
  observedAt: string | null;
};

export type ControllerConnectionPath = {
  state: 'healthy' | 'fault' | 'stale' | 'incomplete' | 'checking';
  label: string;
  stages: ConnectionStage[];
};

type ResolvedSignal = {
  value: number;
  fresh: boolean;
  timestamp: string;
};

const FUTURE_TOLERANCE_MS = 60_000;
const DEFAULT_MAXIMUM_AGE_MS = 45_000;

const signalAliases = {
  heartbeat: ['controller_heartbeat', 'epic_heartbeat', 'heartbeat'],
  pacReadOk: ['node_red_pac_read_ok', 'nodered_pac_read_ok', 'pac_api_read_ok'],
  strategyRunning: ['pac_strategy_running', 'controller_strategy_running', 'strategy_running'],
  ioCommunicationOk: [
    'pac_io_communication_ok',
    'controller_io_communication_ok',
    'controller_io_communication_enabled',
  ],
  ioReady: ['controller_io_ready', 'pac_io_ready', 'io_unit_ready'],
  ioChannelFaultCount: ['io_channel_fault_count', 'pac_io_channel_fault_count']
} as const;

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function numericValue(value: unknown): number | null {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function resolveSignal(
  points: ConnectionTelemetryPoint[],
  deviceIds: string[],
  aliases: readonly string[],
  referenceTimestamp: string | null,
  maximumAgeMs: number
): ResolvedSignal | null {
  const scopedIds = new Set(deviceIds.filter(Boolean));
  if (!scopedIds.size) return null;
  const normalizedAliases = new Set(aliases.map(normalizeKey));
  const matches = points
    .filter((point) => scopedIds.has(point.deviceId) && normalizedAliases.has(normalizeKey(point.key)))
    .sort((left, right) => Date.parse(right.latestTimestamp) - Date.parse(left.latestTimestamp));
  if (!matches.length) return null;

  const point = matches[0];
  const value = numericValue(point.latestValue);
  if (value === null) return null;
  const observedAt = Date.parse(point.latestTimestamp);
  const referenceTime = referenceTimestamp ? Date.parse(referenceTimestamp) : Date.now();
  const fresh = Number.isFinite(observedAt) && Number.isFinite(referenceTime) &&
    referenceTime - observedAt <= maximumAgeMs && observedAt - referenceTime <= FUTURE_TOLERANCE_MS;
  return { value, fresh, timestamp: point.latestTimestamp };
}

function booleanStage(
  id: ConnectionStage['id'],
  label: string,
  signal: ResolvedSignal | null,
  healthyStatus: string,
  faultStatus: string,
  unmonitoredDetail: string,
  healthyDetail: string,
  faultDetail: string
): ConnectionStage {
  if (!signal) {
    return { id, label, state: 'unmonitored', status: 'Not monitored', detail: unmonitoredDetail, observedAt: null };
  }
  if (!signal.fresh) {
    return { id, label, state: 'stale', status: 'Stale', detail: 'The last reported check is older than 45 seconds.', observedAt: signal.timestamp };
  }
  return signal.value !== 0
    ? { id, label, state: 'healthy', status: healthyStatus, detail: healthyDetail, observedAt: signal.timestamp }
    : { id, label, state: 'fault', status: faultStatus, detail: faultDetail, observedAt: signal.timestamp };
}

export function resolveControllerConnectionPath({
  points,
  deviceIds,
  referenceTimestamp,
  feedStatus,
  maximumAgeMs = DEFAULT_MAXIMUM_AGE_MS
}: {
  points: ConnectionTelemetryPoint[];
  deviceIds: string[];
  referenceTimestamp: string | null;
  feedStatus: 'loading' | 'ready' | 'error';
  maximumAgeMs?: number;
}): ControllerConnectionPath {
  const scopedDeviceIds = [...new Set(deviceIds.filter(Boolean))];
  const heartbeat = resolveSignal(points, scopedDeviceIds, signalAliases.heartbeat, referenceTimestamp, maximumAgeMs);
  const pacReadOk = resolveSignal(points, scopedDeviceIds, signalAliases.pacReadOk, referenceTimestamp, maximumAgeMs);
  const strategyRunning = resolveSignal(points, scopedDeviceIds, signalAliases.strategyRunning, referenceTimestamp, maximumAgeMs);
  const ioCommunicationOk = resolveSignal(points, scopedDeviceIds, signalAliases.ioCommunicationOk, referenceTimestamp, maximumAgeMs);
  const ioReady = resolveSignal(points, scopedDeviceIds, signalAliases.ioReady, referenceTimestamp, maximumAgeMs);
  const ioChannelFaultCount = resolveSignal(points, scopedDeviceIds, signalAliases.ioChannelFaultCount, referenceTimestamp, maximumAgeMs);

  const vpn = booleanStage(
    'vpn',
    'VPN and EPIC',
    pacReadOk,
    'Reachable',
    'Unreachable',
    'A direct VPN state is not published. A successful PAC API read can safely prove reachability.',
    'Reachability is inferred from a current successful PAC API read; this is not a direct VPN-session signal.',
    'Node-RED cannot currently read the PAC API through the controller network path.'
  );
  const strategy = booleanStage(
    'strategy',
    'PAC strategy',
    strategyRunning,
    'Running',
    'Stopped',
    'Publish pac_strategy_running from the read-only health flow.',
    'PAC Control reports that the strategy is running.',
    'The controller is reachable, but the PAC strategy reports stopped.'
  );

  let io: ConnectionStage;
  if (!ioCommunicationOk && !ioReady && !ioChannelFaultCount) {
    io = {
      id: 'io',
      label: 'Physical I/O boards',
      state: 'unmonitored',
      status: 'Not monitored',
      detail: 'Publish pac_io_communication_ok and io_channel_fault_count from the read-only health flow.',
      observedAt: null
    };
  } else if (
    (ioCommunicationOk && !ioCommunicationOk.fresh) ||
    (ioReady && !ioReady.fresh) ||
    (ioChannelFaultCount && !ioChannelFaultCount.fresh)
  ) {
    io = {
      id: 'io',
      label: 'Physical I/O boards',
      state: 'stale',
      status: 'Stale',
      detail: 'The last physical I/O check is older than 45 seconds.',
      observedAt: ioCommunicationOk?.timestamp ?? ioReady?.timestamp ?? ioChannelFaultCount?.timestamp ?? null
    };
  } else {
    const communicationHealthy = ioCommunicationOk?.value !== 0;
    const ioUnitReady = ioReady?.value !== 0;
    const channelsHealthy = ioChannelFaultCount ? ioChannelFaultCount.value === 0 : true;
    const healthy = communicationHealthy && ioUnitReady && channelsHealthy;
    io = {
      id: 'io',
      label: 'Physical I/O boards',
      state: healthy ? 'healthy' : 'fault',
      status: healthy ? 'Communicating' : 'Disconnected / faulted',
      detail: healthy
        ? 'PAC reports I/O communication available with no channel faults.'
        : `PAC reports ${communicationHealthy ? 'communication enabled' : 'communication unavailable'}, ${ioUnitReady ? 'I/O unit ready' : 'I/O unit not ready'}, and ${ioChannelFaultCount?.value ?? 'unknown'} channel fault(s).`,
      observedAt: ioCommunicationOk?.timestamp ?? ioReady?.timestamp ?? ioChannelFaultCount?.timestamp ?? null
    };
  }

  const pacRead = booleanStage(
    'pacRead',
    'Node-RED PAC read',
    pacReadOk,
    'Reading',
    'Read failed',
    'Publish node_red_pac_read_ok from the read-only health flow.',
    'Node-RED can read PAC Control without writing to the strategy.',
    'Node-RED is running but its PAC API read is failing.'
  );

  const deliveryEvidence = heartbeat ?? pacReadOk ?? strategyRunning ?? ioCommunicationOk ?? ioChannelFaultCount;
  const delivery: ConnectionStage = !deliveryEvidence
    ? {
        id: 'delivery', label: 'Telemetry delivery', state: 'unmonitored', status: 'Not monitored',
        detail: 'No site-scoped health signal has reached PermaCool yet.', observedAt: null
      }
    : !deliveryEvidence.fresh
      ? {
          id: 'delivery', label: 'Telemetry delivery', state: 'stale', status: 'Stale',
          detail: 'The latest controller health delivery is older than 45 seconds.', observedAt: deliveryEvidence.timestamp
        }
      : {
          id: 'delivery', label: 'Telemetry delivery', state: 'healthy', status: 'Current',
          detail: heartbeat ? 'The dedicated controller heartbeat is current.' : 'A current site-scoped health signal proves Node-RED delivery.',
          observedAt: deliveryEvidence.timestamp
        };

  const website: ConnectionStage = feedStatus === 'loading'
    ? {
        id: 'website', label: 'PermaCool website', state: 'checking', status: 'Checking',
        detail: 'The protected telemetry API request is in progress.', observedAt: referenceTimestamp
      }
    : feedStatus === 'error'
      ? {
          id: 'website', label: 'PermaCool website', state: 'fault', status: 'API unavailable',
          detail: 'The authenticated dashboard could not load its telemetry API.', observedAt: referenceTimestamp
        }
      : {
          id: 'website', label: 'PermaCool website', state: 'healthy', status: 'Connected',
          detail: 'The authenticated dashboard loaded the site-scoped telemetry API.', observedAt: referenceTimestamp
        };

  const stages = [vpn, strategy, io, pacRead, delivery, website];
  const state = stages.some((stage) => stage.state === 'fault')
    ? 'fault'
    : stages.some((stage) => stage.state === 'stale')
      ? 'stale'
      : stages.some((stage) => stage.state === 'unmonitored')
        ? 'incomplete'
        : stages.some((stage) => stage.state === 'checking')
          ? 'checking'
          : 'healthy';

  return {
    state,
    label: state === 'healthy'
      ? 'Full connection path healthy'
      : state === 'fault'
        ? 'Connection path needs attention'
        : state === 'stale'
          ? 'Connection health is stale'
          : state === 'checking'
            ? 'Checking connection path'
            : 'Connection monitoring is incomplete',
    stages
  };
}

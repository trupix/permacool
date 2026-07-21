import type {
  Alert,
  AppUser,
  AuditLogEntry,
  Device,
  EquipmentEvent,
  Organization,
  Site,
  TelemetryPoint
} from '@/types/domain';

export const users: AppUser[] = [
  {
    id: 'user-jose',
    name: 'Jose Perez',
    email: 'jose@perma.cool',
    role: 'owner',
    platformRole: 'staff_admin',
    status: 'approved',
    organizationIds: ['org-permacool'],
    allDeviceOrganizationIds: ['org-permacool'],
    deviceIds: []
  },
  {
    id: 'user-ops-1',
    name: 'Maya Chen',
    email: 'maya@perma.cool',
    role: 'operator',
    platformRole: 'staff_support',
    status: 'approved',
    organizationIds: ['org-permacool'],
    allDeviceOrganizationIds: ['org-permacool'],
    deviceIds: []
  }
];

export const organizations: Organization[] = [
  {
    id: 'org-permacool',
    name: 'PermaCool Operations',
    status: 'active',
    siteIds: ['site-salinas', 'site-okc']
  }
];

export const sites: Site[] = [
  {
    id: 'site-salinas',
    organizationId: 'org-permacool',
    name: 'Salinas Extraction Campus',
    region: 'California, US',
    timezone: 'America/Los_Angeles',
    gatewayStatus: 'online',
    deviceIds: ['epic-mvp-01', 'plc-sal-01', 'plc-sal-02']
  },
  {
    id: 'site-okc',
    organizationId: 'org-permacool',
    name: 'Oklahoma City Process Plant',
    region: 'Oklahoma, US',
    timezone: 'America/Chicago',
    gatewayStatus: 'degraded',
    deviceIds: ['plc-okc-01']
  }
];

export const devices: Device[] = [
  {
    id: 'epic-mvp-01',
    siteId: 'site-salinas',
    name: 'groov EPIC MVP Edge Agent',
    plcModel: 'Opto 22 groov EPIC',
    protocol: 'Node-RED HTTP',
    status: 'online',
    lastSeenAt: '2026-04-28T16:00:00Z',
    firmwareVersion: 'EPIC / Node-RED'
  },
  {
    id: 'plc-sal-01',
    siteId: 'site-salinas',
    name: 'Cryo Loop Controller A',
    plcModel: 'Allen-Bradley CompactLogix',
    protocol: 'EtherNet/IP',
    status: 'online',
    lastSeenAt: '2026-04-25T19:55:00Z',
    firmwareVersion: 'v2.14.8'
  },
  {
    id: 'plc-sal-02',
    siteId: 'site-salinas',
    name: 'Butane Recovery PLC',
    plcModel: 'Siemens S7-1200',
    protocol: 'OPC UA',
    status: 'online',
    lastSeenAt: '2026-04-25T19:54:10Z',
    firmwareVersion: 'v1.9.2'
  },
  {
    id: 'plc-okc-01',
    siteId: 'site-okc',
    name: 'LN2 Supply Controller',
    plcModel: 'Schneider M241',
    protocol: 'Modbus TCP',
    status: 'degraded',
    lastSeenAt: '2026-04-25T19:49:44Z',
    firmwareVersion: 'v3.1.0'
  }
];

export const telemetryPoints: TelemetryPoint[] = [
  {
    id: 'tp-epic-1',
    deviceId: 'epic-mvp-01',
    key: 'chamber_temp',
    label: 'Chamber Temp',
    unit: '°F',
    latestValue: -42.5,
    latestTimestamp: '2026-04-28T16:00:00Z'
  },
  {
    id: 'tp-epic-2',
    deviceId: 'epic-mvp-01',
    key: 'compressor_status',
    label: 'Compressor Status',
    unit: 'bool',
    latestValue: 1,
    latestTimestamp: '2026-04-28T16:00:00Z'
  },
  {
    id: 'tp-epic-3',
    deviceId: 'epic-mvp-01',
    key: 'pressure_high_side',
    label: 'Pressure High Side',
    unit: 'psi',
    latestValue: 218.4,
    latestTimestamp: '2026-04-28T16:00:00Z'
  },
  {
    id: 'tp-1',
    deviceId: 'plc-sal-01',
    key: 'supply_temp',
    label: 'Supply Temp',
    unit: '°F',
    latestValue: -42,
    latestTimestamp: '2026-04-25T19:55:00Z'
  },
  {
    id: 'tp-2',
    deviceId: 'plc-sal-01',
    key: 'pump_load',
    label: 'Pump Load',
    unit: '%',
    latestValue: 67,
    latestTimestamp: '2026-04-25T19:55:00Z'
  },
  {
    id: 'tp-3',
    deviceId: 'plc-okc-01',
    key: 'line_pressure',
    label: 'Line Pressure',
    unit: 'psi',
    latestValue: 124,
    latestTimestamp: '2026-04-25T19:49:44Z'
  }
];

export const alerts: Alert[] = [
  {
    id: 'alert-1',
    siteId: 'site-okc',
    deviceId: 'plc-okc-01',
    severity: 'warning',
    status: 'open',
    message: 'Gateway heartbeat is delayed by 4m 12s.',
    startedAt: '2026-04-25T19:45:00Z'
  },
  {
    id: 'alert-2',
    siteId: 'site-salinas',
    deviceId: 'plc-sal-02',
    severity: 'info',
    status: 'acknowledged',
    message: 'Maintenance window begins at 20:30 UTC.',
    startedAt: '2026-04-25T18:00:00Z'
  }
];

export const equipmentEvents: EquipmentEvent[] = [
  {
    id: 'event-salinas-1',
    siteId: 'site-salinas',
    deviceId: 'epic-mvp-01',
    deviceName: 'groov EPIC MVP Edge Agent',
    channel: 'CH1',
    eventType: 'system_on',
    message: 'CH1 system turned on',
    occurredAt: '2026-04-28T15:20:00Z',
    highPressure: 174.2,
    lowPressure: 31.8,
    processTemperature: -31.4,
    temperatureUnit: 'F',
    compressorAmps: 48.6,
    runtimeMinutes: 18420,
    setpoint: -40,
    setpointUnit: 'F'
  },
  {
    id: 'event-salinas-2',
    siteId: 'site-salinas',
    deviceId: 'epic-mvp-01',
    deviceName: 'groov EPIC MVP Edge Agent',
    channel: 'CH2',
    eventType: 'reached_temperature',
    message: 'Reached Temperature (-40 F) - CH2',
    occurredAt: '2026-04-28T14:55:00Z',
    highPressure: 162.9,
    lowPressure: 28.1,
    processTemperature: -40.3,
    temperatureUnit: 'F',
    compressorAmps: 0,
    runtimeMinutes: 17984,
    setpoint: -40,
    setpointUnit: 'F'
  }
];

export const auditLog: AuditLogEntry[] = [
  {
    id: 'audit-1',
    actorName: 'Jose Perez',
    action: 'Created site record',
    entityType: 'site',
    entityLabel: 'Salinas Extraction Campus',
    createdAt: '2026-04-25T18:12:00Z'
  },
  {
    id: 'audit-2',
    actorName: 'Maya Chen',
    action: 'Updated operator role assignment',
    entityType: 'user',
    entityLabel: 'Maya Chen',
    createdAt: '2026-04-25T18:36:00Z'
  }
];

export const currentUser = users[0];

export const dashboardSummary = {
  totalSites: sites.length,
  onlineDevices: devices.filter((device) => device.status === 'online').length,
  openAlerts: alerts.filter((alert) => alert.status === 'open').length,
  degradedSites: sites.filter((site) => site.gatewayStatus !== 'online').length
};

export function getSiteById(siteId: string) {
  return sites.find((site) => site.id === siteId);
}

export function getDeviceById(deviceId: string) {
  return devices.find((device) => device.id === deviceId);
}

export function getDevicesForSite(siteId: string) {
  return devices.filter((device) => device.siteId === siteId);
}

export function getTelemetryForDevice(deviceId: string) {
  return telemetryPoints.filter((point) => point.deviceId === deviceId);
}

export function getAlertsForSite(siteId: string) {
  return alerts.filter((alert) => alert.siteId === siteId);
}

export function getEquipmentEventsForSite(siteId: string) {
  return equipmentEvents.filter((event) => event.siteId === siteId);
}

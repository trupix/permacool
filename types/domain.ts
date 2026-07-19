export type DeviceStatus = 'online' | 'offline' | 'degraded';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';
export type UserRole = 'owner' | 'operator' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  status: 'active' | 'trial';
  siteIds: string[];
}

export interface Site {
  id: string;
  organizationId: string;
  name: string;
  region: string;
  timezone: string;
  gatewayStatus: DeviceStatus;
  deviceIds: string[];
}

export interface Device {
  id: string;
  siteId: string;
  name: string;
  plcModel: string;
  protocol: string;
  status: DeviceStatus;
  lastSeenAt: string;
  firmwareVersion: string;
}

export interface TelemetryPoint {
  id: string;
  deviceId: string;
  key: string;
  label: string;
  unit: string;
  latestValue: number;
  latestTimestamp: string;
}

export interface Alert {
  id: string;
  siteId: string;
  deviceId: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  startedAt: string;
}

export interface EquipmentEvent {
  id: string;
  siteId: string;
  deviceId: string;
  deviceName?: string;
  channel: 'CH1' | 'CH2' | 'SYSTEM' | string;
  eventType: string;
  message: string;
  occurredAt: string;
  highPressure: number | null;
  lowPressure: number | null;
  processTemperature: number | null;
  temperatureUnit: string | null;
  compressorAmps: number | null;
  runtimeMinutes: number | null;
  setpoint: number | null;
  setpointUnit: string | null;
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  action: string;
  entityType: 'site' | 'device' | 'user' | 'alert';
  entityLabel: string;
  createdAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationIds: string[];
}

export interface TelemetryIngestPayload {
  gatewayId: string;
  siteId: string;
  deviceId: string;
  capturedAt: string;
  points: Array<{
    key: string;
    value: number;
    unit: string;
  }>;
}

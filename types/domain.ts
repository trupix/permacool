export type DeviceStatus = 'online' | 'offline' | 'degraded';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';
export type UserRole = 'owner' | 'operator' | 'viewer';
export type VpnProfileStatus = 'not_generated' | 'issuing' | 'issued' | 'revoked' | 'error' | 'external';
export type PlatformRole = 'customer' | 'staff_support' | 'staff_admin';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type MembershipRole = 'customer_admin' | 'operator' | 'viewer';

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
  lastActiveAt?: string | null;
  operatingActivity?: import('@/lib/site-operating-activity').SiteOperatingActivity;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
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
  serialNumber?: string | null;
  vpnIdentity?: string | null;
  vpnTunnelIp?: string | null;
  localIpAddress?: string | null;
  vpnProfileStatus?: VpnProfileStatus;
  vpnProfileIssuedAt?: string | null;
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

export type LogicDefinitionCategory = 'signal' | 'operation' | 'event' | 'storage' | 'display';
export type LogicImplementationStatus = 'deployed' | 'draft' | 'retired';

export interface LogicDefinition {
  id: string;
  slug: string;
  category: LogicDefinitionCategory;
  title: string;
  signalKey: string | null;
  definition: string;
  behavior: string;
  implementationStatus: LogicImplementationStatus;
  sortOrder: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
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
  platformRole: PlatformRole;
  status: UserStatus;
  organizationIds: string[];
  organizationRoles: Record<string, UserRole>;
  allDeviceOrganizationIds: string[];
  deviceIds: string[];
  companyName?: string;
  accessNote?: string;
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

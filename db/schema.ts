export const schemaNotes = {
  organizations: ['id', 'name', 'status', 'created_at'],
  sites: ['id', 'organization_id', 'name', 'region', 'timezone', 'gateway_status'],
  devices: ['id', 'site_id', 'name', 'plc_model', 'protocol', 'status', 'last_seen_at'],
  telemetry_points: ['id', 'device_id', 'key', 'label', 'unit', 'latest_value', 'latest_timestamp'],
  alerts: ['id', 'site_id', 'device_id', 'severity', 'status', 'message', 'started_at'],
  audit_logs: ['id', 'actor_user_id', 'entity_type', 'entity_id', 'action', 'metadata', 'created_at']
} as const;

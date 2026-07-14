require('dotenv').config({ path: '.env.local', quiet: true });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const users = [
  {
    id: 'user-jose',
    name: 'Jose Perez',
    email: 'jose@perma.cool',
    role: 'owner',
    organizationIds: ['org-permacool']
  },
  {
    id: 'user-ops-1',
    name: 'Maya Chen',
    email: 'maya@perma.cool',
    role: 'operator',
    organizationIds: ['org-permacool']
  }
];

const organizations = [
  {
    id: 'org-permacool',
    name: 'PermaCool Operations',
    status: 'active'
  }
];

const sites = [
  {
    id: 'site-salinas',
    organizationId: 'org-permacool',
    name: 'Salinas Extraction Campus',
    region: 'California, US',
    timezone: 'America/Los_Angeles',
    gatewayStatus: 'online'
  },
  {
    id: 'site-okc',
    organizationId: 'org-permacool',
    name: 'Oklahoma City Process Plant',
    region: 'Oklahoma, US',
    timezone: 'America/Chicago',
    gatewayStatus: 'degraded'
  }
];

const devices = [
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

const telemetryPoints = [
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

const alerts = [
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

const auditLog = [
  {
    id: 'audit-1',
    actorUserId: 'user-jose',
    action: 'Created site record',
    entityType: 'site',
    entityId: 'Salinas Extraction Campus',
    createdAt: '2026-04-25T18:12:00Z'
  },
  {
    id: 'audit-2',
    actorUserId: 'user-ops-1',
    action: 'Updated operator role assignment',
    entityType: 'user',
    entityId: 'Maya Chen',
    createdAt: '2026-04-25T18:36:00Z'
  }
];

async function main() {
  for (const organization of organizations) {
    await prisma.organization.upsert({
      where: { id: organization.id },
      update: organization,
      create: organization
    });
  }

  for (const user of users) {
    const { organizationIds, ...userData } = user;
    await prisma.user.upsert({
      where: { id: user.id },
      update: userData,
      create: userData
    });

    for (const organizationId of organizationIds) {
      await prisma.userOrganization.upsert({
        where: { userId_organizationId: { userId: user.id, organizationId } },
        update: {},
        create: { userId: user.id, organizationId }
      });
    }
  }

  for (const site of sites) {
    await prisma.site.upsert({
      where: { id: site.id },
      update: site,
      create: site
    });
  }

  for (const device of devices) {
    const data = {
      ...device,
      lastSeenAt: device.lastSeenAt ? new Date(device.lastSeenAt) : null
    };

    await prisma.device.upsert({
      where: { id: device.id },
      update: data,
      create: data
    });
  }

  for (const point of telemetryPoints) {
    const data = {
      ...point,
      latestTimestamp: new Date(point.latestTimestamp)
    };

    await prisma.telemetryPoint.upsert({
      where: { deviceId_key: { deviceId: point.deviceId, key: point.key } },
      update: data,
      create: data
    });
  }

  for (const alert of alerts) {
    const data = {
      ...alert,
      startedAt: new Date(alert.startedAt)
    };

    await prisma.alert.upsert({
      where: { id: alert.id },
      update: data,
      create: data
    });
  }

  for (const entry of auditLog) {
    const data = {
      ...entry,
      createdAt: new Date(entry.createdAt)
    };

    await prisma.auditLog.upsert({
      where: { id: entry.id },
      update: data,
      create: data
    });
  }

  console.log('Seeded PermaCool Ops mock entities into Prisma.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

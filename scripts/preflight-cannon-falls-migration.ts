import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const [siteConflict, deviceConflict, vpnConflict] = await Promise.all([
    db.site.findFirst({
      where: { id: 'site-cannon-falls', NOT: { organizationId: 'org-permacool' } },
      select: { id: true, organizationId: true }
    }),
    db.device.findFirst({
      where: { id: 'epic-cannon-falls-01', NOT: { siteId: 'site-cannon-falls' } },
      select: { id: true, siteId: true }
    }),
    db.vpnEnrollment.findFirst({
      where: {
        OR: [
          { id: 'vpn-enrollment-epic-cannon-falls-01' },
          { identity: 'cannon-falls-groov-epic-01' },
          { tunnelIp: '172.28.0.11' }
        ],
        NOT: { deviceId: 'epic-cannon-falls-01' }
      },
      select: { id: true, deviceId: true, identity: true, tunnelIp: true }
    })
  ]);

  const conflicts = [
    siteConflict ? `site ID is owned by ${siteConflict.organizationId}` : null,
    deviceConflict ? `device ID is assigned to ${deviceConflict.siteId}` : null,
    vpnConflict ? `VPN identity or 172.28.0.11 is assigned to ${vpnConflict.deviceId}` : null
  ].filter(Boolean);

  if (conflicts.length) {
    throw new Error(`Cannon Falls migration is blocked: ${conflicts.join('; ')}`);
  }
  console.log('Cannon Falls migration preflight passed: no cross-organization, device, identity, or tunnel-IP conflicts.');
}

main()
  .finally(() => db.$disconnect())
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });

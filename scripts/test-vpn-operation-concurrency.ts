// @ts-nocheck
{
const assert = require('node:assert/strict');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');
const {
  claimExternalVpnProfile,
  claimVpnProfileGeneration,
  completeVpnProfileGeneration,
  VpnOperationStateConflict
} = require(path.join(__dirname, '..', 'server', 'vpn-operation-state.ts'));

async function main() {
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must point to the dedicated staging database for this integration test.');
}

const db = new PrismaClient();
const competingDb = new PrismaClient();
const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const organizationId = `test-vpn-concurrency-${suffix}`;

async function snapshot() {
  return {
    counts: {
      organizations: await db.organization.count(),
      sites: await db.site.count(),
      devices: await db.device.count(),
      vpnEnrollments: await db.vpnEnrollment.count(),
      telemetryPoints: await db.telemetryPoint.count(),
      telemetrySamples: await db.telemetrySample.count(),
      alerts: await db.alert.count(),
      events: await db.equipmentEvent.count(),
      equipmentConfigurations: await db.siteEquipmentConfiguration.count(),
      auditLogs: await db.auditLog.count()
    },
    equipment: await db.siteEquipmentConfiguration.findMany({
      select: { siteId: true, updatedAt: true },
      orderBy: { siteId: 'asc' }
    })
  };
}

async function createDevice(siteId, label) {
  const deviceId = `test-device-${label}-${suffix}`;
  const identity = `test-identity-${label}-${suffix}`;
  await db.device.create({
    data: {
      id: deviceId,
      siteId,
      name: `Test ${label}`,
      plcModel: 'Opto 22 groov EPIC PR1',
      protocol: 'Test only',
      status: 'offline',
      vpnEnrollment: {
        create: { identity, profileStatus: 'not_generated' }
      }
    }
  });
  return { deviceId, identity };
}

async function expectConflict(promise) {
  await assert.rejects(promise, (error) => error instanceof VpnOperationStateConflict);
}

const before = await snapshot();
let testError;

try {
  const siteId = `test-site-${suffix}`;
  await db.organization.create({
    data: {
      id: organizationId,
      name: 'VPN concurrency test',
      status: 'trial',
      sites: {
        create: {
          id: siteId,
          name: 'VPN concurrency test site',
          region: 'Test',
          timezone: 'America/Los_Angeles',
          gatewayStatus: 'offline'
        }
      }
    }
  });

  const concurrent = await createDevice(siteId, 'concurrent');
  const concurrentExternalIdentity = `test-external-concurrent-${suffix}`;
  const concurrentResults = await Promise.allSettled([
    db.$transaction((transaction) => claimVpnProfileGeneration(transaction, concurrent.deviceId)),
    competingDb.$transaction((transaction) =>
      claimExternalVpnProfile(transaction, concurrent.deviceId, concurrentExternalIdentity, new Date())
    )
  ]);
  assert.equal(concurrentResults.filter(({ status }) => status === 'fulfilled').length, 1);
  assert.equal(concurrentResults.filter(({ status }) => status === 'rejected').length, 1);
  const concurrentEnrollment = await db.vpnEnrollment.findUniqueOrThrow({
    where: { deviceId: concurrent.deviceId }
  });
  assert.ok(['issuing', 'external'].includes(concurrentEnrollment.profileStatus));

  const generationFirst = await createDevice(siteId, 'generation-first');
  await db.$transaction((transaction) => claimVpnProfileGeneration(transaction, generationFirst.deviceId));
  await expectConflict(
    db.$transaction((transaction) =>
      claimExternalVpnProfile(
        transaction,
        generationFirst.deviceId,
        `test-external-generation-first-${suffix}`,
        new Date()
      )
    )
  );
  await expectConflict(
    db.$transaction((transaction) => claimVpnProfileGeneration(transaction, generationFirst.deviceId))
  );
  assert.equal(
    (await db.vpnEnrollment.findUniqueOrThrow({ where: { deviceId: generationFirst.deviceId } })).profileStatus,
    'issuing'
  );

  const externalFirst = await createDevice(siteId, 'external-first');
  const externalIdentity = `test-external-first-${suffix}`;
  const firstRegistration = await db.$transaction((transaction) =>
    claimExternalVpnProfile(transaction, externalFirst.deviceId, externalIdentity, new Date())
  );
  assert.equal(firstRegistration.changed, true);
  const idempotentRegistration = await db.$transaction((transaction) =>
    claimExternalVpnProfile(transaction, externalFirst.deviceId, externalIdentity, new Date())
  );
  assert.equal(idempotentRegistration.changed, false);
  await expectConflict(
    db.$transaction((transaction) => claimVpnProfileGeneration(transaction, externalFirst.deviceId))
  );

  const duplicate = await createDevice(siteId, 'duplicate');
  await expectConflict(
    db.$transaction((transaction) =>
      claimExternalVpnProfile(transaction, duplicate.deviceId, externalIdentity, new Date())
    )
  );
  const duplicateEnrollment = await db.vpnEnrollment.findUniqueOrThrow({ where: { deviceId: duplicate.deviceId } });
  assert.equal(duplicateEnrollment.identity, duplicate.identity);
  assert.equal(duplicateEnrollment.profileStatus, 'not_generated');

  const rollback = await createDevice(siteId, 'rollback');
  const rollbackIdentity = `test-external-rollback-${suffix}`;
  await assert.rejects(
    db.$transaction(async (transaction) => {
      await claimExternalVpnProfile(transaction, rollback.deviceId, rollbackIdentity, new Date());
      throw new Error('Force rollback after a successful claim.');
    }),
    /Force rollback/
  );
  const rollbackEnrollment = await db.vpnEnrollment.findUniqueOrThrow({ where: { deviceId: rollback.deviceId } });
  assert.equal(rollbackEnrollment.identity, rollback.identity);
  assert.equal(rollbackEnrollment.profileStatus, 'not_generated');

  const completion = await createDevice(siteId, 'completion');
  await db.$transaction((transaction) => claimVpnProfileGeneration(transaction, completion.deviceId));
  await db.$transaction((transaction) =>
    completeVpnProfileGeneration(transaction, completion.deviceId, 'staging.invalid', new Date())
  );
  assert.equal(
    (await db.vpnEnrollment.findUniqueOrThrow({ where: { deviceId: completion.deviceId } })).profileStatus,
    'issued'
  );
} catch (error) {
  testError = error;
} finally {
  await db.organization.deleteMany({ where: { id: organizationId } });
  await Promise.allSettled([db.$disconnect(), competingDb.$disconnect()]);
}

const verificationDb = new PrismaClient();
const after = {
  counts: {
    organizations: await verificationDb.organization.count(),
    sites: await verificationDb.site.count(),
    devices: await verificationDb.device.count(),
    vpnEnrollments: await verificationDb.vpnEnrollment.count(),
    telemetryPoints: await verificationDb.telemetryPoint.count(),
    telemetrySamples: await verificationDb.telemetrySample.count(),
    alerts: await verificationDb.alert.count(),
    events: await verificationDb.equipmentEvent.count(),
    equipmentConfigurations: await verificationDb.siteEquipmentConfiguration.count(),
    auditLogs: await verificationDb.auditLog.count()
  },
  equipment: await verificationDb.siteEquipmentConfiguration.findMany({
    select: { siteId: true, updatedAt: true },
    orderBy: { siteId: 'asc' }
  })
};
await verificationDb.$disconnect();

assert.deepEqual(after, before, 'The staging database must return exactly to its pre-test state.');
if (testError) throw testError;

console.log('Database-backed VPN concurrency, idempotency, duplicate identity, rollback, and fail-closed tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
}

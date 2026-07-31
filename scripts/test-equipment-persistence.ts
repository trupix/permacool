// @ts-nocheck
{
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  equipmentDraftFingerprint,
  persistEquipmentConfiguration,
  resolveInitialEquipmentDraft
} = require(path.join(__dirname, '..', 'lib', 'equipment', 'configuration-persistence.ts'));
const { canManageSiteEquipment } = require(
  path.join(__dirname, '..', 'lib', 'workspace-access.ts')
);

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

function user(role, organizationId = 'org-permacool') {
  return {
    id: `${role}-user`,
    name: `${role} user`,
    email: `${role}@example.com`,
    role,
    platformRole: 'customer',
    status: 'approved',
    organizationIds: [organizationId],
    organizationRoles: { [organizationId]: role },
    allDeviceOrganizationIds: [organizationId],
    deviceIds: []
  };
}

async function run() {
  const defaultDraft = { arrangement: 'single', refrigerant: 'R404A' };
  const existingDraft = { arrangement: 'parallel', refrigerant: 'R404A' };
  let writeCount = 0;
  let persistedConfiguration = null;

  const loaded = resolveInitialEquipmentDraft({
    initialConfiguration: { kind: 'location', draft: existingDraft },
    kind: 'location',
    defaultValue: defaultDraft,
    normalize: (value) => ({ ...value })
  });

  assert.deepEqual(loaded, existingDraft, 'An existing saved configuration must load unchanged.');
  assert.equal(writeCount, 0, 'Rendering or loading a page must make zero equipment writes.');
  assert.equal(
    equipmentDraftFingerprint(loaded),
    equipmentDraftFingerprint({ ...existingDraft }),
    'Equivalent drafts must not be treated as meaningful edits.'
  );

  const editedDraft = { ...loaded, refrigerant: 'R448A' };
  assert.notEqual(
    equipmentDraftFingerprint(editedDraft),
    equipmentDraftFingerprint(loaded),
    'A user edit must be distinguishable from the saved configuration.'
  );
  assert.equal(writeCount, 0, 'Editing a draft without selecting Save must make zero equipment writes.');

  await persistEquipmentConfiguration({
    siteId: 'site/cannon-falls',
    kind: 'location',
    draft: editedDraft,
    fetcher: async (url, options) => {
      writeCount += 1;
      assert.equal(url, '/api/sites/site%2Fcannon-falls/equipment');
      assert.equal(options.method, 'PATCH');
      persistedConfiguration = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({ savedAt: '2026-07-31T12:00:00.000Z' })
      };
    }
  });

  assert.equal(writeCount, 1, 'An explicit Save action must issue exactly one equipment write.');
  assert.deepEqual(persistedConfiguration, { kind: 'location', draft: editedDraft });

  const reloaded = resolveInitialEquipmentDraft({
    initialConfiguration: persistedConfiguration,
    kind: 'location',
    defaultValue: defaultDraft,
    normalize: (value) => ({ ...value })
  });
  assert.deepEqual(reloaded, editedDraft, 'Explicitly saved equipment changes must reload correctly.');

  const hook = read('components/use-site-equipment-configuration.ts');
  const loadEffects = hook.slice(hook.indexOf('useEffect(() =>'), hook.indexOf('const setDraft:'));
  assert.doesNotMatch(loadEffects, /persistEquipmentConfiguration|method:\s*'PATCH'|fetch\s*\(/);
  assert.doesNotMatch(hook, /setTimeout\s*\(/);
  assert.match(hook, /const save = useCallback\(async \(\) =>/);
  assert.match(hook, /fingerprint === persistedFingerprintRef\.current/);

  for (const componentPath of [
    'components/location-equipment-workspace.tsx',
    'components/site-equipment-dashboard.tsx'
  ]) {
    const component = read(componentPath);
    assert.match(component, /Save equipment changes/);
    assert.match(component, /disabled=\{!hasUnsaved/);
  }

  const route = read('app/api/sites/[siteid]/equipment/route.ts');
  assert.match(route, /getSite\(user, siteid\)/);
  assert.match(route, /canManageSiteEquipment\(user, site\.organizationId\)/);

  assert.equal(canManageSiteEquipment(user('owner'), 'org-permacool'), true);
  assert.equal(canManageSiteEquipment(user('operator'), 'org-permacool'), true);
  assert.equal(canManageSiteEquipment(user('viewer'), 'org-permacool'), false);
  assert.equal(canManageSiteEquipment(user('owner', 'org-other'), 'org-permacool'), false);

  console.log('Equipment persistence checks passed: page loads and unsaved edits make zero writes; explicit scoped saves persist and reload for Owner/Operator while Viewer stays read-only.');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
}

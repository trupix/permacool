import assert from 'node:assert/strict';
// @ts-ignore Node's native TypeScript runner requires the extension.
import { isLabPortalCustomer, portalNextPath } from '../lib/auth-forms.ts';
const lab = {status:'approved',platformRole:'customer',organizationIds:['org-lab']};
const regular = {...lab,organizationIds:['org-other']};
assert.equal(isLabPortalCustomer(lab,'org-lab'),true);
for (const requested of [undefined,'/dashboard','/sites/site-a','/devices/device-a?tab=details','https://evil.example','//evil.example']) {
  assert.equal(portalNextPath(lab,'org-lab',requested),'/lab');
}
assert.equal(portalNextPath(lab,'org-lab','/lab?view=photos'),'/lab?view=photos');
assert.equal(portalNextPath(lab,'org-lab','/set-password?token=example'),'/set-password?token=example');
assert.equal(portalNextPath(regular,'org-lab',undefined),'/dashboard');
assert.equal(portalNextPath(regular,'org-lab','/devices/device-a?tab=details'),'/devices/device-a?tab=details');
assert.equal(portalNextPath({...lab,platformRole:'staff_admin'},'org-lab','/dashboard'),'/dashboard');
assert.equal(portalNextPath({...lab,platformRole:'staff_support'},'org-lab','/lab'),'/lab');
assert.equal(isLabPortalCustomer({...lab,status:'pending'},'org-lab'),false);
assert.equal(isLabPortalCustomer({...lab,status:'suspended'},'org-lab'),false);
assert.equal(isLabPortalCustomer(lab,''),false);
assert.equal(portalNextPath(regular,'org-lab','/\\evil.example'),'/dashboard');
console.log('Lab customer login routing, recovery, staff access and regular-customer destinations passed.');

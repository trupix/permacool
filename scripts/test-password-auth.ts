// @ts-nocheck
{
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  MIN_PASSWORD_LENGTH,
  isEligiblePortalUser,
  newPasswordError,
  safeNextPath
} = require(path.join(__dirname, '..', 'lib', 'auth-forms.ts'));

assert.equal(safeNextPath('/dashboard'), '/dashboard');
assert.equal(safeNextPath('/sites/site-salinas?tab=live'), '/sites/site-salinas?tab=live');
assert.equal(safeNextPath('https://evil.example'), '/dashboard');
assert.equal(safeNextPath('//evil.example'), '/dashboard');
assert.equal(safeNextPath('/\\evil.example'), '/dashboard');

assert.equal(isEligiblePortalUser({ status: 'approved', platformRole: 'customer', membershipCount: 1 }), true);
assert.equal(isEligiblePortalUser({ status: 'approved', platformRole: 'customer', membershipCount: 0 }), false);
assert.equal(isEligiblePortalUser({ status: 'pending', platformRole: 'customer', membershipCount: 1 }), false);
assert.equal(isEligiblePortalUser({ status: 'approved', platformRole: 'staff_support', membershipCount: 0 }), true);
assert.equal(isEligiblePortalUser({ status: 'approved', platformRole: 'staff_admin', membershipCount: 0 }), true);

assert.equal(newPasswordError('short', 'short'), 'password-too-short');
assert.equal(newPasswordError('a'.repeat(MIN_PASSWORD_LENGTH), 'b'.repeat(MIN_PASSWORD_LENGTH)), 'password-mismatch');
assert.equal(newPasswordError('a'.repeat(MIN_PASSWORD_LENGTH), 'a'.repeat(MIN_PASSWORD_LENGTH)), undefined);

const actions = fs.readFileSync(path.join(__dirname, '..', 'app', 'sign-in', 'actions.ts'), 'utf8');
const callback = fs.readFileSync(path.join(__dirname, '..', 'app', 'auth', 'callback', 'route.ts'), 'utf8');
const passwordActions = fs.readFileSync(path.join(__dirname, '..', 'app', 'set-password', 'actions.ts'), 'utf8');

assert.match(actions, /signInWithPassword\(\{ email, password \}\)/);
assert.match(actions, /approvedPortalUser\(email\)/);
assert.match(actions, /resetPasswordForEmail/);
assert.doesNotMatch(actions, /password-email-error/);
assert.match(callback, /safeNextPath/);
assert.match(passwordActions, /supabase\.auth\.getUser\(\)/);
assert.match(passwordActions, /isEligiblePortalUser/);
assert.match(passwordActions, /supabase\.auth\.updateUser\(\{ password \}\)/);
assert.doesNotMatch(actions, /console\.(log|error).*password/i);

console.log('Password authentication tests passed for eligibility, redirect safety, login, and password setup.');
}

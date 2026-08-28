// @ts-nocheck
const assert = require('node:assert/strict');
const path = require('node:path');
const { formatSiteActivity, latestSiteActivity } = require(
  path.join(__dirname, '..', 'lib', 'site-activity.ts')
);

assert.equal(
  latestSiteActivity(['2026-08-28T12:00:00Z', 'Never', null, '2026-08-28T13:15:00Z']),
  '2026-08-28T13:15:00.000Z'
);
assert.equal(latestSiteActivity(['Never', null, undefined]), null);
assert.match(formatSiteActivity('2026-08-28T13:15:00Z', 'America/Chicago'), /Aug 28, 2026/);
assert.equal(formatSiteActivity(null, 'America/Chicago'), 'Never');

console.log('Site last-active time selects the newest valid gateway/device timestamp and safely handles never-seen locations.');

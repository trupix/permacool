import assert from 'node:assert/strict';
import {
  buildContactHref,
  buildContactSubmissionAction,
  contactIntentCopy,
  escapeContactHtml,
  isValidContactEmail,
  normalizeContactPayload
} from '../lib/contact.js';

const butaneHref = buildContactHref({
  interest: 'Butane Recovery Systems',
  requestType: 'System Fit Review',
  product: 'Butane Recovery System',
  source: 'butane-recovery-system'
});

assert.equal(
  butaneHref,
  '/contact-us?interest=Butane+Recovery+Systems&request_type=System+Fit+Review&product=Butane+Recovery+System&source=butane-recovery-system'
);

assert.equal(buildContactHref({ interest: 'Untrusted value' }), '/contact-us');
assert.equal(
  buildContactSubmissionAction({
    requestType: 'System Fit Review',
    product: 'Butane Recovery System',
    source: 'butane-recovery-system'
  }),
  '/api/contact?request_type=System+Fit+Review&product=Butane+Recovery+System&source=butane-recovery-system'
);

const formData = new FormData();
formData.set('name', '  David\nSchaefer  ');
formData.set('email', '  DAVID@PERMA.COOL  ');
formData.set('interest', 'Butane Recovery Systems');
formData.set('request_type', 'System Fit Review');
formData.set('product', 'Butane Recovery System');
formData.set('source', 'butane-recovery-system');
formData.set('message', '<strong>Need a system</strong>');

const payload = normalizeContactPayload(formData);
assert.equal(payload.name, 'David Schaefer');
assert.equal(payload.email, 'david@perma.cool');
assert.equal(payload.interest, 'Butane Recovery Systems');
assert.equal(payload.request_type, 'System Fit Review');
assert.equal(payload.product, 'Butane Recovery System');
assert.equal(payload.source, 'butane-recovery-system');

assert.equal(isValidContactEmail('sales@perma.cool'), true);
assert.equal(isValidContactEmail('not-an-email'), false);
assert.equal(escapeContactHtml('<strong>Need a system</strong>'), '&lt;strong&gt;Need a system&lt;/strong&gt;');
assert.equal(contactIntentCopy({ requestType: 'Cost Comparison' }).buttonLabel, 'Request My Cost Comparison');

console.log('Contact funnel context and submission-safety checks passed.');

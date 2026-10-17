import assert from 'node:assert/strict';
// @ts-ignore Node's native TypeScript runner requires the extension.
import { parseNameplate, validPhotoId } from '../lib/lab-nameplate.ts';
assert.deepEqual(parseNameplate('THERMO\nMODEL: ULT5030A24\nSERIAL NO. 001234567\nVOLTS 115'),{model:'ULT5030A24',serial:'001234567'});
assert.deepEqual(parseNameplate('MODEL NUMBER: MR45PA-GAEE-TS\nS/N: R10S-128457-RS'),{model:'MR45PA-GAEE-TS',serial:'R10S-128457-RS'});
assert.deepEqual(parseNameplate('VOLTS 115\n60 HZ\n123456'),{model:'',serial:''});
assert.deepEqual(parseNameplate('MODEL:\nSERIAL: 001234567'),{model:'',serial:'001234567'});
assert.equal(validPhotoId('../catalog.json'),false);
assert.equal(validPhotoId('765e4459-1234-4e14-aede-f453640aba34'),true);
console.log('Nameplate label extraction preserves punctuation and leading zeros; unlabelled values and unsafe IDs rejected.');

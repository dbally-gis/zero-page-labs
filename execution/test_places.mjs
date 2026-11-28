import test from 'node:test';
import assert from 'node:assert/strict';
import { CASES, caseFromHash } from '../experiments/places-that-werent/places.mjs';

test('each shareable place resolves to its own case', () => {
  for (const key of CASES) assert.equal(caseFromHash(`#${key}`), key);
});
test('ordinary document anchors do not masquerade as place identities', () => {
  for (const hash of ['', '#atlas', '#not-a-place', '#kong-extra']) assert.equal(caseFromHash(hash), null);
});

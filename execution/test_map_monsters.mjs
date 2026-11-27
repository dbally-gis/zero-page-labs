import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../experiments/map-monsters/state.mjs';

test('fresh and ordinary section links open sources', () => {
  for (const hash of ['', '#plate', '#date-notes', '#unknown'])
    assert.deepEqual(parse(hash), { plate: 'viii', view: 'sources' });
});
test('legacy illustrated links retain their meaning', () => {
  for (const plate of ['viii', 'ix', 'x'])
    assert.deepEqual(parse(`#${plate}`), { plate, view: 'illustrated' });
  assert.deepEqual(parse('#illustrated'), { plate: 'viii', view: 'illustrated' });
});
test('six explicit views roundtrip through URLs', () => {
  for (const plate of ['viii', 'ix', 'x'])
    for (const view of ['sources', 'illustrated'])
      assert.deepEqual(parse(`#${plate}-${view}`), { plate, view });
});

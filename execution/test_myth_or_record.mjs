import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = new URL('../experiments/myth-or-record/', import.meta.url);
const { floors } = JSON.parse(readFileSync(new URL('floors.json', dir), 'utf8'));
const html = readFileSync(new URL('index.html', dir), 'utf8');
const isWiki = (u) => /(^|\.)wikipedia\.org\//.test(new URL(u).hostname + '/');

test('there are exactly 28 floors, numbered in order', () => {
  assert.equal(floors.length, 28);
  floors.forEach((f, i) => assert.equal(f.floor, i + 1));
});

test('floor ids are unique and safe for file names', () => {
  assert.equal(new Set(floors.map((f) => f.id)).size, floors.length);
  for (const f of floors) assert.match(f.id, /^[a-z0-9-]+$/);
});

test('every floor but the last runs in date order', () => {
  for (let i = 1; i < floors.length - 1; i++) assert.ok(floors[i].sortYear >= floors[i - 1].sortYear, `${floors[i].id} before ${floors[i - 1].id}`);
});

test('every floor dates from 1200 to 1800', () => {
  for (const f of floors) assert.ok(f.sortYear >= 1200 && f.sortYear <= 1800, f.id);
});

test('every floor names a place, dates and a title', () => {
  for (const f of floors) for (const k of ['site', 'place', 'years', 'title']) assert.ok(String(f[k] || '').trim().length > 1, `${f.id}.${k}`);
});

test('every floor has one claim and a myth or record verdict', () => {
  for (const f of floors) {
    assert.ok(f.claim.length > 20 && f.claim.length < 260, f.id);
    assert.ok(['myth', 'record'].includes(f.verdict), f.id);
  }
});

test('every floor explains its verdict', () => {
  for (const f of floors) assert.ok(f.explanation.split(/\s+/).length >= 50, `${f.id}: explanation too short`);
});

test('every floor cites at least two sources with working-looking URLs', () => {
  for (const f of floors) {
    assert.ok(f.sources.length >= 2, f.id);
    for (const s of f.sources) {
      assert.ok(s.title && s.supports, `${f.id}: source needs title and supports`);
      assert.match(s.url, /^https?:\/\//, f.id);
    }
  }
});

test('every floor cites at least one source that is not Wikipedia', () => {
  for (const f of floors) assert.ok(f.sources.some((s) => !isWiki(s.url)), f.id);
});

test('myths and records are each at least a third of the floors', () => {
  const myths = floors.filter((f) => f.verdict === 'myth').length;
  assert.ok(myths >= floors.length / 3 && myths <= (floors.length * 2) / 3, `myths ${myths}`);
});

test('every floor has its illustration on disk', () => {
  for (const f of floors) assert.ok(existsSync(fileURLToPath(new URL(`art/${f.id}.webp`, dir))), f.id);
});

test('the page says the tower is a composite and the pictures are not likenesses', () => {
  assert.match(html, /composite/);
  assert.match(html, /not likenesses/);
});

test('the page links its stylesheet, script and canonical URL', () => {
  assert.match(html, /href="myth\.css"/);
  assert.match(html, /src="myth\.mjs"/);
  assert.match(html, /rel="canonical" href="https:\/\/zeropagelabs\.com\/experiments\/myth-or-record\/"/);
});

test('every floor has a one-sentence answer shown under the verdict', () => {
  for (const f of floors) {
    assert.ok(f.answer && f.answer.length > 20 && f.answer.length < 200, f.id);
    assert.ok(!/^(Real|Not real|Myth|Record)\b/.test(f.answer), `${f.id}: answer should not repeat the verdict`);
  }
});

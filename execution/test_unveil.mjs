import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  START_SCORE, FLIP_COST, WRONG_COST, BOARD, dayNumber, dailySite, practiceSite, options, score, hexGrid, hexPoints, formatCoords, shareText,
} from '../experiments/unveil/rules.mjs';

const dir = new URL('../experiments/unveil/', import.meta.url);
const sites = JSON.parse(readFileSync(new URL('sites.json', dir), 'utf8'));
const html = readFileSync(new URL('index.html', dir), 'utf8');

test('every site has an image on disk', () => {
  for (const s of sites) assert.ok(existsSync(fileURLToPath(new URL(`img/${s.id}.webp`, dir))), s.id);
});

test('site ids are unique', () => {
  assert.equal(new Set(sites.map((s) => s.id)).size, sites.length);
});

test('every site has one answer and three different decoys', () => {
  for (const s of sites) {
    assert.equal(s.decoys.length, 3, s.id);
    assert.equal(new Set([s.answer, ...s.decoys]).size, 4, s.id);
  }
});

test('every site has an https link, coordinates and an explanation', () => {
  for (const s of sites) {
    assert.match(s.link, /^https:\/\//, s.id);
    assert.ok(Math.abs(s.lat) <= 90 && Math.abs(s.lon) <= 180, s.id);
    assert.ok(s.why.length > 60, s.id);
  }
});

test('the daily site is the same for the same date', () => {
  assert.equal(dailySite(sites, new Date(2026, 11, 3, 8)).id, dailySite(sites, new Date(2026, 11, 3, 23)).id);
});

test('consecutive days cover every site once per lap', () => {
  const lap = Array.from({ length: sites.length }, (_, i) => dailySite(sites, new Date(2026, 10, 26 + i)).id);
  assert.equal(new Set(lap).size, sites.length);
});

test('day numbers start at 0 on launch day', () => {
  assert.equal(dayNumber(new Date(2026, 10, 26, 12)), 0);
  assert.equal(dayNumber(new Date(2026, 10, 27, 0, 5)), 1);
});

test('practice never serves the excluded site', () => {
  for (let i = 0; i < 200; i++) assert.notEqual(practiceSite(sites, 'richat').id, 'richat');
});

test('options hold the answer and decoys, stable for a salt', () => {
  const s = sites[0];
  assert.deepEqual(options(s, 'x'), options(s, 'x'));
  assert.deepEqual([...options(s, 'x')].sort(), [s.answer, ...s.decoys].sort());
});

test('the first flip is free', () => {
  assert.equal(score(0, 0), START_SCORE);
  assert.equal(score(1, 0), START_SCORE);
});

test('each later flip costs points', () => {
  assert.equal(score(2, 0), START_SCORE - FLIP_COST);
  assert.equal(score(6, 0), START_SCORE - 5 * FLIP_COST);
});

test('a wrong guess costs points', () => {
  assert.equal(score(1, 1), START_SCORE - WRONG_COST);
});

test('the score never goes below zero', () => {
  assert.equal(score(80, 3), 0);
});

test('the hex grid covers the whole board', () => {
  const cells = hexGrid();
  assert.ok(cells.length > 50 && cells.length < 100, `${cells.length} cells`);
  // Sample points across the board; each must fall inside some hex (distance to a centre <= inner radius-ish)
  for (let x = 0; x <= BOARD; x += 16) for (let y = 0; y <= BOARD; y += 16) {
    const near = Math.min(...cells.map((c) => Math.hypot(c.cx - x, c.cy - y)));
    assert.ok(near <= 80.5, `gap at ${x},${y}`);
  }
});

test('hex points form a hexagon', () => {
  assert.equal(hexPoints(0, 0, 10).split(' ').length, 6);
});

test('coordinates format with hemispheres', () => {
  assert.equal(formatCoords(-20.2, -67.55), '20.20° S, 67.55° W');
});

test('the share text never names the answer', () => {
  const t = shareText({ day: 0, flips: 5, total: 72, wrong: 1, points: 64 });
  for (const s of sites) for (const word of [s.answer, s.name]) assert.ok(!t.includes(word));
  assert.match(t, /UNVEIL #1/);
});

test('the page credits Copernicus Sentinel data and is indexable', () => {
  assert.match(html, /Contains modified Copernicus Sentinel data/);
  assert.ok(!html.includes('noindex'));
});

test('the page is registered in data/experiments.json', () => {
  const data = JSON.parse(readFileSync(new URL('../data/experiments.json', import.meta.url), 'utf8'));
  assert.ok(data.experiments.some((e) => e.slug === 'unveil'));
});

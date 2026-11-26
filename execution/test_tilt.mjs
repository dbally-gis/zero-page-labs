import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  sources, challengers, COURSES, ZONES, zoneAt, strike, record, newRider, verdict, chequeMarks, opponentAim, gallopBob,
} from '../experiments/westminster-tilt/rules.mjs';

const never = () => 0.99; // rng that never triggers the unhorsing roll
const always = () => 0;
const centre = (id) => ZONES.find((z) => z.id === id).centre;

test('all four 1511 challengers are selectable', () => {
  assert.deepEqual(challengers.map((c) => c.motto), ['Cueur Loyal', 'Vaillant Desir', 'Bon Vouloir', 'Joyeulx Penser']);
  assert.deepEqual(challengers.map((c) => c.name), ['Henry VIII', 'Sir Thomas Knyvet', 'Sir William Courtenay', 'Sir Edward Neville']);
});

test('a bout is three courses', () => assert.equal(COURSES, 3));

test('zones cover every height without gaps', () => {
  for (let y = -50; y < 320; y += 0.5) assert.ok(zoneAt(y), `no zone at ${y}`);
  assert.equal(zoneAt(10).id, 'miss');
  assert.equal(zoneAt(60).id, 'helm');
  assert.equal(zoneAt(130).id, 'body');
  assert.equal(zoneAt(185).id, 'saddle');
  assert.equal(zoneAt(230).id, 'tilt');
});

test('a spear broken on the body scores 1', () => assert.equal(strike(centre('body'), never).points, 1));
test('a spear broken on the helm scores 2', () => assert.equal(strike(centre('helm'), never).points, 2));
test('unhorsing scores 3', () => {
  const r = strike(centre('helm'), always);
  assert.equal(r.unhorsed, true);
  assert.equal(r.points, 3);
});
test('a glancing helm hit is an attaint without a broken spear', () => {
  const r = strike(centre('helm') + 25, never);
  assert.equal(r.attaint, 'head');
  assert.equal(r.broken, false);
  assert.equal(r.points, 0);
});
test('a spear broken on the saddle subtracts 1', () => assert.equal(strike(185, never).points, -1));

test('tilt strikes cost 2, then 3, and three forfeit the prize', () => {
  const you = newRider(), them = newRider();
  record(you, strike(230)); assert.equal(you.score, -2);
  record(you, strike(230)); assert.equal(you.score, -5);
  record(you, strike(230));
  for (let i = 0; i < 3; i++) record(them, strike(5));
  assert.equal(verdict(you, them).winner, 'them');
  assert.match(verdict(you, them).reason, /tilt/);
});

test('unhorsing outranks three helm strikes', () => {
  const you = newRider(), them = newRider();
  record(you, strike(centre('helm'), always));
  for (let i = 0; i < 3; i++) record(them, strike(centre('helm'), never));
  assert.ok(them.score > you.score, 'premise: the helm striker has more points');
  assert.equal(verdict(you, them).winner, 'you');
});

test('three helm strikes outrank more spears', () => {
  const you = newRider(), them = newRider();
  for (let i = 0; i < 3; i++) record(you, strike(centre('helm') + 25, never)); // 3 unbroken attaints, 0 points
  for (let i = 0; i < 3; i++) record(them, strike(centre('body'), never)); // 3 points
  assert.equal(verdict(you, them).winner, 'you');
});

test('otherwise most spears wins, and a level bout is undecided', () => {
  const a = newRider(), b = newRider();
  record(a, strike(centre('body'), never)); record(b, strike(5));
  assert.equal(verdict(a, b).winner, 'you');
  assert.equal(verdict(newRider(), newRider()).winner, null);
});

test('cheque marks follow the 1520 layout', () => {
  const r = newRider();
  record(r, strike(centre('helm'), never)); // head attaint + broken
  record(r, strike(centre('body'), never)); // body attaint + broken
  record(r, strike(230)); // tilt fault
  assert.deepEqual(chequeMarks(r), { aboveTop: 1, belowTop: 1, middle: 2, bottom: 1 });
});

test('a saddle break is a fault, not a counted lance', () => {
  const r = newRider();
  record(r, strike(185, never));
  assert.deepEqual(chequeMarks(r), { aboveTop: 0, belowTop: 0, middle: 0, bottom: 1 });
});

test('opponents land mostly in their chosen zone', () => {
  let s = 1;
  const rng = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (const c of challengers) {
    let hits = 0;
    for (let i = 0; i < 2000; i++) if (zoneAt(opponentAim(c, rng)).id === c.aim) hits++;
    assert.ok(hits / 2000 > 0.45 && hits / 2000 < 0.95, `${c.motto}: ${hits / 2000}`);
  }
});

test('the gallop bob stays within a lance-steadying range', () => {
  for (let t = 0; t < 5; t += 0.01) assert.ok(Math.abs(gallopBob(t, 1.3)) <= 27);
});

test('every source is an https link', () => {
  for (const [, url] of Object.values(sources)) assert.match(url, /^https:\/\//);
});

test('the page cites its sources and carries both honesty notes', () => {
  const html = readFileSync(new URL('../experiments/westminster-tilt/index.html', import.meta.url), 'utf8');
  for (const [, url] of Object.values(sources)) assert.ok(html.includes(url), `page lacks ${url}`);
  assert.match(html, /1520/);
  assert.match(html, /never actually scored/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as E from '../experiments/longitude/engine.mjs';

const dir = new URL('../experiments/longitude/', import.meta.url);
const rings = JSON.parse(readFileSync(new URL('land.json', dir), 'utf8'));
const { voyages, places } = JSON.parse(readFileSync(new URL('voyages.json', dir), 'utf8'));
const land = E.indexLand(rings);
const html = readFileSync(new URL('index.html', dir), 'utf8');

// Sail straight at the destination by reckoning, heaving to when it may be near.
function playStraight(v, seed, opts = {}) {
  let s = E.newVoyage(v, seed, opts);
  const orders = [];
  while (s.status === 'sailing') {
    const { course, dist } = E.rhumb(s.dr, v.dest);
    const order = { heading: Math.round(course), heaveTo: dist < 180 + 2 * s.sdLon + v.sight };
    orders.push(order);
    s = E.sailDay(s, land, places, order);
  }
  return { s, orders };
}

test('voyage ids are unique', () => {
  assert.equal(new Set(voyages.map((v) => v.id)).size, voyages.length);
});

test('every voyage starts at sea, out of sight of land', () => {
  for (const v of voyages) assert.ok(E.landDistance(land, v.start) > E.SIGHT_NM, v.id);
});

test('every destination has land on the chart within its sighting range', () => {
  for (const v of voyages) assert.ok(E.landDistance(land, v.dest) < v.sight, v.id);
});

test('the gazetteer names each destination', () => {
  for (const v of voyages) assert.equal(E.nearestPlace(places, v.dest), v.to, v.id);
});

test('the art the page uses is on disk', () => {
  for (const name of ['log', 'glass', 'clock']) assert.ok(existsSync(fileURLToPath(new URL(`art/${name}.webp`, dir))), name);
});

test('the same date gives every visitor the same voyage and seed', () => {
  const a = E.dailyVoyage(voyages, new Date(2026, 11, 3, 8));
  const b = E.dailyVoyage(voyages, new Date(2026, 11, 3, 22));
  assert.equal(a.voyage.id, b.voyage.id);
  assert.equal(a.seed, b.seed);
});

test('consecutive days walk through every voyage before repeating', () => {
  const ids = Array.from({ length: voyages.length }, (_, i) => E.dailyVoyage(voyages, new Date(2026, 10, 26 + i)).voyage.id);
  assert.equal(new Set(ids).size, voyages.length);
});

test('launch day is voyage No. 1', () => {
  assert.equal(E.dailyVoyage(voyages, new Date(2026, 10, 26, 12)).number, 1);
});

test('rhumb course and distance agree with a known case', () => {
  const { course, dist } = E.rhumb([0, 0], [0, -10]);
  assert.equal(Math.round(course), 270);
  assert.ok(Math.abs(dist - 600) < 1);
});

test('moving due north 60 miles adds one degree of latitude', () => {
  const [lat, lon] = E.move([10, -20], 0, 60);
  assert.ok(Math.abs(lat - 11) < 1e-9);
  assert.ok(Math.abs(lon + 20) < 1e-9);
});

test('a point inside Spain is on land; mid-Atlantic is far from land', () => {
  assert.equal(E.landDistance(land, [40.4, -3.7]), 0);
  assert.ok(E.landDistance(land, [30, -45]) > 300);
});

test('each day advances one noon-to-noon run and uses a day of water', () => {
  const v = voyages.find((x) => x.id === 'barbados');
  const s0 = E.newVoyage(v, 42);
  const s1 = E.sailDay(s0, land, places, { heading: 225 });
  assert.equal(s1.day, 1);
  assert.equal(s1.water, s0.water - 1);
  assert.ok(s1.log[0].loggedNm > 60 && s1.log[0].loggedNm < 200);
  assert.equal(s0.day, 0, 'sailDay does not change the old state');
});

test('the reckoned position differs from the true one after days at sea', () => {
  const v = voyages.find((x) => x.id === 'barbados');
  let s = E.newVoyage(v, 7);
  for (let i = 0; i < 8; i++) s = E.sailDay(s, land, places, { heading: 240 });
  assert.ok(E.distNm(s.dr, s.truePos) > 5);
});

test('a clear noon resets reckoned latitude to within a few miles of the truth', () => {
  const v = voyages.find((x) => x.id === 'barbados');
  let s = E.newVoyage(v, 11), checked = 0;
  for (let i = 0; i < 12; i++) {
    s = E.sailDay(s, land, places, { heading: 235 });
    const e = s.log.at(-1);
    if (e.sight != null && !e.event) { assert.ok(Math.abs(s.dr[0] - s.truePos[0]) * 60 < 8); checked++; }
  }
  assert.ok(checked > 3);
});

test('an overcast noon leaves latitude unfixed', () => {
  const v = voyages.find((x) => x.id === 'barbados');
  let s = E.newVoyage(v, 11), seen = false;
  for (let i = 0; i < 20 && !seen; i++) {
    s = E.sailDay(s, land, places, { heading: 235 });
    const e = s.log.at(-1);
    if (e.cloudy && !e.event) { assert.equal(e.sight, null); seen = true; }
  }
  assert.ok(seen, 'found an overcast day');
});

test('without the clock, a noon sight never touches reckoned longitude', () => {
  const v = voyages.find((x) => x.id === 'barbados');
  let s = E.newVoyage(v, 5);
  for (let i = 0; i < 10; i++) {
    const before = s.drTrack.length;
    s = E.sailDay(s, land, places, { heading: 240 });
    const e = s.log.at(-1);
    assert.equal(e.clockLon, null);
    if (e.sight != null) {
      const preFix = s.drTrack[s.drTrack.length - 2];
      assert.equal(s.dr[1], preFix[1], 'longitude unchanged by the sight');
      assert.ok(s.drTrack.length > before);
    }
  }
});

test('with the clock, a clear noon fixes longitude too', () => {
  const v = voyages.find((x) => x.id === 'barbados');
  let s = E.newVoyage(v, 5, { clock: true }), fixed = 0;
  for (let i = 0; i < 10; i++) {
    s = E.sailDay(s, land, places, { heading: 240 });
    const e = s.log.at(-1);
    if (e.sight != null && !e.event) { assert.ok(E.distNm(s.dr, s.truePos) < 10); fixed++; }
  }
  assert.ok(fixed > 3);
});

test('the clock voyage has the same weather as the 1714 voyage', () => {
  for (let d = 1; d < 30; d++) assert.deepEqual(E.weather(99, d), E.weather(99, d));
  const v = voyages.find((x) => x.id === 'madeira');
  const a = E.sailDay(E.newVoyage(v, 99), land, places, { heading: 225 });
  const b = E.sailDay(E.newVoyage(v, 99, { clock: true }), land, places, { heading: 225 });
  assert.deepEqual(a.truePos, b.truePos);
  assert.equal(a.log[0].cloudy, b.log[0].cloudy);
});

test('replaying saved orders rebuilds the same voyage', () => {
  const v = voyages.find((x) => x.id === 'azores');
  const { s, orders } = playStraight(v, 1234);
  const r = E.replay(v, 1234, orders, land, places);
  assert.deepEqual(r.truePos, s.truePos);
  assert.equal(r.status, s.status);
});

test('sailing at night into land wrecks the ship', () => {
  // Due east from mid-ocean onto the Portuguese coast, never heaving to.
  const v = { ...voyages[0], start: [39.5, -13], dest: [0, -30], sight: 20, reef: 2 };
  let found = false;
  for (let seed = 0; seed < 40 && !found; seed++) {
    let s = E.newVoyage(v, seed);
    while (s.status === 'sailing' && s.day < 10) s = E.sailDay(s, land, places, { heading: 90 });
    if (s.status === 'wrecked') { assert.ok(s.ending.hour >= E.NIGHT[0] && s.ending.hour < E.NIGHT[1]); found = true; }
  }
  assert.ok(found, 'some seed wrecks at night');
});

test('approaching land in daylight stops the ship with land ho', () => {
  const v = { ...voyages[0], start: [39.5, -13], dest: [0, -30], sight: 20, reef: 2 };
  let found = false;
  for (let seed = 0; seed < 40 && !found; seed++) {
    let s = E.newVoyage(v, seed);
    while (s.status === 'sailing' && s.day < 10 && !s.log.at(-1)?.event) s = E.sailDay(s, land, places, { heading: 90 });
    const e = s.log.at(-1).event;
    if (e) { assert.equal(e.type, 'land'); assert.ok(E.distNm(s.dr, s.truePos) < 1, 'land fixes the position'); found = true; }
  }
  assert.ok(found);
});

test('in daylight the ship never sails onto land it can see', () => {
  const v = { ...voyages[0], start: [39.5, -13], dest: [0, -30], sight: 20, reef: 2 };
  for (let seed = 0; seed < 30; seed++) {
    let s = E.newVoyage(v, seed);
    while (s.status === 'sailing' && s.day < 12) s = E.sailDay(s, land, places, { heading: 90 });
    if (s.status === 'wrecked') assert.ok(s.ending.hour >= E.NIGHT[0] && s.ending.hour < E.NIGHT[1], `seed ${seed} wrecked at hour ${s.ending.hour}`);
  }
});

test('sighting the destination ends the voyage as arrived', () => {
  const v = voyages.find((x) => x.id === 'madeira');
  let arrived = 0;
  for (let i = 0; i < 10; i++) if (playStraight(v, i, { clock: true }).s.status === 'arrived') arrived++;
  assert.ok(arrived >= 7, `arrived ${arrived}/10`);
});

test('running out of water ends the voyage', () => {
  const v = voyages.find((x) => x.id === 'barbados');
  let s = E.newVoyage(v, 3);
  // Sail in small circles out at sea: heave to and steer back and forth.
  s = { ...s, truePos: [45, -30], dr: [45, -30] };
  while (s.status === 'sailing') s = E.sailDay(s, land, places, { heading: s.day % 2 ? 0 : 180, heaveTo: true });
  assert.equal(s.status, 'thirst');
  assert.equal(s.water, 0);
});

test('the uncertainty band holds the true position about nine times in ten', () => {
  let inside = 0, n = 0;
  for (const v of voyages) for (let i = 0; i < 6; i++) {
    let s = E.newVoyage(v, E.hash(`band-${v.id}-${i}`));
    while (s.status === 'sailing' && s.day < 30) {
      s = E.sailDay(s, land, places, { heading: E.rhumb(s.dr, v.dest).course, heaveTo: true });
      if (s.status !== 'sailing') break;
      const dLat = (s.truePos[0] - s.dr[0]) * 60, dLon = (s.truePos[1] - s.dr[1]) * 60 * Math.cos((s.dr[0] * Math.PI) / 180);
      if ((dLat / (2 * s.sdLat)) ** 2 + (dLon / (2 * s.sdLon)) ** 2 <= 1) inside++;
      n++;
    }
  }
  const rate = inside / n;
  assert.ok(rate > 0.8 && rate < 0.98, `coverage ${rate.toFixed(2)}`);
});

test('the clock makes voyages more successful than reckoning alone', () => {
  let a = 0, b = 0;
  for (const v of voyages) for (let i = 0; i < 4; i++) {
    const seed = E.hash(`cmp-${v.id}-${i}`);
    if (playStraight(v, seed).s.status === 'arrived') a++;
    if (playStraight(v, seed, { clock: true }).s.status === 'arrived') b++;
  }
  assert.ok(b > a, `clock ${b} vs reckoning ${a}`);
});

test('noon clock time is four minutes per degree west of Greenwich', () => {
  assert.equal(E.clockAtNoon(0), '12:00');
  assert.equal(E.clockAtNoon(-60), '16:00');
  assert.equal(E.clockAtNoon(15), '11:00');
});

test('compass point names', () => {
  assert.equal(E.pointName(0), 'N');
  assert.equal(E.pointName(248), 'WSW');
  assert.equal(E.pointName(258.75), 'W by S');
});

test('the page links its stylesheet, script and canonical URL', () => {
  assert.match(html, /href="longitude\.css"/);
  assert.match(html, /src="longitude\.mjs"/);
  assert.match(html, /rel="canonical" href="https:\/\/zeropagelabs\.com\/experiments\/longitude\/"/);
});

test('a ship that keeps steering at a coast never ends up on land unless wrecked', () => {
  const v = { ...voyages[0], start: [39.5, -13], dest: [0, -30], sight: 20, reef: 2 };
  for (let seed = 0; seed < 40; seed++) {
    for (const offset of [0, 50]) {
      let s = E.newVoyage(v, seed);
      while (s.status === 'sailing' && s.day < 20) s = E.sailDay(s, land, places, { heading: 90 + offset });
      if (s.status === 'wrecked') continue;
      for (const p of s.trueTrack) assert.ok(E.landDistance(land, p) > 0, `seed ${seed} offset ${offset}: on land at ${p}`);
    }
  }
});

test('arrival only counts near the destination, not on another coast', () => {
  for (const id of ['lizard', 'puerto-rico']) {
    const v = voyages.find((x) => x.id === id);
    for (let i = 0; i < 25; i++) {
      for (const clock of [false, true]) {
        let s = E.newVoyage(v, E.hash(`far-${id}-${i}`), { clock });
        while (s.status === 'sailing') {
          const { course, dist } = E.rhumb(s.dr, v.dest);
          s = E.sailDay(s, land, places, { heading: course, heaveTo: dist < 180 + 2 * s.sdLon + v.sight });
        }
        if (s.status === 'arrived') assert.ok(E.distNm(s.truePos, v.dest) <= (v.arrive ?? v.sight + 20), `${id} ${i}: arrived ${Math.round(E.distNm(s.truePos, v.dest))} nm away`);
      }
    }
  }
});

test('sighting any coast of a large destination island counts as arriving', () => {
  const v = voyages.find((x) => x.id === 'puerto-rico');
  // Approach Puerto Rico's west coast from the open sea to the west-southwest, in daylight.
  const start = { ...v, start: [17.6, -68.2] };
  let s = E.newVoyage(start, 3, { clock: true });
  while (s.status === 'sailing' && s.day < 6) s = E.sailDay(s, land, places, { heading: 60, heaveTo: true });
  assert.equal(s.status, 'arrived');
});

test('the Scilly Isles are on the chart', () => {
  assert.equal(E.landDistance(land, [49.93, -6.32]), 0);
});

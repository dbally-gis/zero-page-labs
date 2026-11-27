// Longitude, 1714 — the voyage model. Pure, so it can be tested in Node.
//
// The ship has a TRUE position the player never sees until the end, and a
// RECKONED position worked out from the compass heading and the log line.
// Hidden currents, a mis-marked log line and a small steering error pull the
// two apart. A noon sun sight gives latitude. Only Harrison's clock gives longitude.

export const SIGHT_NM = 14;      // other land is seen within this range in daylight
export const NIGHT = [6, 18];    // hours after noon that are dark
export const UNCERTAINTY = { current: 0.45, log: 0.035 };
export const WINDOW = { w: -100, s: -45, e: 30, n: 68 };
const NM_PER_DEG = 60;
const RAD = Math.PI / 180;

// --- Daily pick and randomness ---------------------------------------------

const EPOCH = Date.UTC(2026, 10, 26);
export function dayNumber(date) {
  return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - EPOCH) / 86400000);
}
export function dateKey(date) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hash(s) {
  let h = 2166136261;
  for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
function shuffle(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const gauss = (rand) => {
  const u = Math.max(rand(), 1e-9), v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/** Today's voyage: walk a fixed shuffle of the list, reshuffled each lap. Seed is per date. */
export function dailyVoyage(voyages, date) {
  const n = dayNumber(date), len = voyages.length;
  const lap = Math.floor(n / len), i = ((n % len) + len) % len;
  return { voyage: shuffle(voyages, rng(hash(`longitude-lap-${lap}`)))[i], seed: hash(`longitude-${dateKey(date)}`), number: n + 1 };
}

// --- Geometry (nautical miles, degrees) -------------------------------------

export function move([lat, lon], headingDeg, nm) {
  const dLat = (nm * Math.cos(headingDeg * RAD)) / NM_PER_DEG;
  const mid = lat + dLat / 2;
  const dLon = (nm * Math.sin(headingDeg * RAD)) / (NM_PER_DEG * Math.max(0.05, Math.cos(mid * RAD)));
  return [lat + dLat, lon + dLon];
}
export const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * RAD) / 2)) / RAD;

/** Rhumb-line course (degrees true) and distance (nm) — what a navigator would lay off on a Mercator chart. */
export function rhumb([lat1, lon1], [lat2, lon2]) {
  const dPhi = mercY(lat2) - mercY(lat1);
  const dLon = lon2 - lon1;
  const course = (Math.atan2(dLon, dPhi) / RAD + 360) % 360;
  const dLat = lat2 - lat1;
  const q = Math.abs(dLat) > 1e-6 ? dLat / dPhi : Math.cos(lat1 * RAD);
  const dist = Math.hypot(dLat, q * dLon) * NM_PER_DEG;
  return { course, dist };
}
export function distNm([lat1, lon1], [lat2, lon2]) {
  const x = (lon2 - lon1) * Math.cos(((lat1 + lat2) / 2) * RAD);
  return Math.hypot(lat2 - lat1, x) * NM_PER_DEG;
}

// --- Land --------------------------------------------------------------------

/** Index rings once: [{ ring, w, s, e, n }]. Rings are [[lon, lat], ...]. */
export function indexLand(rings) {
  return rings.map((ring) => {
    let w = 180, s = 90, e = -180, n = -90;
    for (const [x, y] of ring) { w = Math.min(w, x); e = Math.max(e, x); s = Math.min(s, y); n = Math.max(n, y); }
    return { ring, w, s, e, n };
  });
}
function inRing(ring, lon, lat) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
/** Distance in nm to the nearest coast (0 if on land), searching within ~0.8 degrees. */
export function landDistance(land, [lat, lon]) {
  const pad = 0.8, k = Math.cos(lat * RAD);
  let best = Infinity;
  for (const r of land) {
    if (lon < r.w - pad / k || lon > r.e + pad / k || lat < r.s - pad || lat > r.n + pad) continue;
    if (lon >= r.w && lon <= r.e && lat >= r.s && lat <= r.n && inRing(r.ring, lon, lat)) return 0;
    const ring = r.ring;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const ax = (ring[j][0] - lon) * k, ay = ring[j][1] - lat;
      const bx = (ring[i][0] - lon) * k, by = ring[i][1] - lat;
      const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
      const t = len2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
      const d = Math.hypot(ax + t * dx, ay + t * dy);
      if (d < best) best = d;
    }
  }
  return best * NM_PER_DEG;
}
export function nearestPlace(places, pos) {
  let best = null, bd = Infinity;
  for (const [name, lat, lon] of places) {
    const d = distNm(pos, [lat, lon]);
    if (d < bd) { bd = d; best = name; }
  }
  return bd < 360 ? best : 'an unknown coast';
}

// --- Weather -------------------------------------------------------------------

/** The hidden conditions of one voyage, the same for the 1714 and the clock voyage. */
export function conditions(seed) {
  const r = rng(hash(`cond-${seed}`));
  return {
    logBias: 0.94 + r() * 0.12,            // a log line knotted a little long or short
    steerBias: (r() - 0.5) * 6,            // compass error and leeway, degrees
    currentKn: 0.15 + r() * 0.35,
    currentDir: r() * 360,
  };
}
/** Day d's weather. Depends only on the seed and the day, never on where the ship is. */
export function weather(seed, day) {
  const cond = conditions(seed);
  let dir = cond.currentDir;
  for (let i = 1; i <= day; i++) dir += gauss(rng(hash(`turn-${seed}-${i}`))) * 22;
  const r = rng(hash(`day-${seed}-${day}`));
  return {
    speedKn: 3.6 + r() * 3.8,
    currentDir: ((dir % 360) + 360) % 360,
    currentKn: cond.currentKn * (0.7 + r() * 0.6),
    logNoise: 1 + gauss(r) * 0.04,
    cloudy: r() < 0.28,
    sightErr: gauss(r) * 2,                // minutes of arc
    clockErr: gauss(r) * 1.5,              // minutes of longitude (H4 lost about 5 s in 81 days)
  };
}

// --- The voyage -----------------------------------------------------------------

export function waterDays(voyage) {
  return Math.ceil((rhumb(voyage.start, voyage.dest).dist / 125) * 2) + 7;
}

export function newVoyage(voyage, seed, { clock = false } = {}) {
  return {
    voyage, seed, clock,
    day: 0,
    water: waterDays(voyage),
    truePos: [...voyage.start],
    dr: [...voyage.start],
    sdLat: 1, sdLon: 1,                    // one-sigma uncertainty, nm
    trueTrack: [[...voyage.start]],
    drTrack: [[...voyage.start]],
    log: [],
    status: 'sailing',                     // sailing | arrived | wrecked | thirst | lost
    ending: null,
  };
}

const isNight = (h) => h >= NIGHT[0] && h < NIGHT[1];

/**
 * Sail one noon-to-noon day. Returns a new state. heading is degrees true;
 * heaveTo stops the ship through the water at night (the current still carries it).
 */
export function sailDay(state, land, places, { heading, heaveTo = false }) {
  if (state.status !== 'sailing') return state;
  const s = structuredClone(state);
  const v = s.voyage;
  const day = s.day + 1;
  const wx = weather(s.seed, day);
  const cond = conditions(s.seed);
  const entry = { day, heading, heaveTo, speedKn: +wx.speedKn.toFixed(1), loggedNm: 0, hours: 24, event: null, sight: null, clockLon: null };
  const startLand = landDistance(land, s.truePos);
  let pos = s.truePos, dr = s.dr;
  const STEPS = 4;                       // check land every quarter hour, so no cape is jumped
  const end = (status, h, extra = {}) => { s.status = status; s.ending = { hour: h, ...extra }; entry.hours = h + 1; };

  hours: for (let h = 0; h < 24; h++) {
    const night = isNight(h);
    const stw = heaveTo && night ? 0 : wx.speedKn;
    for (let q = 0; q < STEPS; q++) {
      let next = move(pos, heading + cond.steerBias, stw / STEPS);
      next = move(next, wx.currentDir, wx.currentKn / STEPS);
      const toDest = distNm(next, v.dest);
      const shore = landDistance(land, next);
      if (next[0] < WINDOW.s || next[0] > WINDOW.n || next[1] < WINDOW.w || next[1] > WINDOW.e) { pos = next; end('lost', h); break hours; }
      if (night && (shore <= 1.5 || toDest <= v.reef)) {
        pos = next;
        end('wrecked', h, { place: toDest <= v.reef + 20 ? v.to : nearestPlace(places, next) });
        break hours;
      }
      if (!night && toDest <= v.sight) { pos = next; end('arrived', h, { place: v.to }); break hours; }
      // In daylight the ship never runs onto land she can see: she stays off at the last safe point.
      const tooClose = shore <= 3;
      const newSighting = shore <= SIGHT_NM && startLand > SIGHT_NM;
      if (!night && (tooClose || newSighting)) {
        if (!tooClose) pos = next;
        // Any coast in sight close enough to the destination is the destination's own.
        if (distNm(pos, v.dest) <= (v.arrive ?? v.sight + 20)) { end('arrived', h, { place: v.to }); break hours; }
        const place = nearestPlace(places, pos);
        entry.event = { type: 'land', place, hour: h, pos: [...pos] };
        entry.hours = h + 1;
        dr = [...pos];
        s.sdLat = s.sdLon = 2;
        break hours;
      }
      pos = next;
      const logged = (stw / STEPS) * cond.logBias * wx.logNoise;
      entry.loggedNm += logged;
      dr = move(dr, heading, logged);
    }
    if (h % 3 === 2) { s.trueTrack.push(pos); s.drTrack.push(dr); }
  }
  s.trueTrack.push(pos); s.drTrack.push(dr);
  s.truePos = pos;
  s.day = day;
  s.water -= 1;
  entry.loggedNm = Math.round(entry.loggedNm);

  if (s.status === 'sailing') {
    // Uncertainty grows with unknown current and the doubtful log. Both errors tend to
    // persist from day to day, so the band widens steadily, not like a random walk.
    const grow = UNCERTAINTY.current * wx.currentKn * 24 + UNCERTAINTY.log * entry.loggedNm;
    s.sdLat += grow * 0.8;
    s.sdLon += grow;
    if (!wx.cloudy && !entry.event) {
      const lat = pos[0] + wx.sightErr / 60;
      entry.sight = lat;
      dr = [lat, dr[1]];
      s.sdLat = 2;
      if (s.clock) {
        const lon = pos[1] + wx.clockErr / 60;
        entry.clockLon = lon;
        dr = [lat, lon];
        s.sdLon = 2.5;
      }
      s.drTrack.push(dr);
    }
    s.dr = dr;
    if (s.water <= 0) { s.status = 'thirst'; s.ending = { hour: 24 }; }
  } else {
    s.dr = dr;
  }
  if (s.status !== 'sailing') s.ending.errorNm = Math.round(distNm(s.dr, s.truePos));
  entry.cloudy = wx.cloudy;
  s.log.push(entry);
  return s;
}

/** Rebuild a voyage from its list of orders — how saved games are restored. */
export function replay(voyage, seed, orders, land, places, opts = {}) {
  let s = newVoyage(voyage, seed, opts);
  for (const o of orders) s = sailDay(s, land, places, o);
  return s;
}

// --- Words -----------------------------------------------------------------------

const POINTS = ['N', 'NbE', 'NNE', 'NEbN', 'NE', 'NEbE', 'ENE', 'EbN', 'E', 'EbS', 'ESE', 'SEbE', 'SE', 'SEbS', 'SSE', 'SbE',
  'S', 'SbW', 'SSW', 'SWbS', 'SW', 'SWbW', 'WSW', 'WbS', 'W', 'WbN', 'WNW', 'NWbW', 'NW', 'NWbN', 'NNW', 'NbW'];
export const pointName = (deg) => POINTS[Math.round((((deg % 360) + 360) % 360) / 11.25) % 32].replace('b', ' by ');
export function fmtLat(lat) {
  const a = Math.abs(lat), d = Math.floor(a), m = Math.round((a - d) * 60);
  return `${m === 60 ? d + 1 : d}°${String(m === 60 ? 0 : m).padStart(2, '0')}′ ${lat >= 0 ? 'N' : 'S'}`;
}
export function fmtLon(lon) {
  const a = Math.abs(lon), d = Math.floor(a), m = Math.round((a - d) * 60);
  return `${m === 60 ? d + 1 : d}°${String(m === 60 ? 0 : m).padStart(2, '0')}′ ${lon >= 0 ? 'E' : 'W'}`;
}
/** Local noon as Greenwich clock time: four minutes for every degree of longitude. */
export function clockAtNoon(lon) {
  const mins = Math.round(12 * 60 - lon * 4);
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

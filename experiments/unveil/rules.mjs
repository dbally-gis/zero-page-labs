// UNVEIL — daily pick, hex board, options and scoring. Pure, so it can be tested in Node.

export const START_SCORE = 100;
export const FLIP_COST = 4;   // every tile after the first
export const WRONG_COST = 20;
export const BOARD = 960;     // image and board are BOARD x BOARD
export const HEX_R = 80;      // pointy-top hex radius in board units

// Day 0 is the launch date; the date is the visitor's local calendar date.
const EPOCH = Date.UTC(2026, 10, 26);
export function dayNumber(date) {
  return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - EPOCH) / 86400000);
}
export function dateKey(date) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

// Small deterministic RNG (mulberry32) and string hash, so every visitor gets the same puzzle.
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
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
export function shuffle(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** The daily site: a fixed shuffle of the list, walked one per day, reshuffled each lap. */
export function dailySite(sites, date) {
  const n = dayNumber(date), len = sites.length;
  const lap = Math.floor(n / len), i = ((n % len) + len) % len;
  return shuffle(sites, rng(hash(`unveil-lap-${lap}`)))[i];
}

export function practiceSite(sites, exclude, rand = Math.random) {
  const pool = sites.filter((s) => s.id !== exclude);
  return pool[Math.floor(rand() * pool.length)];
}

/** The four answers in a stable order for this site and day. */
export function options(site, salt = '') {
  return shuffle([site.answer, ...site.decoys], rng(hash(`${site.id}:${salt}`)));
}

/** Score after some flips and wrong guesses. The first flip is free; never below zero. */
export function score(flips, wrong) {
  return Math.max(0, START_SCORE - FLIP_COST * Math.max(0, flips - 1) - WRONG_COST * wrong);
}

/** Pointy-top hexes covering the square board (edge hexes overhang and are clipped). */
export function hexGrid(size = BOARD, r = HEX_R) {
  const w = Math.sqrt(3) * r, rowH = 1.5 * r, cells = [];
  for (let row = 0; row * rowH - r < size; row++) {
    const shift = row % 2 ? w / 2 : 0;
    for (let col = -1; col * w + shift - w / 2 < size; col++) {
      const cx = col * w + shift, cy = row * rowH;
      if (cx + w / 2 <= 0) continue;
      cells.push({ i: cells.length, row, col, cx, cy });
    }
  }
  return cells;
}

export function hexPoints(cx, cy, r = HEX_R) {
  return Array.from({ length: 6 }, (_, k) => {
    const a = Math.PI / 180 * (60 * k - 30);
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

export function formatCoords(lat, lon) {
  const f = (v, pos, neg) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? pos : neg}`;
  return `${f(lat, 'N', 'S')}, ${f(lon, 'E', 'W')}`;
}

/** Text to share: no answer in it, just how it went. */
export function shareText({ day, flips, total, wrong, points }) {
  const tries = wrong === 0 ? 'first guess' : `${wrong + 1} guesses`;
  return `UNVEIL #${day + 1} · ${flips}/${total} tiles · ${tries} · ${points} pts\n${'🟧'.repeat(Math.min(flips, 20))}${flips > 20 ? '…' : ''}`;
}

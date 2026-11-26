// The Composing Ark — Kircher's Arca Musarithmica (1650), Syntagma I, prose pinakes.
// Pure logic: phrasing, choosing the rod, numbers to pitches, octave placement, note values.

export const VOICES = ['Cantus', 'Altus', 'Tenor', 'Bassus'];

// Kircher's twelve tones: scale degrees 1–8 (1 and 8 are the final, an octave apart).
// Per Kircher's Iconismus XIV. "mollis" tones carry a one-flat signature.
const T = (s) => s.split(' ').map((n) => ({ step: n[0], alter: n.includes('#') ? 1 : n.includes('b') ? -1 : 0 }));
export const TONES = {
  I: { mollis: false, final: 'D', degrees: T('D E F G A Bb C# D') },
  II: { mollis: true, final: 'G', degrees: T('G A Bb C D Eb F# G') },
  III: { mollis: false, final: 'A', degrees: T('A B C D E F G# A') },
  IV: { mollis: false, final: 'A', degrees: T('A B C# D E F G A') },
  V: { mollis: true, final: 'Bb', degrees: T('Bb C D E F G A Bb') },
  VI: { mollis: true, final: 'F', degrees: T('F G A Bb C D E F') },
  VII: { mollis: false, final: 'G', degrees: T('G A B C D E F# G') },
  VIII: { mollis: false, final: 'G', degrees: T('G A B C D E F# G') },
  IX: { mollis: true, final: 'D', degrees: T('D E F G A Bb C# D') },
  X: { mollis: false, final: 'A', degrees: T('A B C D E F G A') },
  XI: { mollis: false, final: 'C', degrees: T('C D E F G A B C') },
  XII: { mollis: true, final: 'F', degrees: T('F G A Bb C D E F') },
};
// Kircher allows every tone with the prose pinakes except IV and V.
export const PROSE_TONES = Object.keys(TONES).filter((t) => t !== 'IV' && t !== 'V');

// Comfortable ranges (MIDI), roughly the C1/C3/C4/F4 clefs of the ark's front panel.
export const RANGES = { Cantus: [57, 77], Altus: [50, 71], Tenor: [47, 67], Bassus: [40, 60] };

export const METERS = {
  duple: { label: 'Duple', sign: '¢', secondsPerMinim: 0.42 },
  tripleMinor: { label: 'Triple minor', sign: '3', secondsPerMinim: 0.3 },
  tripleMajor: { label: 'Triple major', sign: '¢3', secondsPerMinim: 0.17 },
};

// ---------- Text ----------

/**
 * Parse text into phrases. Lines and punctuation end phrases; words are split by spaces, syllables by hyphens.
 * A backtick before a syllable marks it long ("Lau-`da-te").
 * Phrases longer than 6 syllables are split at word boundaries; 1-syllable phrases join a neighbour.
 */
export function parseText(text) {
  // Each line (or clause) becomes a run of syllables; word starts are preferred split points
  const runs = [];
  for (const line of text.split(/\n|[.,;:!?]/)) {
    const syls = [];
    for (const w of line.trim().split(/\s+/).filter(Boolean)) {
      w.split('-').filter(Boolean).forEach((s, j) => syls.push({ text: s.replace(/`/g, ''), long: s.startsWith('`'), wordStart: j === 0 }));
    }
    if (!syls.length) continue;
    // A run too short to set joins the previous one
    if (syls.length < 2 && runs.length) runs.at(-1).push(...syls);
    else runs.push(syls);
  }
  if (runs.length > 1 && runs[0].length < 2) runs[1].unshift(...runs.shift());
  const phrases = [];
  for (const run of runs) {
    if (run.length < 2) continue;                       // a single syllable alone cannot be set
    // Fewest phrases of 2–6 syllables; splitting inside a word costs extra
    const n = run.length, cost = Array(n + 1).fill(Infinity), from = Array(n + 1).fill(-1);
    cost[0] = 0;
    for (let i = 0; i < n; i++) {
      if (cost[i] === Infinity) continue;
      for (let j = i + 2; j <= Math.min(n, i + 6); j++) {
        const c = cost[i] + 1 + (j < n && !run[j].wordStart ? 4 : 0);
        if (c < cost[j]) { cost[j] = c; from[j] = i; }
      }
    }
    const cuts = [];
    for (let j = n; j > 0; j = from[j]) cuts.unshift([from[j], j]);
    for (const [i, j] of cuts) phrases.push(toPhrase(run.slice(i, j)));
  }
  return phrases;
}

function toPhrase(syls) {
  const words = [];
  syls.forEach((s, k) => { if (k === 0 || s.wordStart) words.push([]); words.at(-1).push(s.text); });
  const penult = syls[syls.length - 2];
  // With no stress marks at all, assume long: a two-syllable last word always stresses its first syllable
  const marked = syls.some((s) => s.long);
  return { words, syllables: syls.map((s) => s.text), penultLong: marked ? penult.long : true };
}

/** Which rod: Pinax I for a long penultimate, II for short; column by syllable count (2–6). */
export function rodFor(phrase) {
  return { pinax: phrase.penultLong ? 'I' : 'II', column: phrase.syllables.length - 2 };
}

// ---------- Pitch ----------

const STEP_SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midiOf = (deg, octave) => 12 * (octave + 1) + STEP_SEMI[deg.step] + deg.alter;

/**
 * Place each voice's degrees in octaves: stay in range, prefer the smallest leaps.
 * Dynamic programming over candidate octaves; returns spelled pitches {midi, step, alter, octave}.
 */
export function placeVoice(degrees, tone, voice, prevMidi = null, above = null) {
  const [lo, hi] = RANGES[voice], mid = (lo + hi) / 2;
  const cands = degrees.map((d) => {
    const deg = TONES[tone].degrees[d - 1];
    const out = [];
    for (let o = 1; o <= 6; o++) out.push({ midi: midiOf(deg, o), step: deg.step, alter: deg.alter, octave: o });
    return out;
  });
  const outside = (m) => (m < lo ? lo - m : m > hi ? m - hi : 0) * 12;
  // Crossing the voice above is heavily penalised (for the bass, sitting level with it too)
  const crossing = (m, i) => {
    if (!above) return 0;
    const ceiling = above[i];
    return voice === 'Bassus' ? (m >= ceiling ? 400 : 0) : (m > ceiling ? 200 : 0);
  };
  const local = (c, i) => outside(c.midi) + crossing(c.midi, i);
  let costs = cands[0].map((c) => local(c, 0) + (prevMidi == null ? Math.abs(c.midi - mid) * 0.5 : Math.abs(c.midi - prevMidi)));
  const back = [];
  for (let i = 1; i < cands.length; i++) {
    const row = [], from = [];
    for (const c of cands[i]) {
      let best = Infinity, arg = 0;
      cands[i - 1].forEach((p, j) => {
        const leap = Math.abs(c.midi - p.midi);
        const v = costs[j] + leap + (leap > 7 ? 6 : 0);
        if (v < best) { best = v; arg = j; }
      });
      row.push(best + local(c, i)); from.push(arg);
    }
    costs = row; back.push(from);
  }
  let k = costs.indexOf(Math.min(...costs));
  const path = [k];
  for (let i = back.length - 1; i >= 0; i--) { k = back[i][k]; path.unshift(k); }
  return path.map((j, i) => cands[i][j]);
}

/** Place all four voices of a block, top down: each voice stays at or below the one above, the bass lowest. */
export function placeChordVoices(block, tone, prev = {}) {
  const placed = [];
  VOICES.forEach((v, i) => {
    let above = null;
    if (i > 0) above = v === 'Bassus'
      ? block[i].map((_, n) => Math.min(...placed.map((pv) => pv[n].midi)))
      : placed[i - 1].map((p) => p.midi);
    placed.push(placeVoice(block[i], tone, v, prev[v] ?? null, above));
  });
  return placed;
}

// ---------- Rhythm ----------

const BASE = { Lg: 8, Br: 4, Sb: 2, Mn: 1, Sm: 0.5, Fs: 0.25 };
/** Parse a mensural token as printed ("SbD", "MnR", or "R?" for a rest of unclear value). */
export function parseValue(token) {
  if (token === 'R?') return { base: null, dotted: false, rest: true, minims: null };
  // A blackened (coloured) semibreve: always imperfect, never perfected in triple time
  if (token === 'SbBlk') return { base: 'Sb', dotted: false, rest: false, minims: 2, black: true };
  const m = /^(Lg|Br|Sb|Mn|Sm|Fs)(D?)(R?)$/.exec(token);
  if (!m) throw new Error(`Unknown note value ${token}`);
  return { base: m[1], dotted: Boolean(m[2]), rest: Boolean(m[3]), minims: BASE[m[1]] * (m[2] ? 1.5 : 1) };
}

/**
 * Durations as sung. Duple is as printed. In triple time the print often leaves a note's
 * value to the rule of perfection: an undotted breve (triple major) or semibreve (triple
 * minor) is worth three units when perfect, two when imperfect, by its context. We try every reading and keep the one that fills whole groups
 * of three, with the most notes on the beat and a perfect final note. Rests of unclear
 * value are resolved the same way.
 */
export function resolvePattern(tokens, meter) {
  const vals = tokens.map(parseValue);
  if (meter === 'duple') {
    // An unclear rest takes the smallest value that makes the pattern whole semibreves
    const known = vals.reduce((t, v) => t + (v.minims ?? 0), 0);
    const restVal = [0.5, 1, 2].find((r) => (known + r) % 2 === 0) ?? 1;
    const name = { 0.5: 'Sm', 1: 'Mn', 2: 'Sb' }[restVal];
    return vals.map((v) => (v.minims == null ? { ...v, base: name, minims: restVal } : v));
  }
  const unitMinims = meter === 'tripleMajor' ? 2 : 1;            // a unit is a semibreve or a minim
  const perfectible = meter === 'tripleMajor' ? 'Br' : 'Sb';
  const options = vals.map((v) => {
    if (v.minims == null) return [1, 2, 3];                         // unclear rest
    if (v.base === perfectible && !v.dotted && !v.black) return [2, 3];
    return [v.minims / unitMinims];
  });
  let best = null;
  const walk = (i, chosen) => {
    if (i === options.length) {
      let pos = 0, onBeat = 0;
      chosen.forEach((u, k) => { if (!vals[k].rest && pos % 3 === 0) onBeat++; pos += u; });
      const finalPerfect = options.at(-1).length > 1 && chosen.at(-1) === 3 ? 1 : 0;
      const score = (pos % 3 === 0 ? 0 : 1000) - onBeat * 2 - finalPerfect;
      if (!best || score < best.score) best = { score, chosen: [...chosen] };
      return;
    }
    for (const u of options[i]) { chosen.push(u); walk(i + 1, chosen); chosen.pop(); }
  };
  walk(0, []);
  return vals.map((v, k) => {
    const minims = best.chosen[k] * unitMinims;
    if (v.minims != null && v.minims === minims) return v;
    // A perfected note is shown as dotted; an unclear rest takes the value that fits
    const base = v.base ?? Object.keys(BASE).find((b) => BASE[b] === minims) ?? (minims === 3 ? 'Sb' : 'Mn');
    return { ...v, base, minims, dotted: v.base ? minims === BASE[v.base] * 1.5 : minims === BASE[base] * 1.5 || !BASE[base] || BASE[base] !== minims };
  });
}

// ---------- Composition ----------

/**
 * Set a phrase: pick the permutation (vperm) and rhythm pattern by index.
 * Returns events: one per rhythm slot, with the four MIDI pitches (null for rests) and the syllable.
 */
export function setPhrase(tables, phrase, { tone, meter, vperm, rperm, prev = {} }) {
  const { pinax, column } = rodFor(phrase);
  const col = tables[pinax].columns[column];
  const block = col.vperms[vperm % col.vperms.length];
  const rhythms = col.rhythms[meter];
  if (!rhythms?.length) throw new Error(`Pinax ${pinax} has no ${meter} rhythms for ${phrase.syllables.length} syllables`);
  const pattern = resolvePattern(rhythms[rperm % rhythms.length], meter);
  const voices = placeChordVoices(block, tone, prev);
  const events = [];
  let note = 0, t = 0;
  for (const val of pattern) {
    if (val.rest) events.push({ t, minims: val.minims, value: val, rest: true, pitches: [null, null, null, null], syllable: null, degrees: null, index: null });
    else {
      events.push({ t, minims: val.minims, value: val, rest: false, pitches: voices.map((vs) => vs[note]), degrees: block.map((r) => r[note]), syllable: phrase.syllables[note], index: note });
      note++;
    }
    t += val.minims;
  }
  return { pinax, column, vperm: vperm % col.vperms.length, rperm: rperm % rhythms.length, block, pattern, events, length: t,
    last: Object.fromEntries(VOICES.map((v, i) => [v, voices[i].at(-1).midi])) };
}

/** Set a whole text, phrase by phrase, carrying each voice's last pitch for smooth octave choice. */
export function compose(tables, phrases, { tone, meter, choices }) {
  let prev = {}, t = 0;
  return phrases.map((p, i) => {
    const c = choices[i] ?? { vperm: 0, rperm: 0 };
    const set = setPhrase(tables, p, { tone, meter, vperm: c.vperm, rperm: c.rperm, prev });
    prev = set.last;
    const out = { ...set, start: t, phrase: p };
    t += set.length;
    return out;
  });
}

export function counts(tables, phrase, meter) {
  const { pinax, column } = rodFor(phrase);
  const col = tables[pinax].columns[column];
  return { vperms: col.vperms.length, rperms: col.rhythms[meter]?.length ?? 0 };
}

export const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'];

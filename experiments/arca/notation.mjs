// A four-voice score in modern clefs, drawn as SVG. Note shapes follow the mensural values:
// breve, semibreve (whole), minim (half), semiminim (quarter), fusa (eighth).
import { VOICES, TONES } from './engine.mjs';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  parent?.append(n);
  return n;
};

const LINE = 9;                    // staff line spacing
const STAFF_H = LINE * 4;
const STAFF_GAP = 46;              // space between staves (room for ledger lines)
const TOP = 34, LEFT = 96;
const STEP_IDX = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
// Diatonic index of each staff's bottom line: treble E4, tenor (treble 8vb) E3, bass G2
const CLEFS = {
  Cantus: { bottom: 4 * 7 + 2, glyph: '𝄞', flat: 4 * 7 + 6 },
  Altus: { bottom: 4 * 7 + 2, glyph: '𝄞', flat: 4 * 7 + 6 },
  Tenor: { bottom: 3 * 7 + 2, glyph: '𝄞', eight: true, flat: 3 * 7 + 6 },
  Bassus: { bottom: 2 * 7 + 4, glyph: '𝄢', flat: 2 * 7 + 6 },
};

const staffTop = (v) => TOP + v * (STAFF_H + STAFF_GAP);
const yOf = (v, diat) => staffTop(v) + STAFF_H - (diat - CLEFS[VOICES[v]].bottom) * (LINE / 2);

function head(g, x, y, filled, breve) {
  el('ellipse', { cx: x, cy: y, rx: 5.6, ry: 4.1, transform: `rotate(-20 ${x} ${y})`, fill: filled ? 'currentColor' : 'none', stroke: 'currentColor', 'stroke-width': filled ? 0 : 1.7 }, g);
  if (breve) for (const dx of [-8, 8]) el('path', { d: `M ${x + dx} ${y - 6} V ${y + 6} M ${x + dx + (dx < 0 ? 2.4 : -2.4)} ${y - 6} V ${y + 6}`, stroke: 'currentColor', 'stroke-width': 1.2 }, g);
}

function rest(g, v, x, val) {
  const top = staffTop(v);
  if (val.base === 'Br') el('rect', { x: x - 3, y: top + LINE, width: 6, height: LINE, fill: 'currentColor' }, g);
  else if (val.base === 'Sb') el('rect', { x: x - 5, y: top + LINE, width: 10, height: 4, fill: 'currentColor' }, g);
  else if (val.base === 'Mn') el('rect', { x: x - 5, y: top + 2 * LINE - 4, width: 10, height: 4, fill: 'currentColor' }, g);
  else el('path', { d: `M ${x - 2} ${top + LINE} l 5 6 l -5 5 l 5 6 l -6 -2 l 3 6`, fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, g);
}

/**
 * Draw the settings into an <svg>. Returns column positions for highlighting:
 * [{ x, phrase, event }] in playing order.
 */
export function drawScore(svg, settings, tone) {
  svg.replaceChildren();
  const mollis = TONES[tone].mollis;
  const cols = [];
  let x = LEFT + (mollis ? 14 : 0) + 18;
  // Lay out x positions first
  settings.forEach((s, pi) => {
    s.events.forEach((e, ei) => {
      const w = Math.max(30, 14 + e.minims * 15) + (e.value.dotted ? 6 : 0);
      cols.push({ x: x + 10, w, phrase: pi, event: ei, e });
      x += w;
    });
    cols.push({ bar: true, x: x + 4 });
    x += 16;
  });
  const width = x + 14;
  const height = TOP + VOICES.length * (STAFF_H + STAFF_GAP) + 8;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);

  const hi = el('g', { class: 'highlights' }, svg);
  for (const c of cols.filter((c) => !c.bar)) {
    c.node = el('rect', { x: c.x - c.w / 2 + 2, y: TOP - 18, width: c.w - 4, height: height - TOP + 10, rx: 4, class: 'col' }, hi);
  }

  VOICES.forEach((voice, v) => {
    const g = el('g', { class: 'staff' }, svg);
    const top = staffTop(v), clef = CLEFS[voice];
    for (let i = 0; i < 5; i++) el('line', { x1: LEFT - 30, x2: width - 8, y1: top + i * LINE, y2: top + i * LINE, class: 'line' }, g);
    el('text', { x: 6, y: top + STAFF_H / 2 + 4, class: 'voice' }, g).textContent = voice;
    el('text', { x: LEFT - 28, y: top + (clef.glyph === '𝄢' ? LINE * 1.6 : LINE * 3.4), class: 'clef' }, g).textContent = clef.glyph;
    if (clef.eight) el('text', { x: LEFT - 18, y: top + STAFF_H + 15, class: 'eight' }, g).textContent = '8';
    if (mollis) el('text', { x: LEFT + 2, y: yOf(v, clef.flat) + 4, class: 'acc' }, g).textContent = '♭';
    for (const c of cols) {
      if (c.bar) { el('line', { x1: c.x, x2: c.x, y1: top, y2: top + STAFF_H, class: 'bar' }, g); continue; }
      const { e } = c;
      if (e.rest) { rest(g, v, c.x, e.value); continue; }
      const p = e.pitches[v];
      const diat = p.octave * 7 + STEP_IDX[p.step];
      const y = yOf(v, diat);
      // Ledger lines
      for (let d = clef.bottom - 2; d >= diat; d -= 2) el('line', { x1: c.x - 9, x2: c.x + 9, y1: yOf(v, d), y2: yOf(v, d), class: 'line' }, g);
      for (let d = clef.bottom + 10; d <= diat; d += 2) el('line', { x1: c.x - 9, x2: c.x + 9, y1: yOf(v, d), y2: yOf(v, d), class: 'line' }, g);
      // Accidental against the signature
      const sig = mollis && p.step === 'B' ? -1 : 0;
      if (p.alter !== sig) el('text', { x: c.x - 17, y: y + 4, class: 'acc' }, g).textContent = p.alter === 1 ? '♯' : p.alter === -1 ? '♭' : '♮';
      const val = e.value, filled = val.base === 'Sm' || val.base === 'Fs';
      head(g, c.x, y, filled, val.base === 'Br' || val.base === 'Lg');
      if (val.dotted) el('circle', { cx: c.x + 10, cy: y - ((diat - clef.bottom) % 2 === 0 ? LINE / 2 : 0), r: 1.8, fill: 'currentColor' }, g);
      if (val.base === 'Mn' || filled) {
        const up = diat < clef.bottom + 4;
        const sx = up ? c.x + 5.2 : c.x - 5.2, sy = up ? y - 30 : y + 30;
        el('line', { x1: sx, x2: sx, y1: y, y2: sy, stroke: 'currentColor', 'stroke-width': 1.3 }, g);
        if (val.base === 'Fs') el('path', { d: up ? `M ${sx} ${sy} q 9 7 5 17` : `M ${sx} ${sy} q 9 -7 5 -17`, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6 }, g);
      }
    }
  });

  // Text underlay below the bassus
  const ly = TOP + VOICES.length * (STAFF_H + STAFF_GAP) - 12;
  for (const c of cols) if (!c.bar && c.e.syllable) el('text', { x: c.x, y: ly, class: 'lyric' }, svg).textContent = c.e.syllable;
  return cols.filter((c) => !c.bar);
}

// Side-on tiltyard, painted in the manner of the 1511 Roll (imagegen art, cut out by
// execution/prepare_tilt_art.py). Knights are painted sprites; the code moves them.
import { art } from './art/meta.mjs';

const NS = 'http://www.w3.org/2000/svg';
const INK = '#2b2117';
const ART = new URL('./art/', import.meta.url).href;

export function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.append(n);
  return n;
}

/** Every image the game shows, so the page can fetch them before the first charge. */
export function artUrls(ids) {
  return ['backdrop', ...ids.flatMap((id) => ['k', 'h', 'r'].map((t) => `${t}-${id}`)),
    ...ids.filter((id) => id !== 'player').map((id) => `c-${id}`)].map((n) => `${ART}${n}.webp`);
}

export const MEET = 3.0; // seconds from the trumpet to the strike
const NEAR = { start: -300, atMeet: 580, y: 634, h: 300, dir: 1 };
const FAR = { start: 1900, atMeet: 760, y: 478, h: 234, dir: -1 }; // hooves hidden behind the tilt

// One painted knight: the full painting, and for a fall the riderless horse plus the rider alone.
function knight(parent, id, h, clipId) {
  const m = art.knights[id], w = h * m.aspect;
  const box = { x: -w / 2, y: -h, width: w, height: h };
  const g = el('g', {}, parent);
  const horse = el('image', { href: `${ART}h-${id}.webp`, ...box, visibility: 'hidden' }, g);
  const whole = el('image', { href: `${ART}k-${id}.webp`, ...box }, g);
  const riderG = el('g', { visibility: 'hidden' }, g);
  const rider = el('image', { href: `${ART}r-${id}.webp`, ...box }, riderG);
  const tipMark = el('circle', { cx: -w / 2 + m.tip[0] * w, cy: -h + m.tip[1] * h, r: 0.1, fill: 'none' }, g);
  // After a break, everything ahead of the horse's nose (the lance) is clipped away.
  const noseX = -w / 2 + m.nose * w, facingRight = m.tip[0] > 0.5;
  const clip = el('clipPath', { id: clipId, clipPathUnits: 'userSpaceOnUse' }, g);
  el('rect', facingRight ? { x: -w, y: -2 * h, width: w + noseX + 10, height: 3 * h } : { x: noseX - 10, y: -2 * h, width: 2 * w, height: 3 * h }, clip);
  return {
    g, horse, whole, riderG, tipMark, h,
    pivot: [-w / 2 + m.seat[0] * w, -h * 0.45],
    broken() { whole.setAttribute('clip-path', `url(#${clipId})`); rider.setAttribute('clip-path', `url(#${clipId})`); },
    fall() { whole.setAttribute('visibility', 'hidden'); horse.setAttribute('visibility', 'visible'); riderG.setAttribute('visibility', 'visible'); },
  };
}

function backdrop(svg) {
  const img = el('image', { href: `${ART}backdrop.webp`, x: 0, y: 0, width: 1600, height: 640, preserveAspectRatio: 'xMidYMid slice' }, svg);
  img.append(Object.assign(el('title'), { textContent: 'The queen’s pavilion, hung with H and K, at the Westminster tilt.' }));
  // John Blanke, painted after the Roll: a Black trumpeter in a green turban latticed with gold
  const blanke = el('rect', { x: 403, y: 192, width: 142, height: 202, fill: 'transparent', 'pointer-events': 'all' }, svg);
  blanke.append(Object.assign(el('title'), { textContent: 'John Blanke, a royal trumpeter at Henry’s court. The Roll paints him twice, in a turban.' }));
  return img;
}

// The same painting again, clipped to the barrier, so the far rider passes behind the tilt.
function tiltInFront(svg) {
  const [top, bottom] = art.barrier;
  const clip = el('clipPath', { id: 'tilt-front' }, svg);
  el('rect', { x: 0, y: top - 2, width: 1600, height: bottom - top + 4 }, clip);
  el('image', { href: `${ART}backdrop.webp`, x: 0, y: 0, width: 1600, height: 640, preserveAspectRatio: 'xMidYMid slice', 'clip-path': 'url(#tilt-front)' }, svg);
}

export function createScene(svg, foeId) {
  svg.replaceChildren();
  // On a phone CSS gives the svg a 900x640 box and the aim panel covers its right half,
  // so the view is cropped to put the meeting (x 580-760) in the open left half.
  const narrow = matchMedia('(max-width: 600px)').matches;
  svg.setAttribute('viewBox', narrow ? '440 0 900 640' : '0 0 1600 640');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  backdrop(svg);
  const far = knight(svg, foeId, FAR.h, 'clip-far');
  tiltInFront(svg);
  const near = knight(svg, 'player', NEAR.h, 'clip-near');
  const fx = el('g', {}, svg);
  const riders = [
    { k: near, lane: NEAR, fall: 0, color: '#e9dfc8' },
    { k: far, lane: FAR, fall: 0, color: '#efe6d2' },
  ];
  let splinters = [];

  function xAt(lane, t) {
    const D = Math.abs(lane.atMeet - lane.start), u = Math.min(t / MEET, 1);
    const x = D * (0.55 * u + 0.45 * u * u);
    const over = t > MEET ? (D * 1.45 / MEET) * (t - MEET) : 0;
    return lane.start + lane.dir * (x + over);
  }

  function pose(t) {
    for (const r of riders) {
      const { k, lane } = r;
      const phase = 2 * Math.PI * 2.1 * t + (lane.dir > 0 ? 0 : 1.3);
      const bob = t > 0 ? 5 * Math.sin(phase) : 0, rock = t > 0 ? 1.6 * Math.sin(phase + 0.8) : 0;
      k.g.setAttribute('transform', `translate(${xAt(lane, t)} ${lane.y + bob}) rotate(${rock} 0 ${-k.h * 0.3})`);
      if (r.fall) {
        const f = Math.min(1, (t - r.fall) / 0.7), back = -lane.dir;
        const [px, py] = k.pivot;
        k.riderG.setAttribute('transform', `translate(${back * 150 * f} ${170 * f * f}) rotate(${back * 85 * f} ${px} ${py})`);
      }
    }
  }

  function tipWorld(k) {
    const p = new DOMPoint(Number(k.tipMark.getAttribute('cx')), Number(k.tipMark.getAttribute('cy')));
    return p.matrixTransform(k.tipMark.getCTM()).matrixTransform(svg.getCTM().inverse());
  }

  function shatter(which) {
    const r = which === 'you' ? riders[0] : riders[1];
    const p = tipWorld(r.k);
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 260;
      splinters.push({
        x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 140, life: 1,
        node: el('line', { stroke: i % 3 ? r.color : INK, 'stroke-width': i % 3 ? 4 : 2, 'stroke-linecap': 'round' }, fx),
      });
    }
    r.k.broken();
  }

  function step(dt) {
    splinters = splinters.filter((s) => {
      s.life -= dt * 0.9; s.vy += 520 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      s.node.setAttribute('x1', s.x); s.node.setAttribute('y1', s.y);
      s.node.setAttribute('x2', s.x - s.vx * 0.03); s.node.setAttribute('y2', s.y - s.vy * 0.03);
      s.node.setAttribute('opacity', Math.max(0, s.life));
      if (s.life <= 0) { s.node.remove(); return false; }
      return true;
    });
  }

  function unhorse(which, t) {
    const r = which === 'you' ? riders[0] : riders[1];
    r.fall = t; r.k.fall();
  }

  pose(0);
  return { pose, step, shatter, unhorse };
}

/**
 * Close view of the opponent for aiming. The painting is placed so its helm, body,
 * waist and barrier fall in the rules.ZONES bands (helm 34–96, body 96–172,
 * saddle 172–200, tilt 200+).
 */
export function createAimView(svg, foeId) {
  svg.replaceChildren();
  svg.setAttribute('viewBox', '0 0 400 260');
  el('rect', { width: 400, height: 260, fill: '#efe4c8' }, svg);
  el('image', { href: `${ART}c-${foeId}.webp`, x: -2.5, y: -10, width: 405, height: 270 }, svg);
  const guide = el('g', { class: 'zone-guide' }, svg);
  el('rect', { x: 312, y: 30, width: 86, height: 228, rx: 3, fill: '#f4ecd8', opacity: 0.72 }, guide);
  for (const [y0, y1, label] of [[34, 96, 'HELM +2'], [96, 172, 'BODY +1'], [172, 200, 'SADDLE −1'], [200, 260, 'TILT −2']]) {
    el('path', { d: `M 318 ${y0 + 2} V ${y1 - 2}`, stroke: INK, 'stroke-width': 1.5, opacity: 0.6 }, guide);
    el('text', { x: 324, y: (y0 + y1) / 2 + 4, 'font-size': 10, 'font-family': 'ui-monospace, monospace', fill: INK }, guide).textContent = label;
  }
  const tip = el('g', {}, svg);
  el('circle', { r: 16, fill: 'rgba(244,236,216,.25)', stroke: '#8c2f22', 'stroke-width': 3 }, tip);
  el('path', { d: 'M -8 -6 l 8 6 l -8 6 M 0 -9 l 8 9 l -8 9', fill: 'none', stroke: '#8c2f22', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, tip);
  return {
    setTip(y) { tip.setAttribute('transform', `translate(200 ${y})`); },
  };
}

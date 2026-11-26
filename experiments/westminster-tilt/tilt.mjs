import {
  challengers, COURSES, AIM_HEIGHT, strike, record, newRider, verdict, chequeMarks, gallopBob, opponentAim, describe,
} from './rules.mjs';
import { createScene, createAimView, MEET, el, artUrls } from './scene.mjs';

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const AIM_OPEN = MEET - 1.8; // the close view opens for the last stretch of the charge
const END = MEET + 1.6;

let foe, scene, aimView, you, them, course, t0, raf, phase, aimY = 140, keyDir = 0, bobPhase = 0, resolved, frozenTip;

// Opponent cards
for (const c of challengers) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'card';
  b.style.setProperty('--cloth', c.colors.cloth);
  b.style.setProperty('--trim', c.colors.trim);
  b.innerHTML = `<img class="portrait" src="art/c-${c.id}.webp" alt="" width="160" height="107"><span class="motto">${c.motto}</span><span class="eng">“${c.english}”</span><span class="who">${c.name}</span><span class="note">${c.note}</span>`;
  b.addEventListener('click', () => startBout(c));
  $('cards').append(b);
}

const touch = matchMedia('(pointer: coarse)').matches;
const steerHint = touch ? 'Drag up and down to steer' : 'Hold ↑ ↓ or move the mouse to steer';
let briefed = false, countTimer;

function startBout(c) {
  foe = c;
  you = newRider(); them = newRider(); course = 0;
  $('choose').hidden = true; $('verdict').hidden = true;
  drawCheque();
  if (briefed) startCourse();
  else { $('brief').hidden = false; $('ready').focus(); }
}

$('ready').addEventListener('click', () => { briefed = true; $('brief').hidden = true; startCourse(); });

function startCourse() {
  course += 1;
  scene = createScene($('scene'), foe.id);
  aimView = createAimView($('aim-view'), foe.id);
  scene.pose(0);
  $('course-card').hidden = true;
  $('aim-label').textContent = `${touch ? 'Drag up / down' : '↑ ↓ or mouse'} · put the red ring on his helm`;
  aimY = 140; // every course starts with the tip at mid-body
  banner(`Course ${course} of ${COURSES}`);
  // On a phone the Ready/Next buttons sit below the scene; bring the scene back into view
  const top = stage.getBoundingClientRect().top;
  if (top < 0 || top > innerHeight * 0.4) stage.scrollIntoView({ block: 'start', behavior: 'smooth' });
  countdown(['3', '2', '1'], charge);
}

// 3 · 2 · 1, then the trumpet
function countdown(steps, done) {
  const box = $('countdown');
  clearTimeout(countTimer);
  const show = (i) => {
    if (i === steps.length) { box.hidden = true; done(); return; }
    box.innerHTML = `<div>${steps[i]}<small>${steerHint} the red ring</small></div>`;
    box.hidden = false;
    box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
    countTimer = setTimeout(() => show(i + 1), 700);
  };
  show(0);
}

function charge() {
  phase = 'charge'; resolved = false; frozenTip = null;
  bobPhase = Math.random() * Math.PI * 2;
  banner(`Course ${course} of ${COURSES} · Charge!`);
  t0 = performance.now();
  let last = t0;
  cancelAnimationFrame(raf);
  const frame = (now) => {
    const t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    tick(t, dt);
    if (t < END) raf = requestAnimationFrame(frame); else finishCourse();
  };
  raf = requestAnimationFrame(frame);
}

function tipAt(t) { return aimY + gallopBob(t, bobPhase); }

function tick(t, dt) {
  aimY = Math.max(0, Math.min(AIM_HEIGHT, aimY + keyDir * 220 * dt));
  scene.pose(t);
  scene.step(dt);
  const aim = $('aim');
  if (t >= AIM_OPEN && t < MEET + 0.9) {
    if (aim.hidden) { aim.hidden = false; banner(''); }
    const grow = Math.min(1, (t - AIM_OPEN) / (MEET - AIM_OPEN));
    aim.style.setProperty('--grow', (0.82 + 0.18 * grow).toFixed(3));
    aimView.setTip(frozenTip ?? tipAt(t));
  } else if (!aim.hidden) aim.hidden = true;
  if (t >= MEET && !resolved) resolve(t);
}

function resolve(t) {
  resolved = true;
  frozenTip = tipAt(t);
  const mine = strike(frozenTip);
  const theirs = strike(opponentAim(foe));
  record(you, mine); record(them, theirs);
  if (mine.broken && mine.zone !== 'saddle') scene.shatter('you');
  if (theirs.broken && theirs.zone !== 'saddle') scene.shatter('them');
  if (mine.zone === 'saddle') scene.shatter('you');
  if (theirs.zone === 'saddle') scene.shatter('them');
  if (mine.unhorsed) scene.unhorse('them', t);
  if (theirs.unhorsed) scene.unhorse('you', t);
  banner(describe(mine));
  drawCheque();
}

const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');

function finishCourse() {
  const mine = you.courses.at(-1), theirs = them.courses.at(-1);
  const ended = course >= COURSES || mine.unhorsed || theirs.unhorsed;
  $('course-title').textContent = `Course ${course} of ${COURSES}`;
  $('course-you').innerHTML = `<b>You:</b> ${describe(mine)} (${signed(mine.points)})`;
  $('course-them').innerHTML = `<b>${foe.motto}:</b> ${describe(theirs)} (${signed(theirs.points)})`;
  $('next').textContent = ended ? 'Hear the verdict' : 'Next course';
  $('next').onclick = ended ? showVerdict : startCourse;
  $('course-card').hidden = false;
  $('next').focus();
  banner('');
}

function showVerdict() {
  const v = verdict(you, them);
  $('course-card').hidden = true;
  $('verdict-title').textContent = v.winner === 'you'
    ? (foe.id === 'henry' ? 'You have bested the king.' : `You win the prize against ${foe.motto}.`)
    : v.winner === 'them' ? `${foe.motto} takes the prize.` : 'Honours even.';
  const note = foe.id === 'henry' && v.winner === 'you' ? ' The Roll would not have painted it that way.' : '';
  $('verdict-reason').textContent = v.reason + note;
  $('verdict-score').textContent = `Spears: you ${signed(you.score)} · ${foe.motto} ${signed(them.score)}`;
  $('verdict').hidden = false;
  $('again').focus();
}

function banner(text) { $('banner').textContent = text; $('banner').hidden = !text; }

// The herald’s cheque
function drawCheque() {
  const svg = $('cheque');
  svg.replaceChildren();
  svg.setAttribute('viewBox', '0 0 520 250');
  const ink = '#3a2614';
  const block = (x, title, rider) => {
    el('text', { x: x + 110, y: 30, 'text-anchor': 'middle', class: 'cheque-name' }, svg).textContent = title;
    el('rect', { x, y: 46, width: 220, height: 180, fill: 'none', stroke: ink, 'stroke-width': 1.6 }, svg);
    const lines = [96, 136, 186];
    lines.forEach((y) => el('line', { x1: x, y1: y, x2: x + 220, y2: y, stroke: ink, 'stroke-width': 1.4 }, svg));
    if (!rider) return;
    const m = chequeMarks(rider);
    const strokes = (n, y0, y1) => {
      for (let i = 0; i < n; i++) {
        const sx = x + 26 + i * 20;
        el('line', { x1: sx, y1: y0, x2: sx + 3, y2: y1, stroke: ink, 'stroke-width': 3, 'stroke-linecap': 'round', class: 'stroke' }, svg);
      }
    };
    strokes(m.aboveTop, 70, 96);
    strokes(m.belowTop, 96, 122);
    strokes(m.middle, 124, 148);
    strokes(m.bottom, 174, 198);
  };
  block(20, foe ? foe.motto : 'Challenger', them);
  block(280, 'The Answerer (you)', you);
}

// Input: pointer position or drag sets the aim; keys nudge it.
function aimFromPointer(e) {
  const r = $('aim-view').getBoundingClientRect();
  if (!r.height) return;
  aimY = Math.max(0, Math.min(AIM_HEIGHT, ((e.clientY - r.top) / r.height) * AIM_HEIGHT));
}
let dragFrom = null;
stage.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse') aimFromPointer(e);
  else if (dragFrom) {
    const r = $('aim-view').getBoundingClientRect();
    aimY = Math.max(0, Math.min(AIM_HEIGHT, dragFrom.aim + ((e.clientY - dragFrom.y) / (r.height || 260)) * AIM_HEIGHT));
  }
});
stage.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse' && !e.target.closest('button')) dragFrom = { y: e.clientY, aim: aimY };
});
for (const ev of ['pointerup', 'pointercancel']) stage.addEventListener(ev, () => { dragFrom = null; });
stage.addEventListener('touchmove', (e) => { if (dragFrom) e.preventDefault(); }, { passive: false });
addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') { keyDir = -1; e.preventDefault(); }
  if (e.key === 'ArrowDown') { keyDir = 1; e.preventDefault(); }
});
addEventListener('keyup', (e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') keyDir = 0; });

$('again').addEventListener('click', () => startBout(foe));
$('other').addEventListener('click', () => { $('verdict').hidden = true; $('choose').hidden = false; });

// Idle scene behind the chooser
// Fetch the paintings up front so the first charge doesn't pop in
const preloaded = artUrls(['player', ...challengers.map((c) => c.id)]).map((src) => Object.assign(new Image(), { src }));
scene = createScene($('scene'), challengers[0].id);
drawCheque();
banner('');

// Longitude, 1714 — the page: helm, noon reports, chart, saving and the two voyages.
import * as E from './engine.mjs';
import { setLand, drawChart } from './chart.mjs';

const $ = (id) => document.getElementById(id);
const KEY = 'zpl-longitude-v1';
const NS = 'http://www.w3.org/2000/svg';

let land, voyages, places;
let game;          // { daily, number, voyage, seed, clock, orders, state, first }
let heading = 0;
let peek = false;  // ending dismissed to look at the chart

// --- Saving ------------------------------------------------------------------
function loadSaved() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function save() {
  if (!game.daily) return;
  try {
    const all = loadSaved();
    const key = E.dateKey(new Date(game.dateMs));
    const rec = all[key]?.v === game.voyage.id ? all[key] : { v: game.voyage.id };
    rec[game.clock ? 'clock' : 'y1714'] = game.orders;
    all[key] = rec;
    for (const k of Object.keys(all).sort().slice(0, -30)) delete all[k];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* private mode: play on without saving */ }
}

// --- Starting voyages -----------------------------------------------------------
function startDaily(date = new Date()) {
  const { voyage, seed, number } = E.dailyVoyage(voyages, date);
  const rec = loadSaved()[E.dateKey(date)];
  const o1714 = rec?.v === voyage.id ? rec.y1714 || [] : [];
  const first = E.replay(voyage, seed, o1714, land, places);
  game = { daily: true, dateMs: date.getTime(), number, voyage, seed, clock: false, orders: o1714, state: first, first: null };
  if (first.status !== 'sailing' && rec?.clock) {
    game = { ...game, clock: true, orders: rec.clock, first, state: E.replay(voyage, seed, rec.clock, land, places, { clock: true }) };
  }
  begin();
}
function startPractice() {
  const pool = voyages.filter((v) => v.id !== game.voyage.id);
  const voyage = pool[Math.floor(Math.random() * pool.length)];
  const seed = (Math.random() * 2 ** 32) >>> 0;
  game = { daily: false, number: null, voyage, seed, clock: false, orders: [], state: E.newVoyage(voyage, seed), first: null };
  begin();
}
function startClock() {
  game = { ...game, clock: true, orders: [], first: game.state, state: E.newVoyage(game.voyage, game.seed, { clock: true }) };
  save();
  begin();
}
function begin() {
  peek = false;
  heading = Math.round(E.rhumb(game.state.dr, game.voyage.dest).course);
  if (game.orders.length) heading = game.orders.at(-1).heading;
  setNight(game.orders.at(-1)?.heaveTo ?? false);
  render();
}

// --- Sailing ------------------------------------------------------------------
const heaveTo = () => document.querySelector('input[name="night"]:checked').value === 'heave';
const setNight = (heave) => { document.querySelector(`input[name="night"][value="${heave ? 'heave' : 'sail'}"]`).checked = true; };
function sail(days) {
  for (let i = 0; i < days && game.state.status === 'sailing'; i++) {
    const order = { heading, heaveTo: heaveTo() };
    game.orders = [...game.orders, order];
    game.state = E.sailDay(game.state, land, places, order);
    if (game.state.log.at(-1).event) break;
  }
  save();
  render();
  if (game.state.status !== 'sailing') $('ending').focus?.();
}

// --- Compass ------------------------------------------------------------------
function el(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  parent.append(n);
  return n;
}
function buildCompass() {
  const svg = $('compass');
  el('circle', { r: 104, class: 'rim' }, svg);
  el('circle', { r: 92, class: 'face' }, svg);
  for (let i = 0; i < 32; i++) {
    const a = (i * 11.25 * Math.PI) / 180, major = i % 8 === 0, mid = i % 4 === 0;
    const r1 = 92, r2 = major ? 74 : mid ? 80 : 86;
    el('line', { x1: Math.sin(a) * r1, y1: -Math.cos(a) * r1, x2: Math.sin(a) * r2, y2: -Math.cos(a) * r2, class: major ? 'tick major' : 'tick' }, svg);
  }
  ['N', 'E', 'S', 'W'].forEach((t, i) => {
    const a = (i * 90 * Math.PI) / 180;
    el('text', { x: Math.sin(a) * 60, y: -Math.cos(a) * 60 + 7, class: 'cardinal' }, svg).textContent = t;
  });
  el('circle', { r: 5, class: 'dest-dot', id: 'c-dest' }, svg);
  const needle = el('g', { id: 'needle' }, svg);
  el('path', { d: 'M 0 -88 L 9 -10 L 0 4 L -9 -10 Z', class: 'needle' }, needle);
  el('path', { d: 'M 0 4 L 6 0 L 0 34 L -6 0 Z', class: 'needle-tail' }, needle);
  el('circle', { r: 5, class: 'hub' }, svg);

  const setFromPointer = (ev) => {
    const r = svg.getBoundingClientRect();
    const dx = ev.clientX - (r.left + r.width / 2), dy = ev.clientY - (r.top + r.height / 2);
    setHeading(Math.round((Math.atan2(dx, -dy) * 180) / Math.PI));
  };
  svg.addEventListener('pointerdown', (ev) => {
    if (game.state.status !== 'sailing') return;
    svg.setPointerCapture(ev.pointerId);
    setFromPointer(ev);
    svg.onpointermove = setFromPointer;
  });
  const stop = () => { svg.onpointermove = null; };
  svg.addEventListener('pointerup', stop);
  svg.addEventListener('pointercancel', stop);
  svg.addEventListener('keydown', (ev) => {
    if (game.state.status !== 'sailing') return;
    if (ev.key === 'Home') { ev.preventDefault(); setHeading(0); return; }
    if (ev.key === 'End') { ev.preventDefault(); setHeading(359); return; }
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 15, PageDown: -15 }[ev.key];
    if (step == null) return;
    ev.preventDefault();
    setHeading(heading + step * (ev.shiftKey ? 10 : 1));
  });
}
function setHeading(deg) {
  heading = ((Math.round(deg) % 360) + 360) % 360;
  renderHelm();
  renderChart();
}

// --- Rendering -------------------------------------------------------------------
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const miles = (n) => { const r = Math.round(n); return `${r.toLocaleString('en')} mile${r === 1 ? '' : 's'}`; };
const placeName = (p) => p.replace(/^the /, 'the ');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function renderHelm() {
  const s = game.state, v = game.voyage;
  $('heading-text').textContent = `${E.pointName(heading)} · ${String(heading).padStart(3, '0')}°`;
  $('compass').setAttribute('aria-valuenow', heading);
  $('compass').setAttribute('aria-valuetext', `${E.pointName(heading)}, ${heading} degrees`);
  $('needle').setAttribute('transform', `rotate(${heading})`);
  const { course, dist } = E.rhumb(s.dr, v.dest);
  const a = (course * Math.PI) / 180;
  $('c-dest').setAttribute('cx', Math.sin(a) * 98);
  $('c-dest').setAttribute('cy', -Math.cos(a) * 98);
  $('bearing').innerHTML = `${cap(v.to)} lies <b>${E.pointName(course)} · ${Math.round(course)}°</b>, ${miles(dist)} from your reckoning <span class="muted">(red dot)</span>.`;
  const reach = 180 + 2 * s.sdLon + v.sight;
  $('near').hidden = !(s.status === 'sailing' && s.day > 0 && (dist < reach || E.landDistance(land, s.dr) < 180 + 2 * s.sdLon));
}

function renderReport() {
  const s = game.state, last = s.log.at(-1);
  if (!last) {
    $('r-log').textContent = `Taking departure off ${game.voyage.from}. Set a course and sail.`;
    $('r-sun').textContent = 'At noon the sun gives your latitude, unless it is overcast.';
  } else {
    const kn = (last.loggedNm / (last.hours || 24)).toFixed(1);
    const endedToday = s.status !== 'sailing' && s.status !== 'thirst';
    $('r-log').innerHTML = last.event
      ? `<b>Land ho! ${cap(placeName(last.event.place))}.</b> You know the coast, so you know exactly where you are. The ship lies off for the rest of the day: steer clear of it.`
      : `Log line: <b>${last.loggedNm} miles</b> since yesterday noon, about ${kn} knots${last.heaveTo ? ' (hove to at night)' : ''}.`;
    if (endedToday) { $('r-sun').textContent = 'The voyage ended before noon.'; }
    else $('r-sun').innerHTML = last.event ? 'Position fixed by the land.'
      : last.cloudy ? '<b>Overcast.</b> No sun sight today; your latitude is reckoned too.'
      : `Noon sun: latitude <b>${E.fmtLat(last.sight)}</b>.`;
  }
  const clockRow = $('clock-row');
  clockRow.classList.toggle('on', game.clock);
  if (!game.clock) {
    $('r-clock').textContent = 'No clock can yet keep time at sea. Finish this voyage to sail it again with Harrison’s.';
  } else if (!last) {
    $('r-clock').textContent = 'Harrison’s clock keeps Greenwich time. At local noon, every 4 minutes it reads past 12:00 is one degree west.';
  } else if (last.clockLon != null) {
    $('r-clock').innerHTML = `Local noon came at <b>${E.clockAtNoon(last.clockLon)}</b> Greenwich time: longitude <b>${E.fmtLon(last.clockLon)}</b>.`;
  } else {
    const done = game.state.status !== 'sailing' && game.state.status !== 'thirst';
    $('r-clock').textContent = done ? 'The voyage ended before noon.' : last.event ? 'Not needed today.'
      : 'No sun, so no moment of noon to read the clock against.';
  }
}

function renderLog() {
  $('logrows').replaceChildren(...game.state.log.map((e) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${e.day}</td><td>${E.pointName(e.heading)}</td><td>${e.loggedNm}</td><td>${e.event ? `Land: ${placeName(e.event.place)}` : e.sight != null ? E.fmtLat(e.sight) : '—'}</td>`;
    return tr;
  }).reverse());
}

function renderChart() {
  const svg = $('chart');
  const r = svg.getBoundingClientRect();
  const reveal = game.state.status !== 'sailing';
  drawChart(svg, {
    voyage: game.voyage, state: game.state, heading,
    aspect: r.width && r.height ? r.width / r.height : 4 / 3,
    reveal, ghost: reveal && game.first ? game.first.trueTrack : null,
  });
  document.querySelector('.k-true-wrap').hidden = !reveal;
}

function outcome(s) {
  const err = s.ending?.errorNm ?? 0;
  switch (s.status) {
    case 'arrived': return { icon: '🏝️', kicker: 'Land ho!', title: `${cap(s.ending.place)} in ${plural(s.day, 'day')}`, short: `landfall in ${plural(s.day, 'day')}`, text: `Your reckoning was ${miles(err)} out when the island came up.` };
    case 'wrecked': return { icon: '🪨', kicker: 'Wrecked', title: `On ${placeName(s.ending.place)}, day ${s.day}`, short: `wrecked on day ${s.day}`, text: `She struck in the dark. Your reckoning put you ${miles(err)} from where you really were.` };
    case 'thirst': return { icon: '💧', kicker: 'The water ran out', title: `Day ${s.day}, no land in sight`, short: `water gone on day ${s.day}`, text: `Your reckoning was ${miles(err)} from where the ship really was.` };
    default: return { icon: '🌊', kicker: 'Off the chart', title: `Lost on day ${s.day}`, short: `lost on day ${s.day}`, text: 'The ship sailed off the edge of the known chart.' };
  }
}

function renderEnding() {
  const s = game.state;
  const over = s.status !== 'sailing';
  $('ending').hidden = !over || peek;
  $('show-result').hidden = !over || !peek;
  if (!over) return;
  const o = outcome(s);
  $('end-kicker').textContent = (game.clock ? 'With Harrison’s clock · ' : '') + o.kicker;
  $('end-title').textContent = o.title;
  $('end-text').textContent = o.text + (game.clock ? '' : ' The gold line is where the ship really went.');
  const cmp = $('compare');
  cmp.hidden = !game.first;
  if (game.first) {
    const a = outcome(game.first);
    cmp.innerHTML = `<div><span class="label">1714 · reckoning</span><b>${a.icon} ${cap(a.short)}</b></div><div><span class="label">1764 · with the clock</span><b>${o.icon} ${cap(o.short)}</b></div><p class="muted">Faint line: where your first voyage really went.</p>`;
  }
  $('again-clock').hidden = game.clock;
}

function render() {
  const s = game.state, v = game.voyage;
  $('kicker').textContent = game.daily ? `Voyage No. ${game.number} · ${new Date(game.dateMs).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}` : 'Practice voyage';
  $('from').textContent = v.from;
  $('to').textContent = v.to;
  $('story').textContent = v.story;
  $('day').textContent = s.day;
  $('water').textContent = Math.max(0, s.water);
  $('mode').textContent = game.clock ? 'Clock' : '1714';
  const sailing = s.status === 'sailing';
  for (const b of document.querySelectorAll('#sail, #sail3, #steer-dest, .nudge button')) b.disabled = !sailing;
  document.querySelector('.panel').classList.toggle('done', !sailing);
  $('compass').setAttribute('aria-disabled', String(!sailing));
  $('compass').tabIndex = sailing ? 0 : -1;
  renderHelm();
  renderReport();
  renderLog();
  renderChart();
  renderEnding();
}

function shareText() {
  const lines = [`Longitude, 1714 · ${game.daily ? `Voyage No. ${game.number}` : 'Practice'}`, `${game.voyage.from} → ${game.voyage.to}`];
  const first = game.first || (game.clock ? null : game.state);
  if (first) { const o = outcome(first); lines.push(`⚓ By reckoning: ${o.icon} ${o.short}`); }
  if (game.clock && game.state.status !== 'sailing') { const o = outcome(game.state); lines.push(`⌚ With the clock: ${o.icon} ${o.short}`); }
  lines.push('zeropagelabs.com/experiments/longitude/');
  return lines.join('\n');
}

// --- Wiring ------------------------------------------------------------------------
function wire() {
  buildCompass();
  $('sail').addEventListener('click', () => sail(1));
  $('sail3').addEventListener('click', () => sail(3));
  $('steer-dest').addEventListener('click', () => setHeading(E.rhumb(game.state.dr, game.voyage.dest).course));
  for (const b of document.querySelectorAll('.nudge button')) b.addEventListener('click', () => setHeading(heading + Number(b.dataset.turn)));
  $('again-clock').addEventListener('click', startClock);
  $('practice').addEventListener('click', startPractice);
  $('see-chart').addEventListener('click', () => { peek = true; renderEnding(); });
  $('show-result').addEventListener('click', () => { peek = false; renderEnding(); });
  $('share').addEventListener('click', async () => {
    const text = shareText();
    try { await navigator.clipboard.writeText(text); $('share').textContent = 'Copied'; }
    catch { window.prompt('Copy your result', text); }
    setTimeout(() => { $('share').textContent = 'Copy result'; }, 1600);
  });
  new ResizeObserver(() => game && renderChart()).observe($('chart'));
  // A new day starts a new voyage if the page is left open past midnight.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && game?.daily && E.dateKey(new Date()) !== E.dateKey(new Date(game.dateMs))) startDaily();
  });
}

async function main() {
  try {
    const [rings, data] = await Promise.all([
      fetch('land.json').then((r) => r.json()),
      fetch('voyages.json').then((r) => r.json()),
    ]);
    land = E.indexLand(rings);
    setLand(rings);
    ({ voyages, places } = data);
    wire();
    startDaily();
  } catch (err) {
    console.error(err);
    $('route').textContent = 'The chart could not be loaded. Please reload the page.';
  }
}
main();

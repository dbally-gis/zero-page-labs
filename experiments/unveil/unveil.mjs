import {
  BOARD, HEX_R, dayNumber, dateKey, dailySite, practiceSite, options, score, hexGrid, hexPoints, formatCoords, shareText,
} from './rules.mjs';

const $ = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  parent?.append(n);
  return n;
};

const today = new Date();
// Storage can be blocked or hold junk; the game must still load.
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* play on without saving */ } },
};
// A tab left open past midnight moves on to the new day's scene.
const checkDay = () => { if (dateKey(new Date()) !== dateKey(today)) location.reload(); };
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkDay(); });
setInterval(checkDay, 60000);
const day = dayNumber(today);
const storeKey = `unveil:${dateKey(today)}`;
const cells = hexGrid();
const sites = await (await fetch(new URL('./sites.json', import.meta.url))).json();

let game; // { site, daily, opts, flipped: Set, wrong: Set, solved }

function load(daily, site) {
  const saved = daily ? store.get(storeKey) : null;
  game = {
    site, daily,
    opts: options(site, daily ? dateKey(today) : 'practice'),
    flipped: new Set(saved?.site === site.id ? saved.flipped : []),
    wrong: new Set(saved?.site === site.id ? saved.wrong : []),
    solved: saved?.site === site.id && saved.solved,
  };
  $('kicker').textContent = daily ? `Daily scene · #${day + 1}` : 'Practice scene';
  $('today').hidden = daily;
  document.querySelector('.panel').classList.toggle('solved', Boolean(game.solved));
  drawBoard();
  drawOptions();
  update();
  if (game.solved) showResult(false);
}

function save() {
  if (!game.daily) return;
  store.set(storeKey, { site: game.site.id, flipped: [...game.flipped], wrong: [...game.wrong], solved: game.solved });
}

function drawBoard() {
  const svg = $('board');
  svg.replaceChildren();
  svg.classList.toggle('solved', game.solved);
  svgEl('image', { href: `img/${game.site.id}.webp`, x: 0, y: 0, width: BOARD, height: BOARD }, svg);
  const tiles = svgEl('g', {}, svg);
  for (const c of cells) {
    if (game.flipped.has(c.i) || game.solved) continue;
    const t = svgEl('polygon', {
      points: hexPoints(c.cx, c.cy, HEX_R - 1), class: 'tile', 'data-i': c.i, tabindex: 0, role: 'button',
      'aria-label': `Lift tile, row ${c.row + 1}, column ${c.col + 2}`,
    }, tiles);
    t.addEventListener('click', () => lift(c.i, t));
    t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lift(c.i, t); } });
  }
  svgEl('rect', { class: 'edge', x: 1.5, y: 1.5, width: BOARD - 3, height: BOARD - 3 }, svg);
}

function lift(i, node, delay = 0) {
  if (game.flipped.has(i) && !game.solved) return;
  if (!game.solved) { game.flipped.add(i); save(); update(); }
  setTimeout(() => {
    node.classList.add('lift');
    setTimeout(() => node.remove(), 420);
  }, delay);
}

function drawOptions() {
  const box = $('options');
  box.replaceChildren();
  for (const o of game.opts) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = o;
    b.disabled = game.wrong.has(o) || game.solved;
    b.classList.toggle('wrong', game.wrong.has(o));
    if (game.solved && o === game.site.answer) b.classList.add('right');
    b.addEventListener('click', () => guess(o, b));
    box.append(b);
  }
}

function guess(o, button) {
  if (game.solved || game.wrong.has(o)) return;
  if (o !== game.site.answer) {
    game.wrong.add(o);
    button.disabled = true;
    button.classList.add('shake', 'wrong');
    button.setAttribute('aria-label', `${o}, wrong`);
    save(); update();
    return;
  }
  game.solved = true;
  save();
  button.classList.add('right');
  for (const b of $('options').children) b.disabled = true;
  // Lift the rest in a wave spreading out from what was already uncovered
  const lifted = cells.filter((c) => game.flipped.has(c.i));
  const ox = lifted.length ? lifted.reduce((s, c) => s + c.cx, 0) / lifted.length : BOARD / 2;
  const oy = lifted.length ? lifted.reduce((s, c) => s + c.cy, 0) / lifted.length : BOARD / 2;
  for (const t of $('board').querySelectorAll('.tile')) {
    const c = cells[Number(t.dataset.i)];
    lift(c.i, t, Math.hypot(c.cx - ox, c.cy - oy) * 0.9);
  }
  $('board').classList.add('solved');
  document.querySelector('.panel').classList.add('solved');
  update();
  showResult(true);
}

function update() {
  const flips = game.flipped.size;
  $('lifted').textContent = flips;
  $('total').textContent = `/ ${cells.length}`;
  $('score').textContent = score(flips, game.wrong.size);
  $('hint').textContent = game.solved ? ''
    : flips === 0 ? 'Tap a hexagon to lift it. Then say what you think the scene shows.'
      : 'Lift more, or guess whenever you’re ready.';
  $('hint').hidden = game.solved;
}

function showResult(fresh) {
  const { site } = game, flips = game.flipped.size, wrong = game.wrong.size;
  $('result-line').textContent = `${flips} ${flips === 1 ? 'tile' : 'tiles'} · ${wrong === 0 ? 'first guess' : `${wrong + 1} guesses`} · ${score(flips, wrong)} points`;
  $('result-name').textContent = site.name;
  $('result-where').textContent = `${site.place} · ${formatCoords(site.lat, site.lon)} · ${site.km} km across`;
  $('result-why').textContent = site.why;
  $('result-link').href = site.link;
  $('share').hidden = !game.daily;
  $('share-note').hidden = true;
  $('guess').querySelector('.label').textContent = 'It was';
  $('result').hidden = false;
  $('actions').hidden = false;
  if (fresh && matchMedia('(max-width: 860px)').matches) $('result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

$('share').addEventListener('click', async () => {
  const text = shareText({ day, flips: game.flipped.size, total: cells.length, wrong: game.wrong.size, points: score(game.flipped.size, game.wrong.size) });
  try { await navigator.clipboard.writeText(`${text}\n${location.href.split('#')[0]}`); $('share-note').hidden = false; }
  catch { prompt('Copy your result:', text); }
});
$('practice').addEventListener('click', () => {
  resetPanel();
  const daily = dailySite(sites, today).id;
  load(false, practiceSite(sites.filter((s) => s.id !== game.site.id), daily));
});
$('today').addEventListener('click', () => { resetPanel(); load(true, dailySite(sites, today)); });

function resetPanel() {
  $('result').hidden = true;
  $('actions').hidden = true;
  $('guess').querySelector('.label').textContent = 'What is it?';
}

load(true, dailySite(sites, today));

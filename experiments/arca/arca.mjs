import { VOICES, TONES, PROSE_TONES, METERS, parseText, rodFor, compose, counts } from './engine.mjs';
import { drawScore } from './notation.mjs';
import { play, playChord } from './audio.mjs';

const $ = (id) => document.getElementById(id);
const tables = await (await fetch(new URL('./tables.json', import.meta.url))).json();

// A ` marks a stressed (long) syllable, as in Cashner's input convention.
const PRESETS = [
  ['Ave Maria, gratia plena', '`A-ve Ma-`ri-a, `gra-ti-a `ple-na'],
  ['Laudate Dominum', 'Lau-`da-te `Do-mi-num'],
  ['Gloria in excelsis Deo', '`Glo-ri-a, in ex-`cel-sis `De-o'],
  ['Kyrie eleison', '`Ky-ri-e, e-`le-i-son'],
  ['Pater noster, qui es in caelis', '`Pa-ter `nos-ter, qui es in `cae-lis'],
  ['Jubilate Deo', 'Ju-bi-`la-te `De-o'],
];

const SINGERS = [['Soprano', 'Cantus'], ['Alto', 'Altus'], ['Tenor', 'Tenor'], ['Bass', 'Bassus']];
let focus = 0; // which column of the slat is shown on the scale ladder
let phrases = [], overrides = new Map(), choices = [], active = 0, settings = [], cols = [], stop = null;

// ---------- setup ----------
for (const [name] of PRESETS) $('preset').append(new Option(name, name));
$('preset').append(new Option('My own text', ''));
for (const t of PROSE_TONES) $('tone').append(new Option(`Scale ${t}, home note ${TONES[t].final.replace('b', '♭')}`, t));
const METER_WORDS = { duple: 'Even, in two', tripleMinor: 'Lilting, quick three', tripleMajor: 'Lilting, slow three' };
for (const k of Object.keys(METERS)) $('meter').append(new Option(METER_WORDS[k], k));
$('tone').value = 'XI';
$('text').value = PRESETS[0][1];

$('preset').addEventListener('change', () => {
  const p = PRESETS.find(([n]) => n === $('preset').value);
  if (p) { $('text').value = p[1]; resetText(); }
});
$('text').addEventListener('input', () => { $('preset').value = ''; resetText(); });
$('tone').addEventListener('change', render);
$('meter').addEventListener('change', () => { choices.forEach((c) => { c.rperm = 0; }); render(); });

function resetText() { overrides = new Map(); choices = []; active = 0; focus = 0; render(); }

// ---------- state ----------
function currentPhrases() {
  return parseText($('text').value).map((p, i) => (overrides.has(i) ? { ...p, penultLong: overrides.get(i) } : p));
}

function render() {
  stopPlay();
  phrases = currentPhrases();
  choices = phrases.map((_, i) => choices[i] ?? { vperm: 0, rperm: 0 });
  active = Math.min(active, Math.max(0, phrases.length - 1));
  drawPhrases();
  try {
    settings = compose(tables, phrases, { tone: $('tone').value, meter: $('meter').value, choices });
    $('error').hidden = true;
  } catch (err) {
    settings = [];
    $('error').textContent = err.message;
    $('error').hidden = false;
  }
  drawRod();
  cols = settings.length ? drawScore($('score'), settings, $('tone').value) : [];
  $('play').disabled = !settings.length;
}

// ---------- phrases ----------
function drawPhrases() {
  const list = $('phrases');
  list.replaceChildren();
  phrases.forEach((p, i) => {
    const li = document.createElement('li');
    li.classList.toggle('on', i === active);
    li.addEventListener('click', () => { active = i; focus = 0; drawPhrases(); drawRod(); });
    let k = 0;
    p.words.forEach((w) => {
      w.forEach((s, j) => {
        const isPenult = k === p.syllables.length - 2;
        const node = document.createElement(isPenult ? 'button' : 'span');
        node.textContent = s;
        node.className = isPenult ? 'penult syl' : 'syl';
        if (j < w.length - 1) node.classList.add('sep');
        if (isPenult) {
          node.type = 'button';
          node.classList.toggle('stressed', p.penultLong);
          node.dataset.mark = p.penultLong ? 'stressed' : 'unstressed';
          node.setAttribute('aria-label', `${s}: ${p.penultLong ? 'stressed' : 'unstressed'}. Tap to switch.`);
          node.addEventListener('click', (e) => { e.stopPropagation(); overrides.set(i, !p.penultLong); active = i; focus = 0; choices[i] = { vperm: 0, rperm: 0 }; render(); });
        }
        li.append(node);
        k++;
      });
      const gap = document.createElement('span'); gap.className = 'word-gap'; li.append(gap);
    });
    const { pinax } = rodFor(p);
    const pin = document.createElement('span');
    pin.className = 'pin';
    pin.textContent = `${p.syllables.length} syllables`;
    li.append(pin);
    list.append(li);
  });
}

// ---------- the rod ----------
const ACC = (p) => `${p.step}${p.alter === 1 ? '♯' : p.alter === -1 ? '♭' : ''}`;

function drawRod() {
  const p = phrases[active], s = settings[active];
  if (!p || !s) { $('slat').replaceChildren(); $('racks').replaceChildren(); $('how').replaceChildren(); $('ladder').replaceChildren(); return; }
  const { pinax } = rodFor(p);
  const n = p.syllables.length, penult = p.syllables[n - 2];
  const words = p.words.map((w) => w.join('')).join(' ');
  $('how').replaceChildren(...[
    `“${words}” has <b>${n} syllables</b>, so the ark pulls <b>stick ${n}</b>.`,
    `“${penult}” is <b>${p.penultLong ? 'stressed' : 'unstressed'}</b>, so the stick comes from the board for ${p.penultLong ? 'stressed' : 'unstressed'} endings.`,
  ].map((h) => Object.assign(document.createElement('li'), { innerHTML: h })));
  // Both boards, sticks for 2–6 syllables; the chosen board sits directly above its stick
  $('racks').replaceChildren(...['I', 'II'].sort((x) => (x === pinax ? 1 : -1)).map((px) => {
    const board = document.createElement('div');
    board.className = `board-row${px === pinax ? ' on' : ''}`;
    board.innerHTML = `<span class="board-name">${px === 'I' ? 'Stressed' : 'Unstressed'} endings<small>Kircher’s Pinax ${px}</small></span>`;
    const rack = document.createElement('div');
    rack.className = 'rack';
    for (let k = 2; k <= 6; k++) {
      const r = document.createElement('span');
      r.innerHTML = `${k}<small>syl.</small>`;
      r.classList.toggle('up', px === pinax && k === n);
      rack.append(r);
    }
    board.append(rack);
    return board;
  }));
  // The stick: Kircher's numbers with the notes they become, syllables beneath
  const noteAt = new Map(s.events.filter((e) => !e.rest).map((e) => [e.index, e]));
  focus = Math.min(focus, n - 1);
  const table = document.createElement('table');
  table.createCaption().textContent = `Stick ${n} · block ${s.vperm + 1} of 10`;
  VOICES.forEach((v, vi) => {
    const tr = table.insertRow();
    const th = document.createElement('th');
    th.innerHTML = `<i class="dot v${vi}"></i>${SINGERS[vi][0]}<small>${SINGERS[vi][1]}</small>`;
    tr.append(th);
    s.block[vi].forEach((num, ni) => {
      const td = tr.insertCell();
      td.dataset.i = ni;
      td.innerHTML = `<b>${num}</b><small>${ACC(noteAt.get(ni).pitches[vi])}</small>`;
      td.classList.toggle('focus', ni === focus);
      td.addEventListener('click', () => { focus = ni; markFocus(); drawLadder(); playChord(noteAt.get(ni).pitches.map((x) => x.midi)); });
    });
  });
  const syl = table.insertRow(); syl.className = 'syls';
  syl.append(document.createElement('th'));
  p.syllables.forEach((x, ni) => { const td = syl.insertCell(); td.textContent = x; td.dataset.i = ni; td.classList.toggle('focus', ni === focus); });
  $('slat').replaceChildren(table);
  const c = counts(tables, p, $('meter').value);
  $('v-out').textContent = `${s.vperm + 1} of ${c.vperms}`;
  $('r-out').textContent = `${s.rperm + 1} of ${c.rperms}`;
  $('rhythm').replaceChildren(...s.pattern.map(noteGlyph));
  drawLadder();
}

function markFocus() {
  for (const td of $('slat').querySelectorAll('td')) td.classList.toggle('focus', Number(td.dataset.i) === focus);
}

// The scale as a ladder of eight steps, with a dot for each singer on the focused chord
function drawLadder() {
  const s = settings[active]; if (!s) return;
  const tone = TONES[$('tone').value];
  const chord = s.block.map((row) => row[focus]);
  const cells = tone.degrees.map((d, i) => {
    const cell = document.createElement('div');
    cell.className = 'rung';
    const dots = chord.map((num, vi) => (num === i + 1 ? `<i class="dot v${vi}"></i>` : '')).join('');
    cell.innerHTML = `<span class="dots">${dots}</span><b>${i + 1}</b><small>${ACC(d)}</small>`;
    return cell;
  });
  $('ladder').replaceChildren(...cells);
}

$('voice-key').replaceChildren(...SINGERS.map(([en, la], vi) => Object.assign(document.createElement('li'), { innerHTML: `<i class="dot v${vi}"></i>${en} <small>(${la})</small>` })));

function spin(key, d) {
  const p = phrases[active]; if (!p) return;
  const c = counts(tables, p, $('meter').value);
  const n = key === 'vperm' ? c.vperms : c.rperms;
  choices[active][key] = (choices[active][key] + d + n) % n;
  $('hero-play').addEventListener('click', () => {
  document.querySelector('.score-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (!stop) $('play').click();
});

render();
}
$('v-prev').addEventListener('click', () => spin('vperm', -1));
$('v-next').addEventListener('click', () => spin('vperm', 1));
$('r-prev').addEventListener('click', () => spin('rperm', -1));
$('r-next').addEventListener('click', () => spin('rperm', 1));
$('lots').addEventListener('click', () => {
  choices = phrases.map((p) => {
    const c = counts(tables, p, $('meter').value);
    return { vperm: Math.floor(Math.random() * c.vperms), rperm: Math.floor(Math.random() * Math.max(1, c.rperms)) };
  });
  render();
});

// A small drawn note for each rhythm value
function noteGlyph(val) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 22 34'); svg.setAttribute('width', 18); svg.setAttribute('height', 28);
  svg.setAttribute('aria-label', `${val.rest ? 'rest' : ''}${{ Lg: 'long', Br: 'breve', Sb: 'semibreve', Mn: 'minim', Sm: 'semiminim', Fs: 'fusa' }[val.base]}${val.dotted ? ', dotted' : ''}`);
  const filled = val.base === 'Sm' || val.base === 'Fs';
  if (val.rest) svg.innerHTML = '<rect x="6" y="14" width="10" height="5" fill="currentColor"/>';
  else {
    svg.innerHTML = `<ellipse cx="9" cy="26" rx="5.5" ry="4" transform="rotate(-20 9 26)" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="${filled ? 0 : 1.8}"/>`
      + (val.base === 'Br' ? '<path d="M2 20v12M16 20v12" stroke="currentColor" stroke-width="1.4"/>' : '')
      + (val.base === 'Mn' || filled ? '<line x1="14.2" y1="26" x2="14.2" y2="4" stroke="currentColor" stroke-width="1.4"/>' : '')
      + (val.base === 'Fs' ? '<path d="M14.2 4q7 5 4 13" fill="none" stroke="currentColor" stroke-width="1.6"/>' : '')
      + (val.dotted ? '<circle cx="19" cy="24" r="1.8" fill="currentColor"/>' : '');
  }
  return svg;
}

// ---------- playback ----------
function stopPlay() {
  stop?.(); stop = null;
  $('play').textContent = '▶ Play';
  for (const c of cols) c.node.classList.remove('now');
  for (const td of $('slat').querySelectorAll('td.now')) td.classList.remove('now');
}

$('play').addEventListener('click', () => {
  if (stop) { stopPlay(); return; }
  $('play').textContent = '■ Stop';
  let prev = null;
  stop = play(settings, METERS[$('meter').value].secondsPerMinim, (k) => {
    prev?.node.classList.remove('now');
    const c = cols[k]; prev = c;
    if (!c) return;
    c.node.classList.add('now');
    // keep the sounding chord in view
    const wrap = $('score-wrap'), x = c.x * (wrap.querySelector('svg').getBoundingClientRect().width / Number($('score').getAttribute('width')));
    if (x < wrap.scrollLeft + 40 || x > wrap.scrollLeft + wrap.clientWidth - 60) wrap.scrollTo({ left: x - 60, behavior: 'smooth' });
    // follow along on the rod
    if (c.phrase !== active) { active = c.phrase; drawPhrases(); drawRod(); }
    for (const td of $('slat').querySelectorAll('td.now')) td.classList.remove('now');
    if (c.e.index != null) {
      for (const td of $('slat').querySelectorAll(`td[data-i="${c.e.index}"]`)) td.classList.add('now');
      focus = c.e.index; markFocus(); drawLadder();
    }
  }, () => stopPlay());
});

render();

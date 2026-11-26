import { VOICES, TONES, PROSE_TONES, METERS, parseText, rodFor, compose, counts } from './engine.mjs';
import { drawScore } from './notation.mjs';
import { play } from './audio.mjs';

const $ = (id) => document.getElementById(id);
const tables = await (await fetch(new URL('./tables.json', import.meta.url))).json();

// A ` marks a stressed (long) syllable, as in Cashner's input convention.
const PRESETS = [
  ['Laudate Dominum', 'Lau-`da-te `Do-mi-num'],
  ['Ave Maria, gratia plena', '`A-ve Ma-`ri-a, `gra-ti-a `ple-na'],
  ['Gloria in excelsis Deo', '`Glo-ri-a, in ex-`cel-sis `De-o'],
  ['Kyrie eleison', '`Ky-ri-e, e-`le-i-son'],
  ['Pater noster, qui es in caelis', '`Pa-ter `nos-ter, qui es in `cae-lis'],
  ['Jubilate Deo', 'Ju-bi-`la-te `De-o'],
];

let phrases = [], overrides = new Map(), choices = [], active = 0, settings = [], cols = [], stop = null;

// ---------- setup ----------
for (const [name] of PRESETS) $('preset').append(new Option(name, name));
$('preset').append(new Option('My own text', ''));
for (const t of PROSE_TONES) $('tone').append(new Option(`Tone ${t} · final ${TONES[t].final}${TONES[t].mollis ? ' · ♭' : ''}`, t));
for (const [k, m] of Object.entries(METERS)) $('meter').append(new Option(`${m.label} (${m.sign})`, k));
$('tone').value = 'II';
$('text').value = PRESETS[0][1];

$('preset').addEventListener('change', () => {
  const p = PRESETS.find(([n]) => n === $('preset').value);
  if (p) { $('text').value = p[1]; resetText(); }
});
$('text').addEventListener('input', () => { $('preset').value = ''; resetText(); });
$('tone').addEventListener('change', render);
$('meter').addEventListener('change', () => { choices.forEach((c) => { c.rperm = 0; }); render(); });

function resetText() { overrides = new Map(); choices = []; active = 0; render(); }

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
    li.addEventListener('click', () => { active = i; drawPhrases(); drawRod(); });
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
          node.dataset.mark = p.penultLong ? '¯' : '˘';
          node.setAttribute('aria-label', `${s}: ${p.penultLong ? 'long' : 'short'}. Tap to make it ${p.penultLong ? 'short' : 'long'}.`);
          node.addEventListener('click', (e) => { e.stopPropagation(); overrides.set(i, !p.penultLong); active = i; choices[i] = { vperm: 0, rperm: 0 }; render(); });
        }
        li.append(node);
        k++;
      });
      const gap = document.createElement('span'); gap.className = 'word-gap'; li.append(gap);
    });
    const { pinax } = rodFor(p);
    const pin = document.createElement('span');
    pin.className = 'pin';
    pin.textContent = `Pinax ${pinax} · ${p.syllables.length}`;
    li.append(pin);
    list.append(li);
  });
}

// ---------- the rod ----------
const ACC = (p) => `${p.step}${p.alter === 1 ? '♯' : p.alter === -1 ? '♭' : ''}`;

function drawRod() {
  const p = phrases[active], s = settings[active];
  if (!p || !s) { $('slat').replaceChildren(); $('racks').replaceChildren(); $('how').replaceChildren(); return; }
  const { pinax, column } = rodFor(p);
  const n = p.syllables.length, penult = p.syllables[n - 2];
  const tone = TONES[$('tone').value];
  // Why this rod: three plain steps
  const steps = [
    `<b>${n} syllables</b> in “${p.words.map((w) => w.join('')).join(' ')}” → the rod for <b>${n}</b>.`,
    `Second-to-last syllable “<b>${penult}</b>” is <b>${p.penultLong ? 'long' : 'short'}</b> → <b>Pinax ${pinax}</b>, the board for ${p.penultLong ? 'long' : 'short'} endings.`,
    `Tone ${$('tone').value} turns numbers into notes: ${tone.degrees.map((d, i) => `${i + 1}=${ACC({ ...d })}`).join(' ')}.`,
  ];
  $('how').replaceChildren(...steps.map((h) => Object.assign(document.createElement('li'), { innerHTML: h })));
  // Both boards, five rods each; the chosen rod lifted
  // The chosen board sits last, directly above its slat
  $('racks').replaceChildren(...['I', 'II'].sort((x) => (x === pinax ? 1 : -1)).map((px) => {
    const board = document.createElement('div');
    board.className = `board-row${px === pinax ? ' on' : ''}`;
    board.innerHTML = `<span class="board-name">Pinax ${px}<small>${px === 'I' ? 'long ¯' : 'short ˘'}</small></span>`;
    const rack = document.createElement('div');
    rack.className = 'rack';
    for (let k = 2; k <= 6; k++) {
      const r = document.createElement('span');
      r.innerHTML = `${k}<small>syl.</small>`;
      r.classList.toggle('up', px === pinax && k - 2 === column);
      rack.append(r);
    }
    board.append(rack);
    return board;
  }));
  // The slat: Kircher's numbers with the notes they become, syllables beneath
  const noteAt = new Map(s.events.filter((e) => !e.rest).map((e) => [e.index, e]));
  const table = document.createElement('table');
  const cap = table.createCaption();
  cap.textContent = `Pinax ${pinax} · rod for ${n} syllables · row ${s.vperm + 1}`;
  VOICES.forEach((v, vi) => {
    const tr = table.insertRow();
    const th = document.createElement('th'); th.textContent = v; tr.append(th);
    s.block[vi].forEach((num, ni) => {
      const td = tr.insertCell();
      td.dataset.i = ni;
      td.innerHTML = `<b>${num}</b><small>${ACC(noteAt.get(ni).pitches[vi])}</small>`;
    });
  });
  const syl = table.insertRow(); syl.className = 'syls';
  syl.append(document.createElement('th'));
  p.syllables.forEach((x) => { syl.insertCell().textContent = x; });
  $('slat').replaceChildren(table);
  const c = counts(tables, p, $('meter').value);
  $('v-out').textContent = `${s.vperm + 1} of ${c.vperms}`;
  $('r-out').textContent = `${s.rperm + 1} of ${c.rperms}`;
  $('rhythm').replaceChildren(...s.pattern.map(noteGlyph));
}

function spin(key, d) {
  const p = phrases[active]; if (!p) return;
  const c = counts(tables, p, $('meter').value);
  const n = key === 'vperm' ? c.vperms : c.rperms;
  choices[active][key] = (choices[active][key] + d + n) % n;
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
    if (c.e.index != null) for (const td of $('slat').querySelectorAll(`td[data-i="${c.e.index}"]`)) td.classList.add('now');
  }, () => stopPlay());
});

render();

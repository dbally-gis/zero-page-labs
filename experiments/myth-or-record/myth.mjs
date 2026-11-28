// Real or Not? — one claim per floor, answers saved in this browser.
const $ = (id) => document.getElementById(id);
const KEY = 'zpl-myth-or-record-v1';
let floors = [];
let answers = {};

function load() { try { answers = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { answers = {}; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(answers)); } catch { /* private mode */ } }

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const label = (v) => (v === 'myth' ? 'Not real' : 'Real');

function sourceItem(s) {
  const who = [s.author, s.publisher, s.year].filter(Boolean).map(esc).join(', ');
  return `<li><a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.title)}</a>${who ? ` — ${who}` : ''}. <span class="supports">${esc(s.supports)}</span></li>`;
}

function floorHTML(f) {
  const a = answers[f.id];
  const right = a && a === f.verdict;
  return `
  <li class="floor${a ? ' answered' : ''}" id="floor-${f.floor}" data-id="${esc(f.id)}">
    <div class="room">
      <span class="num" aria-hidden="true">${f.floor}</span>
      <img src="art/${esc(f.id)}.webp" alt="" loading="lazy" width="800" height="600">
      <span class="illus">Illustration, not a likeness</span>
    </div>
    <div class="card">
      <p class="where">Floor ${f.floor} · ${esc(f.years)} · ${esc(f.place)}</p>
      <h2>${esc(f.title)}</h2>
      <p class="claim">“${esc(f.claim)}”</p>
      <div class="choose" role="group" aria-label="Real or not?">
        <button type="button" data-pick="record" ${a ? 'disabled' : ''} class="${a === 'record' ? 'picked' : ''}">Real</button>
        <button type="button" data-pick="myth" ${a ? 'disabled' : ''} class="${a === 'myth' ? 'picked' : ''}">Not real</button>
      </div>
      ${a ? `
      <div class="reveal" tabindex="-1">
        <p class="verdict ${right ? 'right' : 'wrong'}"><b>${label(f.verdict)}.</b> ${right ? 'You got it.' : `You said ${label(a).toLowerCase()}.`}</p>
        <p class="answer">${esc(f.answer)}</p>
        <details class="more"><summary>The evidence</summary>
          <p>${esc(f.explanation)}</p>
          ${f.nuance ? `<p class="nuance"><b>Fine print:</b> ${esc(f.nuance)}</p>` : ''}
          <p class="src-head">Sources</p>
          <ol class="sources">${f.sources.map(sourceItem).join('')}</ol>
        </details>
      </div>` : ''}
    </div>
  </li>`;
}

function render() {
  $('floors').innerHTML = floors.map(floorHTML).join('');
  const done = floors.filter((f) => answers[f.id]);
  const score = done.filter((f) => answers[f.id] === f.verdict).length;
  $('g-score').textContent = score;
  $('g-done').textContent = done.length;
  $('gauge').innerHTML = floors.map((f) => {
    const a = answers[f.id];
    const cls = !a ? '' : a === f.verdict ? 'right' : 'wrong';
    return `<li class="${cls}"><a href="#floor-${f.floor}" title="Floor ${f.floor}: ${esc(f.site)}, ${esc(f.years)}"><span>${f.floor}</span><i>${esc(f.short || f.site)}</i></a></li>`;
  }).join('');
  const finished = done.length === floors.length && floors.length > 0;
  $('result').hidden = !finished;
  if (finished) {
    $('result-title').textContent = `${score} of ${floors.length} right`;
    const myths = floors.filter((f) => f.verdict === 'myth').length;
    $('result-text').textContent = `${myths} of these ${floors.length} stories turned out not to be real, and ${floors.length - myths} are real. ${score >= 18 ? 'A sharp eye for a tall tale.' : score >= 12 ? 'The legends fooled you now and then, as they fooled the Victorians.' : 'The legends got you. They got most of the 1800s too.'}`;
  }
}

function pick(id, choice) {
  answers[id] = choice;
  save();
  const f = floors.find((x) => x.id === id);
  const li = document.querySelector(`.floor[data-id="${CSS.escape(id)}"]`);
  li.outerHTML = floorHTML(f);
  render();
  document.querySelector(`#floor-${f.floor} .reveal`)?.focus?.();
}

function reset() {
  if (!window.confirm('Clear your answers and start at the top?')) return;
  answers = {};
  save();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function shareText() {
  const marks = floors.map((f) => (answers[f.id] === f.verdict ? '🟩' : '🟥'));
  const score = floors.filter((f) => answers[f.id] === f.verdict).length;
  const rows = [];
  for (let i = 0; i < marks.length; i += 14) rows.push(marks.slice(i, i + 14).join(''));
  return `Real or Not? Prisons and dungeons, 1200–1800\n${score}/${floors.length}\n${rows.join('\n')}\nzeropagelabs.com/experiments/myth-or-record/`;
}

async function main() {
  load();
  try {
    floors = (await fetch('floors.json').then((r) => r.json())).floors;
  } catch (err) {
    console.error(err);
    $('floors').innerHTML = '<li class="floor"><p>The tower could not be loaded. Please reload the page.</p></li>';
    return;
  }
  render();
  $('floors').addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-pick]');
    if (!b) return;
    pick(b.closest('.floor').dataset.id, b.dataset.pick);
  });
  $('reset').addEventListener('click', reset);
  $('reset2').addEventListener('click', reset);
  $('share').addEventListener('click', async () => {
    const text = shareText();
    try { await navigator.clipboard.writeText(text); $('share').textContent = 'Copied'; }
    catch { window.prompt('Copy your result', text); }
    setTimeout(() => { $('share').textContent = 'Copy result'; }, 1600);
  });
}
main();

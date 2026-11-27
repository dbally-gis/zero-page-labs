// Three plates, two views each. The hash (#ix-sources, #x, ...) picks both so any view can be linked.
// Older links (#illustrated, #sources) open Plate VIII.
const PLATES = ['viii', 'ix', 'x'];
const VIEWS = ['illustrated', 'sources'];
const state = { plate: 'viii', view: 'illustrated' };

function parse(hash) {
  const [a, b] = hash.replace(/^#/, '').split('-');
  if (VIEWS.includes(a)) return { plate: 'viii', view: a };
  return {
    plate: PLATES.includes(a) ? a : 'viii',
    view: VIEWS.includes(b) ? b : 'illustrated',
  };
}

function render(push) {
  document.querySelectorAll('.tabs button[data-plate]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.plate === state.plate)));
  document.querySelectorAll('.tabs button[data-view]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.view === state.view)));
  document.querySelectorAll('section.view').forEach(s => { s.hidden = !(s.dataset.plate === state.plate && s.dataset.view === state.view); });
  if (push) history.replaceState(null, '', `#${state.plate}${state.view === 'sources' ? '-sources' : ''}`);
}

document.querySelectorAll('.tabs').forEach(group => {
  const buttons = [...group.querySelectorAll('button')];
  buttons.forEach(b => b.addEventListener('click', () => {
    if (b.dataset.plate) state.plate = b.dataset.plate;
    if (b.dataset.view) state.view = b.dataset.view;
    render(true);
  }));
  group.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const i = buttons.findIndex(b => b.getAttribute('aria-selected') === 'true');
    const next = buttons[(i + (e.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length];
    next.click();
    next.focus();
  });
});

document.querySelectorAll('[data-go]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  state.view = a.dataset.go;
  render(true);
  document.getElementById('plate').scrollIntoView({ behavior: 'smooth', block: 'start' });
}));

window.addEventListener('hashchange', () => { Object.assign(state, parse(location.hash)); render(false); });
Object.assign(state, parse(location.hash));
render(false);

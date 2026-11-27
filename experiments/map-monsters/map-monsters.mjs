// Three plates, two views each. The hash (#ix-sources, #x, ...) picks both so any view can be linked.
// Older links (#illustrated, #sources) open Plate VIII.
import { parse } from './state.mjs';
const state = { plate: 'viii', view: 'sources' };

function render(push) {
  document.querySelectorAll('.tabs button').forEach(b => {
    const selected = b.dataset.plate ? b.dataset.plate === state.plate : b.dataset.view === state.view;
    b.setAttribute('aria-selected', String(selected));
    b.tabIndex = selected ? 0 : -1;
    b.setAttribute('aria-controls', `${state.plate}-${state.view}`);
  });
  document.querySelectorAll('section.view').forEach(s => { s.hidden = !(s.dataset.plate === state.plate && s.dataset.view === state.view); });
  document.querySelectorAll('[data-catalogue]').forEach(s => { s.hidden = s.dataset.catalogue !== state.plate; });
  if (push) history.pushState(null, '', `#${state.plate}-${state.view}`);
}

document.querySelectorAll('.tabs').forEach(group => {
  const buttons = [...group.querySelectorAll('button')];
  buttons.forEach(b => b.addEventListener('click', () => {
    if (b.dataset.plate) state.plate = b.dataset.plate;
    if (b.dataset.view) state.view = b.dataset.view;
    render(true);
  }));
  group.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const i = buttons.findIndex(b => b.getAttribute('aria-selected') === 'true');
    const next = buttons[e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length];
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

window.addEventListener('hashchange', () => {
  if (/^#(?:viii|ix|x|sources|illustrated)(?:-|$)/.test(location.hash) || !location.hash) {
    Object.assign(state, parse(location.hash));
    render(false);
  }
});
Object.assign(state, parse(location.hash));
render(false);

// Specimen deep links select their own plate without resetting the view.
function revealSpecimen() {
  if (!location.hash.startsWith('#specimen-')) return;
  const entry = document.getElementById(location.hash.slice(1));
  if (!entry) return;
  state.plate = entry.closest('[data-catalogue]').dataset.catalogue;
  state.view = 'sources';
  render(false);
  entry.open = true;
  entry.scrollIntoView({ block: 'start' });
}
window.addEventListener('hashchange', revealSpecimen);
revealSpecimen();

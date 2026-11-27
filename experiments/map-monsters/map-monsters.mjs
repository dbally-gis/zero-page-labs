// Two views of one plate. The hash (#illustrated or #sources) picks the view so either can be linked.
const VIEWS = ['illustrated', 'sources'];

function show(name, push) {
  if (!VIEWS.includes(name)) name = VIEWS[0];
  for (const v of VIEWS) {
    document.getElementById(`tab-${v}`).setAttribute('aria-selected', String(v === name));
    document.getElementById(`view-${v}`).hidden = v !== name;
  }
  if (push) history.replaceState(null, '', `#${name}`);
}

for (const v of VIEWS) {
  document.getElementById(`tab-${v}`).addEventListener('click', () => show(v, true));
}
document.querySelectorAll('[data-view]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  show(a.dataset.view, true);
  document.getElementById('plate').scrollIntoView({ behavior: 'smooth', block: 'start' });
}));
document.querySelector('.views').addEventListener('keydown', e => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const current = VIEWS.findIndex(v => document.getElementById(`tab-${v}`).getAttribute('aria-selected') === 'true');
  const next = VIEWS[(current + (e.key === 'ArrowRight' ? 1 : VIEWS.length - 1)) % VIEWS.length];
  show(next, true);
  document.getElementById(`tab-${next}`).focus();
});
window.addEventListener('hashchange', () => show(location.hash.slice(1), false));
show(location.hash.slice(1), false);

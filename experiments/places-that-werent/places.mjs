export const CASES = ['california', 'frisland', 'kong', 'terra-australis'];

export function caseFromHash(hash) {
  const key = hash.replace(/^#/, '');
  return CASES.includes(key) ? key : null;
}

if (typeof document !== 'undefined') {
  const cases = [...document.querySelectorAll('.case')];
  const links = [...document.querySelectorAll('[data-case]')];
  let active = CASES[0];
  function selectCase() {
    const key = caseFromHash(location.hash);
    const selected = key || active;
    active = selected;
    for (const panel of cases) panel.hidden = panel.id !== selected;
    for (const link of links) {
      if (link.dataset.case === selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
    if (key) document.getElementById(key).scrollIntoView({block: 'start', behavior: 'instant'});
  }
  // Native hash navigation preserves browser Back and ordinary document anchors.
  window.addEventListener('hashchange', selectCase);
  selectCase();
  for (const panel of cases) {
    panel.querySelectorAll('[data-view]').forEach(button => {
      button.addEventListener('click', () => {
        const view = button.dataset.view;
        const image = panel.querySelector('.map-image');
        image.src = `img/${panel.id}-${view}.webp`;
        image.alt = image.dataset[`${view}Alt`];
        panel.querySelector('.enlarge').href = image.src;
        panel.querySelector('.view-label').textContent = view === 'detail' ? 'Detail of the supplied scan' : 'Complete supplied scan';
        panel.querySelector('.map-window').classList.toggle('whole', view === 'sheet');
        panel.querySelectorAll('[data-view]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      });
    });
  }
}

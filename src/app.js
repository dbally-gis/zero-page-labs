const filters = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('[data-style]');
const count = document.querySelector('#gallery-count');
filters.forEach(button => button.addEventListener('click', () => {
  const selected = button.dataset.filter;
  filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  let visible = 0;
  cards.forEach(card => {
    card.hidden = selected !== 'All' && card.dataset.style !== selected;
    if (!card.hidden) visible += 1;
  });
  count.textContent = `${visible} ${visible === 1 ? 'face' : 'faces'}`;
}));

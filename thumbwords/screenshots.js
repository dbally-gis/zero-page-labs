const viewer = document.querySelector('.screenshot-viewer');
const preview = viewer.querySelector('img');
const title = viewer.querySelector('#screenshot-title');
const original = viewer.querySelector('.screenshot-original');

document.querySelectorAll('.screenshot-open').forEach(link => {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !viewer.showModal) return;

    const thumbnail = link.querySelector('img');
    title.textContent = link.closest('figure').querySelector('figcaption strong').textContent;
    preview.alt = thumbnail.alt;
    preview.src = link.href;
    original.href = link.href;
    event.preventDefault();
    link.focus({ preventScroll: true });
    viewer.showModal();
  });
});

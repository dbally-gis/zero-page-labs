export const PLATES = ['viii', 'ix', 'x'];
export const VIEWS = ['illustrated', 'sources'];

export function parse(hash) {
  const [a, b] = hash.replace(/^#/, '').split('-');
  if (VIEWS.includes(a)) return { plate: 'viii', view: a };
  return {
    plate: PLATES.includes(a) ? a : 'viii',
    // Bare plate hashes historically selected the illustrated view.
    view: VIEWS.includes(b) ? b : PLATES.includes(a) ? 'illustrated' : 'sources',
  };
}

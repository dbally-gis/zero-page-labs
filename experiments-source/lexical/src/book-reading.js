import {atlasPosition, WORDS_PER_SHEET} from './model.js';

export const PAGE_WIDTH = 3.5;
export const PAGE_HEIGHT = 5;
export const WORD_SIZE = 0.105;

export function readablePage(sheetCount, step, origin, direction, verticalPixels, previous) {
  if (Math.abs(direction.z) < 0.35) return null;
  const back = direction.z > 0;
  for (let offset = 0; offset < sheetCount; offset++) {
    const page = back ? sheetCount - offset - 1 : offset;
    const distance = (-page * step - origin.z) / direction.z;
    if (distance <= 0.1) continue;
    const x = origin.x + distance * direction.x;
    const y = origin.y + distance * direction.y;
    if (Math.abs(x) > PAGE_WIDTH / 2 || Math.abs(y) > PAGE_HEIGHT / 2) continue;
    const minimum = previous?.page === page && previous.back === back ? 8 : 10;
    return WORD_SIZE * verticalPixels / distance >= minimum ? {page, back} : null;
  }
  return null;
}

export function pageWordAt(page, back, u, v, tokenCount) {
  const [firstX, firstY] = atlasPosition(0);
  const column = Math.round(((back ? 1 - u : u) * PAGE_WIDTH - PAGE_WIDTH / 2 - firstX) / (2.94 / 9));
  const row = Math.round((firstY - (v - 0.5) * PAGE_HEIGHT) / (4.36 / 24));
  if (column < 0 || column >= 10 || row < 0 || row >= 25) return null;
  const index = page * WORDS_PER_SHEET + row * 10 + column;
  return index < tokenCount ? index : null;
}

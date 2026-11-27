// The sea chart: a Mercator projection, drawn as SVG, as navigators used from the 1600s on.
// On it a constant compass course is a straight line.
import { mercY, move } from './engine.mjs';

const NS = 'http://www.w3.org/2000/svg';
const K = 10;                       // SVG units per degree
const RAD = Math.PI / 180;
const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  parent?.append(n);
  return n;
};
export const X = (lon) => lon * K;
export const Y = (lat) => -mercY(lat) * K;
const pt = ([lat, lon]) => `${X(lon).toFixed(2)},${Y(lat).toFixed(2)}`;

let landPath = '';
export function setLand(rings) {
  landPath = rings.map((r) => 'M' + r.map(([lon, lat]) => `${X(lon).toFixed(1)},${Y(lat).toFixed(1)}`).join('L') + 'Z').join('');
}

/** Bounds that hold the given [lat, lon] points with padding, stretched to the aspect ratio. */
export function viewFor(points, aspect) {
  let w = Infinity, e = -Infinity, n = -Infinity, s = Infinity;
  for (const [lat, lon] of points) { w = Math.min(w, lon); e = Math.max(e, lon); n = Math.max(n, lat); s = Math.min(s, lat); }
  const padLon = Math.max(4, (e - w) * 0.12), padLat = Math.max(3, (n - s) * 0.12);
  let x0 = X(w - padLon), x1 = X(e + padLon), y0 = Y(Math.min(80, n + padLat)), y1 = Y(Math.max(-75, s - padLat));
  let width = x1 - x0, height = y1 - y0;
  if (width / height < aspect) { const d = height * aspect - width; x0 -= d / 2; width += d; }
  else { const d = width / aspect - height; y0 -= d / 2; height += d; }
  return { x: x0, y: y0, width, height };
}

const latOfY = (y) => (2 * Math.atan(Math.exp((-y / K) * RAD)) - Math.PI / 2) / RAD;

/**
 * Draw the whole chart.
 * opts: { voyage, state, heading, aspect, reveal, ghost }  (ghost = an earlier voyage's true track)
 */
export function drawChart(svg, { voyage, state, heading, aspect, reveal, ghost }) {
  const pts = [voyage.start, voyage.dest, ...state.drTrack];
  if (reveal) pts.push(...state.trueTrack);
  if (ghost) pts.push(...ghost);
  const vb = viewFor(pts, aspect);
  svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.width} ${vb.height}`);
  svg.replaceChildren();
  const px = vb.width / svg.clientWidth || vb.width / 800;   // SVG units per screen pixel

  // Graticule
  const lonMin = vb.x / K, lonMax = (vb.x + vb.width) / K;
  const latMax = latOfY(vb.y), latMin = latOfY(vb.y + vb.height);
  const step = lonMax - lonMin > 60 ? 10 : 5;
  const grid = el('g', { class: 'grid' }, svg);
  for (let lon = Math.ceil(lonMin / step) * step; lon <= lonMax; lon += step) {
    el('line', { x1: X(lon), x2: X(lon), y1: vb.y, y2: vb.y + vb.height }, grid);
    el('text', { x: X(lon) + 3 * px, y: vb.y + vb.height - 5 * px, 'font-size': 11 * px }, grid).textContent = lon === 0 ? '0°' : `${Math.abs(lon)}°${lon < 0 ? 'W' : 'E'}`;
  }
  for (let lat = Math.ceil(latMin / step) * step; lat <= latMax; lat += step) {
    el('line', { x1: vb.x, x2: vb.x + vb.width, y1: Y(lat), y2: Y(lat) }, grid);
    el('text', { x: vb.x + 5 * px, y: Y(lat) - 3 * px, 'font-size': 11 * px }, grid).textContent = lat === 0 ? 'Equator' : `${Math.abs(lat)}°${lat < 0 ? 'S' : 'N'}`;
  }

  // Rhumb lines from a wind rose, as on a portolan chart
  const rose = { x: vb.x + vb.width * 0.5, y: vb.y + vb.height * 0.52 };
  const rl = el('g', { class: 'rhumbs' }, svg);
  for (let i = 0; i < 16; i++) {
    const a = (i * 22.5) * RAD, L = vb.width * 1.5;
    el('line', { x1: rose.x, y1: rose.y, x2: rose.x + Math.sin(a) * L, y2: rose.y - Math.cos(a) * L, class: i % 2 ? 'minor' : '' }, rl);
  }

  // Land with a water-line halo
  el('path', { d: landPath, class: 'halo' }, svg);
  el('path', { d: landPath, class: 'land' }, svg);

  // Departure and destination
  const marks = el('g', { class: 'marks' }, svg);
  const [sy, sx] = [Y(voyage.start[0]), X(voyage.start[1])];
  el('circle', { cx: sx, cy: sy, r: 3 * px, class: 'start' }, marks);
  const [dy, dx] = [Y(voyage.dest[0]), X(voyage.dest[1])];
  el('circle', { cx: dx, cy: dy, r: 9 * px, class: 'dest-ring' }, marks);
  el('circle', { cx: dx, cy: dy, r: 3.5 * px, class: 'dest' }, marks);
  const right = dx < vb.x + vb.width * 0.75;
  el('text', { x: dx + (right ? 13 : -13) * px, y: dy + 4 * px, 'font-size': 14 * px, class: 'dest-label', 'text-anchor': right ? 'start' : 'end' }, marks).textContent = voyage.to.replace(/^the /, 'The ');

  // Earlier voyage, for comparison
  if (ghost) el('polyline', { points: ghost.map(pt).join(' '), class: 'ghost' }, svg);

  // The reckoned track and today's uncertainty
  if (state.status === 'sailing') {
    const [lat, lon] = state.dr;
    const c = Math.cos(lat * RAD);
    el('ellipse', { cx: X(lon), cy: Y(lat), rx: ((2 * state.sdLon) / (60 * c)) * K, ry: ((2 * state.sdLat) / (60 * c)) * K, class: 'band' }, svg);
    const ahead = move(state.dr, heading, 150);
    el('line', { x1: X(lon), y1: Y(lat), x2: X(ahead[1]), y2: Y(ahead[0]), class: 'course' }, svg);
  }
  el('polyline', { points: state.drTrack.map(pt).join(' '), class: 'dr' }, svg);
  const fixes = el('g', { class: 'fixes' }, svg);
  for (const entry of state.log) {
    if (entry.event?.type !== 'land') continue;
    const [elat, elon] = entry.event.pos;
    el('text', { x: X(elon) + 6 * px, y: Y(elat) - 6 * px, 'font-size': 12 * px, class: 'event' }, fixes).textContent = `Land ho: ${entry.event.place}`;
  }

  if (reveal) {
    el('polyline', { points: state.trueTrack.map(pt).join(' '), class: 'true' }, svg);
    const t = state.truePos;
    el('circle', { cx: X(t[1]), cy: Y(t[0]), r: 4 * px, class: 'true-end' }, svg);
  }

  // The ship, at the reckoned position
  const [lat, lon] = state.dr;
  const ship = el('g', { class: 'ship', transform: `translate(${X(lon)} ${Y(lat)}) scale(${px})` }, svg);
  el('path', { d: 'M -9 2 L 9 2 L 6 7 L -6 7 Z', class: 'hull' }, ship);
  el('path', { d: 'M -1 1 L -1 -15 L 7 0 Z M -3 1 L -3 -11 L -9 0 Z', class: 'sail' }, ship);
  return vb;
}

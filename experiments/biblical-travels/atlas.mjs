import { coords, records } from './acts-data.mjs';

const root = document.getElementById('biblical-travels');
const get = selector => root.querySelector(selector);
const people = [...root.querySelectorAll('[data-person]')];
const buttons = [...root.querySelectorAll('[data-id]')];
const peopleCodes = {Paul:'P', Barnabas:'B', 'John Mark':'M', Peter:'R', Philip:'F'};
const sequence = records.map(([id]) => id);
const events = Object.fromEntries(records.map(([id, place, verse, title, codes, detail], index) =>
  [id, [place, 25 + index * 4.4, 'Acts ' + verse, title, detail || '']]));
const routes = Object.fromEntries(Object.entries(peopleCodes).map(([person, code]) =>
  [person, records.filter(row => row[4].includes(code)).map(([id]) => id)]));
const eventLocations = Object.fromEntries(records.map(([id, place, verse, title, codes]) =>
  [id, Object.values(peopleCodes).map(code => codes.includes(code) ? place : 'Location unspecified in this event')]));
const timeline = get('[data-time]');
timeline.max = sequence.length - 1;
const handoff = get('[data-handoff]');
const follow = [...handoff.querySelectorAll('[data-follow]')];
follow.forEach(button => button.addEventListener('click', () => {
  person = button.dataset.follow;
  render();
}));
let person = 'Philip';
let stop = 'samaria';
let view = 'flat';
let angle = 0;
let zoom = 1;
let origin = [0, 0];
let drag = null;
let matrix = [.82, .06, -.25, .49, 130, 263];
const views = [...root.querySelectorAll('[data-view-choice]')];
const rotation = get('[data-rotation]');
const zoomControl = get('[data-zoom]');
const map = get('.cube svg');
function updateProjection() {
  if (view === 'flat') {
    matrix = [.94, 0, 0, .94, 22, 45];
    return;
  }
  const radians = angle * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const a = .82*cos - .25*sin;
  const b = .06*cos + .49*sin;
  const c = -.82*sin - .25*cos;
  const d = -.06*sin + .49*cos;
  matrix = [a,b,c,d,364 - a*360 - c*245,405 - b*360 - d*245];
}
function projectedFloor(place) {
  const [x, y] = coords[place];
  const [a,b,c,d,e,f] = matrix;
  return [a*x + c*y + e, b*x + d*y + f];
}
function magnify([x,y]) {
  return [zoom*x + origin[0], zoom*y + origin[1]];
}
function floor(place) {
  return magnify(projectedFloor(place));
}
function projectedEvent(id) {
  const [place, height] = events[id];
  const [x, y] = projectedFloor(place);
  return [x, view === 'cube' ? y-height : y];
}
function position(id) {
  return magnify(projectedEvent(id));
}
const polyline = (ids, active) => '<polyline points="' + ids.map(id => position(id).join(',')).join(' ') + '" stroke="var(--' + (active ? 'route' : 'quiet') + ')" stroke-width="' + (active ? 4 : 2) + '" opacity="' + (active ? 1 : .55) + '"/>';
function drawProjection() {
  updateProjection();
  const [focusX, focusY] = projectedEvent(stop);
  origin = [Math.min(575, Math.max(145, focusX)) - zoom*focusX, Math.min(490, Math.max(55, focusY)) - zoom*focusY];
  get('[data-floor]').setAttribute('transform', 'translate(' + origin.join(' ') + ') scale(' + zoom + ') matrix(' + matrix.join(' ') + ')');
  const guidePlaces = new Set([events[stop][0], 'Perga']);
  get('#bt-guides').innerHTML = view === 'flat' ? '' : [...guidePlaces].map(place => {
    const [x,y] = floor(place);
    const peak = Math.min(...Object.keys(events).filter(id => events[id][0] === place).map(id => position(id)[1]));
    return '<path d="M'+x+','+y+' V'+peak+'"/><circle cx="'+x+'" cy="'+y+'" r="3"/>';
  }).join('');
  buttons.forEach(button => {
    const [x,y] = position(button.dataset.id);
    button.style.left = (x/7.2).toFixed(4)+'%';
    button.classList.toggle('label-left', x > 505);
    button.style.top = (y/5.5).toFixed(4)+'%';
  });
}
buttons.forEach(button => {
  button.addEventListener('click', () => {
    stop = button.dataset.id;
    render();
  });
});
function render() {
  drawProjection();
  get('.cube').dataset.view = view;
  get('.axis').hidden = view === 'flat';
  map.setAttribute('aria-label', view === 'flat' ? 'Map of the Mediterranean' : 'Mediterranean map with events stacked in Acts narrative order');
  get('[data-height-note]').hidden = view === 'flat';
  rotation.parentElement.hidden = view === 'flat';
  views.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.viewChoice === view)));
  const route = routes[person];
  timeline.value = sequence.indexOf(stop);
  const present = follow.filter(button => routes[button.dataset.follow].includes(stop));
  handoff.hidden = present.length < 2;
  follow.forEach(button => {
    button.hidden = !present.includes(button);
    button.setAttribute('aria-pressed', String(button.dataset.follow === person));
  });
  const [,, reference, eventTitle] = events[stop];
  timeline.setAttribute('aria-valuetext', eventTitle + ', ' + reference);
  get('[data-time-label]').textContent = (Number(timeline.value)+1) + ' / ' + sequence.length + ' · ' + reference;
  people.forEach((button, index) => {
    get('[data-where="' + button.dataset.person + '"]').textContent = eventLocations[stop][index];
  });
  people.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.person === person)));
  buttons.forEach(button => {
    const id = button.dataset.id;
    button.hidden = id !== stop && !(events[stop][0] === 'Perga' && ['perga','return'].includes(id));
    button.setAttribute('aria-current', id === stop ? 'step' : 'false');
  });
  get('#bt-paths').innerHTML = Object.entries(routes).filter(([name]) => name !== person && routes[name].includes(stop)).map(([, stops]) => polyline(stops, false)).join('') + polyline(route, true);
  get('#bt-marks').innerHTML = Object.keys(events).map(id => {
    const [x,y] = position(id);
    return '<circle cx="'+x+'" cy="'+y+'" r="'+(id===stop ? 8 : 3)+'" fill="var(--'+(id === stop || route.includes(id) ? 'route' : 'quiet')+')" stroke="var(--paper)" stroke-width="2"/>';
  }).join('');
  const [, , verse, title, detail] = events[stop];
  const passage = get('[data-verse]');
  passage.textContent = 'Read ' + verse + ' ↗';
  passage.href = 'https://www.biblegateway.com/passage/?search=' + encodeURIComponent(verse.replace('–', '-')) + '&version=WEB';
  get('[data-title]').textContent = title;
  get('[data-detail]').textContent = detail;
  get('[data-detail]').hidden = !detail;
  get('[data-back]').disabled = !neighbor(-1);
  get('[data-next]').disabled = !neighbor(1);
}
people.forEach(button => button.addEventListener('click', () => {
  person = button.dataset.person;
  render();
}));
function neighbor(offset) {
  const index = sequence.indexOf(stop);
  for (let i = index + offset; i >= 0 && i < sequence.length; i += offset) {
    if (routes[person].includes(sequence[i])) return sequence[i];
  }
}
function move(offset) {
  stop = neighbor(offset) ?? stop;
  render();
}
timeline.addEventListener('input', () => {
  stop = sequence[Number(timeline.value)];
  render();
});
views.forEach(button => button.addEventListener('click', () => {
  view = button.dataset.viewChoice;
  render();
}));
rotation.addEventListener('input', () => {
  angle = Number(rotation.value);
  render();
});
zoomControl.addEventListener('input', () => {
  zoom = Number(zoomControl.value) / 100;
  render();
});
map.addEventListener('pointerdown', event => {
  if (view !== 'cube' || drag || event.button !== 0) return;
  drag = { id: event.pointerId, x: event.clientX, angle, width: map.getBoundingClientRect().width };
  map.setPointerCapture(event.pointerId);
  map.setAttribute('data-dragging', '');
});
map.addEventListener('pointermove', event => {
  if (drag?.id !== event.pointerId) return;
  const degrees = drag.angle + (event.clientX - drag.x) * 180 / drag.width;
  angle = ((Math.round(degrees) + 180) % 360 + 360) % 360 - 180;
  rotation.value = angle;
  render();
});
map.addEventListener('lostpointercapture', event => {
  if (drag?.id !== event.pointerId) return;
  drag = null;
  map.removeAttribute('data-dragging');
});
get('[data-back]').addEventListener('click', () => move(-1));
get('[data-next]').addEventListener('click', () => move(1));
render();

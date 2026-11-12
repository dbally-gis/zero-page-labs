import { coords as actsCoords, records as actsRecords } from './acts-data.mjs';
import { gospelCoords, gospelCoastline, gospelRecords } from './gospel-data.mjs';

const root = document.getElementById('biblical-travels');
const get = selector => root.querySelector(selector);
const parameters = new URLSearchParams(location.search);
const sharedPlaces = new Map();
for (const stops of Object.values(gospelRecords)) {
  for (const place of new Set(stops.map(([name]) => name))) {
    sharedPlaces.set(place, (sharedPlaces.get(place) ?? 0) + 1);
  }
}
const requestedBook = parameters.get('book');
const gospelColors = {
  Matthew: '#a43a24',
  Mark: '#28685e',
  Luke: '#75458d',
  John: '#2c548a'
};
const book = Object.hasOwn(gospelRecords, requestedBook) ? requestedBook : 'Acts';
const isActs = book === 'Acts';
const coords = isActs ? actsCoords : gospelCoords;
const records = isActs ? actsRecords : gospelRecords[book].map(([place, verse, title, detail], index) =>
  ['gospel-' + index, place, verse, title, 'J', detail]);
const people = isActs ? [...root.querySelectorAll('[data-person]')] : [];
const peopleCodes = isActs ? { Paul:'P', Barnabas:'B', 'John Mark':'M', Peter:'R', Philip:'F' } : { Jesus:'J' };

if (!isActs) {
  get('[data-book="Acts"]').removeAttribute('aria-current');
  get('[data-book="' + book + '"]').setAttribute('aria-current', 'page');
  get('[data-kicker]').textContent = 'The journeys of Jesus';
  get('[data-intro]').textContent = 'Follow Jesus through selected stops in ' + book + '. Each Gospel follows its own narrative order.';
  get('[data-timeline-name]').textContent = book + ' timeline';
  get('[data-people]').hidden = true;
  get('[data-comparison]').hidden = false;
  get('[data-account-key]').innerHTML = Object.entries(gospelColors).map(([name, color]) =>
    '<span><i style="background:' + color + '"></i>' + name + '</span>').join('') + '<span>◯ Select a shared place</span>';
  get('.event-people').hidden = true;
  get('[data-back]').textContent = 'Previous event';
  get('[data-next]').textContent = 'Next event';
  get('.axis').textContent = '↑ ' + book + ' narrative order';
  get('[data-height-note]').textContent = 'Height shows ' + book + ' narrative order. ';
  get('[data-floor] path').setAttribute('d', gospelCoastline);
  get('.sea-name').setAttribute('x', '95');
  get('.sea-name').setAttribute('y', '190');
  root.querySelectorAll('[data-id]').forEach(button => button.remove());
  const chart = get('.cube');
  for (const [id, place] of records) {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'event';
    marker.dataset.id = id;
    marker.textContent = place;
    marker.hidden = true;
    chart.append(marker);
  }
}
const buttons = [...root.querySelectorAll('[data-id]')];
const sequence = records.map(([id]) => id);
const events = Object.fromEntries(records.map(([id, place, verse, title, codes, detail], index) =>
  [id, [place, 25 + index * (isActs ? 4.4 : 230 / (records.length - 1)), book + ' ' + verse, title, detail || '']]));
const routes = Object.fromEntries(Object.entries(peopleCodes).map(([person, code]) =>
  [person, records.filter(row => row[4].includes(code)).map(([id]) => id)]));
const eventLocations = Object.fromEntries(records.map(([id, place, verse, title, codes]) =>
  [id, Object.values(peopleCodes).map(code => codes.includes(code) ? place : 'Location unspecified in this event')]));
const timeline = get('[data-time]');
timeline.max = sequence.length - 1;
const handoff = get('[data-handoff]');
const follow = isActs ? [...handoff.querySelectorAll('[data-follow]')] : [];
follow.forEach(button => button.addEventListener('click', () => {
  person = button.dataset.follow;
  render();
}));
let person = isActs ? 'Philip' : 'Jesus';
const requestedStop = parameters.get('stop');
let stop = isActs ? 'samaria' : sequence.includes(requestedStop) ? requestedStop : sequence[0];
let view = !isActs && parameters.get('view') === 'cube' ? 'cube' : 'flat';
let angle = isActs ? 0 : Math.max(-180, Math.min(180, Number(parameters.get('angle')) || 0));
let zoom = isActs ? 1 : Math.max(1, Math.min(2.4, Number(parameters.get('zoom')) || 1));
const comparison = get('[data-compare]');
const ringLayer = get('[data-ring-layer]');
const ringLeaders = get('#bt-ring-leaders');
let pickedPlace = null;
const placeButtons = new Map();
if (!isActs) {
  for (const [place, count] of sharedPlaces) {
    if (count < 2) continue;
    const ring = document.createElement('button');
    ring.type = 'button';
    ring.className = 'place-ring';
    ring.dataset.place = place;
    ring.title = place + ' · ' + count + ' Gospel accounts';
    ring.setAttribute('aria-label', ring.title);
    ring.setAttribute('aria-controls', 'gospel-place-passages');
    ring.addEventListener('click', () => {
      pickedPlace = place;
      render();
      get('[data-shared-heading]').focus({preventScroll: true});
      get('[data-shared]').scrollIntoView({block: 'nearest'});
    });
    placeButtons.set(place, ring);
    ringLayer.append(ring);
  }
}
comparison.checked = !isActs && parameters.get('compare') === '1';
let origin = [0, 0];
let drag = null;
let matrix = [.82, .06, -.25, .49, 130, 263];
const views = [...root.querySelectorAll('[data-view-choice]')];
const rotation = get('[data-rotation]');
const zoomControl = get('[data-zoom]');
const map = get('.cube svg');
rotation.value = angle;
zoomControl.value = zoom * 100;
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
function comparisonPaths() {
  if (!comparison.checked) return '';
  return Object.entries(gospelRecords).map(([name, stops], accountIndex) => {
    if (name === book) return '';
    const points = stops.slice(name === 'Matthew' ? 1 : 0).map(([place]) => {
      const [x, y] = projectedFloor(place);
      // Other accounts stay on the floor because their event orders are independent.
      return magnify([x, y]).join(',');
    }).join(' ');
    return '<polyline points="' + points + '" stroke="' + gospelColors[name]
      + '" stroke-width="3" stroke-dasharray="5 13" stroke-dashoffset="' + accountIndex * 4 + '"/>';
  }).join('');
}

function layoutSharedRings() {
  ringLayer.hidden = !comparison.checked;
  ringLeaders.replaceChildren();
  if (!comparison.checked) return;

  const width = map.clientWidth;
  const height = map.clientHeight;
  if (!width || !height) return;
  const spacing = 32;
  const inset = spacing / 2;
  const placed = [];
  for (const [place, ring] of placeButtons) {
    const [x, y] = floor(place);
    const px = x * width / 720;
    const py = y * height / 550;
    ring.hidden = px < 0 || px > width || py < 0 || py > height;
    if (ring.hidden) continue;

    // Fan out nearby controls while keeping their geographic anchors visible.
    const candidates = [[0, 0]];
    for (let radius = spacing; radius <= spacing * 4; radius += spacing) {
      for (let direction = 0; direction < 8; direction++) {
        const radians = direction * Math.PI / 4;
        candidates.push([radius * Math.cos(radians), radius * Math.sin(radians)]);
      }
    }
    const options = candidates.map(([dx, dy]) => [px + dx, py + dy]);
    const [cx, cy] = options.find(([cx, cy]) =>
      cx >= inset && cx <= width - inset && cy >= inset && cy <= height - inset &&
      placed.every(([otherX, otherY]) => Math.hypot(cx - otherX, cy - otherY) >= spacing)
    ) ?? [Math.max(inset, Math.min(width - inset, px)), Math.max(inset, Math.min(height - inset, py))];
    placed.push([cx, cy]);
    ring.style.left = (cx / width * 100) + '%';
    ring.style.top = (cy / height * 100) + '%';
    ring.setAttribute('aria-pressed', String(place === (pickedPlace ?? events[stop][0])));

    if (Math.hypot(cx - px, cy - py) > 1) {
      const leader = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      leader.setAttribute('x1', x);
      leader.setAttribute('y1', y);
      leader.setAttribute('x2', cx * 720 / width);
      leader.setAttribute('y2', cy * 550 / height);
      ringLeaders.append(leader);
    }
  }
}

function accountUrl(name, index) {
  const query = new URLSearchParams({book: name, stop: 'gospel-' + index, view, angle, zoom});
  if (comparison.checked) query.set('compare', '1');
  return '?' + query;
}

function updateSharedPlace() {
  const shared = get('[data-shared]');
  if (isActs) return;
  const place = pickedPlace ?? events[stop][0];
  get('[data-shared-heading]').textContent = pickedPlace
    ? 'Gospel passages at ' + place
    : 'Other accounts at this place';
  const container = get('[data-shared-links]');
  container.replaceChildren();
  for (const [name, stops] of Object.entries(gospelRecords)) {
    if (name === book && !pickedPlace) continue;
    stops.forEach(([otherPlace, verse], index) => {
      if (otherPlace !== place) return;
      const link = document.createElement('a');
      link.href = accountUrl(name, index);
      link.textContent = name + ' ' + verse;
      container.append(link);
    });
  }
  shared.hidden = container.childElementCount === 0;
  get('[data-account-key]').hidden = !comparison.checked;
}

function drawProjection() {
  updateProjection();
  const [focusX, focusY] = projectedEvent(stop);
  origin = [Math.min(575, Math.max(145, focusX)) - zoom*focusX, Math.min(490, Math.max(55, focusY)) - zoom*focusY];
  get('[data-floor]').setAttribute('transform', 'translate(' + origin.join(' ') + ') scale(' + zoom + ') matrix(' + matrix.join(' ') + ')');
  const guidePlaces = new Set([events[stop][0]]);
  if (isActs) guidePlaces.add('Perga');
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
    pickedPlace = null;
    render();
  });
});
function render() {
  drawProjection();
  updateSharedPlace();
  get('.cube').dataset.view = view;
  get('.axis').hidden = view === 'flat';
  map.setAttribute('aria-label', view === 'flat' ? 'Map of the Mediterranean' : 'Map with events stacked in ' + book + ' narrative order');
  get('[data-height-note]').hidden = view === 'flat';
  if (!isActs) {
    get('[data-height-note]').textContent = comparison.checked
      ? 'The active account rises in narrative order. Other accounts stay on the map floor. '
      : 'Height shows ' + book + ' narrative order. ';
    root.style.setProperty('--route', gospelColors[book]);
  }
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
  get('#bt-paths').innerHTML = Object.entries(routes).filter(([name]) => name !== person && routes[name].includes(stop)).map(([, stops]) => polyline(stops, false)).join('') + comparisonPaths() + polyline(book === 'Matthew' ? route.slice(1) : route, true);
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
  layoutSharedRings();
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
  pickedPlace = null;
  render();
}
timeline.addEventListener('input', () => {
  stop = sequence[Number(timeline.value)];
  pickedPlace = null;
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
comparison.addEventListener('change', () => {
  pickedPlace = null;
  render();
});
if (!isActs) new ResizeObserver(layoutSharedRings).observe(map);
get('[data-back]').addEventListener('click', () => move(-1));
get('[data-next]').addEventListener('click', () => move(1));
render();

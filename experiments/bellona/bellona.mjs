import { duration, parts, phases, sampleTack, sources } from './study.mjs';
import { gunCrew, gunDuration, gunPhases, sampleGun } from './drill.mjs';

const byId = id => document.getElementById(id);
const viewButtons = [...document.querySelectorAll('[data-view]')];
const canvas = byId('ship-canvas');
const player = byId('player');
const scrub = byId('scrub');
const play = byId('play');
const speed = byId('speed');
const sections = {
  whole: ['PLATE 01', 'WHOLE SHIP', 'Plan-based proportions · reconstructed rig'],
  cut: ['PLATE 01', 'LONGITUDINAL CUTAWAY', 'Plan-based study model · reconstructed detail'],
  tack: ['PLATE 02', 'GUIDED TACK', 'Period seamanship · illustrative motion'],
  gun: ['PLATE 03', 'LOWER GUN DECK / 32-POUNDER', 'Documented drill · reconstructed crew and motion'],
};
const lessons = {
  tack: { title:'Tack', duration, phases, sample:sampleTack, update:renderTack, ids:['phase-label','phase-title','phase-text'], time:0 },
  gun: { title:'Gun drill', duration:gunDuration, phases:gunPhases, sample:sampleGun, update:renderGun, ids:['gun-step','gun-phase','gun-text'], time:0 },
};
let lesson=lessons.tack;
let stepButtons=[];
let scene;
let view = 'cut';
let time = 0;
let playing = false;
let frame = 0;
let lastTick;
let previousPhase = -1;
let selectedCrew = 0;

function button(label, parent) {
  const el = document.createElement('button');
  el.type = 'button';
  el.textContent = label;
  parent.append(el);
  return el;
}

function choosePart(index) {
  const part = parts[index];
  byId('part-title').textContent = part.name;
  byId('part-text').textContent = part.text;
  byId('part-limit').textContent = part.limit;
  byId('evidence').textContent = part.evidence;
  byId('part-sources').replaceChildren(...part.refs.map(key => {
    const [label, url] = sources[key];
    const link = document.createElement('a');
    link.className = 'source-link';
    link.href = url;
    link.textContent = label + ' ↗';
    return link;
  }));
  [...partButtons, ...markers].forEach((el, n) => el.setAttribute('aria-pressed', String(n % parts.length === index)));
}

const partButtons = parts.map((part, i) => {
  const el = button(`${String(i + 1).padStart(2, '0')} ${part.name}`, byId('parts'));
  el.addEventListener('click', () => choosePart(i));
  return el;
});
const markers = parts.map((part, i) => {
  const el = button(String(i + 1), byId('markers'));
  el.setAttribute('aria-label', `Inspect ${part.name}`);
  el.hidden = true;
  el.addEventListener('click', () => choosePart(i));
  return el;
});
choosePart(0);

const crewButtons = gunCrew.map(({name}, index) => {
  const el=button(name, byId('crew-buttons'));
  el.setAttribute('aria-pressed',String(index===selectedCrew));
  el.addEventListener('click', () => chooseCrew(index));
  return el;
});

function renderCrew(phase) {
  const member=gunCrew[selectedCrew];
  byId('crew-role').textContent=member.name;
  byId('crew-station').textContent=member.station;
  byId('crew-step').textContent=gunPhases[phase].name + '.';
  byId('crew-action').textContent=member.actions[phase];
}

function chooseCrew(index) {
  selectedCrew=index;
  crewButtons.forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
  scene?.selectCrew(index);
  renderCrew(previousPhase);
}

function prepareLesson(next) {
  lesson=next;
  previousPhase=-1;
  const steps=byId('steps');
  steps.replaceChildren();
  steps.dataset.lesson=view;
  steps.setAttribute('aria-label', 'Jump to '+lesson.title.toLowerCase()+' step');
  player.setAttribute('aria-label', lesson.title+' playback');
  byId('scrub-label').textContent=lesson.title+' timeline';
  scrub.max=lesson.duration;
  stepButtons=lesson.phases.map((step,i) => {
    const el=button(`${i+1}. ${step.short}`,steps);
    el.addEventListener('click', () => { render(step.at); pause(); });
    return el;
  });
}

// Integrate a teaching path from the same heading and drive that move the ship.
const track = [{ x: 155, y: 142 }];
for (let i = 1; i <= duration * 10; i++) {
  const { heading, drive } = sampleTack(i / 10);
  const direction = heading * Math.PI / 180;
  const p = track.at(-1);
  track.push({ x: p.x + Math.sin(direction) * drive * 1.06, y: p.y - Math.cos(direction) * drive * 1.06 });
}
const pathPoints = track.map(({ x, y }, i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`);
byId('track-path').setAttribute('d', pathPoints.join(''));

function stamp(seconds) { return '0:' + String(Math.floor(seconds)).padStart(2, '0'); }

function render(seconds) {
  const pose=lesson.sample(seconds);
  time=lesson.time=pose.time;
  scene?.setPose(pose);
  scrub.value=time;
  const step=lesson.phases[pose.phase];
  scrub.setAttribute('aria-valuetext', `${time.toFixed(1)} seconds, ${step.name}`);
  byId('time').textContent=`${stamp(time)} / ${stamp(lesson.duration)}`;
  lesson.update(pose,step);
  if (pose.phase!==previousPhase) {
    const [label,title,description]=lesson.ids;
    byId(label).textContent=`Step 0${pose.phase+1} / 0${lesson.phases.length}`;
    byId(title).textContent=step.name;
    byId(description).textContent=step.text;
    stepButtons.forEach((el,i)=>el.setAttribute('aria-current',i===pose.phase?'step':'false'));
    if (view==='gun') renderCrew(pose.phase);
    previousPhase=pose.phase;
  }
}

function renderGun(pose,step) {
  const shift=pose.carriage*106;
  const slack=pose.carriage*27;
  const toolTip=377-Math.max(pose.sponge,pose.ram)*71;
  byId('gun-state').textContent=pose.time>=41.5 ? 'Inboard · loaded for the next shot' :
    pose.phase===4 && pose.recoil>=1 ? 'Inboard · recoil checked' : step.state;
  byId('schematic-gun').setAttribute('transform',`translate(${shift},0)`);
  byId('schematic-rope').setAttribute('d',`M444 177Q${330+shift/2} ${191+slack} ${198+shift} 164`);
  byId('schematic-tool').setAttribute('d',pose.phase<2||pose.phase>=5?`M${toolTip} 162h62`:'');
  byId('schematic-flash').setAttribute('opacity',pose.flash);
}

function renderTack(pose) {
  byId('tack-side').textContent = Math.abs(pose.heading) < 2 ? 'Head to wind' : pose.heading < 0 ? 'Starboard tack' : 'Port tack';
  for (const name of ['main', 'fore']) {
    const angle=Math.round(pose[name]);
    byId(name+'-yards').textContent = angle===0 ? 'Square' : Math.abs(angle)+'° '+(angle>0?'old tack':'new tack');
  }
  byId('tack-heading').textContent = `${Math.round(Math.abs(pose.heading))}° off wind`;
  const index = Math.min(track.length - 1, Math.round(time * 10));
  const { x, y } = track[index];
  byId('track-ship').setAttribute('transform', `translate(${x} ${y}) rotate(${pose.heading})`);
  byId('track-progress').setAttribute('d', pathPoints.slice(0, index + 1).join(''));
}

function pause() {
  playing = false;
  lastTick = undefined;
  cancelAnimationFrame(frame);
  play.textContent = time >= lesson.duration ? 'Play again' : 'Play';
}

function tick(timestamp) {
  if (!playing) return;
  if (lastTick !== undefined) render(time + Math.min(timestamp - lastTick, 100) / 1000 * Number(speed.value));
  lastTick = timestamp;
  if (time >= lesson.duration) pause();
  else frame = requestAnimationFrame(tick);
}

function start() {
  pause();
  if (time >= lesson.duration) render(0);
  playing = true;
  play.textContent = 'Pause';
  frame = requestAnimationFrame(tick);
}

function setView(next) {
  pause();
  view = next;
  const [number, title, caption] = sections[view];
  byId('plate-number').textContent = number;
  byId('plate-title').textContent = title;
  byId('view-caption').textContent = caption;
  viewButtons.forEach(el => el.setAttribute('aria-pressed', String(el.dataset.view === view)));
  const nextLesson=lessons[view];
  byId('anatomy').hidden=Boolean(nextLesson);
  byId('maneuver').hidden=view!=='tack';
  byId('gun-side').hidden=view!=='gun';
  player.hidden=!nextLesson;
  byId('fallback').hidden=Boolean(scene)||view==='gun';
  byId('gun-plate').toggleAttribute('hidden', Boolean(scene)||view!=='gun');
  byId('view-help').textContent=scene ? (view==='gun' ? 'Click a crew member · drag to orbit' : 'Drag or use arrow keys to orbit') :
    view==='gun' ? 'Animated side plate' : 'Static ship plate · tack chart is interactive';
  canvas.setAttribute('aria-label', view==='gun' ? '3D lower gun deck. Select a figure or use the crew buttons below. Drag or use arrow keys to rotate.' :
    '3D Bellona model. Drag or use the arrow keys to rotate.');
  scene?.setView(view);
  if (view==='gun') scene?.selectCrew(selectedCrew);
  if (nextLesson) {
    prepareLesson(nextLesson);
    render(lesson.time);
    pause();
  }
}

viewButtons.forEach(el => el.addEventListener('click', () => setView(el.dataset.view)));
play.addEventListener('click', () => playing ? pause() : start());
byId('replay').addEventListener('click', () => { render(0); start(); });
scrub.addEventListener('input', () => { pause(); render(Number(scrub.value)); pause(); });
byId('zoom-in').addEventListener('click', () => scene?.zoomBy(1.18));
byId('zoom-out').addEventListener('click', () => scene?.zoomBy(1 / 1.18));
byId('reset-view').addEventListener('click', () => scene?.resetCamera());
setView(location.hash==='#gun-drill' ? 'gun' : 'cut');

try {
  const { createScene } = await import('./scene.mjs');
  // Probe once before Three tries to create a renderer so a normal fallback is quiet.
  if (!canvas.getContext('webgl2', { alpha: true, antialias: true }) &&
      !canvas.getContext('webgl', { alpha: true, antialias: true })) throw new Error('WebGL unavailable');
  scene = createScene(byId('stage'), canvas, markers, chooseCrew);
  canvas.hidden = false;
  byId('fallback').hidden = true;
  document.querySelector('.camera').hidden = false;
  byId('view-help').textContent = 'Drag or use arrow keys to orbit';
  setView(view);
} catch {
  // The schematic and lesson controls are already active.
}

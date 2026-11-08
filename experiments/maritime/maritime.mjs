import { BATTLES } from './battles.mjs';
import { STOPS, clamp, chapterAt, positionAt, trailAt, advance, readView, shareView, cameraZoom, isSharedView, startsPlaying } from './model.mjs';

const $=id=>document.getElementById(id);
const svgNS='http://www.w3.org/2000/svg';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const initial=readView(location.hash);
const state={...initial,selected:initial.ship,playing:startsPlaying(location.hash,reduced.matches),speed:1,layers:{courses:true,weapons:false,wind:true,labels:false},question:null,camera:{x:0,y:0,w:1000,h:600}};
let nodes=[],lastChapter=-1,lastFrame=0,lastPaint=0,drag=null,dragged=false;
function node(tag,attrs={},parent=null,text=null) {
  const n=document.createElementNS(svgNS,tag);
  for(const [key,value] of Object.entries(attrs)) n.setAttribute(key,value);
  if(text!==null) n.textContent=text;
  if(parent) parent.append(n);
  return n;
}
function html(tag,text,className) {
  const n=document.createElement(tag); if(text!==undefined) n.textContent=text;
  if(className) n.className=className; return n;
}
function announce(text){$('announcement').textContent=text;}
function sourceLink(element,index) {
  const source=state.battle.sources[index] || state.battle.sources[0];
  element.href=source.url; element.title=source.title;
}
function setPlaying(playing) {
  state.playing=playing;
  $('play').textContent=playing?'Ⅱ':state.progress>=1?'↺':'▶';
  $('play').setAttribute('aria-label',playing?'Pause replay':state.progress>=1?'Replay from start':'Play replay');
  $('replay-status').textContent=playing?'PLAYING / COMPRESSED SEQUENCE':state.progress>=1?'COMPLETE / EXPLORE THE OUTCOME':'PAUSED / EXPLORE THIS MOMENT';
  $('chart').classList.toggle('playing',playing);
}
function chapterButtons() {
  $('chapters').replaceChildren();
  state.battle.chapters.forEach((c,i)=>{
    const b=html('button'); b.type='button'; b.append(html('span',`0${i+1}`),document.createTextNode(c.label));
    b.addEventListener('click',()=>seek(STOPS[i])); $('chapters').append(b);
  });
}
function renderMoment() {
  const i=chapterAt(state.progress),q=state.question===null?null:state.battle.questions[state.question];
  const c=q || state.battle.chapters[i];
  $('moment-number').textContent=q?'ASK THE CHART / EXPLAINED':`CHAPTER 0${i+1} / ${state.battle.chapters[i].label}`;
  $('moment-title').textContent=c.title; $('moment-text').textContent=c.text;
  sourceLink($('moment-source'),c.source); $('return-story').hidden=!q;
  $('phase-tag').textContent=`0${i+1} / ${state.battle.chapters[i].label.toUpperCase()}`;
  for(const [index,b] of [...$('chapters').children].entries()) b.setAttribute('aria-pressed',String(index===i));
  for(const [index,b] of [...$('questions').children].entries()) b.setAttribute('aria-pressed',String(index===state.question));
  lastChapter=i;
}
function renderShip() {
  const s=state.battle.ships.find(s=>s.id===state.selected);
  $('ship-select').value=s.id; $('ship-name').textContent=s.representative?'Formation marker':s.name;
  $('ship-side').textContent=state.battle.sides[s.side];
  $('ship-type').textContent=({sail:'Sailing warship',galley:'Oared galley',monitor:'Turreted ironclad',ironclad:'Armoured steam warship',cruiser:'Steam cruiser'})[s.type];
  if(s.id==='minnesota') $('ship-type').textContent='Steam frigate · aground';
  $('ship-role').textContent=s.role;
  $('ship-chip').textContent=`${s.representative?'Formation marker':s.name} · Details ↓`;
  $('ship-chip').hidden=!$('start-hint').hidden;
  $('ship-marker').textContent=s.representative?'REPRESENTATIVE MARKER · not an identified vessel':'SELECTED PARTICIPANT · position is schematic';
  $('weapon-note').textContent=state.battle.id==='yalu'?'Weapon sectors are omitted here: mixed steam-era mountings need ship-specific treatment.':'Weapon sectors show mounting principles, not measured range or clearance.';
  $('ship-portrait').replaceChildren(node('use',{href:`#ship-${s.type}`,x:-25,y:-35,width:50,height:70}));
  sourceLink($('ship-source'),s.source);
}
function setCamera(camera) {
  state.camera=camera;
  $('sea').setAttribute('viewBox',`${camera.x} ${camera.y} ${camera.w} ${camera.h}`);
  $('zoom-in').disabled=camera.w<=420; $('zoom-out').disabled=camera.w>=1400;
}
function setView(view) {
  state.view=view; $('chart').classList.toggle('atmosphere',view==='atmosphere');
  $('tactical').setAttribute('aria-pressed',String(view==='tactical'));
  $('atmosphere').setAttribute('aria-pressed',String(view==='atmosphere'));
}
function renderLayers() {
  for(const [key,on] of Object.entries(state.layers)) $('layer-'+key).setAttribute('aria-pressed',String(on));
  $('courses').style.display=state.layers.courses?'':'none';
  $('weapons').style.display=state.layers.weapons?'':'none';
  $('wind-key').hidden=!state.layers.wind;
}
function buildTerrain() {
  const g=$('terrain');g.replaceChildren();
  if(state.battle.terrain==='open') {
    node('path',{d:'M860-30Q930 70 1080 95M900-30Q940 40 1080 64',fill:'none',stroke:'#95c9b2','stroke-opacity':'.12'},g);
    return;
  }
  const roads=state.battle.terrain==='roads';
  const shape=roads?'M-80-80H500Q400 35 375 65T230 100Q125 85 125 180T-80 280Z':'M680-80H1100V210Q1050 140 985 140T890 83Q830 60 820 25T680-80Z';
  node('path',{d:shape,fill:'#668176','fill-opacity':'.22',stroke:'#a6bda0','stroke-opacity':'.5','stroke-width':'2'},g);
  node('path',{d:shape,fill:'none',stroke:'#9ac1a6','stroke-opacity':'.08','stroke-width':'70'},g);
  node('path',{d:shape,fill:'none',stroke:'#b9c8a0','stroke-opacity':'.12','stroke-width':'30'},g);
  node('text',{x:roads?110:920,y:roads?50:40,'text-anchor':'middle',fill:'#bdd0ae','fill-opacity':'.5','font-size':10,'letter-spacing':2},g,roads?'SHOALS · ILLUSTRATIVE':'COAST · ILLUSTRATIVE');
}
function buildFleet() {
  $('fleet').replaceChildren();$('courses').replaceChildren();$('weapons').replaceChildren();
  nodes=state.battle.ships.map(s=>{
    const group=node('g',{class:`ship ${s.side?'enemy':''}`,role:'button',tabindex:'0','aria-label':`${s.name}. ${s.representative?'Representative formation marker. ':''}Inspect ship.`, 'aria-pressed':'false','data-ship':s.id},$('fleet'));
    node('title',{},group,s.name);
    node('circle',{r:29,class:'selection'},group);
    const rotated=node('g',{},group);
    node('path',{d:'M-7 23Q-15 43-23 54M7 23Q15 43 23 54M-4 26 0 58 4 26',class:'wake'},rotated);
    node('use',{href:`#ship-${s.type}`,x:-21,y:-32,width:42,height:64,class:'vessel'},rotated);
    node('path',{d:'M0-36 3-32 0-28-3-32Z',class:'side-marker'},rotated);
    const label=node('text',{y:44,class:`ship-label ${s.representative?'marker-label':''}`},group,s.representative?`Formation ${s.id.split('-').at(-1)}`:s.name);
    node('rect',{x:-24,y:-33,width:48,height:70,class:'hitbox'},group);
    const choose=()=>{
      if(dragged)return;
      state.selected=s.id;setPlaying(false);$('start-hint').hidden=true;renderShip();renderPositions();
      announce(`Selected ${s.name}. Replay paused. Ship details follow the playback controls.`);
    };
    group.addEventListener('click',choose);
    group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();dragged=false;choose();}});
    const course=node('polyline',{class:`course ${s.side?'enemy':''}`},$('courses'));
    return {s,group,rotated,label,course};
  });
}
function renderPositions() {
  const chapter=state.battle.chapters[chapterAt(state.progress)];
  const focus=state.question===null?chapter.focus:state.battle.questions[state.question].focus;
  for(const {s,group,rotated,label,course} of nodes) {
    const p=positionAt(s,state.progress),selected=s.id===state.selected,highlight=focus.includes(s.id);
    group.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
    rotated.setAttribute('transform',`rotate(${p.heading.toFixed(2)})`);
    group.classList.toggle('selected',selected); group.classList.toggle('highlighted',highlight);
    group.setAttribute('aria-pressed',String(selected));
    label.style.display=state.layers.labels||selected||highlight?'':'none';
    course.setAttribute('points',trailAt(s,state.progress).map(p=>p.join(',')).join(' '));
    course.classList.toggle('focus-course',selected||highlight);
  }
  // Overlays belong only to the selected ship, keeping the tactical chart readable.
  if(state.layers.weapons && state.battle.id!=='yalu') {
    const s=state.battle.ships.find(s=>s.id===state.selected),p=positionAt(s,state.progress);
    let sector=$('weapons').firstElementChild;
    if(!sector) sector=node('g',{},$('weapons'));
    sector.replaceChildren();sector.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${p.heading})`);
    const d=s.type==='galley'?'M0 0-55-105Q0-130 55-105Z':s.type==='monitor'?'M0-95A95 95 0 1 1-.01-95Z':'M0 0-105-55Q-135 0-105 55ZM0 0 105-55Q135 0 105 55Z';
    node('path',{d,class:'sector'},sector);
  } else $('weapons').replaceChildren();
  $('weapon-note').hidden=!state.layers.weapons;
  $('timeline').value=Math.round(state.progress*1000);
  $('timeline').style.setProperty('--progress',`${state.progress*100}%`);
  $('timeline').setAttribute('aria-valuetext',`${chapter.label}, ${Math.round(state.progress*100)} percent of compressed replay`);
  if(lastChapter!==chapterAt(state.progress))renderMoment();
}
function loadBattle(battle,progress=0,selected=battle.defaultShip) {
  state.battle=battle;state.progress=progress;state.selected=selected;state.question=null;lastChapter=-1;
  $('start-hint').hidden=progress>0||isSharedView(location.hash);
  setCamera({x:0,y:0,w:1000,h:600});
  $('battle-title').textContent=battle.name;$('battle-meta').textContent=`${battle.date} / ${battle.place}`;
  $('battle-takeaway').textContent=battle.takeaway;$('battle-introduction').textContent=battle.introduction;
  $('sea-label').textContent=battle.seaLabel;
  $('wind-label').textContent=battle.wind;
  $('wind-key').querySelector('svg').style.transform=`rotate(${battle.windAngle}deg)`;
  $('wind-key').querySelector('svg').style.opacity=battle.id==='trafalgar'||battle.id==='lepanto'?'1':'.35';
  $('ship-count').textContent=`${battle.ships.length} diagram markers`;
  for(const b of $('battle-tabs').children)b.setAttribute('aria-pressed',String(b.dataset.battle===battle.id));
  $('legend').replaceChildren(...battle.sides.map(side=>{const n=html('span');n.append(html('i'),document.createTextNode(side));return n;}));
  $('ship-select').replaceChildren(...battle.ships.map(s=>{const n=html('option',s.name);n.value=s.id;return n;}));
  $('questions').replaceChildren(...battle.questions.map((q,i)=>{
    const b=html('button',q.label);b.type='button';b.setAttribute('aria-pressed','false');
    b.addEventListener('click',()=>{
      state.question=i;state.progress=STOPS[q.phase];setPlaying(false);state.layers[q.layer]=true;
      state.selected=q.focus[0];setCamera({x:0,y:0,w:1000,h:600});
      $('start-hint').hidden=true;renderShip();renderLayers();renderMoment();renderPositions();
      announce(`${q.title}. ${q.text}`);
    });return b;
  }));
  $('sources-title').textContent=`Reading for ${battle.name}`;
  $('source-list').replaceChildren(...battle.sources.map(s=>{
    const li=html('li'),a=html('a',s.title);a.href=s.url;li.append(a,html('p',s.note));return li;
  }));
  $('share-status').replaceChildren();
  chapterButtons();buildTerrain();buildFleet();renderShip();renderLayers();renderMoment();renderPositions();setPlaying(state.playing);
}
function seek(progress) {
  state.progress=clamp(progress,0,1);state.question=null;setPlaying(false);$('start-hint').hidden=true;
  renderMoment();renderPositions();announce(`${state.battle.name}: ${state.battle.chapters[chapterAt(progress)].label}. Replay paused.`);
}
for(const battle of BATTLES) {
  const b=html('button');b.type='button';b.dataset.battle=battle.id;
  b.append(html('span',String(battle.year)),document.createTextNode(battle.name));
  b.addEventListener('click',()=>{setPlaying(!reduced.matches);loadBattle(battle);announce(`${battle.name}, ${battle.year}. ${battle.era}.`);});
  $('battle-tabs').append(b);
}
$('play').addEventListener('click',()=>{
  if(state.progress>=1){state.progress=0;state.question=null;renderMoment();renderPositions();}
  if(!state.playing){state.question=null;renderMoment();renderPositions();}
  setPlaying(!state.playing);announce(state.playing?'Replay playing.':'Replay paused.');
});
$('restart').addEventListener('click',()=>{seek(0);setPlaying(!reduced.matches);});
$('timeline').addEventListener('input',e=>seek(Number(e.target.value)/1000));
$('speed').addEventListener('change',e=>{state.speed=Number(e.target.value);});
$('ship-select').addEventListener('change',e=>{state.selected=e.target.value;setPlaying(false);$('start-hint').hidden=true;renderShip();renderPositions();});
$('return-story').addEventListener('click',()=>{state.question=null;renderMoment();renderPositions();announce('Returned to chapter explanation.');});
for(const key of Object.keys(state.layers)) $('layer-'+key).addEventListener('click',()=>{state.layers[key]=!state.layers[key];renderLayers();renderPositions();});
$('zoom-in').addEventListener('click',()=>setCamera(cameraZoom(state.camera,.8)));
$('zoom-out').addEventListener('click',()=>setCamera(cameraZoom(state.camera,1.25)));
$('reset-map').addEventListener('click',()=>setCamera({x:0,y:0,w:1000,h:600}));
$('tactical').addEventListener('click',()=>setView('tactical'));
$('atmosphere').addEventListener('click',()=>setView('atmosphere'));
$('about-button').addEventListener('click',()=>{const open=$('about').hidden;$('about').hidden=!open;$('about-button').setAttribute('aria-expanded',String(open));if(open)$('about').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});});
$('share').addEventListener('click',async()=>{
  const url=new URL(location.href);url.hash=shareView(state);const value=url.toString();
  try {await navigator.clipboard.writeText(value);$('share-status').textContent='Link copied. It opens this battle, ship and moment.';}
  catch {const a=html('a','Open or copy this moment’s link');a.href=value;$('share-status').replaceChildren(a);}
});
function chartPoint(e) {
  const p=new DOMPoint(e.clientX,e.clientY);return p.matrixTransform($('sea').getScreenCTM().inverse());
}
$('sea').addEventListener('pointerdown',e=>{
  dragged=false;if(e.button!==0||e.target.closest('.ship')||e.pointerType==='touch')return;
  const p=chartPoint(e);drag={id:e.pointerId,x:p.x,y:p.y,camera:{...state.camera}};
  $('sea').setPointerCapture(e.pointerId);$('sea').classList.add('dragging');
});
$('sea').addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const p=chartPoint(e),dx=p.x-drag.x,dy=p.y-drag.y;
  if(Math.abs(dx)+Math.abs(dy)>3)dragged=true;
  const c=drag.camera;setCamera({...c,x:clamp(state.camera.x-dx,-250,1250-c.w),y:clamp(state.camera.y-dy,-150,750-c.h)});
});
const endDrag=()=>{drag=null;$('sea').classList.remove('dragging');};
$('sea').addEventListener('pointerup',endDrag);$('sea').addEventListener('pointercancel',endDrag);
reduced.addEventListener('change',e=>{if(e.matches)setPlaying(false);});
document.addEventListener('visibilitychange',()=>{lastFrame=0;});
window.addEventListener('hashchange',()=>{if(!isSharedView(location.hash))return;const view=readView(location.hash);setPlaying(false);loadBattle(view.battle,view.progress,view.ship);setView(view.view);});
function tick(now) {
  const dt=lastFrame?(now-lastFrame)/1000:0;lastFrame=now;
  if(state.playing&&!document.hidden) {
    state.progress=advance(state.progress,dt,state.speed);
    if(state.progress>=1){setPlaying(false);announce('Replay complete. Explore the outcome or choose another encounter.');}
    if(now-lastPaint>32){renderPositions();lastPaint=now;}
  }
  requestAnimationFrame(tick);
}
loadBattle(state.battle,state.progress,state.selected);setView(state.view);requestAnimationFrame(tick);

import {damageAt,damageStages,sinkingAt,tornAtMast} from './damage.mjs';
import {eventsFor,eventSource} from './battle-events.mjs';
import { BATTLES } from './battles.mjs';
import { STOPS, clamp, chapterAt, positionAt, trailAt, advance, readView, shareView, cameraZoom, isSharedView, startsPlaying, fateAt, activePositionAt, followFrame, FOLLOW_WIDTH, FOLLOW_MIN, FOLLOW_MAX } from './model.mjs';
import {effectsAt,previewSalvo,previewShipAction,impactStyle} from './combat.mjs';

const $=id=>document.getElementById(id);
const svgNS='http://www.w3.org/2000/svg';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const initial=readView(location.hash);
const state={...initial,selected:initial.ship,playing:startsPlaying(location.hash,reduced.matches),speed:1,layers:{courses:true,weapons:false,wind:true,labels:false,effects:true},question:null,followWidth:FOLLOW_WIDTH,camera:{x:0,y:0,w:1000,h:600}};
let nodes=[],lastChapter=-1,lastFrame=0,lastPaint=0,drag=null,dragged=false;
let dimensional=null,classic=false;
const selectedShip=()=>state.battle.ships.find(ship=>ship.id===state.selected);
const following=()=>state.view==='follow';
function currentFrame(){
  return following()?followFrame(selectedShip(),state.progress,state.followWidth):state.camera;
}
function sceneState(){return {...state,camera:currentFrame()};}
function refreshScene(){if(dimensional&&!classic)dimensional.update(sceneState());}
function selectShip(id){state.selected=id;setPlaying(false);$('start-hint').hidden=true;renderShip();renderPositions();announce(`Selected ${state.battle.ships.find(s=>s.id===id).name}. Replay paused.`);}
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
  refreshScene();
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
  $('ship-chip').hidden=!following()&&!$('start-hint').hidden;
  $('watch-salvo').disabled=following()&&!previewShipAction(state.battle,s,state.progress);
  $('ship-marker').textContent=s.representative?'REPRESENTATIVE MARKER · not an identified vessel':'SELECTED PARTICIPANT · position is schematic';
  $('weapon-note').textContent=state.battle.id==='yalu'?'Weapon sectors are omitted here: mixed steam-era mountings need ship-specific treatment.':'Weapon sectors show mounting principles, not measured range or clearance.';
  $('ship-portrait').replaceChildren(node('use',{href:`#ship-${s.type}`,x:-25,y:-35,width:50,height:70}));
  sourceLink($('ship-source'),s.source);renderFate();
}
function renderFate(){
  const s=state.battle.ships.find(s=>s.id===state.selected),f=fateAt(s,state.progress);
  const panel=$('ship-damage'),stages=damageStages(state.battle,s),key=state.battle.id+':'+s.id;
  panel.hidden=!stages.length;
  if(panel.dataset.ship!==key){
    panel.dataset.ship=key;
    panel.replaceChildren();
    for(const d of stages){
      const button=html('button',d.title);button.type='button';
      button.addEventListener('click',()=>{seek(d.at);renderPositions();$('chart').scrollIntoView({behavior:'instant',block:'start'});});
      const link=html('a','Damage source ↗');link.href=d.source.url;link.title=d.source.title;link.target='_blank';link.rel='noopener';
      panel.append(button,html('p',d.text),link);
    }
  }
  panel.querySelectorAll('button').forEach((button,i)=>{
    const d=stages[i],label=`${state.progress>=d.at?'◆ ':'↗ '}${d.title}`;
    if(button.textContent!==label)button.textContent=label;
  });
  $('ship-fate').hidden=!f;
  if(f){
    const sinking=sinkingAt(state.battle,s,state.progress,reduced.matches);
    $('fate-status').textContent=f.kind==='sunk'?(sinking.complete?'× SUNK':'↘ SINKING'):'◆ CAPTURED';
    $('fate-text').textContent=f.text+(sinking.started?' Sinking duration, list and depth are illustrative.':'')+(sinking.shallow?' Part of the wreck remains above water.':'');
    $('wreck-source').hidden=!sinking.shallow;
    sourceLink($('fate-source'),f.source);
  }
}

function renderCamera() {
  const camera=currentFrame();
  $('sea').setAttribute('viewBox',`${camera.x} ${camera.y} ${camera.w} ${camera.h}`);
  $('zoom-in').disabled=camera.w<=(following()?FOLLOW_MIN:420);
  $('zoom-out').disabled=camera.w>=(following()?FOLLOW_MAX:1400);
}
function setCamera(camera) {
  state.camera=camera;
  renderCamera();
  refreshScene();
}
function zoom(factor){
  if(following()){
    state.followWidth=clamp(state.followWidth*factor,FOLLOW_MIN,FOLLOW_MAX);
    renderCamera();
    refreshScene();
  }else setCamera(cameraZoom(state.camera,factor));
}
function setView(view) {
  state.view=view;
  $('chart').classList.toggle('atmosphere',view==='atmosphere');
  $('chart').classList.toggle('follow-view',following());
  for(const id of ['tactical','atmosphere','follow'])$(id).setAttribute('aria-pressed',String(view===id));
  $('watch-salvo').textContent=following()?'Watch ship action ▶':'Watch a salvo ▶';
  $('reset-map').setAttribute('aria-label',following()?'Reset close-up zoom':'Reset map framing');
  if(following())$('start-hint').hidden=true;
  renderShip();
  renderCamera();
  renderPositions();
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
    const vessel=node('use',{href:`#ship-${s.type}`,x:-21,y:-32,width:42,height:64,class:'vessel'},rotated);
    const damageRig=node('g',{'aria-hidden':'true'},rotated);
    node('path',{d:'M0-36 3-32 0-28-3-32Z',class:'side-marker'},rotated);
    const label=node('text',{y:44,class:`ship-label ${s.representative?'marker-label':''}`},group,s.representative?`Formation ${s.id.split('-').at(-1)}`:s.name);
    const loss=node('g',{class:'loss-cross','aria-hidden':'true'},group);node('path',{d:'M-15-15 15 15M15-15-15 15'},loss);
    node('rect',{x:-24,y:-33,width:48,height:70,class:'hitbox'},group);
    const choose=()=>{
      if(dragged)return;
      state.selected=s.id;setPlaying(false);$('start-hint').hidden=true;renderShip();renderPositions();
      announce(`Selected ${s.name}. Replay paused. Ship details follow the playback controls.`);
    };
    group.addEventListener('click',choose);
    group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();dragged=false;choose();}});
    group.addEventListener('focus',()=>dimensional?.focusShip(s.id));
    group.addEventListener('blur',()=>dimensional?.focusShip(null));
    const course=node('polyline',{class:`course ${s.side?'enemy':''}`},$('courses'));
    return {s,group,rotated,label,course,loss,vessel,damageRig};
  });
}
function drawDamage(group,damage,changedRig){
  group.replaceChildren();
  if(changedRig){
    node('path',{d:'M0-29Q12-15 10 22L7 28H-7L-10 22Q-12-15 0-29',fill:'#57402b',stroke:'#d0ad6b'},group);
    for(const [mast,y,w] of [['fore',-15,14],['main',2,19],['mizzen',20,12]]){
      if(damage.lost?.includes(mast)){
        node('path',{d:`M-4 ${y-2}L4 ${y+3}M0 ${y-3}V${y+4}`,stroke:'#c8a65e','stroke-width':2},group);
        continue;
      }
      if(mast==='fore'&&damage.yardLost){
        // Two fore-sail tiers keep the two kinds of yard loss distinct in plan view.
        const intactY=damage.yardLost==='fore-course'?y-4:y+6;
        const brokenY=damage.yardLost==='fore-course'?y+6:y-4;
        node('path',{d:`M-9 ${intactY}Q0 ${intactY-4} 9 ${intactY}L8 ${intactY+4}H-8Z`,fill:'#e0d4af'},group);
        node('path',{d:`M0 ${brokenY-2}L6 ${brokenY+2}`,stroke:'#c8a65e','stroke-width':2},group);
        continue;
      }
      const edge=tornAtMast(damage,mast)
        ?`L5 ${y+5}L2 ${y+9}L-2 ${y+3}L-5 ${y+9}L${-w+2} ${y+9}`
        :`Q0 ${y+4} ${-w+2} ${y+9}`;
      node('path',{d:`M${-w} ${y}Q0 ${y-6} ${w} ${y}L${w-2} ${y+9}${edge}Z`,fill:'#e0d4af',stroke:'#f1e5bc','stroke-width':.5},group);
    }
  }
  const marks={
    bow:'M-5-23 -1-20 -3-16 4-18 6-23',
    hull:'M-5-5 -2-11 4-8 2-4 6-1 -3 2Z',
    port:'M-11-6 -6-4 -8 0 -4 3 -10 6Z',
    starboard:'M11-7 6-4 8 0 4 3 10 6Z',
    pilot:'M-4-16H3L6-12 0-10 -4-12Z',
    deck:'M1-11 6-8 4-6 8-3 1-2 -1-6Z',
    funnel:'M-3-6 2-8 4-4 0-1 -3-3Z',
    burn:'M-7 5 -3 1 3 3 7 7 5 13 -3 15 -7 11Z'
  };
  for(const mark of damage?.marks??[]){
    if(marks[mark])node('path',{d:marks[mark],fill:'#261d18',stroke:'#d49e73','stroke-width':1.3},group);
  }
}

function renderPositions() {
  const chapter=state.battle.chapters[chapterAt(state.progress)];
  const focus=state.question===null?chapter.focus:state.battle.questions[state.question].focus;
  for(const {s,group,rotated,label,course,loss,vessel,damageRig} of nodes) {
    const fate=fateAt(s,state.progress),sunk=fate?.kind==='sunk',p=activePositionAt(s,state.progress),selected=s.id===state.selected,highlight=focus.includes(s.id);
    group.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
    const sinking=sinkingAt(state.battle,s,state.progress,reduced.matches),damage=damageAt(state.battle,s,state.progress);
    rotated.style.display=sinking.complete&&!sinking.shallow?'none':'';rotated.style.opacity=String(1-sinking.amount*(sinking.shallow?.55:1));loss.style.display=sinking.complete?'':'none';
    const changedRig=s.type==='sail'&&(damage?.lost||damage?.torn||damage?.yardLost);
    vessel.style.display=changedRig?'none':'';
    if(damageRig.dataset.stage!==String(damage?.at)){
      damageRig.dataset.stage=String(damage?.at);
      drawDamage(damageRig,damage,changedRig);
    }
    const condition=fate?(sunk?(sinking.complete?'Sunk':'Sinking'):'Captured'):damage?'Damaged':'';
    label.textContent=sunk?`${sinking.complete?'×':'↘'} ${s.name} · ${condition}`:s.representative?'Fleet marker':s.name+(damage?' · Damaged':'');
    group.setAttribute('aria-label',`${s.name}${condition?'. '+condition:''}. Inspect ship.`);
    rotated.setAttribute('transform',`rotate(${p.heading.toFixed(2)})`);
    group.classList.toggle('selected',selected); group.classList.toggle('highlighted',highlight);
    group.setAttribute('aria-pressed',String(selected));
    label.style.display=sunk||damage||state.layers.labels||selected||highlight?'':'none';
    course.setAttribute('points',trailAt(s,s.fate?.kind==='sunk'?Math.min(state.progress,s.fate.at):state.progress).map(p=>p.join(',')).join(' '));
    course.classList.toggle('focus-course',selected||highlight);
  }
  // Overlays belong only to the selected ship, keeping the tactical chart readable.
  if(state.layers.weapons && state.battle.id!=='yalu'&&!fateAt(state.battle.ships.find(s=>s.id===state.selected),state.progress)) {
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
  {
    const current=eventsFor(state.battle).filter(e=>e.at<=state.progress+.0001).at(-1);
    for(const b of $('event-list').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.event===current?.id));
  }
  $('shots').replaceChildren();
  if(state.layers.effects&&(classic||!dimensional))for(const e of effectsAt(state.battle,state.progress)){
    const g=$('shots'),p=e.origin,q=e.impact,style=impactStyle(e),impactAge=style.age;
    node('circle',{cx:p.x+e.age*9,cy:p.z,r:10+e.age*8,fill:'#e8dfc7',opacity:e.gunSmoke*.22,class:'shot-smoke'},g);
    if(e.hitSmoke)node('circle',{cx:q.x+impactAge*6,cy:q.z,r:10+impactAge*7,fill:style.color,opacity:e.hitSmoke*.4,class:'shot-smoke'},g);
    if(!reduced.matches){
      if(e.flash)node('circle',{cx:p.x,cy:p.z,r:11,fill:'#ffca61',opacity:e.flash},g);
      if(e.impactFlash){node('circle',{cx:q.x,cy:q.z,r:14*style.scale,fill:'#ff7529',opacity:e.impactFlash},g);node('circle',{cx:q.x,cy:q.z,r:7*style.scale,fill:'#fff0a8',opacity:e.impactFlash},g);}
      if(e.debris)for(let i=0;i<7;i++){
        const a=i*2.4,spread=(1-e.debris)*23;
        node('path',{d:`M${q.x+Math.sin(a)*spread} ${q.z+Math.cos(a)*spread}l3 -4`,stroke:'#c4a375','stroke-width':2,opacity:e.debris},g);
      }
      if(e.sparks)for(let i=0;i<5;i++){const a=i*2.4,spread=(1-e.sparks)*18;node('path',{d:`M${q.x+Math.sin(a)*spread} ${q.z+Math.cos(a)*spread}l2 -3`,stroke:'#edf2df','stroke-width':2,opacity:e.sparks},g);}
      if(e.ricochet)node('circle',{cx:e.ricochet.x,cy:e.ricochet.z,r:1.7,fill:'#94998b'},g);
      if(e.splash)node('circle',{cx:q.x,cy:q.z,r:8+Math.max(0,e.impactAge)*14,fill:'none',stroke:'#d6f7f2','stroke-width':3,opacity:e.splash},g);
      if(e.projectile)node('circle',{cx:e.projectile.x,cy:e.projectile.z,r:1.7,fill:'#302820'},g);
    }
  }
  if(following()){
    const ship=selectedShip(),fate=fateAt(ship,state.progress);
    const loss=sinkingAt(state.battle,ship,state.progress,reduced.matches);
    const condition=loss.started?(loss.complete?'Sunk':'Sinking'):fate?'Captured':damageAt(state.battle,ship,state.progress)?'Damaged':'Following';
    const label=`${ship.representative?'Formation marker':ship.name} · ${condition} · Details ↓`;
    if($('ship-chip').textContent!==label)$('ship-chip').textContent=label;
    $('ship-chip').hidden=false;
    renderCamera();
  }
  renderFate();refreshScene();
}
function loadBattle(battle,progress=0,selected=battle.defaultShip) {
  state.battle=battle;state.progress=progress;state.selected=selected;state.question=null;lastChapter=-1;
  $('start-hint').hidden=following()||progress>0||isSharedView(location.hash);
  setCamera({x:0,y:0,w:1000,h:600});
  $('battle-title').textContent=battle.name;$('battle-meta').textContent=`${battle.date} / ${battle.place}`;
  $('battle-takeaway').textContent=battle.takeaway;$('battle-introduction').textContent=battle.introduction;
  $('sea-label').textContent=battle.seaLabel;
  $('wind-label').textContent=battle.wind;
  $('wind-key').querySelector('svg').style.transform=`rotate(${battle.windAngle}deg)`;
  $('wind-key').querySelector('svg').style.opacity=battle.id==='trafalgar'||battle.id==='lepanto'?'1':'.35';
  $('ship-count').textContent=`${battle.ships.length} diagram markers`;
  $('battle-tabs').value=battle.id;
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
  $('event-guide').hidden=false;$('event-era').textContent=String(battle.year);
  $('gunfire-note').textContent='Selected source-linked combat episodes. Animated rounds stand for exchanges, not a shot-by-shot log. Timing, trajectories and damage shapes remain schematic; fires and losses are separate sourced events.';
  $('event-list').replaceChildren();
  for(const event of eventsFor(battle)){
    const source=eventSource(battle,event),card=html('div'),button=html('button',event.title),link=html('a',source.title+' ↗');
    button.type='button';button.dataset.event=event.id;button.setAttribute('aria-pressed','false');
    button.addEventListener('click',()=>{seek(event.at);state.selected=event.focus;renderShip();renderPositions();$('chart').scrollIntoView({behavior:'instant',block:'start'});announce(event.title+'. '+event.text);});
    link.href=source.url;card.append(button,html('p',event.certainty,'eyebrow'),html('p',event.text),link);$('event-list').append(card);
  }
  $('sources-title').textContent=`Reading for ${battle.name}`;
  $('source-list').replaceChildren(...battle.sources.map(s=>{
    const li=html('li'),a=html('a',s.title);a.href=s.url;li.append(a,html('p',s.note));return li;
  }));
  const damageList=$('damage-events');
  damageList.replaceChildren(html('span','SHIP DAMAGE · select to inspect'));
  for(const ship of battle.ships){
    for(const stage of damageStages(battle,ship)){
      const button=html('button',`${ship.name} · ${stage.title}`);
      button.type='button';
      button.addEventListener('click',()=>{
        state.selected=ship.id;
        seek(stage.at);
        renderShip();
        $('chart').scrollIntoView({behavior:'instant',block:'start'});
        announce(`${ship.name}. ${stage.title}. Replay paused.`);
      });
      damageList.append(button);
    }
  }
  damageList.hidden=damageList.childElementCount===1;
  const outcomes=battle.ships.filter(s=>s.fate);$('loss-events').hidden=!outcomes.length;
  $('loss-events').replaceChildren(html('span','SHIP OUTCOMES · select to inspect'));
  for(const s of outcomes){const button=html('button',`${s.fate.kind==='sunk'?'×':'◆'} ${s.name} · ${s.fate.kind==='sunk'?'Sunk':'Captured'}`);button.type='button';button.addEventListener('click',()=>{state.selected=s.id;seek(s.fate.at);renderShip();renderPositions();$('chart').scrollIntoView({behavior:'instant',block:'start'});announce(`${s.name}: ${s.fate.kind}. ${s.fate.text}`);});$('loss-events').append(button);}
  $('share-status').replaceChildren();
  chapterButtons();buildTerrain();buildFleet();renderShip();renderLayers();renderMoment();renderPositions();setPlaying(state.playing);
}
function seek(progress) {
  state.progress=clamp(progress,0,1);state.question=null;setPlaying(false);$('start-hint').hidden=true;
  renderMoment();renderPositions();announce(`${state.battle.name}: ${state.battle.chapters[chapterAt(progress)].label}. Replay paused.`);
}
for(const battle of BATTLES){const option=html('option',`${battle.year} · ${battle.name}`);option.value=battle.id;$('battle-tabs').append(option);}
$('battle-tabs').addEventListener('change',e=>{const battle=BATTLES.find(b=>b.id===e.target.value);setPlaying(!reduced.matches);loadBattle(battle);announce(`${battle.name}, ${battle.year}. ${battle.era}.`);});
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
$('zoom-in').addEventListener('click',()=>zoom(.8));
$('zoom-out').addEventListener('click',()=>zoom(1.25));
$('reset-map').addEventListener('click',()=>{
  if(following()){
    state.followWidth=FOLLOW_WIDTH;
    renderCamera();
    refreshScene();
  }else setCamera({x:0,y:0,w:1000,h:600});
});
$('watch-salvo').addEventListener('click',()=>{
  if(following()){
    const action=previewShipAction(state.battle,selectedShip(),state.progress);
    if(!action)return;
    state.layers.effects=true;
    renderLayers();
    seek(reduced.matches?action.still:action.at-.012);
    $('chart').scrollIntoView({behavior:'instant',block:'center'});
    setPlaying(!reduced.matches);
    announce(action.title);
    return;
  }
  const e=previewSalvo(state.battle);state.layers.effects=true;renderLayers();
  if(e){state.selected=e.shooter||e.target||e.focus;renderShip();seek(((reduced.matches?e.arrival+.3:e.firedAt+.03))/100);}else seek(.48);
  setCamera({x:0,y:0,w:1000,h:600});setPlaying(!reduced.matches);
  $('chart').scrollIntoView({behavior:'instant',block:'center'});
  announce('Selected sourced combat episode. Animated rounds and travel time are representative; read its evidence card for the limits.');
});
$('tactical').addEventListener('click',()=>setView('tactical'));
$('atmosphere').addEventListener('click',()=>setView('atmosphere'));
$('follow').addEventListener('click',()=>setView('follow'));
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
  dragged=false;if(following()||e.button!==0||e.target.closest('.ship')||e.pointerType==='touch')return;
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
reduced.addEventListener('change',e=>{if(e.matches)setPlaying(false);renderPositions();});
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

function setClassic(value){
  classic=value;$('classic-chart').setAttribute('aria-pressed',String(value));
  $('chart').classList.toggle('dimensional',!value&&!!dimensional);
  dimensional?.setVisible(!value);renderPositions();
}
$('classic-chart').addEventListener('click',()=>setClassic(!classic));
function sceneUnavailable(message){setClassic(true);$('classic-chart').disabled=true;$('scene-status').textContent=message;}
// Dynamic import keeps the complete classic chart available if WebGL or the
// optional renderer fails. No replay or historical data is delegated to WebGL.
if(!new URLSearchParams(location.search).has('classic')){
  import('./scene.mjs').then(({createScene})=>{
    try{
      dimensional=createScene($('chart'),{onSelect:selectShip,onPan:(dx,dy)=>{if(following())return;const c=state.camera;setCamera({...c,x:clamp(c.x+dx,-250,1250-c.w),y:clamp(c.y+dy,-150,750-c.h)});},onFailure:sceneUnavailable,reducedMotion:reduced.matches});
      refreshScene();setClassic(classic);
    }catch{sceneUnavailable('The dimensional sea is unavailable. Classic chart is ready.');}
  }).catch(()=>sceneUnavailable('The dimensional sea is unavailable. Classic chart is ready.'));
}else{setClassic(true);$('classic-chart').disabled=true;}

import { BATTLES } from './battles.mjs?v=atlas-review';
export const STOPS = [0, .24, .5, .75, 1];
export const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
export function chapterAt(progress) {
  let result=0;
  STOPS.forEach((stop,index)=>{if(progress>=stop-1e-8) result=index;});
  return result;
}
export function positionAt(ship, progress) {
  const t=clamp(Number.isFinite(progress)?progress:0,0,1);
  const i=Math.min(chapterAt(t),3);
  const f=(t-STOPS[i])/(STOPS[i+1]-STOPS[i]);
  const a=ship.points[i],b=ship.points[i+1];
  const turn=((b[2]-a[2]+540)%360)-180;
  return {x:a[0]+(b[0]-a[0])*f,y:a[1]+(b[1]-a[1])*f,heading:a[2]+turn*f};
}
export function trailAt(ship, progress) {
  const current=positionAt(ship,progress);
  return [...ship.points.slice(0,chapterAt(progress)+1).map(p=>p.slice(0,2)),[current.x,current.y]];
}
export function advance(progress, elapsed, speed) {
  return clamp(progress+clamp(elapsed,0,.15)*speed/100,0,1);
}
export function readView(hash) {
  const p=new URLSearchParams(hash.replace(/^#/,''));
  const battle=BATTLES.find(b=>b.id===p.get('battle')) || BATTLES.find(b=>b.id==='trafalgar');
  const n=Number(p.get('t')??0);
  const view=['atmosphere','follow'].includes(p.get('view'))?p.get('view'):'tactical';
  const ids=p.get('pair')?.split(',');
  const pair=view==='follow'&&ids?.length===2&&ids[0]!==ids[1]&&ids.every(id=>battle.ships.some(ship=>ship.id===id))?ids:null;
  return {battle,progress:clamp(Number.isFinite(n)?n:0,0,1),ship:battle.ships.some(s=>s.id===p.get('ship'))?p.get('ship'):battle.defaultShip,moment:p.get('moment'),view,pair};
}
export function shareView(state) {
  const params=new URLSearchParams({battle:state.battle.id,t:state.progress.toFixed(3),ship:state.selected,view:state.view});
  if(state.moment)params.set('moment',state.moment);
  if(state.view==='follow'&&state.pair)params.set('pair',state.pair.join(','));
  return '#'+params;
}
export function isSharedView(hash) {
  return BATTLES.some(b=>b.id===new URLSearchParams(hash.replace(/^#/, '')).get('battle'));
}
export function startsPlaying(hash, reducedMotion) {
  return !reducedMotion && !isSharedView(hash);
}
export function cameraZoom(camera, factor) {
  const width=clamp(camera.w*factor,420,1400), height=width*.6;
  return {x:clamp(camera.x+(camera.w-width)/2,-250,1250-width),y:clamp(camera.y+(camera.h-height)/2,-150,750-height),w:width,h:height};
}

// Loss thresholds are authored replay positions, never damage adjudication.
export function fateAt(ship,progress){return ship.fate&&Number.isFinite(progress)&&progress>=ship.fate.at?ship.fate:null;}
export function activePositionAt(ship,progress){return positionAt(ship,ship.fate?.kind==='sunk'?Math.min(progress,ship.fate.at):progress);}

export const FOLLOW_WIDTH = 156;
export const FOLLOW_MIN = 128;
export const FOLLOW_MAX = 280;
export function followFrame(ship,progress,width=FOLLOW_WIDTH){
  const {x,y,heading}=activePositionAt(ship,progress);
  const height=width*.6;
  return {x:x-width/2,y:y-height/2,w:width,h:height,heading};
}

export function followPairFrame(ships,progress,scale=1){
  const [a,b]=ships.map(ship=>activePositionAt(ship,progress));
  const dx=b.x-a.x,dy=b.y-a.y;
  const w=(Math.abs(dx)+112)*scale,h=(Math.abs(dy)+112)*scale;
  return {x:(a.x+b.x-w)/2,y:(a.y+b.y-h)/2,w,h,pairSpan:{dx,dy,scale}};
}

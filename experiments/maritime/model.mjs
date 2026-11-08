import { BATTLES } from './battles.mjs';
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
  const battle=BATTLES.find(b=>b.id===p.get('battle')) || BATTLES[1];
  const n=Number(p.get('t')??0);
  return {battle,progress:clamp(Number.isFinite(n)?n:0,0,1),ship:battle.ships.some(s=>s.id===p.get('ship'))?p.get('ship'):battle.defaultShip,view:p.get('view')==='atmosphere'?'atmosphere':'tactical'};
}
export function shareView(state) {
  return '#'+new URLSearchParams({battle:state.battle.id,t:state.progress.toFixed(3),ship:state.selected,view:state.view});
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

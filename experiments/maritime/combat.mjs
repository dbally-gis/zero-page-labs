import {damageStages} from './damage.mjs';
import {eventsFor} from './battle-events.mjs?v=atlas-review';
import {positionAt,activePositionAt,clamp,fateAt} from './model.mjs?v=atlas-review';
const DEG=Math.PI/180;
// The Monitor model’s pilothouse face is 17 units forward before the 1.08 scene scale.
const FORWARD_OFFSETS={stern:-22,bow:22,pilothouse:17*1.08};
const GUN_KINDS=new Set(['muzzle','timber','armor','shell']);
const FLIGHT_KINDS=new Set(['timber','armor','shell']);
const fade=(age,life)=>age>=0?Math.max(0,1-age/life):0;
const point=(ship,progress,anchor)=>{
  const p=activePositionAt(ship,progress),offset=FORWARD_OFFSETS[anchor]??0,a=p.heading*DEG;
  return {x:p.x+Math.sin(a)*offset,y:anchor==='pilothouse'?9*1.08:8,z:p.y-Math.cos(a)*offset};
};
// Finite, authored historical episodes only. No nearest-target choice or simulated hit ratio.
export function shotEvent(battle,index){
  const event=eventsFor(battle).filter(e=>e.kind)[index];if(!event)return null;
  const ship=battle.ships.find(s=>s.id===(event.shooter||event.target||event.focus));
  const target=event.target?battle.ships.find(s=>s.id===event.target):null;
  const firedAt=event.at*100,p=point(ship,event.at,event.muzzleAnchor),q=target?point(target,event.at,event.anchor):p;
  if(fateAt(ship,event.at)||target&&fateAt(target,event.at))return null;
  const heading=positionAt(ship,event.at).heading;
  const bearing=target&&event.shooter?Math.atan2(q.x-p.x,p.z-q.z)/DEG:heading+(ship.type==='galley'?0:90);
  const travel=event.shooter&&FLIGHT_KINDS.has(event.kind)?clamp(Math.hypot(q.x-p.x,q.z-p.z)/210,.35,1.65):0;
  const arrival=firedAt+travel;
  if(target&&fateAt(target,arrival/100))return null;
  const origin={x:p.x+Math.sin(bearing*DEG)*10,y:7,z:p.z-Math.cos(bearing*DEG)*10};
  return {...event,eventId:event.id,id:index,firedAt,arrival,travel,origin,impact:target?point(target,arrival/100,event.anchor):p,bearing,hit:!!target};
}
export function effectsAt(battle,progress){
  if(!Number.isFinite(progress)||progress<0||progress>1)return [];
  const time=progress*100;
  return eventsFor(battle).filter(e=>e.kind).map((_,i)=>shotEvent(battle,i)).filter(Boolean).filter(e=>{
    const age=time-e.firedAt,life=e.kind==='reported-fire'?101-e.firedAt:5.5;
    return age>=0&&age<life&&![e.shooter,e.target].filter(Boolean).some(id=>fateAt(battle.ships.find(s=>s.id===id),progress));
  }).map(e=>{
    const age=time-e.firedAt,impactAge=time-e.arrival,fire=e.kind==='reported-fire',flight=e.travel>0,f=flight?clamp(age/e.travel,0,1):1;
    const target=e.target?battle.ships.find(s=>s.id===e.target):null;
    if(fire&&target)e.impact=point(target,progress,e.anchor);
    const debris=['timber','ram','shell'].includes(e.kind)?fade(impactAge,.8):0;
    const sparks=e.kind==='armor'?fade(impactAge,.4):0;
    const impactFlash=fire?.75:e.kind==='shell'?fade(impactAge,.45):e.kind==='explosion'?fade(impactAge,1.2):0;
    const hitSmoke=fire?.7:e.kind==='muzzle'?0:fade(impactAge,e.kind==='armor'?1:e.kind==='timber'||e.kind==='ram'?2:4);
    const projectile=flight&&age<e.travel?{x:e.origin.x+(e.impact.x-e.origin.x)*f,y:7+(e.impact.y-7)*f,z:e.origin.z+(e.impact.z-e.origin.z)*f}:null;
    const phase=impactAge/.4,a=e.bearing*DEG;
    const ricochet=e.deflect&&phase>=0&&phase<1?{x:e.impact.x+Math.cos(a)*phase*24,y:e.impact.y+phase*7,z:e.impact.z+Math.sin(a)*phase*24}:null;
    return {...e,age,impactAge,flash:e.shooter&&GUN_KINDS.has(e.kind)&&age<.22?Math.pow(1-age/.22,.5):0,gunSmoke:e.shooter&&GUN_KINDS.has(e.kind)?fade(age,5.5):0,impactFlash,hitSmoke,debris,sparks,ricochet,splash:0,projectile};
  });
}
export function previewSalvo(battle){
  const list=eventsFor(battle).filter(e=>e.kind),index=list.findIndex(e=>e.shooter&&FLIGHT_KINDS.has(e.kind));
  return shotEvent(battle,index>=0?index:0);
}
// Use only authored episodes for the selected ship, including outcomes with no gunfire.
export function previewShipAction(battle,ship,progress){
  const shots=eventsFor(battle).filter(event=>event.kind)
    .map((_,i)=>shotEvent(battle,i))
    .filter(event=>event&&(event.target===ship.id||event.shooter===ship.id))
    .map(event=>({at:event.firedAt/100,still:(event.arrival+.12)/100,title:event.title}));
  const stages=damageStages(battle,ship).map(stage=>({at:stage.at,still:stage.at,title:stage.title}));
  if(ship.fate?.kind==='sunk'){
    const at=ship.fate.at;
    // A reduced-motion view jumps to the loss threshold and draws the final marker.
    stages.push({at,still:at,title:`${ship.name} sinks`});
  }
  const moments=[...shots,...stages].sort((a,b)=>a.at-b.at);
  return moments.find(moment=>moment.at>=progress-.001)??moments.at(-1)??null;
}
// Shared by SVG and 3D. Bounded visual sizes never grow with a long reported fire.
export function impactStyle(effect){
  const age=effect.kind==='reported-fire'?1:Math.min(4,Math.max(0,effect.impactAge));
  return {age,burst:effect.kind==='shell'||effect.kind==='explosion',scale:effect.kind==='explosion'?2.4:effect.kind==='shell'?.65:1,color:effect.kind==='armor'?'#edf2df':effect.kind==='timber'?'#ab9677':'#625d53',debrisColor:effect.kind==='shell'?0x8c9693:0xb69362};
}

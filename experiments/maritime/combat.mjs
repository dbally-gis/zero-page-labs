import {positionAt,clamp} from './model.mjs';

// Illustrative gunfire, not a reconstruction of recorded shots or ship damage.
// One global volley every 1.6 replay seconds bounds flashes and particle counts.
const START=24,END=91.2,CADENCE=1.6,SMOKE_LIFE=5.5;
const deg=Math.PI/180;
const difference=(a,b)=>((a-b+540)%360)-180;
function targetFor(battle,ship,progress){
  const p=positionAt(ship,progress),targets=[];
  for(const other of battle.ships){
    if(other.side===ship.side)continue;
    const q=positionAt(other,progress),dx=q.x-p.x,dy=q.y-p.y,distance=Math.hypot(dx,dy);
    if(distance<25||distance>420)continue;
    const bearing=Math.atan2(dx,-dy)/deg,relative=difference(bearing,p.heading);
    if(ship.type==='sail'&&Math.abs(Math.abs(relative)-90)>47)continue;
    if(ship.type==='galley'&&Math.abs(relative)>38)continue;
    targets.push({ship:other,position:q,distance,bearing});
  }
  return targets.sort((a,b)=>a.distance-b.distance)[0]||null;
}
export function shotEvent(battle,index){
  const firedAt=START+index*CADENCE;
  if(index<0||firedAt>END)return null;
  const progress=firedAt/100;
  const eligible=battle.ships.map(ship=>({ship,target:targetFor(battle,ship,progress)})).filter(x=>x.target);
  if(!eligible.length)return null;
  const {ship,target}=eligible[index%eligible.length],p=positionAt(ship,progress);
  const angle=target.bearing*deg;
  const origin={x:p.x+Math.sin(angle)*10,y:7,z:p.y-Math.cos(angle)*10};
  const travel=clamp(target.distance/210,.35,1.65),arrival=firedAt+travel;
  const destination=positionAt(target.ship,arrival/100),hit=index%3!==1;
  let impact={x:destination.x,y:hit?8:0,z:destination.y};
  if(!hit){
    const fleet=battle.ships.map(s=>positionAt(s,arrival/100));
    outer:for(const radius of [65,90,125,175,250])for(let j=0;j<24;j++){
      const a=angle+(j%2?-1:1)*Math.ceil(j/2)*Math.PI/12;
      const point={x:destination.x+Math.cos(a)*radius,y:0,z:destination.y+Math.sin(a)*radius};
      if(fleet.every(p=>Math.hypot(point.x-p.x,point.z-p.y)>=55)){impact=point;break outer;}
    }
  }
  return {id:index,shooter:ship.id,target:target.ship.id,hit,firedAt,arrival,travel,origin,impact,bearing:target.bearing};
}
export function effectsAt(battle,progress){
  if(!Number.isFinite(progress)||progress<0||progress>1)return [];
  const time=progress*100,first=Math.max(0,Math.ceil((time-SMOKE_LIFE-START)/CADENCE)),last=Math.floor((time-START+1e-8)/CADENCE),events=[];
  for(let i=first;i<=last;i++){
    const e=shotEvent(battle,i);if(!e)continue;
    const age=Math.max(0,time-e.firedAt),impactAge=time-e.arrival,f=clamp(age/e.travel,0,1);
    events.push({...e,age,impactAge,
      flash:age<.22?Math.pow(1-age/.22,.5):0,
      gunSmoke:Math.max(0,1-age/SMOKE_LIFE),
      impactFlash:e.hit&&impactAge>=0&&impactAge<.95?Math.pow(1-impactAge/.95,1.5):0,
      hitSmoke:e.hit&&impactAge>=0?Math.max(0,1-impactAge/3.8):0,
      splash:!e.hit&&impactAge>=0&&impactAge<1.3?Math.sin(impactAge/1.3*Math.PI):0,
      projectile:age>=0&&age<e.travel?{x:e.origin.x+(e.impact.x-e.origin.x)*f,y:e.origin.y+(e.impact.y-e.origin.y)*f+Math.sin(f*Math.PI)*12,z:e.origin.z+(e.impact.z-e.origin.z)*f}:null,
    });
  }
  return events;
}
export function previewSalvo(battle){
  for(let i=8;i<30;i++){
    const e=shotEvent(battle,i);if(!e||!e.hit||e.shooter==='minnesota')continue;
    if(battle.ships.some(s=>s.id===e.shooter&&!s.representative)&&battle.ships.some(s=>s.id===e.target&&!s.representative))return e;
  }
  return shotEvent(battle,15);
}

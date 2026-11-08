import test from 'node:test';
import assert from 'node:assert/strict';
import {BATTLES} from '../experiments/maritime/battles.mjs';
import {eventsFor,eventSource} from '../experiments/maritime/battle-events.mjs';
import {effectsAt,shotEvent,previewSalvo,impactStyle} from '../experiments/maritime/combat.mjs';
import {fateAt,positionAt} from '../experiments/maritime/model.mjs';
const gun=new Set(['muzzle','timber','armor','shell']);
for(const battle of BATTLES){
  test(`${battle.name}: selected episodes have resolvable evidence and participants`,()=>{
    const events=eventsFor(battle);assert.ok(events.length>=3);let previous=-1;
    assert.equal(new Set(events.map(e=>e.id)).size,events.length);
    for(const e of events){
      assert.ok(e.at>previous&&e.at<1);previous=e.at;
      assert.ok(e.text);assert.ok(e.certainty);
      const source=eventSource(battle,e);assert.ok(source.title);assert.equal(new URL(source.url).protocol,'https:');
      for(const id of [e.focus,e.shooter,e.target].filter(Boolean))assert.ok(battle.ships.some(s=>s.id===id));
    }
    assert.equal(shotEvent(battle,events.filter(e=>e.kind).length),null);
  });
  test(`${battle.name}: firing preview selects an authored episode`,()=>{
    const e=previewSalvo(battle);assert.ok(e);assert.ok(gun.has(e.kind));
    const start=effectsAt(battle,(e.firedAt+.03)/100).find(x=>x.id===e.id);
    assert.ok(start.flash>0);assert.ok(start.gunSmoke>0);
    if(e.travel>0){assert.equal(start.hitSmoke,0);assert.ok(start.projectile);}
  });
  test(`${battle.name}: scrub restoration and bounded visuals`,()=>{
    const original=effectsAt(battle,.53);effectsAt(battle,.99);assert.deepEqual(effectsAt(battle,.53),original);
    for(let i=0;i<=1000;i++){
      const effects=effectsAt(battle,i/1000);assert.ok(effects.length<=5);
      for(const e of effects){
        for(const value of [e.flash,e.gunSmoke,e.hitSmoke,e.impactFlash,e.debris,e.sparks])assert.ok(Number.isFinite(value)&&value>=0&&value<=1);
        assert.ok(impactStyle(e).age<=4);
        for(const id of [e.shooter,e.target].filter(Boolean))assert.equal(fateAt(battle.ships.find(s=>s.id===id),i/1000),null);
      }
    }
    assert.deepEqual(effectsAt(battle,.05),[]);
  });
  test(`${battle.name}: material response does not invent a ship fire`,()=>{
    const animated=eventsFor(battle).filter(e=>e.kind);
    animated.forEach((entry,i)=>{
      const shot=shotEvent(battle,i);assert.ok(shot);
      const e=effectsAt(battle,(shot.arrival+.1)/100).find(x=>x.id===i);assert.ok(e);
      if(entry.kind==='timber'){assert.ok(e.debris>0);assert.equal(e.impactFlash,0);assert.equal(e.sparks,0);}
      if(entry.kind==='armor'){assert.ok(e.sparks>0);assert.equal(e.impactFlash,0);assert.equal(e.debris,0);}
      if(entry.kind==='muzzle'){assert.equal(e.hit,false);assert.equal(e.projectile,null);assert.equal(e.hitSmoke,0);assert.equal(e.impactFlash,0);}
      if(entry.kind==='ram'){assert.equal(e.flash,0);assert.equal(e.gunSmoke,0);assert.equal(e.projectile,null);assert.ok(e.debris>0);assert.equal(e.impactFlash,0);}
      if(entry.kind==='reported-fire'){assert.equal(e.flash,0);assert.equal(e.projectile,null);assert.ok(e.impactFlash>0);assert.equal(impactStyle(e).age,1);}
      if(entry.kind==='explosion'){assert.equal(e.flash,0);assert.equal(e.projectile,null);assert.ok(e.impactFlash>0);assert.equal(impactStyle(e).burst,true);}
      if(entry.kind==='shell'){assert.ok(e.impactFlash>0);assert.equal(impactStyle(e).burst,true);const later=effectsAt(battle,(shot.arrival+1)/100).find(x=>x.id===i);assert.equal(later.impactFlash,0);}
    });
  });
}
test('authored contacts retain the researched ship pairs',()=>{
  const pair=id=>eventsFor(BATTLES.find(b=>b.id===id)).filter(e=>e.kind&&e.kind!=='muzzle'&&e.shooter).map(e=>[e.shooter,e.target,e.kind]);
  assert.ok(pair('diu').some(e=>e[0]==='flor'&&e[1]==='egyptian-rear'));
  assert.ok(pair('gravelines').some(e=>e[0]==='revenge'&&e[1]==='san-martin'));
  assert.ok(pair('hampton-roads').some(e=>e[0]==='virginia'&&e[1]==='monitor'&&e[2]==='armor'));
  assert.ok(pair('lissa').some(e=>e[0]==='ferdinand-max'&&e[1]==='re-italia'&&e[2]==='ram'));
  assert.ok(pair('yalu').some(e=>e[0]==='zhenyuan'&&e[1]==='matsushima'&&e[2]==='shell'));
  assert.ok(pair('manila-bay').some(e=>e[0]==='olympia'&&e[1]==='reina-cristina'&&e[2]==='shell'));
});
test('fires disappear at sourced loss thresholds without changing fate data',()=>{
  const battle=BATTLES.find(b=>b.id==='manila-bay');
  assert.ok(effectsAt(battle,.8).filter(e=>e.kind==='reported-fire').length===2);
  assert.equal(effectsAt(battle,.85).filter(e=>e.kind==='reported-fire').length,1);
  assert.equal(effectsAt(battle,.91).filter(e=>e.kind==='reported-fire').length,0);
});
test('fleet-only accounts do not manufacture a target impact',()=>{
  for(const id of ['lepanto','chesapeake']){
    const battle=BATTLES.find(b=>b.id===id);
    assert.ok(eventsFor(battle).filter(e=>e.kind).every(e=>e.kind==='muzzle'&&!e.target));
  }
});
test('invalid progress creates no effects',()=>{
  for(const battle of BATTLES)for(const progress of [NaN,Infinity,-1,2])assert.deepEqual(effectsAt(battle,progress),[]);
});

test('Olympia opening discharge originates at the documented forward mounting',()=>{
  const b=BATTLES.find(b=>b.id==='manila-bay'),e=shotEvent(b,0),ship=b.ships.find(s=>s.id==='olympia');
  const p=positionAt(ship,e.at),a=p.heading*Math.PI/180;
  const forward=(e.origin.x-p.x)*Math.sin(a)-(e.origin.z-p.y)*Math.cos(a);assert.ok(forward>=21.9&&forward<=22.1);
});

const {DAMAGE,damageAt,damageStages,sinkingAt}=await import('../experiments/maritime/damage.mjs');
test('Trafalgar damage stages are evidence-linked, reversible and vessel-specific',()=>{
  const battle=BATTLES.find(b=>b.id==='trafalgar');
  for(const id of ['victory','redoutable']){
    const ship=battle.ships.find(s=>s.id===id),stage=damageStages(battle,ship)[0];
    assert.ok(stage.source.url.startsWith('https://'));
    assert.equal(damageAt(battle,ship,stage.at-.001),null);
    assert.equal(damageAt(battle,ship,stage.at),stage);
    assert.equal(damageAt(battle,ship,0),null);
  }
  assert.deepEqual(damageAt(battle,battle.ships.find(s=>s.id==='redoutable'),1).lost,['main','mizzen']);
  assert.equal(damageAt(battle,battle.ships.find(s=>s.id==='victory'),1).torn,true);
  for(const ship of battle.ships.filter(s=>!['victory','redoutable'].includes(s.id)))assert.equal(damageAt(battle,ship,1),null);
});
for(const battle of BATTLES)for(const ship of battle.ships.filter(s=>s.fate))test(`${battle.id}/${ship.id}: loss transition follows documented fate`,()=>{
  const t=ship.fate.at;
  assert.equal(sinkingAt(battle,ship,t-.001).started,false);
  if(ship.fate.kind!=='sunk'){assert.equal(sinkingAt(battle,ship,1).started,false);return;}
  assert.equal(sinkingAt(battle,ship,t).amount,0);
  assert.ok(Math.abs(sinkingAt(battle,ship,t+.0175).amount-.5)<1e-8);
  assert.equal(sinkingAt(battle,ship,t+.036).complete,true);
  assert.equal(sinkingAt(battle,ship,t,true).complete,true);
  assert.equal(sinkingAt(battle,ship,t+.036).shallow,battle.id==='manila-bay');
  assert.equal(sinkingAt(battle,ship,t-.001).amount,0);
});

test('each encounter has ordered, reversible damage on a documented participant',()=>{
  assert.deepEqual(Object.keys(DAMAGE).sort(),BATTLES.map(b=>b.id).sort());
  for(const battle of BATTLES){
    for(const [id,stages] of Object.entries(DAMAGE[battle.id])){
      const ship=battle.ships.find(s=>s.id===id);
      assert.ok(ship&&!ship.representative,`${battle.id}/${id}`);
      assert.ok(stages.length);
      for(const [index,stage] of stages.entries()){
        assert.match(stage.source.url,/^https:\/\//);
        assert.ok(stage.at>(stages[index-1]?.at??0)&&stage.at<(ship.fate?.at??1));
        assert.equal(damageAt(battle,ship,stage.at),stage);
        assert.equal(damageAt(battle,ship,stage.at-1e-6),stages[index-1]??null);
      }
    }
  }
});
test('Downs fire applies to Santa Teresa without inventing a projectile',()=>{
  const battle=BATTLES.find(b=>b.id==='downs');
  const fire=effectsAt(battle,.66).find(e=>e.kind==='reported-fire');
  assert.equal(fire?.eventId,'fireships');
  assert.equal(fire.projectile,null);
});

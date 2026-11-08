import {TRAFALGAR_EVENTS,TRAFALGAR_EVIDENCE} from '../experiments/maritime/trafalgar-events.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {BATTLES} from '../experiments/maritime/battles.mjs';
import {effectsAt,shotEvent,previewSalvo} from '../experiments/maritime/combat.mjs';
import {positionAt} from '../experiments/maritime/model.mjs';

for(const b of BATTLES.filter(b=>b.id!=='trafalgar')){
  test(`${b.name}: salvo preview joins opposing named ships`,()=>{
    const e=previewSalvo(b);assert.ok(e);assert.equal(e.hit,true);
    const shooter=b.ships.find(s=>s.id===e.shooter),target=b.ships.find(s=>s.id===e.target);
    assert.equal(shooter.representative,false);assert.equal(target.representative,false);assert.notEqual(shooter.side,target.side);
    const p=positionAt(shooter,e.firedAt/100);assert.ok(Math.abs(Math.hypot(e.origin.x-p.x,e.origin.z-p.y)-10)<1e-8);
  });
  test(`${b.name}: muzzle flash precedes hit fire and smoke`,()=>{
    const e=previewSalvo(b),start=effectsAt(b,(e.firedAt+.03)/100).find(x=>x.id===e.id);
    assert.ok(start.flash>0);assert.ok(start.gunSmoke>0);assert.equal(start.impactFlash,0);assert.equal(start.hitSmoke,0);assert.ok(start.projectile);
    const arrived=effectsAt(b,(e.arrival+.15)/100).find(x=>x.id===e.id);
    assert.equal(arrived.flash,0);assert.ok(arrived.impactFlash>0);assert.ok(arrived.hitSmoke>0);assert.equal(arrived.projectile,null);
  });
  test(`${b.name}: near misses create splashes without hull fire`,()=>{
    const e=Array.from({length:30},(_,i)=>shotEvent(b,i)).find(x=>x&&!x.hit);assert.ok(e);
    const at=effectsAt(b,(e.arrival+.3)/100).find(x=>x.id===e.id);
    assert.ok(at.splash>0);assert.equal(at.impactFlash,0);assert.equal(at.hitSmoke,0);
    for(let i=0;i<43;i++){
      const miss=shotEvent(b,i);if(!miss||miss.hit)continue;
      for(const ship of b.ships){const p=positionAt(ship,miss.arrival/100);assert.ok(Math.hypot(miss.impact.x-p.x,miss.impact.z-p.y)>=55,`${miss.id} splash intersects ${ship.id}`);}
    }
  });
  test(`${b.name}: scrub restoration is deterministic and particle budget is bounded`,()=>{
    const before=effectsAt(b,.53);effectsAt(b,.9);assert.deepEqual(effectsAt(b,.53),before);
    for(let i=0;i<=1000;i++){
      const effects=effectsAt(b,i/1000);assert.ok(effects.length<=5);
      assert.ok(effects.filter(e=>e.flash>0).length<=1);
      for(const e of effects){assert.ok(e.arrival>e.firedAt);assert.ok(e.travel>=.35&&e.travel<=1.65);for(const v of [e.flash,e.gunSmoke,e.impactFlash,e.hitSmoke,e.splash])assert.ok(v>=0&&v<=1);}
    }
    assert.deepEqual(effectsAt(b,.1),[]);assert.deepEqual(effectsAt(b,1),[]);
  });
}
test('invalid progress does not create effects',()=>{
  for(const progress of [NaN,Infinity,-1,2])assert.deepEqual(effectsAt(BATTLES[1],progress),[]);
});

const trafalgar=BATTLES.find(b=>b.id==='trafalgar');
test('Trafalgar only animates the selected rake, reciprocal exchange and reported fire',()=>{
  const events=Array.from({length:43},(_,i)=>shotEvent(trafalgar,i)).filter(Boolean);
  assert.deepEqual(events.map(e=>[e.shooter,e.target,e.kind]),[['victory','bucentaure','timber'],['victory','redoutable','timber'],['redoutable','victory','timber'],['redoutable','redoutable','reported-fire']]);
  assert.ok(events.every(e=>e.evidence));
  assert.equal(shotEvent(trafalgar,43),null);
});
test('Trafalgar timber impacts create debris without impact fire',()=>{
  for(let i=0;i<3;i++){
    const e=shotEvent(trafalgar,i),start=effectsAt(trafalgar,(e.firedAt+.03)/100).find(x=>x.id===i);
    assert.ok(start.flash>0);assert.equal(start.debris,0);assert.ok(start.projectile);
    const hit=effectsAt(trafalgar,(e.arrival+.15)/100).find(x=>x.id===i);
    assert.ok(hit.debris>0);assert.ok(hit.hitSmoke>0);assert.equal(hit.impactFlash,0);assert.equal(hit.projectile,null);
  }
});
test('Trafalgar reported stern fire is independent of projectile impact',()=>{
  const fire=effectsAt(trafalgar,.86).find(e=>e.kind==='reported-fire');
  assert.ok(fire.impactFlash>0);assert.equal(fire.flash,0);assert.equal(fire.projectile,null);assert.equal(fire.debris,0);
  const ship=positionAt(trafalgar.ships.find(s=>s.id==='redoutable'),.86);
  assert.ok(Math.abs(Math.hypot(ship.x-fire.impact.x,ship.y-fire.impact.z)-22)<1e-8);
  assert.ok(effectsAt(trafalgar,.96).some(e=>e.kind==='reported-fire'));
});
test('Trafalgar scrub is deterministic with no manufactured approach firing',()=>{
  assert.deepEqual(effectsAt(trafalgar,.3),[]);
  const at=effectsAt(trafalgar,.506);effectsAt(trafalgar,.87);assert.deepEqual(effectsAt(trafalgar,.506),at);
  for(let i=0;i<=1000;i++)assert.ok(effectsAt(trafalgar,i/1000).length<=5);
});

test('Trafalgar event controls carry evidence and ordered replay offsets',()=>{
  let previous=-1;
  for(const e of TRAFALGAR_EVENTS){
    assert.ok(e.at>previous&&e.at<1);previous=e.at;
    assert.ok(trafalgar.ships.some(s=>s.id===e.focus));
    const source=TRAFALGAR_EVIDENCE[e.evidence];assert.ok(source.title);assert.equal(new URL(source.url).protocol,'https:');
  }
});

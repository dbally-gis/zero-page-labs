import test from 'node:test';
import assert from 'node:assert/strict';
import {BATTLES} from '../experiments/maritime/battles.mjs';
import {effectsAt,shotEvent,previewSalvo} from '../experiments/maritime/combat.mjs';
import {positionAt} from '../experiments/maritime/model.mjs';

for(const b of BATTLES){
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

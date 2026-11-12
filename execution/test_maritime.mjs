import test from 'node:test';
import assert from 'node:assert/strict';
import { BATTLES } from '../experiments/maritime/battles.mjs';
import { STOPS, chapterAt, positionAt, trailAt, advance, readView, shareView, cameraZoom, isSharedView, startsPlaying, fateAt, activePositionAt, followFrame, followPairFrame } from '../experiments/maritime/model.mjs';

test('collection covers distinct propulsion eras within the requested period',()=>{
  assert.deepEqual(BATTLES.map(b=>b.id),['diu','lepanto','gravelines','downs','quiberon','chesapeake','nile','trafalgar','hampton-roads','lissa','yalu','manila-bay']);
  assert.ok(BATTLES.every(b=>b.year>=1400&&b.year<=1900));
  assert.equal(new Set(BATTLES.map(b=>b.id)).size,12);
  assert.equal(new Set(BATTLES.map(b=>b.era)).size,12);
});
for(const b of BATTLES) {
  test(`${b.name}: complete paths, participants, citations and guided questions`,()=>{
    assert.equal(b.chapters.length,5);
    assert.equal(b.questions.length,3);
    const ids=new Set(b.ships.map(s=>s.id)); assert.equal(ids.size,b.ships.length);assert.ok(ids.has(b.defaultShip));
    for(const item of [...b.chapters,...b.questions,...b.ships]) {
      assert.ok(b.sources[item.source]);
      for(const id of item.focus||[]) assert.ok(ids.has(id));
    }
    for(const q of b.questions) {assert.ok(q.phase>=0&&q.phase<5);assert.ok(['courses','wind','weapons'].includes(q.layer));}
    for(const s of b.ships){
      assert.equal(s.points.length,5); assert.ok(s.side===0||s.side===1);
      for(const p of s.points) {assert.equal(p.length,3);assert.ok(p.every(Number.isFinite));assert.ok(p[0]>=35&&p[0]<=965);assert.ok(p[1]>=35&&p[1]<=565);}
      if(s.representative)assert.match(s.role,/Representative/);
    }
    for(const source of b.sources)assert.match(source.url,/^https:\/\//);
  });
  test(`${b.name}: scrubbing hits each authored chapter position`,()=>{
    for(const s of b.ships)for(const [i,t] of STOPS.entries()){
      const p=positionAt(s,t);assert.equal(p.x,s.points[i][0]);assert.equal(p.y,s.points[i][1]);
      assert.ok(Math.abs(((p.heading-s.points[i][2]+540)%360)-180)<1e-8);
    }
  });
  test(`${b.name}: reverse scrubbing has no accumulated motion or future trails`,()=>{
    for(const s of b.ships){
      const early=positionAt(s,.1); positionAt(s,.98);assert.deepEqual(positionAt(s,.1),early);
      const trail=trailAt(s,.1);assert.equal(trail.length,2);assert.deepEqual(trail.at(-1),[early.x,early.y]);
      for(let i=1;i<4;i++){
        const a=positionAt(s,STOPS[i]-1e-7),c=positionAt(s,STOPS[i]+1e-7);
        assert.ok(Math.hypot(a.x-c.x,a.y-c.y)<.01);
      }
    }
  });
}
test('heading interpolation uses the short turn across north',()=>{
  const s={points:[[0,0,350],[100,100,10],[100,100,10],[100,100,10],[100,100,10]]};
  assert.deepEqual(positionAt(s,.12),{x:50,y:50,heading:360});
});
test('scrubbing and progression bound invalid or extreme inputs',()=>{
  const s=BATTLES[1].ships[0];
  assert.deepEqual(positionAt(s,-1),positionAt(s,0));assert.deepEqual(positionAt(s,2),positionAt(s,1));
  assert.deepEqual(positionAt(s,NaN),positionAt(s,0));
  assert.equal(advance(.9999,.15,4),1);assert.equal(advance(.2,-2,1),.2);
  assert.equal(advance(.2,300,1),advance(.2,.15,1));
  assert.equal(chapterAt(.5),2);assert.equal(chapterAt(1),4);
});
test('share links restore the selected battle, moment, vessel and view',()=>{
  for(const b of BATTLES){
    const state={battle:b,progress:.5,selected:b.defaultShip,view:'atmosphere'};
    const view=readView(shareView(state));assert.equal(view.battle.id,b.id);assert.equal(view.progress,.5);assert.equal(view.ship,b.defaultShip);assert.equal(view.view,'atmosphere');
  }
});
test('untrusted share fields cannot create arbitrary ships or views',()=>{
  const state=readView('#battle=bad&t=Infinity&ship=bad&view=bad');assert.equal(state.battle.id,'trafalgar');assert.equal(state.ship,'victory');assert.equal(state.progress,0);assert.equal(state.view,'tactical');
  assert.equal(readView('#t=-5').progress,0);assert.equal(readView('#t=500').progress,1);
});
test('map zoom keeps a usable extent through repeated zooming',()=>{
  let camera={x:0,y:0,w:1000,h:600};
  for(let i=0;i<100;i++)camera=cameraZoom(camera,.8);assert.equal(camera.w,420);assert.equal(camera.h,252);
  for(let i=0;i<100;i++)camera=cameraZoom(camera,1.25);assert.equal(camera.w,1400);assert.equal(camera.h,840);
});

test('ordinary anchor navigation never counts as shared replay state',()=>{
  assert.equal(isSharedView('#sources'),false);assert.equal(isSharedView('#battle=bad'),false);assert.equal(isSharedView('#explorer'),false);
  assert.equal(isSharedView('#battle=yalu&t=0.5'),true);
});
test('shared moments start paused while a fresh visit can play',()=>{
  assert.equal(startsPlaying('#battle=yalu&t=.5',false),false);
  assert.equal(startsPlaying('',true),false);assert.equal(startsPlaying('',false),true);
});
test('Trafalgar breakthrough actually crosses the allied line',()=>{
  const b=BATTLES.find(b=>b.id==='trafalgar'),at=id=>positionAt(b.ships.find(s=>s.id===id),.5);
  assert.ok(at('victory').x>at('bucentaure').x);
  assert.ok(at('sovereign').x>at('allied-6').x);
});

test('source-backed fates distinguish captured vessels from battle sinkings',()=>{
  const losses=BATTLES.flatMap(b=>b.ships.filter(s=>s.fate).map(s=>({b,s})));
  assert.deepEqual(losses.filter(({s})=>s.fate.kind==='sunk').map(({s})=>s.id),['egyptian-rear','great-diu-ship','superbe','orient','re-italia','reina-cristina','castilla']);
  for(const {b,s} of losses){
    assert.equal(s.representative,false);assert.ok(b.sources[s.fate.source]);assert.ok(s.fate.text);assert.ok(s.fate.at>0&&s.fate.at<1);
    assert.equal(fateAt(s,s.fate.at-.001),null);assert.equal(fateAt(s,s.fate.at),s.fate);
    assert.equal(fateAt(s,0),null);
    if(s.fate.kind==='sunk')assert.deepEqual(activePositionAt(s,1),positionAt(s,s.fate.at));
  }
  const sultana=BATTLES.find(b=>b.id==='lepanto').ships.find(s=>s.id==='sultana');assert.equal(fateAt(sultana,1).kind,'captured');
  assert.equal(BATTLES.find(b=>b.id==='trafalgar').ships.some(s=>s.fate?.kind==='sunk'),false);
});

test('Follow Ship centers a moving vessel and holds the sourced loss location',()=>{
  const battle=BATTLES.find(b=>b.id==='lissa'),ship=battle.ships.find(s=>s.id==='re-italia');
  for(const progress of [.2,.52,.76,1,.1]){
    const frame=followFrame(ship,progress,140),position=activePositionAt(ship,progress);
    assert.equal(frame.x+frame.w/2,position.x);
    assert.equal(frame.y+frame.h/2,position.y);
    assert.equal(frame.heading,position.heading);
  }
  assert.notDeepEqual(followFrame(ship,.2),followFrame(ship,.52));
  assert.deepEqual(followFrame(ship,1),followFrame(ship,ship.fate.at));
});

test('Follow Ship survives a shared moment URL without changing existing modes',()=>{
  const battle=BATTLES.find(b=>b.id==='nile');
  for(const view of ['follow','tactical','atmosphere']){
    const hash=shareView({battle,progress:.7,selected:'bellerophon',view});
    assert.equal(readView(hash).view,view);
    assert.equal(readView(hash).ship,'bellerophon');
    assert.equal(startsPlaying(hash,false),false);
  }
});

const {replayMoments,momentAt,adjacentMoment}=await import('../experiments/maritime/replay-moments.mjs');

test('desk combines sourced firing, damage and outcomes without losing simultaneous entries',()=>{
  const battle=BATTLES.find(b=>b.id==='lissa'),moments=replayMoments(battle);
  const breach=moments.find(m=>m.kind==='Damage'),loss=moments.find(m=>m.kind==='Loss');
  assert.equal(breach.ship,'re-italia');
  assert.equal(momentAt(moments,breach.at,null,.5),breach);
  assert.match(breach.source.url,/usni.org/);
  const sameTime=adjacentMoment(moments,breach.at,breach.key,1);
  assert.equal(sameTime.at,loss.at);
  assert.equal(adjacentMoment(moments,sameTime.at,sameTime.key,1),loss);
  const shared=readView(shareView({battle,progress:sameTime.at,selected:sameTime.ship,view:'follow',moment:sameTime.key}));
  assert.equal(momentAt(moments,shared.progress,shared.moment,.75),sameTime);
  assert.equal(momentAt(moments,1,null,1),undefined);
  assert.equal(adjacentMoment(moments,loss.at,loss.key,1),undefined);
});

test('desk moment data keeps stable keys, vessel targets and source URLs in the collection',()=>{
  for(const battle of BATTLES){
    const moments=replayMoments(battle);
    assert.equal(new Set(moments.map(moment=>moment.key)).size,moments.length);
    for(const [index,moment] of moments.entries()){
      assert.ok(moment.at>=(moments[index-1]?.at??0));
      assert.ok(battle.ships.some(ship=>ship.id===moment.ship));
      assert.match(moment.source.url,/^https:\/\//);
    }
  }
});

test('Moment identifies both sides of an impact without inventing an attacker or target',()=>{
  const moments=id=>replayMoments(BATTLES.find(battle=>battle.id===id));
  const hampton=moments('hampton-roads');
  assert.deepEqual(hampton.find(moment=>moment.key==='event:pilothouse').roles,[
    {ship:'virginia',label:'Fired'},{ship:'monitor',label:'Hit'}
  ]);
  assert.deepEqual(moments('lissa').find(moment=>moment.key==='event:ram').roles,[
    {ship:'ferdinand-max',label:'Rammer'},{ship:'re-italia',label:'Ship struck'}
  ]);
  assert.deepEqual(moments('trafalgar').find(moment=>moment.key==='event:stern-fire').roles,[
    {ship:'redoutable',label:'Ship on fire'}
  ]);
  assert.deepEqual(moments('yalu').find(moment=>moment.key==='event:matsushima-hit').roles,[
    {ship:'matsushima',label:'Hit'}
  ]);
  assert.deepEqual(moments('trafalgar').find(moment=>moment.key==='event:return').roles,[
    {ship:'redoutable',label:'Representative firing ship'},{ship:'victory',label:'Representative target'}
  ]);
  const manila=moments('manila-bay');
  assert.deepEqual(manila.find(moment=>moment.key==='event:open-fire').roles,[{ship:'olympia',label:'Fired'}]);
  assert.deepEqual(manila.find(moment=>moment.key==='event:castilla-fire').roles,[{ship:'castilla',label:'Ship on fire'}]);
  assert.deepEqual(manila.find(moment=>moment.key==='event:abandon').roles,[]);
});

test('Follow both frames both moving ships and retains the documented loss position',()=>{
  const battle=BATTLES.find(b=>b.id==='lissa');
  const ships=['ferdinand-max','re-italia'].map(id=>battle.ships.find(ship=>ship.id===id));
  for(const progress of [.2,.73,.84,1]){
    const frame=followPairFrame(ships,progress);
    const points=ships.map(ship=>activePositionAt(ship,progress));
    assert.equal(frame.x+frame.w/2,(points[0].x+points[1].x)/2);
    assert.equal(frame.y+frame.h/2,(points[0].y+points[1].y)/2);
    for(const {x,y} of points){
      assert.ok(x-frame.x>=56-1e-8&&frame.x+frame.w-x>=56-1e-8);
      assert.ok(y-frame.y>=56-1e-8&&frame.y+frame.h-y>=56-1e-8);
    }
  }
});

test('a shared follow pair restores two distinct ships in its battle',()=>{
  const battle=BATTLES.find(b=>b.id==='hampton-roads'),pair=['virginia','monitor'];
  const state={battle,progress:.73,selected:'monitor',view:'follow',pair,moment:'event:pilothouse'};
  const view=readView(shareView(state));
  assert.deepEqual(view.pair,pair);
  assert.equal(view.progress,.73);
  assert.equal(view.moment,'event:pilothouse');
  assert.equal(readView(shareView({...state,pair:['virginia','virginia']})).pair,null);
  assert.equal(readView(shareView({...state,pair:['virginia','victory']})).pair,null);
  assert.equal(readView(shareView({...state,view:'tactical'})).pair,null);
});

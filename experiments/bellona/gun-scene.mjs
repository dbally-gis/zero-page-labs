import * as T from '../maritime/vendor/three-0.160.1.module.min.js';

const material = (color, extra = {}) => new T.MeshStandardMaterial({ color, roughness: .82, ...extra });
const timber = material(0x9a683e);
const endgrain = material(0xcb9e6a);
const oak = material(0x765334);
const red = material(0x843d2d);
const iron = material(0x30383a, { metalness: .28 });
const brass = material(0xae8449, { metalness: .25 });
const rope = material(0xb28a52);
const cloth = material(0xdcc59c);
const leather = material(0x443429);
const gunHeight = .84;
const runOut = 2.48;
const wall = 3.48;

function shape(parent, geometry, mat, x=0, y=0, z=0) {
  const mesh = new T.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function box(parent, size, pos, mat) {
  return shape(parent, new T.BoxGeometry(...size), mat, ...pos);
}

function link(parent, radius, mat) {
  const part = shape(parent, new T.CylinderGeometry(radius, radius, 1, 8), mat);
  return (a,b) => {
    const start = new T.Vector3(...a);
    const delta = new T.Vector3(...b).sub(start);
    part.position.copy(start).addScaledVector(delta,.5);
    part.scale.y = delta.length();
    part.quaternion.setFromUnitVectors(new T.Vector3(0,1,0), delta.normalize());
  };
}

function crewMember(parent, coat, complexion) {
  const figure=new T.Group(); parent.add(figure);
  const jacket=material(coat), skin=material(complexion), trousers=material(0xc3b5a0);
  const torso=shape(figure,new T.CapsuleGeometry(.17,.39,5,9),jacket,0,1.22,0);
  torso.scale.set(.84,1,1.12);
  const head=shape(figure,new T.SphereGeometry(.123,12,9),skin,0,1.7,0);
  const hat=shape(figure,new T.CylinderGeometry(.135,.18,.075,10),leather,0,1.79,0);
  const arms=[link(figure,.062,jacket),link(figure,.062,jacket)];
  const forearms=[link(figure,.052,skin),link(figure,.052,skin)];
  const legs=[link(figure,.081,trousers),link(figure,.081,trousers)];
  const feet=[-1,1].map(side=>box(figure,[.27,.115,.13],[.03,.065,side*.125],leather));
  function move(x,z,heading,effort,reach=effort) {
    figure.position.set(x,0,z);
    figure.rotation.y=heading;
    torso.rotation.z=-effort*.40;
    torso.position.set(effort*.13,1.20-effort*.12,0);
    head.position.set(effort*.23,1.68-effort*.15,0);
    hat.position.copy(head.position);hat.position.y+=.12;
    for(const [i,side] of [-1,1].entries()){
      const shoulder=[effort*.17,1.44-effort*.12,side*.19];
      const elbow=[.15+reach*.20,1.12-effort*.11,side*.18];
      const hand=[.19+reach*.42,1.02-effort*.15,side*.13];
      arms[i](shoulder,elbow);
      forearms[i](elbow,hand);
      const toe=side*.18*effort;
      legs[i]([effort*.09,.94-effort*.10,side*.12],[toe,.10,side*.125]);
      feet[i].position.x=toe+.06;
    }
  }
  return {figure, move};
}

function buildDeck(parent) {
  const boards=[0xa47345,0xb18151,0xba8b59,0x9b6b41,0xa67950].map(color=>material(color));
  for(let i=0;i<23;i++) {
    const z=-3.05+i*.278;
    const split=-1.8+(i%4)*1.08;
    const left=-4.12, right=wall+.45;
    box(parent,[split-left-.012,.19,.267],[(split+left)/2,-.095,z],boards[i%boards.length]);
    box(parent,[right-split-.012,.19,.267],[(right+split)/2,-.095,z],boards[(i+2)%boards.length]);
  }
  box(parent,[.54,.64,6.4],[wall,.32,0],oak);
  box(parent,[.54,.57,6.4],[wall,1.71,0],timber);
  for(const side of [-1,1]){
    box(parent,[.54,.80,2.61],[wall,1.02,side*1.885],timber);
    box(parent,[.67,.82,.15],[wall,1.02,side*.57],endgrain);
    for (const y of [.25,.51,1.48,1.72,1.93]) {
      box(parent,[.024,.018,2.57],[wall-.285,y,side*1.9],oak);
    }
    box(parent,[.19,1.99,.21],[wall-.27,1.0,side*2.73],oak);
  }
  box(parent,[.30,.13,1.18],[wall,.575,0],endgrain);
  const lid=box(parent,[.16,.85,1.28],[wall+.48,1.63,0],red);
  lid.rotation.z=-1.05;
  for(const z of [-.37,.37]) box(parent,[.19,.80,.075],[wall+.44,1.64,z],iron).rotation.z=-1.05;
  box(parent,[.38,.14,6.32],[wall-.12,2.06,0],endgrain);
  for(const z of [-2.1,2.1]) box(parent,[1.2,.15,.15],[wall-.69,2.06,z],endgrain);

  const tub=shape(parent,new T.CylinderGeometry(.23,.20,.37,12,1,true),oak,1.9,.185,-1.70);
  tub.material=oak.clone(); tub.material.side=T.DoubleSide;
  shape(parent,new T.CylinderGeometry(.214,.214,.03,12),material(0x506a62),1.9,.29,-1.70);
  box(parent,[.64,.38,.48],[-3.3,.19,-1.92],oak);
  box(parent,[.68,.06,.52],[-3.3,.41,-1.92],endgrain);
  for(let i=0;i<3;i++) shape(parent,new T.SphereGeometry(.084,12,8),iron,-3.49+i*.19,.52,-1.92);
}

function buildGun(parent) {
  const gun=new T.Group(), tube=new T.Group();
  parent.add(gun); gun.add(tube);
  tube.position.set(-.10,gunHeight,0);
  const profile=[
    [0,-1.46],[.085,-1.46],[.12,-1.37],[.12,-1.30],[.24,-1.26],[.28,-1.14],
    [.245,-1.01],[.222,-.86],[.234,-.77],[.209,-.67],[.197,-.23],[.21,-.16],
    [.18,-.08],[.158,.55],[.173,.63],[.149,.73],[.139,1.18],[.174,1.27],
    [.182,1.45],[.089,1.45],[.087,-1.02],[0,-1.02],
  ];
  const barrel=shape(tube,new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),40),iron);
  barrel.rotation.z=-Math.PI/2;
  shape(tube,new T.CylinderGeometry(.105,.105,.81,16),iron,-.16,-.048,0).rotation.x=Math.PI/2;
  shape(tube,new T.CylinderGeometry(.045,.055,.045,10),brass,-.87,.226,0);
  for(const side of [-1,1]){
    box(gun,[1.86,.28,.12],[-.37,.46,side*.30],red);
    box(gun,[.59,.14,.14],[-.15,.64,side*.30],red);
    for(const x of [-1.03,.38]){
      const wheel=shape(gun,new T.CylinderGeometry(x<0?.165:.20,x<0?.165:.20,.16,20),oak,x,x<0?.165:.20,side*.43);
      wheel.rotation.x=Math.PI/2;
      shape(gun,new T.CylinderGeometry(.062,.062,.036,12),iron,x,x<0?.165:.20,side*.53).rotation.x=Math.PI/2;
    }
  }
  box(gun,[1.71,.14,.62],[-.36,.37,0],red);
  box(gun,[.44,.12,.24],[-.94,.62,0],endgrain).rotation.z=-.13;
  return {gun,tube};
}

export function createGunDrill() {
  const room=new T.Group();
  room.visible=false;
  buildDeck(room);
  const {gun,tube}=buildGun(room);
  const crew=[
    crewMember(room,0x334b50,0xd0a080),
    crewMember(room,0x946049,0xb68660),
    crewMember(room,0xc1a681,0xc58d6f),
    crewMember(room,0x596353,0xa57757),
    crewMember(room,0x697f81,0xdbad87),
  ];
  crew.forEach(({figure}, index)=>{figure.userData.crewIndex=index;});
  const highlight=shape(room,new T.RingGeometry(.32,.38,32),new T.MeshBasicMaterial({color:0xffdb87}),0,.016);
  highlight.rotation.x=-Math.PI/2;
  let selectedCrew=0;
  const breeching=[-1,1].map(()=>Array.from({length:6},()=>link(room,.040,rope)));
  const tackles=[-1,1].map(()=>Array.from({length:3},()=>link(room,.018,cloth)));
  const tool=new T.Group(); room.add(tool);
  shape(tool,new T.CylinderGeometry(.026,.026,2.61,8),endgrain,1.29,0,0).rotation.z=-Math.PI/2;
  const sponge=shape(tool,new T.CylinderGeometry(.074,.074,.16,12),cloth,.04,0,0);
  sponge.rotation.z=-Math.PI/2;
  const ram=shape(tool,new T.CylinderGeometry(.059,.059,.13,10),oak,.04,0,0);
  ram.rotation.z=-Math.PI/2;
  const charge=shape(room,new T.CylinderGeometry(.072,.072,.24,12),cloth);
  charge.rotation.z=Math.PI/2;
  const round=shape(room,new T.SphereGeometry(.084,14,10),iron);
  const match=shape(room,new T.CylinderGeometry(.025,.028,.67,8),timber);
  match.rotation.z=-.9;
  const spark=shape(room,new T.SphereGeometry(.042,10,8),new T.MeshBasicMaterial({color:0xfca660}));
  const flyingShot=shape(room,new T.SphereGeometry(.084,14,10),iron);
  const flash=shape(room,new T.SphereGeometry(1,14,10),new T.MeshBasicMaterial({color:0xf6aa4e,transparent:true,depthWrite:false}));
  const vapor=Array.from({length:13},()=>shape(room,new T.SphereGeometry(1,10,7),
    new T.MeshBasicMaterial({color:0x8f9184,transparent:true,depthWrite:false})));
  return {
    room,
    selectCrew(index) {selectedCrew=index;},
    pickCrew(ray) {
      const hit=ray.intersectObject(room,true).find(({object})=>
        object.visible && object!==highlight && (object.parent!==tool || tool.visible));
      return hit?.object.parent.userData.crewIndex;
    },
    update(pose) {
      const {time,carriage,recoil}=pose;
      const shift=carriage*runOut;
      const {loading, haul, aim}=pose;
      const work=Math.max(pose.sponge,pose.ram);
      gun.position.x=shift;
      tube.rotation.z=pose.phase===3 ? -.018*Math.sin((time-16)*.75)**2 : 0;
      const loadEffort=loading*work;
      const passing=Math.max(Math.sin(Math.PI*pose.cartridge),Math.sin(Math.PI*pose.shot));
      crew[0].move(-1.25+shift*.52,-.92,-.69,.12+aim*.53,.20+aim*.60);
      crew[1].move(2.28+loading*.42-loadEffort*.86,.80+shift*.22,2.76,.12+loading*.22+loadEffort*.58,.12+loading*.50+loadEffort*.32);
      crew[2].move(.98+loading*.54+passing*.53,-1.02,-.22-loading*.52,.22+passing*.47,.25+passing*.65);
      crew[3].move(-1.20+shift*.59,1.43,-.08,haul);
      crew[4].move(-.58+shift*.64,-1.55,.15,haul);
      const {x,z}=crew[selectedCrew].figure.position;
      highlight.position.set(x,.016,z);
      for(const [index,side] of [-1,1].entries()){
        const slack=.025+carriage*.80+(time<12?.15:0);
        const points=Array.from({length:7},(_,i)=>{
          const t=i/6;
          return [T.MathUtils.lerp(wall-.3,-1.46+shift,t),
            T.MathUtils.lerp(.86,.88,t)-Math.sin(Math.PI*t)*slack,
            side*T.MathUtils.lerp(.92,.08,t)];
        });
        breeching[index].forEach((set,i)=>set(points[i],points[i+1]));
        tackles[index].forEach((set,i)=>set([wall-.32,.64+i*.034,side*.77],[-.14+shift,.49+i*.034,side*.39]));
      }
      tool.visible=loading>.5;
      tool.position.set(1.43-work*2.50,gunHeight,.23*(1-Math.min(1,work*12)));
      tool.rotation.x=pose.sponge*Math.PI*2;
      sponge.visible=pose.phase===0||pose.phase===5;
      ram.visible=!sponge.visible;
      charge.visible=pose.cartridge>0&&pose.cartridge<1;
      charge.position.set(1.96-pose.cartridge*.68,gunHeight,-.63*(1-pose.cartridge));
      round.visible=pose.shot>0&&pose.shot<1;
      round.position.set(2.01-pose.shot*.73,gunHeight,-.64*(1-pose.shot));
      match.visible=spark.visible=pose.match;
      match.position.set(shift-1.14,1.28,-.25);
      spark.position.set(shift-.97,1.1,-.02);
      flyingShot.visible=pose.flash>.42;
      flyingShot.position.set(3.83+(1-pose.flash)*4.1,gunHeight,0);
      flash.visible=pose.flash>0;
      flash.position.set(3.94,.87,0);
      flash.scale.set(.29+pose.flash*.86,.12+pose.flash*.21,.12+pose.flash*.21);
      flash.material.opacity=pose.flash*.88;
      vapor.forEach((cloud,i)=>{
        cloud.visible=pose.smoke>0;
        if(!cloud.visible) return;
        const progress=1-pose.smoke;
        cloud.position.set(3.7+i*.088+progress*(.48+i*.18),
          .86+progress*(.48+i*.077)+Math.sin(i*1.84)*.22,
          Math.sin(i*2.26)*(.2+progress*.57));
        cloud.scale.setScalar(.16+progress*.73+(i%4)*.075);
        cloud.material.opacity=pose.smoke*.17*(.82+recoil*.18);
      });
    },
  };
}

import * as T from '../maritime/vendor/three-0.160.1.module.min.js';
import { recoilTravel, slackCurve } from './drill.mjs';
import { createFigure } from './figure.mjs';
import { puff, random, surfaces } from './surface.mjs';

const { standard, grain, cloth: weave, gunmetal: iron, wrought, brass, hemp: rope, line } = surfaces();
const material = (color, extra = {}) => standard(color, grain, extra);
const timber = material(0xa87646);
const endgrain = material(0xd2a873);
const oak = material(0x82603e);
// The carriage is shown red, worn enough to show the grain. The colour is illustrative.
const red = material(0x8a3a28, { roughness: .66, bumpScale: .9 });
const cloth = standard(0xdcc59c, weave, { roughness: .95 });
const scatter = random(17);
const gunHeight = .84;
const runOut = recoilTravel;
const wall = 3.48;
// Breeching length: taut when the gun is fully inboard.
const breechingLength = Math.hypot(wall-.3+1.46, .02, .84) * 1.004;

function shape(parent, geometry, mat, x=0, y=0, z=0) {
  const mesh = new T.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

// Boxes carry their texture at one scale, with the grain along the longest edge of each face.
function box(parent, size, pos, mat) {
  const geometry = new T.BoxGeometry(...size), uv = geometry.attributes.uv;
  const [x, y, z] = size, faces = [[z, y], [z, y], [x, z], [x, z], [x, y], [x, y]];
  faces.forEach(([wide, tall], face) => {
    const shiftU = scatter(), shiftV = scatter();
    for (let i = face * 4; i < face * 4 + 4; i++) {
      const u = uv.getX(i) * wide, v = uv.getY(i) * tall;
      const [along, across] = wide >= tall ? [u, v] : [v, u];
      uv.setXY(i, along / 1.5 + shiftU, across / .75 + shiftV);
    }
  });
  return shape(parent, geometry, mat, ...pos);
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

function buildDeck(parent) {
  const boards=[0xb08052,0xba8a5a,0xc29464,0xa5774b,0xb3855a].map(color=>material(color,{roughness:.7}));
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
  for(const z of [-.37,.37]) box(parent,[.19,.80,.075],[wall+.44,1.64,z],wrought).rotation.z=-1.05;
  // Ring bolts in the side for the breeching and the gun tackles.
  for(const side of [-1,1]) for(const [y,z,size] of [[.86,.92,.062],[.66,.77,.045]]) {
    const ring=shape(parent,new T.TorusGeometry(size,size*.26,8,18),wrought,wall-.31,y,side*z);
    ring.rotation.y=Math.PI/2;
    shape(parent,new T.CylinderGeometry(size*.3,size*.3,.09,8),wrought,wall-.275,y+size,side*z).rotation.z=Math.PI/2;
  }
  box(parent,[.38,.14,6.32],[wall-.12,2.06,0],endgrain);
  for(const z of [-2.1,2.1]) box(parent,[1.2,.15,.15],[wall-.69,2.06,z],endgrain);

  const tub=shape(parent,new T.CylinderGeometry(.23,.20,.37,12,1,true),oak,1.9,.185,-1.70);
  tub.material=oak.clone(); tub.material.side=T.DoubleSide;
  shape(parent,new T.CylinderGeometry(.214,.214,.03,12),material(0x506a62),1.9,.29,-1.70);
  box(parent,[.64,.38,.48],[-3.3,.19,-1.92],oak);
  box(parent,[.68,.06,.52],[-3.3,.41,-1.92],endgrain);
  for(let i=0;i<3;i++) shape(parent,new T.SphereGeometry(.084,20,14),iron,-3.49+i*.19,.52,-1.92);
  for(const y of [.07,.30]) shape(parent,new T.TorusGeometry(y<.1?.207:.226,.012,6,24),wrought,1.9,y,-1.70).rotation.x=Math.PI/2;
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
  const barrel=shape(tube,new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),56),iron);
  barrel.rotation.z=-Math.PI/2;
  shape(tube,new T.CylinderGeometry(.105,.105,.81,16),iron,-.16,-.048,0).rotation.x=Math.PI/2;
  shape(tube,new T.CylinderGeometry(.045,.055,.045,10),brass,-.87,.226,0);
  for(const side of [-1,1]){
    box(gun,[1.86,.28,.12],[-.37,.46,side*.30],red);
    box(gun,[.59,.14,.14],[-.15,.64,side*.30],red);
    for(const x of [-1.03,.38]){
      const wheel=shape(gun,new T.CylinderGeometry(x<0?.165:.20,x<0?.165:.20,.16,20),oak,x,x<0?.165:.20,side*.43);
      wheel.rotation.x=Math.PI/2;
      shape(gun,new T.CylinderGeometry(.062,.062,.036,12),wrought,x,x<0?.165:.20,side*.53).rotation.x=Math.PI/2;
      shape(gun,new T.CylinderGeometry(.012,.012,.15,6),wrought,x,x<0?.165:.20,side*.535);
    }
    // Capsquare over the trunnion, and the eyebolts the tackles and breeching lead to.
    const cap=shape(gun,new T.TorusGeometry(.112,.017,6,14,Math.PI),wrought,-.26,.725,side*.30);
    cap.scale.z=3.4;
    box(gun,[.36,.022,.115],[-.26,.722,side*.30],wrought);
    for(const [x,y,size] of [[-.14,.49,.04],[-1.05,.50,.034]]) {
      shape(gun,new T.TorusGeometry(size,size*.28,8,16),wrought,x,y,side*.385).rotation.x=Math.PI/2;
    }
  }
  for(const x of [-1.03,.38]) box(gun,[.2,.16,.98],[x,x<0?.21:.25,0],oak);
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
    {coat:0x2f4650,shirt:0xd9d0bd,trousers:0xcfc4ae,skin:0xc99a78,hair:0x4a3526,neckcloth:0x1c1b1c,sleeves:'long',head:'hat',queue:true,height:1.0,seed:21,glance:-.3,lead:1},
    {coat:0x8d4a38,shirt:0xd8cdb6,trousers:0xbfb39c,skin:0xae7d58,hair:0x241a14,neckcloth:0x2a3c52,head:'scarf',scarf:0x7c2f28,stubble:true,height:.97,seed:34,glance:.25,lead:-1},
    {coat:0xc3ab85,shirt:0xcfc5ae,trousers:0xd4cab6,skin:0xc08a6c,hair:0x6b4a2c,neckcloth:0x7c2f28,head:'bare',queue:true,height:1.03,seed:47,glance:.4,lead:1},
    {coat:0x56614f,shirt:0xd3c9b2,trousers:0xc6bba4,skin:0x9c6e4f,hair:0x1c1612,neckcloth:0x1c1b1c,sleeves:'long',head:'hat',stubble:true,height:.99,seed:58,glance:-.2,lead:-1},
    {coat:0x64797c,shirt:0xddd4c2,trousers:0xcbbfa6,skin:0xd3a583,hair:0x8a6238,neckcloth:0x7c2f28,head:'scarf',scarf:0x2f4458,height:1.01,seed:69,glance:.3,lead:1},
  ].map(look=>createFigure(room,look));
  crew.forEach(({figure}, index)=>{figure.userData.crewIndex=index;});
  const highlight=shape(room,new T.RingGeometry(.32,.38,48),new T.MeshBasicMaterial({color:0xffdb87,toneMapped:false}),0,.016);
  highlight.rotation.x=-Math.PI/2;
  let selectedCrew=0;
  const breeching=[-1,1].map(()=>Array.from({length:12},()=>link(room,.040,rope)));
  // A ball at each joint keeps the rope round where two straight lengths meet.
  const knuckles=[-1,1].map(()=>Array.from({length:13},()=>shape(room,new T.SphereGeometry(.040,10,8),rope)));
  const tackles=[-1,1].map(()=>Array.from({length:3},()=>link(room,.016,line)));
  const blocks=[-1,1].map(()=>[0,1].map(()=>{
    const block=shape(room,new T.SphereGeometry(1,12,9),oak);
    block.scale.set(.085,.05,.035);
    return block;
  }));
  const tool=new T.Group(); room.add(tool);
  shape(tool,new T.CylinderGeometry(.026,.026,2.61,8),endgrain,1.29,0,0).rotation.z=-Math.PI/2;
  const sponge=shape(tool,new T.CylinderGeometry(.074,.074,.16,12),cloth,.04,0,0);
  sponge.rotation.z=-Math.PI/2;
  const ram=shape(tool,new T.CylinderGeometry(.059,.059,.13,10),oak,.04,0,0);
  ram.rotation.z=-Math.PI/2;
  const charge=shape(room,new T.CylinderGeometry(.072,.072,.24,12),cloth);
  charge.rotation.z=Math.PI/2;
  const round=shape(room,new T.SphereGeometry(.084,20,14),iron);
  const match=shape(room,new T.CylinderGeometry(.025,.028,.67,8),timber);
  match.rotation.z=-.9;
  const soft=puff();
  const sprite=(color,extra={})=>{
    const part=new T.Sprite(new T.SpriteMaterial({map:soft,color,transparent:true,depthWrite:false,toneMapped:false,...extra}));
    room.add(part);
    return part;
  };
  const spark=sprite(0xffb066,{blending:T.AdditiveBlending});
  spark.scale.setScalar(.16);
  const flyingShot=shape(room,new T.SphereGeometry(.084,20,14),iron);
  const flash=[sprite(0xffa040,{blending:T.AdditiveBlending}),sprite(0xfff0c0,{blending:T.AdditiveBlending})];
  const glare=new T.PointLight(0xffb060,0,9,2);
  glare.position.set(3.2,1.1,0);
  room.add(glare);
  const vapor=Array.from({length:22},(_,i)=>sprite(i%3 ? 0xb9b8ad : 0x8d8c82));
  return {
    room,
    selectCrew(index) {selectedCrew=index;},
    pickCrew(ray) {
      const hit=ray.intersectObject(room,true).find(({object})=>
        object.visible && !object.isSprite && object!==highlight && (object.parent!==tool || tool.visible));
      for(let part=hit?.object;part && part!==room;part=part.parent) {
        if(part.userData.crewIndex!==undefined) return part.userData.crewIndex;
      }
    },
    update(pose) {
      const {time,carriage,recoil}=pose;
      const shift=carriage*runOut;
      const {loading, haul, aim}=pose;
      const work=Math.max(pose.sponge,pose.ram);
      gun.position.x=shift;
      tube.rotation.z=(pose.phase===3 ? -.018*Math.sin((time-16)*.75)**2 : 0)+pose.snub*.03;
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
        const points=slackCurve([wall-.3,.86,side*.92],[-1.46+shift,.88,side*.08],breechingLength,side);
        breeching[index].forEach((set,i)=>set(points[i],points[i+1]));
        knuckles[index].forEach((knot,i)=>knot.position.set(...points[i]));
        const fixed=[wall-.36,.66,side*.77], moving=[-.14+shift,.49,side*.39];
        const along=new T.Vector3(...moving).sub(new T.Vector3(...fixed)).normalize();
        const ends=[fixed.map((v,n)=>v+along.getComponent(n)*.16),moving.map((v,n)=>v-along.getComponent(n)*.16)];
        tackles[index].forEach((set,i)=>set([ends[0][0],ends[0][1]+(i-1)*.022,ends[0][2]],[ends[1][0],ends[1][1]+(i-1)*.022,ends[1][2]]));
        blocks[index].forEach((block,i)=>{
          block.position.set(...ends[i]);
          block.rotation.set(0,Math.atan2(-along.z,along.x),Math.asin(along.y));
        });
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
      flash.forEach((burst,i)=>{
        burst.visible=pose.flash>0;
        burst.position.set(4.05+i*.25+pose.flash*.3,.87,0);
        burst.scale.set((i?1.1:2.3)*(.5+pose.flash),(i?.5:1.0)*(.5+pose.flash),1);
        burst.material.opacity=pose.flash;
      });
      glare.intensity=pose.flash*60;
      vapor.forEach((cloud,i)=>{
        cloud.visible=pose.smoke>0;
        if(!cloud.visible) return;
        const progress=1-pose.smoke, drift=progress**.6;
        cloud.position.set(3.75+i*.07+drift*(.5+i*.13),
          .86+drift*(.38+i*.05)+Math.sin(i*1.84)*.2*(.3+drift),
          Math.sin(i*2.26)*(.15+drift*.6));
        cloud.scale.setScalar(.45+drift*1.5+(i%4)*.14);
        cloud.material.rotation=i*1.3+progress*(i%2 ? .5 : -.5);
        cloud.material.opacity=pose.smoke**1.4*.34*(.82+recoil*.18);
      });
    },
  };
}

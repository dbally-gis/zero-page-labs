import * as T from './vendor/three-0.160.1.module.min.js';
import {positionAt,trailAt,chapterAt,fateAt,activePositionAt} from './model.mjs?v=atlas-review';
import {damageAt,sinkingAt,tornAtMast} from './damage.mjs';
import {createShotEffects} from './shot-effects.mjs?v=hull-forms';
import {formFor,hullHalf,hullMesh} from './hull.mjs';

// The scene illustrates the same schematic replay as the accessible SVG chart.
// Models are generic ship types, not measured reconstructions of named vessels.
const PI=Math.PI;
const wood=new T.MeshStandardMaterial({color:0x57402b,roughness:.88});
const trim=new T.MeshStandardMaterial({color:0xbc9555,roughness:.62});
const deck=new T.MeshStandardMaterial({color:0xa58d62,roughness:1});
const splinter=new T.MeshStandardMaterial({color:0xb28a5e,roughness:1});
const scorch=new T.MeshStandardMaterial({color:0x201c1a,roughness:1});
const dark=new T.MeshStandardMaterial({color:0x252d2b,roughness:.8});
const iron=new T.MeshStandardMaterial({color:0x526160,roughness:.6,metalness:.25});
const sail=new T.MeshStandardMaterial({color:0xf1e4c4,roughness:1,side:T.DoubleSide});
const blue=new T.MeshStandardMaterial({color:0x75bbc6,side:T.DoubleSide});
const rust=new T.MeshStandardMaterial({color:0xce795d,side:T.DoubleSide});
const rigging=new T.LineBasicMaterial({color:0x504635,transparent:true,opacity:.65});
const cache=new Map();

function mesh(parent,geometry,material,x=0,y=0,z=0,rotation=null) {
  const m=new T.Mesh(geometry,material);m.position.set(x,y,z);
  if(rotation)m.rotation.set(...rotation);parent.add(m);return m;
}
function beam(parent,a,b,r,material=wood) {
  const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);
  const m=mesh(parent,new T.CylinderGeometry(r,r,delta.length(),5),material);
  m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;
}
function lines(parent,segments,material=rigging) {
  const g=new T.BufferGeometry().setFromPoints(segments.flat().map(v=>new T.Vector3(...v)));
  const l=new T.LineSegments(g,material);parent.add(l);return l;
}
function buffer({positions,uvs,colors,indices}) {
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  if(uvs)g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
  if(colors)g.setAttribute('color',new T.Float32BufferAttribute(colors,4));
  g.setIndex(indices);g.computeVertexNormals();return g;
}
function paint(width,height,draw) {
  const c=document.createElement('canvas');c.width=width;c.height=height;draw(c.getContext('2d'),width,height);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t;
}
// Strakes run from keel (0) to rail (1). Seams suggest planks or plates; they are not counted.
// Tones are neutral timber and iron. They are not national or period paint schemes.
function strakes(base,bands,seam,step) {
  return paint(256,128,(ctx,w,h)=>{
    ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
    for(const [from,to,color] of bands){ctx.fillStyle=color;ctx.fillRect(0,h*(1-to),w,h*(to-from));}
    ctx.fillStyle=seam;
    for(let y=3;y<h;y+=step){ctx.fillRect(0,y,w,1);for(let x=(y*37)%53;x<w;x+=53)ctx.fillRect(x,y-step+1,1,step-1);}
  });
}
function planks(base,seam,step) {
  return paint(128,128,(ctx,w,h)=>{
    ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
    for(let x=step/2;x<w;x+=step){
      ctx.fillStyle=`rgba(255,240,205,${.03+(x*7%5)*.012})`;ctx.fillRect(x-step/2,0,step,h);
      ctx.fillStyle=seam;ctx.fillRect(x,0,1,h);ctx.fillRect(x-step/2,(x*13)%h,step,1);
    }
  });
}
let skinCache=null;
function skins() {
  if(skinCache)return skinCache;
  const side=(map,extra={})=>new T.MeshStandardMaterial({map,roughness:.86,side:T.DoubleSide,...extra});
  const plate=side(strakes('#56625f',[[0,.3,'#55362e'],[.93,1,'#6d7a76']],'rgba(20,28,27,.22)',16),{roughness:.6,metalness:.25});
  const timberDeck=new T.MeshStandardMaterial({map:planks('#a58d62','rgba(70,52,30,.32)',16),roughness:1});
  const plateDeck=new T.MeshStandardMaterial({map:planks('#66716e','rgba(20,28,27,.3)',32),roughness:.7,metalness:.2});
  sail.map=paint(128,128,(ctx,w,h)=>{
    const fade=ctx.createLinearGradient(0,0,0,h);fade.addColorStop(0,'#fbf1d6');fade.addColorStop(1,'#e2d2ab');
    ctx.fillStyle=fade;ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba(112,92,58,.2)';
    for(let x=8;x<w;x+=16)ctx.fillRect(x,0,1,h);
    ctx.fillRect(0,h*.3,w,1);
  });
  sail.color.set(0xffffff);sail.needsUpdate=true;
  const timber={hull:side(strakes('#5b4129',[[0,.2,'#3d2c1e'],[.4,.5,'#6f5234'],[.62,.725,'#6f5234'],[.93,1,'#a8834c']],'rgba(25,16,8,.25)',8)),deck:timberDeck};
  skinCache={
    sail:timber,'screw-frigate':timber,
    galley:{hull:side(strakes('#6b3f2a',[[0,.25,'#44291d'],[.88,1,'#c9a25a']],'rgba(25,16,8,.25)',8)),deck:timberDeck},
    cruiser:{hull:side(strakes('#444e4c',[[0,.3,'#55362e'],[.8,.84,'#d9d6c6']],'rgba(20,28,27,.22)',16),{roughness:.6,metalness:.25}),deck:timberDeck},
    monitor:{hull:plate,deck:plateDeck},ironclad:{hull:plate,deck:plateDeck},
  };
  return skinCache;
}
function canvasGeometry(width,height,billow=3,torn=false) {
  const g=new T.PlaneGeometry(width,height,10,7),p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const u=p.getX(i)/width+.5,v=p.getY(i)/height+.5;
    p.setZ(i,-Math.sin(u*PI)*Math.sin(v*PI)*billow);
  }
  if(torn){
    const index=Array.from(g.index.array),kept=[];
    for(let i=0;i<index.length;i+=3){const a=index[i];if([13,14,35,36,57,58].includes(a))continue;kept.push(...index.slice(i,i+3));}
    g.setIndex(kept);
  }
  g.computeVertexNormals();return g;
}
function mergePieces(group) {
  // Bake static pieces by material: a fleet uses a handful of draws per vessel,
  // rather than a separate draw for every gunport, yard and railing.
  const batches=new Map(),remove=[];
  group.updateMatrixWorld(true);
  group.traverse(m=>{if(!m.isMesh)return;const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrixWorld);
    const key=m.material; if(!batches.has(key))batches.set(key,[]);batches.get(key).push(g);remove.push(m);
  });
  for(const m of remove)m.removeFromParent();
  for(const [material,geometries] of batches){
    const p=[],n=[],uv=[];
    for(const g of geometries){p.push(...g.attributes.position.array);n.push(...g.attributes.normal.array);if(g.attributes.uv)uv.push(...g.attributes.uv.array);else uv.push(...Array(g.attributes.position.count*2).fill(0));g.dispose();}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));mesh(group,g,material);
  }
  return group;
}
function shipModel(type,side,damage=null) {
  const key=type+side+JSON.stringify(damage);if(cache.has(key))return cache.get(key).clone(true);
  const g=new T.Group(),isGalley=type==='galley',isSail=type==='sail'||type==='screw-frigate',isMonitor=type==='monitor',isCruiser=type==='cruiser';
  const skin=skins()[type]??skins().ironclad,hull=hullMesh(type);
  mesh(g,buffer(hull.shell),skin.hull);mesh(g,buffer(hull.deck),skin.deck);
  const ropes=[];
  if(isSail){
    // Hull bands, gun ports, raised quarterdeck, bowsprit and three square rigs.
    // Gun ports follow the painted strakes on the hull surface.
    for(const y of [2.9,5.4])for(const side of [-1,1])for(let z=-16;z<=18;z+=5){
      mesh(g,new T.BoxGeometry(.5,1.3,2),dark,side*(hullHalf(type,z,y)-.1),y,z);
    }
    // Stern gallery.
    mesh(g,new T.BoxGeometry(8.4,1.8,.6),trim,0,7.7,27.6);
    for(let x=-3;x<=3;x+=2)mesh(g,new T.BoxGeometry(1.2,1,.8),dark,x,7.7,27.65);
    mesh(g,new T.BoxGeometry(13,3,12),trim,0,9.3,16);mesh(g,new T.BoxGeometry(12,1,11),deck,0,11.3,16);
    beam(g,[0,9,-24],[0,18,-40],.35,trim);
    for(const [z,height] of [[-15,38],[0,46],[17,33]]){
      const mast=z===-15?'fore':z===0?'main':'mizzen';
      if(damage?.lost?.includes(mast)){beam(g,[0,8,z],[0,13,z],.5,wood);beam(g,[0,12,z],[8,9,z+5],.35,wood);continue;}
      beam(g,[0,8,z],[0,height,z],.42,wood);
      const tiers=height>40?[[19,23,10],[31,22,9],[40,14,7]]:[[17,19,9],[28,16,8]];
      for(const [top,w,h] of tiers){
        const tier=tiers[0][0]===top?'course':tiers[1][0]===top?'topsail':'upper';
        if(damage?.yardLost===mast+'-'+tier){
          beam(g,[0,top,z],[w*.21,top-4,z+2],.25,wood);
          continue;
        }
        beam(g,[-w/2,top,z],[w/2,top,z],.21,wood);
        mesh(g,canvasGeometry(w,h,3.5,tier==='topsail'&&tornAtMast(damage,mast)),sail,0,top-h/2,z+.6);
        ropes.push([[-w/2,top,z],[0,height,z]],[[w/2,top,z],[0,height,z]]);
      }
      ropes.push([[0,height,z],[-7,8,z+8]],[[0,height,z],[7,8,z+8]],[[0,height,z],[0,10,-34]]);
    }
    if(type==='screw-frigate') mesh(g,new T.CylinderGeometry(1.25,1.5,8,12),dark,0,12,-7);
    for(let x=-5;x<=5;x+=2.5)ropes.push([[x,8.2,-22],[x,8.2,23]]);
  } else if(isGalley){
    mesh(g,new T.BoxGeometry(8,4,11),trim,0,10,23);
    for(let z=-20;z<=20;z+=4)for(const side of [-1,1])beam(g,[side*4,6,z],[side*21,.8,z+6],.22,trim);
    beam(g,[0,8,-1],[0,32,-1],.4);beam(g,[-12,14,-3],[12,33,-3],.25);
    const geom=new T.BufferGeometry().setFromPoints([new T.Vector3(-12,14,-3),new T.Vector3(12,33,-3),new T.Vector3(10,13,0)]);geom.computeVertexNormals();mesh(g,geom,sail);
    ropes.push([[0,32,-1],[-4,9,-21]],[[0,32,-1],[4,9,23]]);
    beam(g,[0,9,-30],[0,10,-40],.45,trim);
    for(const x of [-2.6,2.6]){
      const broken=damage?.marks?.includes('bow');
      beam(g,[x,8,-17],[broken?x*.6:x*.32,broken?10:8,-28],.42,broken?splinter:trim);
    }
  } else if(isMonitor){
    mesh(g,new T.CylinderGeometry(7,7,6,20),iron,0,10,0);mesh(g,new T.BoxGeometry(5,3,4),iron,0,9,-15);
    const cracked=damage?.marks?.includes('pilot');
    mesh(g,new T.BoxGeometry(5.4,.6,4.4),iron,cracked?1.8:0,10.7,-15,cracked?[0,0,.21]:null);
    if(cracked)beam(g,[-1.8,10.5,-17.04],[.7,7.8,-17.04],.23,scorch);
    for(const x of [-2,2])beam(g,[x,10,-5],[x,10,-14],.7,dark);
    mesh(g,new T.CylinderGeometry(1.5,1.5,6,8),dark,0,10,14);
  } else if(isCruiser){
    mesh(g,new T.BoxGeometry(10,4,28),deck,0,9,0);
    for(const z of [-5,8]){mesh(g,new T.CylinderGeometry(1.7,2,11,10),dark,0,16,z);mesh(g,new T.CylinderGeometry(2.1,2.1,1,10),trim,0,21,z);}
    for(const z of [-20,20]){mesh(g,new T.CylinderGeometry(3.2,3.5,3,10),iron,0,9,z);beam(g,[0,10,z],[0,10,z+(z<0?-9:9)],.45,dark);}
    for(const z of [-15,16]){beam(g,[0,10,z],[0,34,z],.3);beam(g,[-8,28,z],[8,28,z],.2);ropes.push([[0,34,z],[-6,8,z+7]],[[0,34,z],[6,8,z+7]]);}
  } else {
    // Casemate with sloped sides and rounded ends.
    const c=mesh(g,new T.CylinderGeometry(.62,1,7,24),iron,0,10.5,0);c.scale.set(7.9,1,19);
    mesh(g,new T.CylinderGeometry(1.4,1.8,11,8),dark,0,18,-4);
    for(const x of [-8,8])for(const z of [-12,0,12])beam(g,[x,10,z],[x*1.65,10,z],.45,dark);
  }
  // Localised marks are schematic silhouettes, not a measured survey of the damage.
  for(const mark of damage?.marks??[]){
    if(mark==='bow'||mark==='pilot')continue;
    if(mark==='port'||mark==='starboard'||mark==='hull'){
      const sides=mark==='hull'?[-1,1]:[mark==='port'?-1:1];
      for(const side of sides){
        const x=side*hullHalf(type,0,4.8);
        mesh(g,new T.DodecahedronGeometry(mark==='port'?3.7:2.3),scorch,x,4.8,0).scale.set(.33,1,1.8);
        beam(g,[x,6.6,-4],[x*.91,5.9,4],.34,splinter);
      }
    }else if(mark==='funnel'){
      mesh(g,new T.DodecahedronGeometry(1.5),scorch,1.65,17,-5).scale.set(.45,1,.7);
    }else{
      const y=isCruiser?11.12:8.2,z=mark==='burn'?6:mark==='deck'?-8:-11;
      mesh(g,new T.DodecahedronGeometry(mark==='burn'?7:4),scorch,mark==='deck'?2.6:0,y,z).scale.set(.82,.10,1.5);
      if(mark!=='burn')beam(g,[-3,y+.35,z-1],[2,y+.4,z+4],.48,splinter);
    }
  }
  // Fleet-colour pennants are diagram keys, not historical national flags.
  const mastHeight=isSail?46:isGalley?32:34,mastZ=isSail?0:isGalley?-1:16;
  if(isMonitor)beam(g,[0,9,15],[0,22,15],.2);
  const fh=isMonitor?22:mastHeight,fz=isMonitor?15:mastZ;
  if(type==='ironclad')beam(g,[0,9,fz],[0,fh,fz],.25,iron);
  const flagG=new T.BufferGeometry().setFromPoints([new T.Vector3(0,fh,fz),new T.Vector3(8,fh-1,fz+1),new T.Vector3(0,fh-4,fz)]);flagG.computeVertexNormals();if(!damage?.lost?.includes('main'))mesh(g,flagG,side?rust:blue);
  if(ropes.length)lines(g,ropes);
  mergePieces(g);
  // Sails cast shadows but do not take them: billowed cloth shows shadow-map banding.
  g.traverse(part=>{if(part.isMesh){part.castShadow=true;part.receiveShadow=part.material!==sail;}});
  cache.set(key,g);return g.clone(true);
}

function puffTexture() {
  const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
  for(let i=0;i<14;i++){
    const x=64+Math.sin(i*8.7)*20,y=64+Math.cos(i*4.3)*19,r=25+(i%4)*5;
    const grad=ctx.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,'rgba(239,230,206,.28)');grad.addColorStop(.5,'rgba(230,226,207,.12)');grad.addColorStop(1,'rgba(230,226,207,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);
  }
  return new T.CanvasTexture(c);
}
// A bow wave spreading aft in a V, with churned water behind the stern. The bow is at the top.
function wakeTexture() {
  const c=document.createElement('canvas');c.width=128;c.height=256;const ctx=c.getContext('2d');
  const dab=(x,y,r,alpha)=>{const grad=ctx.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,`rgba(255,255,255,${alpha})`);grad.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=grad;ctx.fillRect(x-r,y-r,r*2,r*2);};
  for(let k=0;k<90;k++){
    const f=k/90,y=4+f*248,half=5+y*.225,alpha=.34*(1-f)**1.4;
    for(const side of [-1,1])dab(64+side*half+Math.sin(k*2.1)*1.5,y,4+f*9,alpha);
    if(y>118)dab(64+Math.sin(k*1.7)*4,y,9+f*8,.2*(1-f));
  }
  return new T.CanvasTexture(c);
}
const oceanVertex=`varying vec3 vWorld;void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const oceanFragment=`
precision highp float;
uniform float time;uniform float span;uniform vec3 eye;varying vec3 vWorld;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float waves(vec2 p){float t=time*.33;p+=vec2(noise(p*.035),noise(p*.043+17.))*9.;return sin(dot(p,vec2(.18,.11))+t)*.40+sin(dot(p,vec2(-.12,.28))+t*1.31)*.24+sin(dot(p,vec2(.48,.13))-t*.72)*.10+sin(dot(p,vec2(.85,-.41))+t*.9)*.035;}
void main(){
 vec2 p=vWorld.xz;float h=waves(p);float dx=waves(p+vec2(.4,0))-waves(p-vec2(.4,0));float dz=waves(p+vec2(0,.4))-waves(p-vec2(0,.4));
 // Fine ripples, glitter and whitecaps belong to close views. From high up they alias into specks, so they fade out.
 float closeUp=1.-smoothstep(240.,420.,span);
 vec2 q=p*.55+vec2(time*.21,-time*.16);
 vec2 ripple=vec2(noise(q+vec2(.35,0))-noise(q-vec2(.35,0)),noise(q+vec2(0,.35))-noise(q-vec2(0,.35)));
 vec3 normal=normalize(vec3(-dx*1.5-ripple.x*.55*closeUp,1.,-dz*1.5-ripple.y*.55*closeUp));vec3 view=normalize(eye-vWorld);vec3 sun=normalize(vec3(-.5,.78,-.37));
 float broad=noise(p*.003),detail=noise(p*.09);float facing=max(dot(normal,sun),0.);float fresnel=pow(1.-max(dot(normal,view),0.),3.);
 vec3 deep=vec3(.004,.027,.041),shallow=vec3(.009,.10,.115);vec3 color=mix(deep,shallow,clamp(broad*.6+facing*.22+h*.1,0.,1.));
 color+=vec3(.045,.10,.105)*fresnel;float gleam=max(dot(reflect(-sun,normal),view),0.);
 color+=vec3(.88,.85,.66)*(pow(gleam,90.)*.24*mix(.25,1.,closeUp)*(.3+detail*.7)+pow(gleam,500.)*1.1*step(.5,noise(p*2.1+time*.8))*closeUp);
 // Sparse whitecaps, gated by a broad patch field so they never line up with the swell.
 float cap=smoothstep(.5,.78,h+detail*.3)*smoothstep(.56,.8,noise(p*.043+vec2(time*.02,3.)))*smoothstep(.35,.7,noise(p*.8));
 color+=vec3(.08,.11,.10)*cap*closeUp;
 color*=.91+noise(p*.018)*.18;float mist=clamp(length(p)*.00008,0.,.17);color=mix(color,vec3(.28,.41,.40),mist);
 gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

export function createScene(host,{onSelect,onPan,onFailure,reducedMotion=false}) {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const canvas=document.createElement('canvas');canvas.className='ocean-canvas';canvas.setAttribute('aria-hidden','true');
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  // Phones get a smaller, cheaper shadow map.
  const handheld=matchMedia('(pointer: coarse)').matches||innerWidth<700;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=handheld?T.PCFShadowMap:T.PCFSoftShadowMap;
  host.prepend(canvas);
  const scene=new T.Scene();scene.background=new T.Color(0x183d43);scene.fog=new T.FogExp2(0x60837e,.00016);
  scene.add(new T.HemisphereLight(0xdcebe3,0x344541,2));
  const sun=new T.DirectionalLight(0xffe5b6,3.1);sun.castShadow=true;sun.shadow.mapSize.setScalar(handheld?1024:2048);sun.shadow.bias=-.0005;scene.add(sun,sun.target);
  const sunward=new T.Vector3(-380,600,-280).normalize();
  const fill=new T.DirectionalLight(0x8fc9dd,.6);fill.position.set(400,100,200);scene.add(fill);
  const camera=new T.OrthographicCamera(-600,600,360,-360,1,6000);
  const oceanMaterial=new T.ShaderMaterial({uniforms:{time:{value:0},span:{value:600},eye:{value:new T.Vector3()}},vertexShader:oceanVertex,fragmentShader:oceanFragment});
  mesh(scene,new T.PlaneGeometry(7000,7000),oceanMaterial,0,-1,0,[-PI/2,0,0]);
  // The ocean is a custom shader, so a clear plane just above it takes the ships' shadows.
  mesh(scene,new T.PlaneGeometry(7000,7000),new T.ShadowMaterial({color:0x00161a,opacity:.42,depthWrite:false}),0,-.5,0,[-PI/2,0,0]).receiveShadow=true;
 let ships=[],terrain=new T.Group(),overlays=new T.Group(),fleet=new T.Group(),lastBattle=null,state=null,focused=null,hidden=false,clock=0,last=0,frame=0,dead=false,dirty=true,failed=false,lastDraw=0;
  const fail=()=>{failed=true;hidden=true;onFailure('The dimensional sea is unavailable. Classic chart is ready.');};
  renderer.debug.onShaderError=fail;
  scene.add(terrain,overlays,fleet);
  const labels=document.createElement('div');labels.className='scene-labels';labels.setAttribute('aria-hidden','true');host.append(labels);
  const smoke=puffTexture(),foam=wakeTexture();
  const shots=createShotEffects(scene,smoke);
  const ray=new T.Raycaster(),pointer=new T.Vector2(),waterPlane=new T.Plane(new T.Vector3(0,1,0),0);
  const palette=getComputedStyle(host);
  const fleetColors=['--blue','--red'].map(name=>palette.getPropertyValue(name).trim());
  const lineMat=fleetColors.map(color=>new T.LineDashedMaterial({color,dashSize:5,gapSize:7,transparent:true,opacity:.7}));
  function disposeGroup(g){g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&& ![...lineMat].includes(o.material)){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats)m.dispose();}});g.clear();}
  function ring(radius,color,dashed=false){const points=[];for(let i=0;i<=80;i++){const a=i/80*PI*2;points.push(new T.Vector3(Math.sin(a)*radius,.8,Math.cos(a)*radius));}const m=dashed?new T.LineDashedMaterial({color,dashSize:3,gapSize:5,transparent:true,opacity:.9}):new T.LineBasicMaterial({color,transparent:true,opacity:.95});const l=new T.Line(new T.BufferGeometry().setFromPoints(points),m);l.computeLineDistances();return l;}
  function rebuild(battle){
    // Cached ship geometries/materials are shared between instances and retained.
    for(const s of ships){s.label.remove();s.loss.geometry.dispose();s.loss.material.dispose();s.hit.geometry.dispose();s.hit.material.dispose();s.ring.geometry.dispose();s.ring.material.dispose();s.fleetRing.geometry.dispose();s.fleetRing.material.dispose();s.focusRing.geometry.dispose();s.focusRing.material.dispose();s.wake.geometry.dispose();s.wake.material.dispose();s.foamLine.geometry.dispose();s.foamLine.material.dispose();s.smokes.forEach(p=>{p.material.dispose();p.removeFromParent();});}
    fleet.clear();labels.replaceChildren();disposeGroup(terrain);ships=[];
    if(battle.terrain!=='open'){
      const roads=battle.terrain==='roads';
      const coordinates=battle.terrain==='aboukir'?[[-950,-650],[1000,-650],[1000,-200],[260,-240],[10,-205],[-300,-180],[-950,-190]]:roads?[[-950,-650],[0,-650],[-130,-235],[-260,-200],[-365,-215],[-375,-100],[-600,50],[-950,50]]:[[160,-650],[1000,-650],[1000,-40],[550,-110],[445,-150],[390,-220],[320,-250]];
      const shape=new T.Shape();coordinates.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
      const landMaterials=[new T.MeshStandardMaterial({color:0x304c38,roughness:1}),new T.MeshStandardMaterial({color:0x62665b,roughness:1})];
      mesh(terrain,new T.ExtrudeGeometry(shape,{depth:10,bevelEnabled:true,bevelSize:3,bevelThickness:3,bevelSegments:2,steps:1}),landMaterials,0,1,0,[-PI/2,0,0]).receiveShadow=true;
      // An illustrative beach and a band of shallow water outside it.
      mesh(terrain,new T.ExtrudeGeometry(shape,{depth:.6,bevelEnabled:true,bevelSize:10,bevelThickness:1.2,bevelSegments:1,steps:1}),new T.MeshStandardMaterial({color:0xc9b88a,roughness:1}),0,-.5,0,[-PI/2,0,0]).receiveShadow=true;
      mesh(terrain,new T.ExtrudeGeometry(shape,{depth:.05,bevelEnabled:true,bevelSize:30,bevelThickness:.05,bevelSegments:1,steps:1}),new T.MeshBasicMaterial({color:0x58c2b4,transparent:true,opacity:.2,depthWrite:false}),0,-.85,0,[-PI/2,0,0]);
      const edge=coordinates.map(([x,z])=>new T.Vector3(x,.7,z));edge.push(edge[0]);
      terrain.add(new T.Line(new T.BufferGeometry().setFromPoints(edge),new T.LineBasicMaterial({color:0xbfcdc0,transparent:true,opacity:.75})));
      // A second contour gives the illustrative shore a shallow turquoise edge.
      const contour=edge.map(v=>v.clone().add(new T.Vector3(-10,-.2,15)));
      terrain.add(new T.Line(new T.BufferGeometry().setFromPoints(contour),new T.LineBasicMaterial({color:0x7ed1c8,transparent:true,opacity:.45})));
      const rocks=new T.Group(),rockMaterial=new T.MeshStandardMaterial({color:0x747a67,roughness:1});
      for(let i=1;i<coordinates.length;i++){
        const a=coordinates[i-1],b=coordinates[i];
        for(let j=0;j<5;j++){
          const f=j/5,x=a[0]+(b[0]-a[0])*f,z=a[1]+(b[1]-a[1])*f;
          if(Math.abs(x)>600||Math.abs(z)>400)continue;
          const rock=mesh(rocks,new T.IcosahedronGeometry(5+(j%3)*2,0),rockMaterial,x+Math.sin(i*7+j)*4,3,z+Math.cos(j*3)*4);
          rock.scale.set(1.1,.6+(j%2)*.3,1.4);rock.rotation.y=i+j;
        }
      }
      mergePieces(rocks);rocks.traverse(rock=>{rock.castShadow=rock.receiveShadow=true;});terrain.add(rocks);
    }
    for(const data of battle.ships){
      const group=new T.Group(),model=shipModel(data.type,data.side);model.scale.setScalar(data.representative?.84:1.08);group.add(model);
      const radius=data.representative?26:32;
      const fleetRing=mesh(group,new T.RingGeometry(radius-1.8,radius,64),new T.MeshBasicMaterial({
        color:fleetColors[data.side],transparent:true,opacity:.95,depthWrite:false,toneMapped:false,fog:false
      }),0,.65,0,[-PI/2,0,0]);
      const selected=ring(38,0xf0d7a1),focusRing=ring(38,0xedd6ac,true);group.add(selected,focusRing);
      const hit=mesh(group,new T.BoxGeometry(36,55,65),new T.MeshBasicMaterial({visible:false}),0,24,0);hit.userData.ship=data.id;
      const low=-formFor(data.type).low*model.scale.y;
      const foamLine=mesh(group,buffer(hullMesh(data.type).foam),new T.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false}),0,-.2,0);foamLine.scale.copy(model.scale);
      const wake=mesh(group,new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:foam,color:0xe5f4e0,transparent:true,opacity:.6,depthWrite:false}),0,-.3,34,[-PI/2,0,0]);wake.scale.set(72,128,1);
      const smokes=[];for(let i=0;i<4;i++){const p=new T.Sprite(new T.SpriteMaterial({map:smoke,color:data.type==='sail'||data.type==='galley'?0xe0d9c5:0x8d9b96,transparent:true,opacity:0,depthWrite:false}));scene.add(p);smokes.push(p);}
      const label=document.createElement('span');label.className='scene-ship-label';label.textContent=data.representative?'Fleet marker':data.name;labels.append(label);
      const vertices=[];
      for(const angle of [PI/4,-PI/4])for(const [x,z] of [[-2.5,-18],[2.5,-18],[2.5,18],[-2.5,-18],[2.5,18],[-2.5,18]])vertices.push(x*Math.cos(angle)-z*Math.sin(angle),3,x*Math.sin(angle)+z*Math.cos(angle));
      const cross=new T.BufferGeometry();cross.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
      const loss=new T.Mesh(cross,new T.MeshBasicMaterial({color:0xffb69c,depthTest:false,side:T.DoubleSide}));loss.renderOrder=5;loss.visible=false;group.add(loss);
      group.userData.ship=data.id;fleet.add(group);ships.push({loss,data,group,model,low,ring:selected,fleetRing,focusRing,hit,wake,foamLine,smokes,label});
    }
    lastBattle=battle.id;
  }
  function rebuildOverlays(){
    disposeGroup(overlays);if(!state)return;
    const focus=state.question===null?state.battle.chapters[chapterAt(state.progress)].focus:state.battle.questions[state.question].focus;
    if(state.layers.courses)for(const s of ships){
      const points=trailAt(s.data,s.data.fate?.kind==='sunk'?Math.min(state.progress,s.data.fate.at):state.progress).map(([x,z])=>new T.Vector3(x-500,.5,z-300));
      if(points.length>1){const line=new T.Line(new T.BufferGeometry().setFromPoints(points),lineMat[s.data.side]);line.computeLineDistances();overlays.add(line);}
    }
    if(state.layers.weapons&&state.battle.id!=='yalu'&&!fateAt(state.battle.ships.find(s=>s.id===state.selected),state.progress)){
      const ship=state.battle.ships.find(s=>s.id===state.selected),p=positionAt(ship,state.progress),group=new T.Group();group.position.set(p.x-500,.9,p.y-300);group.rotation.y=-p.heading*PI/180;
      const ranges=ship.type==='monitor'?[[0,360]]:ship.type==='galley'?[[-28,28]]:[[60,120],[240,300]];
      for(const [a,b]of ranges){const points=[new T.Vector3(0,0,0)];for(let d=a;d<=b;d+=2)points.push(new T.Vector3(Math.sin(d*PI/180)*115,0,-Math.cos(d*PI/180)*115));points.push(new T.Vector3(0,0,0));
        const vertices=[],indices=[];points.forEach(v=>vertices.push(...v));for(let i=1;i<points.length-1;i++)indices.push(0,i,i+1);
        const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geom.setIndex(indices);geom.computeVertexNormals();mesh(group,geom,new T.MeshBasicMaterial({color:0xf4e7bf,transparent:true,opacity:.10,side:T.DoubleSide,depthWrite:false}));group.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0xf0dfb5,transparent:true,opacity:.6})));
      }overlays.add(group);
    }
    for(const s of ships){s.ring.visible=s.data.id===state.selected;s.focusRing.visible=!s.ring.visible&&(focus.includes(s.data.id)||focused===s.data.id);}
  }
  function frameCamera(){
    if(!state)return;const w=host.clientWidth,h=host.clientHeight,aspect=w/h;
    if(!w||!h)return;
    const close=state.view==='follow';
    const angle=(close?26:state.view==='atmosphere'?34:58)*PI/180;
    // A steady port-quarter view keeps the deck, rig and waterline in frame.
    const span=state.camera.pairSpan;
    const yaw=(close&&!span&&!motion.matches?-state.camera.heading-65:-30)*PI/180;
    let height=close
      ?Math.max(state.camera.w*.68,state.camera.w/aspect)
      :Math.max(650*Math.sin(angle)+90,1100/aspect)*state.camera.w/1000;
    if(span){
      const width=Math.abs(span.dx*Math.cos(yaw)-span.dy*Math.sin(yaw))+152;
      const depth=Math.abs(span.dx*Math.sin(yaw)+span.dy*Math.cos(yaw))*Math.sin(angle)+112;
      height=Math.max(width/aspect,depth)*span.scale;
    }
    camera.left=-height*aspect/2;camera.right=height*aspect/2;camera.top=height/2;camera.bottom=-height/2;
    const target=new T.Vector3(state.camera.x+state.camera.w/2-500,close?17:12,state.camera.y+state.camera.h/2-300);
    camera.position.copy(target).add(new T.Vector3(1800*Math.cos(angle)*Math.sin(yaw),1800*Math.sin(angle),1800*Math.cos(angle)*Math.cos(yaw)));
    camera.lookAt(target);camera.updateProjectionMatrix();camera.updateMatrixWorld();oceanMaterial.uniforms.eye.value.copy(camera.position);oceanMaterial.uniforms.span.value=height;
    // The shadow map covers the water now in view, so close views get sharp shadows.
    const reach=Math.min(950,Math.hypot(camera.right,camera.top/Math.sin(angle))*1.04),lens=sun.shadow.camera;
    sun.target.position.copy(target);sun.position.copy(target).addScaledVector(sunward,1500);
    Object.assign(lens,{left:-reach,right:reach,top:reach,bottom:-reach,near:200,far:2800});lens.updateProjectionMatrix();
    sun.shadow.normalBias=reach*.0035;
  }
  const resize=new ResizeObserver(()=>{renderer.setSize(host.clientWidth,host.clientHeight,false);frameCamera();dirty=true;});resize.observe(host);
  renderer.setSize(host.clientWidth,host.clientHeight,false);
  function update(next){state=next;dirty=true;if(lastBattle!==state.battle.id)rebuild(state.battle);frameCamera();
    for(const s of ships){const p=activePositionAt(s.data,state.progress);s.group.position.set(p.x-500,0,p.y-300);s.group.rotation.y=-p.heading*PI/180;}
    rebuildOverlays();
  }
  let down=null;
  const atPointer=e=>{const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);};
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;atPointer(e);const world=ray.ray.intersectPlane(waterPlane,new T.Vector3());down={x:e.clientX,y:e.clientY,moved:false,touch:e.pointerType==='touch',world:world?.clone()};if(!down.touch)canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!down)return;if(Math.abs(e.clientX-down.x)+Math.abs(e.clientY-down.y)>4)down.moved=true;if(down.moved&&state?.view!=='follow'&&!down.touch&&down.world){atPointer(e);const world=ray.ray.intersectPlane(waterPlane,new T.Vector3());if(world)onPan(down.world.x-world.x,down.world.z-world.z);}});
  canvas.addEventListener('pointerup',e=>{if(!down)return;const moved=down.moved;down=null;if(moved)return;atPointer(e);const hit=ray.intersectObjects(ships.map(s=>s.hit),false)[0];if(hit)onSelect(hit.object.userData.ship);});
  canvas.addEventListener('pointercancel',()=>{down=null;});
  // Pointer cancellation during touch scrolling leaves the document in charge.
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fail();});
  function draw(now){
    if(dead)return;frame=requestAnimationFrame(draw);
    if(hidden||!state||document.hidden){last=now;return;}
    const dt=last?Math.min((now-last)/1000,.05):0;last=now;
    if(state.playing&&!motion.matches)clock+=dt;
    if(!dirty&&(!state.playing||motion.matches))return;
    if(now-lastDraw<32)return;lastDraw=now;dirty=false;
    oceanMaterial.uniforms.time.value=clock;
    const focus=state.question===null?state.battle.chapters[chapterAt(state.progress)].focus:state.battle.questions[state.question].focus;
    const occupied=[];
    for(const s of [...ships].sort((a,b)=>Number(b.data.id===state.selected)-Number(a.data.id===state.selected))){
      const damage=damageAt(state.battle,s.data,state.progress),damageKey=JSON.stringify(damage);
      if(s.damageKey!==damageKey){s.model.removeFromParent();s.model=shipModel(s.data.type,s.data.side,damage);s.model.scale.setScalar(s.data.representative?.84:1.08);s.group.add(s.model);s.damageKey=damageKey;}
      const sinking=sinkingAt(state.battle,s.data,state.progress,motion.matches);
      s.model.rotation.z=sinking.started?sinking.amount*.32:(motion.matches?0:Math.sin(clock*.65+s.data.id.length)*.008);
      s.model.position.y=s.low-sinking.amount*(sinking.shallow?12:65);
      const fate=fateAt(s.data,state.progress),sunk=fate?.kind==='sunk';s.model.visible=!sinking.complete||sinking.shallow;s.foamLine.visible=!sunk;s.loss.visible=sinking.complete;
      s.label.textContent=sunk?`${sinking.complete?'×':'↘'} ${s.data.name} · ${sinking.complete?'Sunk':'Sinking'}`:s.data.representative?'Fleet marker':s.data.name+(damage?' · Damaged':'');
      s.wake.visible=!fate&&s.data.id!=='minnesota'&&state.progress<1;s.wake.material.opacity=.42+Math.sin(clock*1.2+s.data.id.length)*.06;
      const selected=s.data.id===state.selected,chapterFocus=focus.includes(s.data.id);
      s.label.hidden=state.pair
        ?!state.pair.includes(s.data.id)&&!state.layers.labels
        :state.view==='follow'
          ?selected||!state.layers.labels
          :!(sunk||damage||selected||state.layers.labels||chapterFocus);
      const screen=s.group.position.clone().add(new T.Vector3(0,4,state.pair?0:37)).project(camera);
      const labelWidth=s.label.textContent.length*5.6+12;
      const labelX=Math.max(labelWidth/2+4,Math.min(host.clientWidth-labelWidth/2-4,(screen.x+1)*.5*host.clientWidth));
      let labelY=(-screen.y+1)*.5*host.clientHeight;
      if(!s.label.hidden){
        for(let attempt=0;attempt<20&&occupied.some(p=>Math.abs(p.x-labelX)<(p.w+labelWidth)/2+3&&Math.abs(p.y-labelY)<19);attempt++)labelY+=19;
        occupied.push({x:labelX,y:labelY,w:labelWidth});
      }
      s.label.style.left=`${labelX}px`;s.label.style.top=`${labelY}px`;s.label.classList.toggle('selected',selected);
      s.label.style.visibility=Math.abs(screen.x)>1||Math.abs(screen.y)>1?'hidden':'';
      for(let i=0;i<s.smokes.length;i++){
        const p=s.smokes[i],phase=(clock*.12+i*.25+s.data.id.length*.09)%1,steam=s.data.type==='cruiser'||s.data.type==='ironclad';
        const amount=steam&&!sunk?.14:0;
        p.material.opacity=amount*Math.sin(phase*PI);p.position.copy(s.group.position).add(new T.Vector3(phase*50-10,(steam?25:12)+phase*20,phase*12+i*3));p.scale.setScalar(24+phase*58);p.material.rotation=i*.8+phase*.1;
      }
    }
    shots.update(state.battle,state.progress,{enabled:state.layers.effects,reduced:motion.matches});
    try{renderer.render(scene,camera);}catch{fail();}
  }
  frame=requestAnimationFrame(draw);
  return {update,setVisible(value){if(failed&&value){onFailure('The dimensional sea is unavailable. Classic chart is ready.');return;}hidden=!value;dirty=true;canvas.hidden=!value;labels.hidden=!value;},focusShip(id){focused=id;dirty=true;rebuildOverlays();},dispose(){
    dead=true;cancelAnimationFrame(frame);resize.disconnect();
    shots.dispose();
    const geometries=new Set(),materials=new Set(),textures=new Set();
    scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of (o.material?(Array.isArray(o.material)?o.material:[o.material]):[])){materials.add(m);if(m.map)textures.add(m.map);}});
    for(const g of cache.values())g.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material){materials.add(o.material);if(o.material.map)textures.add(o.material.map);}});
    for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();smoke.dispose();foam.dispose();cache.clear();sun.dispose();skinCache=null;
    renderer.dispose();canvas.remove();labels.remove();
  },canvas};
}

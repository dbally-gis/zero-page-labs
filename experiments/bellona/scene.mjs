import * as T from '../maritime/vendor/three-0.160.1.module.min.js';
import { createGunDrill } from './gun-scene.mjs';
import { createShip } from './ship.mjs';
import { parts, sampleTack, tackPosition, tackTrack } from './study.mjs';

// Metres of ground per unit of the teaching path, chosen so the tack spans about four ship lengths.
const trackScale = 12;
const ground = -7.2;

// A flat strip along the path. World x is upwind, world z is across the wind.
function ribbon(points, width, color, opacity) {
  const positions=[], indices=[];
  points.forEach((p,i)=>{
    const a=points[Math.max(0,i-1)], b=points[Math.min(points.length-1,i+1)];
    const dx=b.y-a.y, dz=b.x-a.x, size=Math.hypot(dx,dz)||1;
    const x=p.y*trackScale, z=p.x*trackScale, nx=-dz/size*width/2, nz=dx/size*width/2;
    positions.push(x+nx,0,z+nz,x-nx,0,z-nz);
    if (i) indices.push(i*2-2,i*2-1,i*2,i*2-1,i*2+1,i*2);
  });
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setIndex(indices);
  return new T.Mesh(geometry,new T.MeshBasicMaterial({color,transparent:true,opacity,side:T.DoubleSide,depthWrite:false}));
}

function shade(root) {
  root.traverse(part=>{
    if (!part.isMesh || !part.material.isMeshStandardMaterial) return;
    part.castShadow=true;
    part.receiveShadow=!part.userData.castOnly;
  });
}

export function createScene(stage, canvas, markers, chooseCrew) {
  const renderer = new T.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFSoftShadowMap;
  const scene=new T.Scene();
  scene.add(new T.HemisphereLight(0xffefd2,0x524637,2.35));
  const light=new T.DirectionalLight(0xffedcf,2.2);
  light.castShadow=true;
  light.shadow.mapSize.set(2048,2048);
  scene.add(light);
  // One shadow light serves both scales: the whole ship, then the gun bay.
  function aimLight(gunView) {
    light.position.set(...(gunView ? [-7,16,10] : [60,120,90]));
    const reach=gunView ? 6.5 : 72, lens=light.shadow.camera;
    Object.assign(lens,{left:-reach,right:reach,top:reach,bottom:-reach,near:gunView?2:20,far:gunView?40:330});
    lens.updateProjectionMatrix();
    light.shadow.bias=-.0005;
    light.shadow.normalBias=gunView ? .012 : .16;
  }
  aimLight(false);
  const fill=new T.DirectionalLight(0xc6dcea,1.0);
  fill.position.set(-25,20,-40);
  scene.add(fill);
  const camera=new T.OrthographicCamera(-1,1,1,-1,.5,400);
  const ship=createShip();
  shade(ship.ship);
  scene.add(ship.ship);
  const floor=new T.Mesh(new T.PlaneGeometry(260,260),new T.ShadowMaterial({opacity:.2}));
  floor.rotation.x=-Math.PI/2;
  floor.position.y=ground-.02;
  floor.receiveShadow=true;
  scene.add(floor);
  const grid=new T.GridHelper(135,27,0xa6a997,0xa6a997);
  grid.material.transparent=true;
  grid.material.opacity=.25;
  grid.position.y=ground;
  scene.add(grid);
  const wind=new T.Group();
  for (const z of [-30,-15,0,15,30]) {
    const arrow=new T.ArrowHelper(new T.Vector3(-1,0,0),new T.Vector3(58,-6.7,z),12,0x3f7472,2.6,1.25);
    wind.add(arrow);
  }
  scene.add(wind);
  // The tack path lies on the ground plane and slides under the ship, which stays centred.
  const path=tackTrack(.1);
  const track=new T.Group();
  const ahead=ribbon(path,.7,0x3f7472,.3), sailed=ribbon(path,1.5,0x9a4f2c,.85);
  ahead.position.y=.03; sailed.position.y=.05;
  track.add(ahead,sailed);
  track.position.y=ground;
  track.visible=false;
  scene.add(track);
  const cell=135/27;

  let drill;
  let view='cut', yaw=.30, elevation=.31, zoom=1, previous, pending=false;
  let pose={heading:0, fore:0, main:0, mizzen:0, rudder:0};
  const markerPoints=parts.map(part=>new T.Vector3(...part.point));
  const ray=new T.Raycaster();

  function paint() {
    pending=false;
    const {clientWidth:width,clientHeight:height}=stage;
    if (!width || !height) return;
    const aspect=width/height;
    const gunView = view==='gun';
    // The cutaway frames the hull and lets the upper masts run off the plate.
    // Whole ship and tack frame the full rig.
    const [focusX,focusY,tall,wide] = gunView ? [.1,.85,7.6,11.5] : view==='cut' ? [2,14.5,49,78] :
      view==='tack' ? [4,20,84,104] : [6,24.5,70,92];
    const radius = gunView ? 25 : 140;
    const frustum = Math.max(tall,wide/aspect)/zoom;
    camera.top=frustum/2;
    camera.bottom=-camera.top;
    camera.right=camera.top*aspect;
    camera.left=-camera.right;
    camera.updateProjectionMatrix();
    camera.position.set(
      focusX+Math.sin(yaw)*Math.cos(elevation)*radius,
      focusY+Math.sin(elevation)*radius,
      Math.cos(yaw)*Math.cos(elevation)*radius,
    );
    camera.lookAt(focusX,focusY,0);
    if (gunView) {
      drill.update(pose);
    } else {
      ship.setTrim(view==='tack'?pose:sampleTack(0));
      ship.ship.rotation.y=view==='tack' ? T.MathUtils.degToRad(-pose.heading):0;
      const time=view==='tack' ? pose.time||0 : 0;
      const at=tackPosition(time);
      const x=at.y*trackScale, z=at.x*trackScale;
      track.position.set(-x,ground,-z);
      grid.position.set(-(x%cell),ground,-(z%cell));
      sailed.geometry.setDrawRange(0,Math.round(time*10)*6);
    }
    const size=renderer.getSize(new T.Vector2());
    if (size.x!==width || size.y!==height) renderer.setSize(width,height,false);
    renderer.render(scene,camera);
    for (let i=0;i<markers.length;i++) {
      const projected=markerPoints[i].clone().project(camera);
      markers[i].hidden=view!=='cut'|| Math.abs(projected.x)>.94 || Math.abs(projected.y)>.92;
      markers[i].style.left=`${(projected.x+1)*50}%`;
      markers[i].style.top=`${(1-projected.y)*50}%`;
    }
  }

  function invalidate() {
    if (!pending) {pending=true; requestAnimationFrame(paint);}
  }

  function resetCamera() {
    yaw=view==='gun' ? -.32 : view==='tack' ? .18 : view==='whole' ? -.46 : .43;
    elevation=view==='gun' ? .47 : view==='tack' ? .67 : .27;
    zoom=1;
    invalidate();
  }

  canvas.addEventListener('pointerdown',event=>{
    if (previous || event.button!==0) return;
    previous={id:event.pointerId,x:event.clientX,y:event.clientY,dragging:view!=='gun'};
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',event=>{
    if (previous?.id!==event.pointerId) return;
    const dx=event.clientX-previous.x, dy=event.clientY-previous.y;
    if (!previous.dragging && Math.hypot(dx,dy)<5) return;
    yaw-=dx*.009;
    elevation=T.MathUtils.clamp(elevation+dy*.007,-.55,1.45);
    Object.assign(previous,{x:event.clientX,y:event.clientY,dragging:true});
    invalidate();
  });
  canvas.addEventListener('pointerup',event=>{
    if (view!=='gun' || previous?.id!==event.pointerId || previous.dragging ||
        Math.hypot(event.clientX-previous.x,event.clientY-previous.y)>=5) return;
    const bounds=canvas.getBoundingClientRect();
    ray.setFromCamera(new T.Vector2(
      (event.clientX-bounds.left)/bounds.width*2-1,
      1-(event.clientY-bounds.top)/bounds.height*2,
    ),camera);
    const index=drill.pickCrew(ray);
    if (index!==undefined) chooseCrew(index);
  });
  canvas.addEventListener('lostpointercapture',()=>{previous=null;});
  canvas.addEventListener('keydown',event=>{
    const keys={ArrowLeft:[.12,0],ArrowRight:[-.12,0],ArrowUp:[0,.10],ArrowDown:[0,-.10]};
    const delta=keys[event.key];
    if (!delta) return;
    event.preventDefault();
    yaw+=delta[0];
    elevation=T.MathUtils.clamp(elevation+delta[1],-.55,1.45);
    invalidate();
  });
  new ResizeObserver(invalidate).observe(stage);
  resetCamera();
  return {
    setView(value) {
      view=value;
      if (view==='gun' && !drill) {
        drill=createGunDrill();
        shade(drill.room);
        scene.add(drill.room);
      }
      if (drill) drill.room.visible=view==='gun';
      ship.ship.visible=view!=='gun';
      grid.visible=floor.visible=view!=='gun';
      track.visible=view==='tack';
      aimLight(view==='gun');
      wind.visible=view==='tack';
      ship.setCutaway(view==='cut');
      resetCamera();
    },
    setPose(value) {pose=value; invalidate();},
    selectCrew(index) {drill?.selectCrew(index); invalidate();},
    zoomBy(factor) {zoom=T.MathUtils.clamp(zoom*factor,.72,2.5); invalidate();},
    resetCamera,
  };
}

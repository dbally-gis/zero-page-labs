import * as T from '../maritime/vendor/three-0.160.1.module.min.js';
import { createShip } from './ship.mjs';
import { parts } from './study.mjs';

export function createScene(stage, canvas, markers) {
  const renderer = new T.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  const scene=new T.Scene();
  scene.add(new T.HemisphereLight(0xffefd2,0x524637,2.35));
  const light=new T.DirectionalLight(0xffedcf,2.2);
  light.position.set(30,60,45);
  scene.add(light);
  const fill=new T.DirectionalLight(0xc6dcea,1.0);
  fill.position.set(-25,20,-40);
  scene.add(fill);
  const camera=new T.OrthographicCamera(-1,1,1,-1,.5,400);
  const ship=createShip();
  scene.add(ship.ship);
  const grid=new T.GridHelper(135,27,0xa6a997,0xa6a997);
  grid.material.transparent=true;
  grid.material.opacity=.25;
  grid.position.y=-7.2;
  scene.add(grid);
  const wind=new T.Group();
  for (const z of [-30,-15,0,15,30]) {
    const arrow=new T.ArrowHelper(new T.Vector3(-1,0,0),new T.Vector3(48,-6.7,z),15,0x3f7472,2.6,1.25);
    wind.add(arrow);
  }
  scene.add(wind);

  let view='cut', yaw=.30, elevation=.31, zoom=1, previous, pending=false;
  let pose={heading:0, fore:0, main:0, mizzen:0, rudder:0};
  const markerPoints=parts.map(part=>new T.Vector3(...part.point));

  function paint() {
    pending=false;
    const {clientWidth:width,clientHeight:height}=stage;
    if (!width || !height) return;
    const aspect=width/height;
    const focusY=view==='tack'? 12: 14.5;
    const frustum=Math.max(view==='tack'? 67:49,(view==='tack'? 82:78)/aspect)/zoom;
    camera.top=frustum/2;
    camera.bottom=-camera.top;
    camera.right=camera.top*aspect;
    camera.left=-camera.right;
    camera.updateProjectionMatrix();
    camera.position.set(
      Math.sin(yaw)*Math.cos(elevation)*110,
      focusY+Math.sin(elevation)*110,
      Math.cos(yaw)*Math.cos(elevation)*110,
    );
    camera.lookAt(2,focusY,0);
    ship.setTrim(view==='tack'?pose:{heading:-62,fore:37,main:37,mizzen:35,rudder:0});
    ship.ship.rotation.y=view==='tack' ? T.MathUtils.degToRad(-pose.heading):0;
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
    yaw=view==='tack' ? .18 : view==='whole' ? -.46 : .43;
    elevation=view==='tack'?.67:.27;
    zoom=1;
    invalidate();
  }

  canvas.addEventListener('pointerdown',event=>{
    if (previous) return;
    previous={id:event.pointerId,x:event.clientX,y:event.clientY};
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',event=>{
    if (previous?.id!==event.pointerId) return;
    yaw-=(event.clientX-previous.x)*.009;
    elevation=T.MathUtils.clamp(elevation+(event.clientY-previous.y)*.007,-.55,1.45);
    previous={id:event.pointerId,x:event.clientX,y:event.clientY};
    invalidate();
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
    setView(value) {view=value; wind.visible=value==='tack'; ship.setCutaway(value==='cut'); resetCamera();},
    setPose(value) {pose=value; invalidate();},
    zoomBy(factor) {zoom=T.MathUtils.clamp(zoom*factor,.72,2.5); invalidate();},
    resetCamera,
  };
}

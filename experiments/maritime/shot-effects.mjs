import * as T from './vendor/three-0.160.1.module.min.js';
import {effectsAt} from './combat.mjs';

function fireTexture(){
  const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
  const gradient=ctx.createRadialGradient(64,75,2,64,65,56);
  gradient.addColorStop(0,'rgba(255,255,232,1)');gradient.addColorStop(.19,'rgba(255,236,147,1)');gradient.addColorStop(.43,'rgba(255,153,38,.9)');gradient.addColorStop(.72,'rgba(227,62,15,.3)');gradient.addColorStop(1,'rgba(160,35,8,0)');
  ctx.fillStyle=gradient;ctx.beginPath();ctx.moveTo(25,110);ctx.bezierCurveTo(9,75,59,57,53,3);ctx.bezierCurveTo(83,31,72,57,96,35);ctx.bezierCurveTo(89,70,126,92,100,118);ctx.closePath();ctx.fill();
  const core=ctx.createRadialGradient(64,85,0,64,85,27);core.addColorStop(0,'#fffce1');core.addColorStop(.4,'rgba(255,226,126,.9)');core.addColorStop(1,'rgba(255,174,66,0)');ctx.fillStyle=core;ctx.fillRect(25,40,78,88);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;return texture;
}
function sprite(group,map,color,additive=false){const p=new T.Sprite(new T.SpriteMaterial({map,color,transparent:true,opacity:0,depthWrite:false,depthTest:false,toneMapped:false,blending:additive?T.AdditiveBlending:T.NormalBlending}));p.renderOrder=additive?5:3;group.add(p);return p;}

export function createShotEffects(scene,smoke){
  const root=new T.Group();root.position.set(-500,0,-300);scene.add(root);
  const flame=fireTexture(),pool=[];
  const light=new T.PointLight(0xffae49,0,100,2);root.add(light);
  for(let i=0;i<5;i++){
    const group=new T.Group();root.add(group);
    const flash=sprite(group,flame,0xffffff,true),fire=sprite(group,flame,0xffffff);fire.renderOrder=5;
    const gunSmoke=Array.from({length:3},()=>sprite(group,smoke,0xdfd8c5));
    const hitSmoke=Array.from({length:3},()=>sprite(group,smoke,0x625d53));
    const splash=sprite(group,smoke,0xdcf4f0);
    const sparks=Array.from({length:5},()=>sprite(group,flame,0xffd594,true));
    const debris=Array.from({length:7},()=>{const d=new T.Mesh(new T.BoxGeometry(1,1,5),new T.MeshBasicMaterial({color:0xb69362}));group.add(d);return d;});
    const ball=new T.Mesh(new T.SphereGeometry(1.4,6,5),new T.MeshBasicMaterial({color:0x302820}));group.add(ball);
    const tailGeometry=new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]);
    const tail=new T.Line(tailGeometry,new T.LineBasicMaterial({color:0xf5cd8f,transparent:true,opacity:.75}));group.add(tail);
    const ripple=new T.Mesh(new T.RingGeometry(.88,1,40),new T.MeshBasicMaterial({color:0xd0ede7,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}));ripple.rotation.x=-Math.PI/2;group.add(ripple);
    pool.push({debris,group,flash,fire,gunSmoke,hitSmoke,splash,sparks,ball,tail,ripple});
  }
  const put=(object,p,y=0)=>object.position.set(p.x,p.y+y,p.z);
  function update(battle,progress,{enabled=true,reduced=false}={}){
    root.visible=enabled;light.intensity=0;if(!enabled)return;
    const events=effectsAt(battle,progress);let peak=0;
    pool.forEach((p,index)=>{
      const e=events[index];p.group.visible=!!e;if(!e)return;
      p.flash.material.opacity=reduced?0:e.flash;
      put(p.flash,e.origin,2);p.flash.scale.set(27+e.flash*12,21+e.flash*18,1);p.flash.material.rotation=e.bearing/180*Math.PI;
      const glow=reduced?0:e.flash;
      if(glow>peak){peak=glow;put(light,e.origin,4);light.intensity=500*glow;}
      p.gunSmoke.forEach((s,i)=>{
        const age=e.age,spread=i-1;
        s.material.opacity=e.gunSmoke*(.45+.2*Math.min(age,1));
        s.position.set(e.origin.x+age*10+spread*(4+age*3),e.origin.y+age*5+i*2,e.origin.z+age*2+spread*6);
        s.scale.setScalar(16+age*12+i*7);s.material.rotation=i*.8+age*.04;
      });
      const impactAge=e.kind==='reported-fire'?1:Math.max(0,e.impactAge);
      p.fire.material.opacity=reduced?0:e.impactFlash;
      put(p.fire,e.impact,9+impactAge*5);p.fire.scale.set(23+impactAge*14,42+impactAge*20,1);
      if(!reduced&&e.impactFlash>peak){peak=e.impactFlash;put(light,e.impact,13);light.intensity=650*e.impactFlash;}
      p.hitSmoke.forEach((s,i)=>{
        s.material.color.set(e.kind==='timber'?0xab9677:0x625d53);
        s.material.opacity=e.hitSmoke*(.65-i*.07);
        s.position.set(e.impact.x+impactAge*8+(i-1)*7,e.impact.y+9+impactAge*8+i*3,e.impact.z+(i-1)*5);
        s.scale.setScalar(24+impactAge*17+i*9);s.material.rotation=i*.9-impactAge*.06;
      });
      p.splash.material.opacity=reduced?0:e.splash*.85;put(p.splash,e.impact,8+e.splash*14);p.splash.scale.set(16+impactAge*17,20+e.splash*42,1);
      const rippleAlpha=!e.hit&&e.impactAge>=0?Math.max(0,1-impactAge/2):0;
      p.ripple.material.opacity=rippleAlpha*.55;p.ripple.position.set(e.impact.x,.2,e.impact.z);p.ripple.scale.setScalar(8+impactAge*16);
      p.debris.forEach((d,i)=>{
        d.visible=!reduced&&(e.debris||0)>0;
        const phase=impactAge/.8,a=i*2.4+e.id;
        d.position.set(e.impact.x+Math.sin(a)*phase*22,e.impact.y+6+Math.sin(Math.min(1,phase)*Math.PI)*14,e.impact.z+Math.cos(a)*phase*22);
        d.rotation.set(phase*4+i,phase*5,phase*3);
      });
      p.sparks.forEach((s,i)=>{
        const phase=impactAge/.8,a=i*2.4+e.id;
        s.material.opacity=reduced||battle.id==='trafalgar'?0:e.hit&&e.impactAge>=0&&phase<1?(1-phase)*.9:0;
        s.position.set(e.impact.x+Math.sin(a)*phase*23,e.impact.y+8+Math.sin(phase*Math.PI)*17,e.impact.z+Math.cos(a)*phase*23);
        s.scale.set(2.5,5,1);
      });
      p.ball.visible=!!e.projectile&&!reduced;p.tail.visible=p.ball.visible&&battle.id!=='trafalgar';
      if(e.projectile){
        put(p.ball,e.projectile);
        const direction=new T.Vector3(e.impact.x-e.origin.x,0,e.impact.z-e.origin.z).normalize().multiplyScalar(9);
        const a=p.tail.geometry.attributes.position;
        a.setXYZ(0,e.projectile.x,e.projectile.y,e.projectile.z);a.setXYZ(1,e.projectile.x-direction.x,e.projectile.y+1,e.projectile.z-direction.z);a.needsUpdate=true;p.tail.geometry.computeBoundingSphere();
      }
    });
  }
  return {update,dispose(){root.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});flame.dispose();root.removeFromParent();}};
}

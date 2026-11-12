import * as T from '../maritime/vendor/three-0.160.1.module.min.js';

export const length = 168 * .3048;
export const beam = 46.75 * .3048;
const half = length / 2;
const keelDepth = -6.24;
const radians = T.MathUtils.degToRad;
const mix = T.MathUtils.lerp;

// Fractional stations approximated from the ZAZ1357 half-breadth, normalized
// to the published gun-deck length and maximum beam. End shape and sheer are
// coarse readings of the profile. These are not survey offsets.
const stations = [
  [0, .54, 2.22, -1.5], [.075, .70, 1.58, -4.0], [.17, .84, .92, -5.64],
  [.30, .95, .42, -6.12], [.45, .99, .10, -6.24], [.59, 1, 0, -6.24],
  [.72, .95, .07, -6.23], [.82, .83, .25, -6.04], [.90, .64, .53, -5.5],
  [.95, .44, .78, -4.45], [.98, .24, .98, -2.6], [1, .009, 1.17, -.9],
];
const section = [[0,.045],[.08,.39],[.20,.70],[.35,.91],[.51,1],[.65,.99],[.79,.95],[.92,.90],[1,.85]];

function interpolate(rows, position) {
  const i = rows.findIndex(row => row[0] >= position);
  if (i <= 0) return rows[i === 0 ? 0 : rows.length - 1].slice(1);
  const a = rows[i - 1], b = rows[i];
  return a.slice(1).map((value, n) => mix(value, b[n + 1], (position - a[0]) / (b[0] - a[0])));
}

function dimensions(x) {
  const [width, sheer, keel] = interpolate(stations, (x + half) / length);
  return { width: width * beam / 2, sheer, keel };
}

function point(x, level, side = 1) {
  const { width, sheer, keel } = dimensions(x);
  const y = Math.max(keel, level + sheer);
  const fraction = T.MathUtils.clamp((y - keel) / (5.4 + sheer - keel), 0, 1);
  return [x, y, side * width * interpolate(section, fraction)[0]];
}

const colors = {
  timber: 0x925f36, edge: 0xd8a260, light: 0xd0a673, ochre: 0xc49245,
  dark: 0x293434, iron: 0x32383a, red: 0x783d2a, copper: 0x69412d, sail: 0xf2dfb1,
};
const mat = Object.fromEntries(Object.entries(colors).map(([key, color]) => [
  key, new T.MeshStandardMaterial({ color, roughness: .91, side: T.DoubleSide }),
]));
const boxGeometry = new T.BoxGeometry(1, 1, 1);
const lines = new T.LineBasicMaterial({ color: 0x574431, transparent: true, opacity: .52 });
const fine = new T.LineBasicMaterial({ color: 0x513726, transparent: true, opacity: .28 });

function box(parent, size, pos, material) {
  const mesh = new T.Mesh(boxGeometry, material);
  mesh.scale.set(...size);
  mesh.position.set(...pos);
  parent.add(mesh);
  return mesh;
}

function line(parent, points, material = lines) {
  const geo = new T.BufferGeometry().setFromPoints(points.map(p => new T.Vector3(...p)));
  parent.add(new T.Line(geo, material));
}

function spar(parent, a, b, radius, material = mat.timber, endRadius = radius) {
  const start = new T.Vector3(...a), end = new T.Vector3(...b), axis = end.clone().sub(start);
  const mesh = new T.Mesh(new T.CylinderGeometry(endRadius, radius, axis.length(), 8), material);
  mesh.position.copy(start).lerp(end, .5);
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0), axis.normalize());
  parent.add(mesh);
  return mesh;
}

function face(parent, positions, material, indices) {
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(positions.flat(), 3));
  if (indices) geo.setIndex(indices);
  geo.computeVertexNormals();
  const mesh = new T.Mesh(geo, material);
  parent.add(mesh);
  return mesh;
}

const gunX = Array.from({ length: 14 }, (_, i) => -22 + i * 3.26);
const upperX = gunX.map(x => x + .39);
const hullLevels = [-12,-5.6,-4.9,-4.1,-3.2,-2.35,-1.5,-.65,.22,.92,1.78,2.66,3.15,4.18,4.98,5.4];
const xSamples = Array.from({length: 101}, (_, i) => -half + length * i / 100);
const xCuts = [...new Set([...xSamples, ...[...gunX,...upperX].flatMap(x => [x-.51,x+.51])])].sort((a,b)=>a-b);
const shellMaterial = new T.MeshStandardMaterial({vertexColors:true, roughness:.92, side:T.DoubleSide});

function hull(parent, side) {
  const positions = [], shades = [];
  for (let band=0; band<hullLevels.length-1; band++) {
    const lower = hullLevels[band], upper = hullLevels[band+1];
    const ports = lower===1.78 ? gunX : lower===4.18 ? upperX : [];
    const palette = upper<.22 ? 'timber' : [.92,1.78,3.15,4.18,5.4].includes(upper) ? 'dark' : 'ochre';
    for (let i=0; i<xCuts.length-1; i++) {
      const a=xCuts[i], b=xCuts[i+1], center=(a+b)/2;
      if (ports.some(x=>Math.abs(x-center)<.51)) continue;
      const corners=[point(a,lower,side),point(b,lower,side),point(b,upper,side),point(a,upper,side)];
      const tint=new T.Color(colors[palette]).multiplyScalar(.91 + .08*Math.sin(band*3+i*.34) + .05*Math.sin(i*1.7));
      for(const j of [0,1,2,0,2,3]){
        positions.push(corners[j]);
        shades.push(tint.r,tint.g,tint.b);
      }
    }
  }
  const surface = face(parent, positions, shellMaterial);
  surface.geometry.setAttribute('color', new T.Float32BufferAttribute(shades,3));
  for (const level of [-4.9,-4.1,-3.2,-2.35,-1.5,-.65,.22,.92,1.78,2.66,3.15,4.18,4.98,5.4]) {
    line(parent,xSamples.map(x=>{const p=point(x,level,side); p[2]+=side*.017; return p;}),fine);
  }
  const rail = new T.CatmullRomCurve3(xSamples.filter((_,i)=>i%4===0).map(x=>new T.Vector3(...point(x,5.4,side))));
  parent.add(new T.Mesh(new T.TubeGeometry(rail,70,.095,5,false),mat.edge));
}

function deck(parent, start, end, level, side, material) {
  const positions = [];
  for(let i=0;i<50;i++) {
    const x1=mix(start,end,i/50), x2=mix(start,end,(i+1)/50);
    const edge = x => {const p=point(x,level,side); p[2]*=.97; return p;};
    const a=edge(x1), b=edge(x2), c=[x1,a[1],0], d=[x2,b[1],0];
    positions.push(a,b,d,a,d,c);
  }
  face(parent, positions, material);
  for(let j=1;j<15;j++) {
    line(parent,Array.from({length:51},(_,i)=>{
      const p=point(mix(start,end,i/50),level,side);
      p[1]+=.018;
      p[2]*=j/15*.96;
      return p;
    }),fine);
  }
  const stripe = Array.from({length:26},(_,i)=>point(mix(start,end,i/25),level,side));
  line(parent,stripe,lines);
}

function gun(parent, x, level, side, heavy) {
  const p=point(x,level,side);
  const y=p[1], z=p[2];
  box(parent,[.68,.25,.95],[x,y+.23,z-side*1.1],mat.red);
  for (const dx of [-.28,.28]) for (const dz of [-.35,.35]) {
    spar(parent,[x+dx-.07,y+.16,z-side*1.1+dz],[x+dx+.07,y+.16,z-side*1.1+dz],.16,mat.dark);
  }
  spar(parent,[x,y+.75,z-side*1.68],[x,y+.85,z+side*.16],heavy?.17:.13,mat.iron,heavy?.12:.095);
}

function battery(parent, xs, y, side, heavy) {
  for (const x of xs) gun(parent,x,y,side,heavy);
}

function sail(parent, y, width, depth, bias, material = mat.sail) {
  const verts=[], indices=[], uSteps=12,vSteps=8;
  for (let v=0;v<=vSteps;v++) for (let u=0;u<=uSteps;u++){
    const t=v/vSteps, span=u/uSteps*2-1;
    verts.push([bias*Math.sin(Math.PI*t)*Math.cos(span*Math.PI/2)+.14*t,
      y-depth*t+.75*span*span*t, span*width/2*(.84+.16*t)]);
  }
  for(let v=0;v<vSteps;v++) for(let u=0;u<uSteps;u++){
    const i=v*(uSteps+1)+u, j=i+uSteps+1;
    indices.push(i,j,i+1,i+1,j,j+1);
  }
  const cloth=face(parent,verts,material,indices);
  const ropes=new T.Group(); parent.add(ropes);
  for(let u=0;u<=uSteps;u+=3) line(ropes,Array.from({length:vSteps+1},(_,v)=>verts[v*(uSteps+1)+u]),fine);
  line(ropes,verts.slice(-uSteps-1),lines);
  return [cloth,ropes];
}

function rig(parent) {
  const sets = {};
  const cloth = {};
  // Mast, station, truck height above the waterline, then [yard height, yard length, sail drop]
  // for the lower, topsail, and topgallant yards. Approximate proportions for a 74 of this length:
  // masts about 12%, 55%, and 85% of the gun deck from the bow, main yard about 29 m.
  const specs = [
    ['fore', 19.4, 50, [[19,25.5,11],[33.5,18.5,13.5],[43.5,12.5,8.5]]],
    ['main', -2.8, 56, [[21,29,12.5],[37,21.5,15],[48,14.5,9.5]]],
    ['mizzen', -17.9, 41, [[15.5,18.5,0],[26.5,14,10],[34,9.5,6.5]]],
  ];
  const [fore, main, mizzen] = specs;
  for (const [name,x,top,yards] of specs) {
    spar(parent,[x,-2,0],[x,top,0],.38,mat.timber,.075);
    for (const y of [yards[0][0]+2.7,yards[1][0]+2]) {
      spar(parent,[x,y-.38,0],[x,y,0],1.25,mat.dark,1.14);
    }
    sets[name]=new T.Group(); sets[name].position.x=x; parent.add(sets[name]);
    cloth[name]=[];
    for (const [y,width,drop] of yards) {
      spar(sets[name],[0,y,-width/2],[0,y,width/2],.05+width*.006,mat.dark);
      line(sets[name],[[0,y,-width/2],[0,y+3,0],[0,y,width/2]]);
      if (drop) cloth[name].push(...sail(sets[name],y,width,drop,drop*.1));
    }
    for (const side of [-1,1]) {
      const tops=yards[0][0]+2.7;
      const anchors=[-2.4,-1.5,-.6,.3,1.2,2.1].map(dx=>point(x+dx,3.72,side));
      for (const p of anchors) line(parent,[[x,tops,0],p]);
      for(let i=2;i<13;i++) {
        const t=i/15;
        line(parent,[anchors[0],anchors.at(-1)].map(p=>[mix(p[0],x,t),mix(p[1],tops,t),mix(p[2],0,t)]),fine);
      }
      line(parent,[[x,top-3,0],point(x-3.9,3.72,side)]);
    }
  }
  spar(parent,[22.9,5.2,0],[44,15.2,0],.32,mat.timber,.09);
  line(parent,[[44,15.2,0],[fore[1],fore[2],0],[main[1],main[2],0],[mizzen[1],mizzen[2],0]]);
  line(parent,[[36,11.4,0],...specs.map(([,x,,yards])=>[x,yards[1][0]+2,0])]);
  line(parent,[[35,10.9,0],[26,-.4,0]]);
  const jib = new T.Group(); parent.add(jib);
  face(jib,[[42,14.3,0],[21,35.5,0],[25.5,11.6,3.4],[29.5,17.2,2.2]],mat.sail,[0,1,3,1,2,3,2,0,3]);
  const driver = new T.Group(); driver.position.x=mizzen[1]; parent.add(driver);
  spar(driver,[0,9.5,0],[-14.5,8.6,0],.13,mat.dark);
  spar(driver,[0,17,0],[-9.5,21,0],.1,mat.dark);
  face(driver,[[0,9.5,0],[-14,8.7,0],[-9.3,20.9,0],[0,17,0]],mat.sail,[0,1,2,0,2,3]);
  return { sets, cloth, jib, driver };
}

export function createShip() {
  const ship=new T.Group(), near=new T.Group(), far=new T.Group(), open=new T.Group();
  ship.add(far,near,open);
  hull(far,-1); hull(near,1);
  for(const [side,parent] of [[-1,far],[1,near]]) {
    for(const [level,material] of [[-1.18,mat.timber],[1.17,mat.light],[3.59,mat.light]]) {
      deck(parent,-half+.5,half-.65,level,side,material);
    }
    deck(parent,-half+.3,-8.8,5.19,side,mat.light);
    deck(parent,13,half-.4,5.19,side,mat.light);
    battery(parent,gunX,1.17,side,true); battery(parent,upperX,3.59,side,false);
    battery(parent,Array.from({length:7},(_,i)=>-23.9+i*2.35),5.19,side,false);
    battery(parent,[16.7,20.4],5.19,side,false);
    for(let i=0;i<5;i++){
      const y=5.55 + (i>0?1.42:0), z=side*(.5+i*.57);
      box(parent,[.14,.67,.43],[-half-.08,y,z],mat.ochre);
      box(parent,[.16,.49,.29],[-half-.15,y,z],mat.dark);
    }
    const stern=[point(-half,-8,side),point(-half,3.4,side),point(-half,5.4,side)];
    const [a,b,c]=stern;
    face(parent,[a,b,c,[-half,c[1],0],[-half,a[1],0]],mat.timber,[0,1,4,1,3,4,1,2,3]);
  }

  for(let i=0;i<27;i++){
    const x=mix(-24,24,i/26);
    const {keel,sheer}=dimensions(x);
    const frame=Array.from({length:15},(_,j)=>{
      const p=point(x,mix(keel-sheer,5.26,j/14),-1); p[2]*=.965; return new T.Vector3(...p);
    });
    open.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(frame),18,.105,5,false),mat.edge));
    for(const level of [-1.18,1.17,3.59]) {
      const p=point(x,level,-1);
      box(open,[.14,.16,-p[2]],[x,p[1]-.09,p[2]/2],mat.edge);
    }
  }
  for(const x of [-17,-13,-9,-6,8,11,14,17]) for(const z of [-1.05,-2.15,-3.1]){
    const y=dimensions(x).keel+1.65+.22*Math.abs(z);
    if (point(x,y-dimensions(x).sheer,-1)[2]>z-.35) continue;
    const barrel=new T.Mesh(new T.CylinderGeometry(.37,.34,.84,9),mat.timber);
    barrel.position.set(x,y,z);open.add(barrel);
    for (const dy of [-.27,.27]) spar(open,[x,y+dy-.035,z],[x,y+dy+.035,z],.384,mat.dark);
  }

  // The keel runs straight from the sternpost and turns up into the stem only at the forefoot.
  // Deadwood fills the space where the body of the hull rises above the keel.
  const keelLine=x=>x<length*.72-half ? keelDepth : dimensions(x).keel;
  const keel=new T.CatmullRomCurve3(xSamples.filter((_,i)=>i%4===0).map(x=>new T.Vector3(x,keelLine(x),0)));
  ship.add(new T.Mesh(new T.TubeGeometry(keel,64,.2,5,false),mat.edge));
  spar(ship,[-half,keelDepth,0],[-half,2.6,0],.2,mat.edge);
  const deadwood=[];
  for(let i=0;i<50;i++){
    const a=xSamples[i], b=xSamples[i+1], top=x=>Math.max(keelDepth,dimensions(x).keel);
    deadwood.push([a,keelDepth,0],[b,keelDepth,0],[b,top(b),0],[a,keelDepth,0],[b,top(b),0],[a,top(a),0]);
  }
  face(ship,deadwood,mat.timber);
  const rudder=new T.Group();rudder.position.set(-half-.3,-.25,0);ship.add(rudder);
  const foot=keelDepth+.25;
  face(rudder,[[0,2.3,0],[0,foot,0],[-1.3,foot,0],[-.66,1.9,0]],mat.timber,[0,1,2,0,2,3]);
  spar(rudder,[0,2.5,0],[0,foot,0],.13,mat.dark);
  const wheel=new T.Group();wheel.position.set(-14.5,6.9,0); ship.add(wheel);
  for(const dx of [-.23,.23]){
    const ring=new T.Mesh(new T.TorusGeometry(.48,.05,8,20),mat.timber);ring.rotation.y=Math.PI/2;ring.position.x=dx;wheel.add(ring);
    for(let i=0;i<8;i++) spar(wheel,[dx,0,0],[dx,Math.cos(i*Math.PI/4)*.54,Math.sin(i*Math.PI/4)*.54],.027,mat.edge);
  }
  box(ship,[.46,.7,.32],[-14.5,6.2,0],mat.timber);

  const rigging=new T.Group();
  ship.add(rigging);
  const { sets, cloth, jib, driver }=rig(rigging);
  // Sails cast shadows but do not take them: the curved cloth shows shadow-map banding.
  for(const piece of [...Object.values(cloth).flat(),jib,driver]) {
    piece.traverse(part=>{ if(part.material===mat.sail) part.userData.castOnly=true; });
  }
  return {
    ship,
    setCutaway(cut) {
      near.visible=!cut; open.visible=cut;
      for(const piece of [...Object.values(cloth).flat(),jib,driver]) piece.visible=!cut;
    },
    setTrim({heading,fore,main,mizzen,rudder:angle}) {
      for (const [name,value] of Object.entries({fore,main,mizzen})) {
        sets[name].rotation.y=radians(value);
        // Exaggerated change of billow to make the backed sails legible.
        const incidence=Math.cos(radians(heading-value));
        const billow=T.MathUtils.clamp(-incidence*7,-1,1);
        for(const piece of cloth[name]) piece.scale.x=billow;
      }
      rudder.rotation.y=radians(angle);
      wheel.rotation.x=radians(angle*4);
      // Fore-and-aft sails lie to leeward and shift as the bow crosses the wind.
      const lee=T.MathUtils.clamp(heading/10,-1,1);
      jib.scale.z=lee || .001;
      driver.rotation.y=radians(16*lee);
    },
  };
}

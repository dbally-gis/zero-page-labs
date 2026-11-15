// Generic hull forms by ship type. These are illustrative shapes that tell the
// types apart, not measured lines of any named vessel. Pure data: no renderer needed.
export const KEEL=-2,DECK=8.05,RAIL=9;
// Height fractions from keel to rail at which each section is sampled.
const LEVELS=[0,.14,.33,.45,.56,.67,.82,1];
// entry/run: where the bow stops widening and the stern starts narrowing (fraction of length).
// bluff: fullness of the bow. transom: stern width as a fraction of the beam (0 = rounded stern).
// sheer: rise of the rail toward the ends. rake/counter: how far the lower hull is cut back at bow/stern.
// section: half-breadth fraction at each level. low: how far the hull sits below the common deck height,
// so that low-freeboard ironclads ride nearly awash.
export const FORMS={
  sail:{low:0,length:56,beam:16.6,entry:.30,bluff:1.8,run:.58,transom:.62,sheer:1.7,rake:4,counter:5,section:[.05,.58,.90,.97,1,.98,.92,.84]},
  galley:{low:0,length:64,beam:9.6,entry:.50,bluff:1,run:.72,transom:.42,sheer:1.3,rake:5,counter:3,section:[.08,.52,.80,.90,.96,1,1,1]},
  monitor:{low:4.4,length:43,beam:17.4,entry:.36,bluff:1.15,run:.64,transom:0,sheer:0,rake:3,counter:3,section:[.08,.44,.60,.64,.66,.67,1,1]},
  cruiser:{low:0,length:56,beam:16.6,entry:.38,bluff:1.1,run:.74,transom:.18,sheer:.5,rake:-3,counter:4,section:[.08,.66,.92,.97,1,1,1,.99]},
  ironclad:{low:3.8,length:56,beam:16.6,entry:.34,bluff:1.1,run:.66,transom:0,sheer:0,rake:1,counter:1,section:[.08,.60,.84,.92,.97,1,1,1]},
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// A screw frigate keeps the sailing hull; her funnel is added in the scene.
FORMS['screw-frigate']=FORMS.sail;
export const formFor=type=>FORMS[type]??FORMS.ironclad;

// Half-breadth of the deck outline at a fraction of the length, 0 at the bow.
function planform(form,t){
  if(t<form.entry){const u=1-t/form.entry;return Math.pow(Math.max(0,1-u*u),1/form.bluff);}
  if(t>form.run){const u=(t-form.run)/(1-form.run);return form.transom+(1-form.transom)*Math.sqrt(Math.max(0,1-u*u));}
  return 1;
}
function sectionAt(form,f){
  const i=Math.max(1,LEVELS.findIndex(level=>level>=f)),a=LEVELS[i-1],b=LEVELS[i];
  return form.section[i-1]+(form.section[i]-form.section[i-1])*clamp((f-a)/(b-a),0,1);
}
const railAt=(form,t)=>RAIL+form.sheer*(2*t-1)**2*(t>.5?1.4:1);

// Half-breadth of the hull at a position along the keel (bow is -z) and a height.
export function hullHalf(type,z,y){
  const form=formFor(type),t=clamp(z/form.length+.5,0,1);
  return form.beam/2*planform(form,t)*sectionAt(form,clamp((y-KEEL)/(railAt(form,t)-KEEL),0,1));
}

// Shell, transom, deck and waterline foam as flat arrays ready for buffer geometry.
export function hullMesh(type,stations=30){
  const form=formFor(type),{length,beam}=form,rows=LEVELS.length;
  const shell={positions:[],uvs:[],indices:[]},deck={positions:[],uvs:[],indices:[]},foam={positions:[],colors:[],indices:[]};
  const ts=Array.from({length:stations+1},(_,i)=>(1-Math.cos(Math.PI*i/stations))/2);
  for(const side of [1,-1])for(const t of ts){
    const plan=planform(form,t),rail=railAt(form,t);
    for(let j=0;j<rows;j++){
      const f=LEVELS[j],low=1-f;
      const z=(t-.5)*length+form.rake*low*Math.max(0,1-t/form.entry)**2-form.counter*low*Math.max(0,(t-form.run)/(1-form.run))**2;
      shell.positions.push(side*beam/2*plan*form.section[j],KEEL+f*(rail-KEEL),z);
      shell.uvs.push(t*6,f);
    }
  }
  for(let s=0;s<2;s++)for(let i=0;i<stations;i++)for(let j=0;j<rows-1;j++){
    const a=s*(stations+1)*rows+i*rows+j,b=a+rows,c=a+1,d=b+1;
    if(s)shell.indices.push(a,b,c,b,d,c);else shell.indices.push(a,c,b,b,c,d);
  }
  if(form.transom){
    // Flat stern: join the last station of each side.
    const last=stations*rows,start=shell.positions.length/3;
    for(const offset of [last,(stations+1)*rows+last])for(let j=0;j<rows;j++){
      shell.positions.push(...shell.positions.slice((offset+j)*3,(offset+j)*3+3));
      shell.uvs.push(offset===last?6.6:6,LEVELS[j]);
    }
    for(let j=0;j<rows-1;j++){const a=start+j,b=start+rows+j;shell.indices.push(a,b,a+1,b,b+1,a+1);}
  }
  ts.forEach((t,i)=>{
    const z=(t-.5)*length,half=hullHalf(type,z,DECK)*.97;
    deck.positions.push(half,DECK,z,-half,DECK,z);
    deck.uvs.push(half/9,z/14,-half/9,z/14);
    if(i)deck.indices.push(i*2-2,i*2-1,i*2,i*2-1,i*2+1,i*2);
  });
  // Foam hugs the waterline: clear at the hull, brightest just outside, clear again further out.
  const ring=[];
  for(const side of [1,-1])for(let i=0;i<=stations;i++){const t=side>0?ts[i]:ts[stations-i],z=(t-.5)*length;ring.push([side*hullHalf(type,z,form.low),z]);}
  ring.forEach(([x,z],i)=>{
    const nx=x/(beam/2)**2,nz=z/(length/2)**2,size=Math.hypot(nx,nz)||1;
    for(const [reach,alpha] of [[-.4,0],[.7,.55],[3.4,0]]){
      foam.positions.push(x+nx/size*reach,0,z+nz/size*reach);
      foam.colors.push(.9,.97,.92,alpha);
    }
    const a=i*3,b=(i+1)%ring.length*3;
    for(const k of [0,1])foam.indices.push(a+k,b+k,a+k+1,b+k,b+k+1,a+k+1);
  });
  return {shell,deck,foam};
}

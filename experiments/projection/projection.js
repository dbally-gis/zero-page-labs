/* Browser adapter for the unchanged Orbits projection renderer. */
'use strict';
const $=id=>document.getElementById(id);
const state={index:9,unfold:1,zoom:1,rotation:null,observer:null,center:false,circles:true,rings:false,gridcore:false,imagery:false};
let coasts,catalog,display=null,frame=null,previousTime=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function tick(time){
  frame=null;
  const dt=previousTime===null?0:Math.max(0,time-previousTime);previousTime=time;
  if(!display||reduced.matches)display={...state};
  else if(display.index!==state.index){
    const amount=Math.max(0,display.unfold-dt/180);
    display={...state,index:display.index,unfold:amount};
    if(amount===0)display={...state,unfold:0};
  }else{
    const delta=state.unfold-display.unfold;
    display={...state,unfold:display.unfold+Math.sign(delta)*Math.min(Math.abs(delta),dt/180)};
  }
  try{AtlasProjections.render(display,$('map'),coasts);}catch(error){$('loading').hidden=false;$('loading').textContent='The map could not render. Reload to try again.';console.error(error);return;}
  if(display.index!==state.index||Math.abs(display.unfold-state.unfold)>0.0001)frame=requestAnimationFrame(tick);else previousTime=null;
}
function draw(){if(coasts&&frame===null)frame=requestAnimationFrame(tick);}
function update(){
  const item=catalog[state.index];$('projection').value=state.index;$('name').textContent=item.name;$('explanation').textContent=item.explanation;
  $('count').textContent=`${state.index+1} / ${catalog.length}`;$('map-state').textContent=item.name.toUpperCase();
  $('map').setAttribute('aria-label',`Earth: ${item.name}, ${Math.round(state.unfold*100)}% unfolded`);
  $('property').textContent=[4,5,6,7,9,12,14,15,16,17,20].includes(state.index)?'PRESERVES AREA':[1,2,18,22].includes(state.index)?'PRESERVES LOCAL ANGLES':state.index===23?'ICOSAHEDRAL UNFOLDING':'COMPARE SHAPE, AREA & DISTANCE';
  $('unfold').value=state.unfold;$('amount').textContent=`${Math.round(state.unfold*100)}%`;$('zoom').value=state.zoom;$('zoom-value').textContent=`${Math.round(state.zoom*100)}%`;
  $('circles').checked=state.circles;$('gridcore').checked=state.gridcore;
  $('gesture').textContent=state.unfold<1?'Drag or focus the map and use arrow keys to rotate.':'Move the slider toward Globe to rotate with drag or arrow keys.';
  $('map').style.touchAction=state.unfold<1?'none':'pan-y';draw();
}
async function init(){
  try{
    [coasts,catalog]=await Promise.all(['earth-coastlines.json','catalog.json'].map(async url=>{const response=await fetch(url);if(!response.ok)throw Error(`Asset ${url}: ${response.status}`);return response.json();}));
    if(!globalThis.AtlasProjections||catalog.length!==24)throw Error('Projection assets unavailable');
    catalog.forEach((item,index)=>$('projection').add(new Option(item.name,index)));$('projection').disabled=false;
    $('projection').onchange=event=>{state.index=Number(event.target.value);update();};
    for(const [id,delta] of [['previous',-1],['next',1]])$(id).onclick=()=>{state.index=(state.index+delta+catalog.length)%catalog.length;update();};
    for(const id of ['unfold','zoom'])$(id).oninput=event=>{state[id]=Number(event.target.value);update();};
    for(const id of ['circles','gridcore'])$(id).onchange=event=>{state[id]=event.target.checked;update();};
    $('reset').onclick=()=>{Object.assign(state,{index:9,unfold:1,zoom:1,rotation:null,circles:true,gridcore:false});update();};
    $('map').onkeydown=event=>{const moves={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,10],ArrowDown:[0,-10]};const move=moves[event.key];if(!move||state.unfold===1)return;event.preventDefault();const rotation=state.rotation||[0,0];state.rotation=[rotation[0]+move[0],Math.max(-89,Math.min(89,rotation[1]+move[1]))];draw();};
    let drag=null;
    $('map').onpointerdown=event=>{if(state.unfold===1)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,rotation:state.rotation||[0,0]};$('map').setPointerCapture(event.pointerId);};
    $('map').onpointermove=event=>{if(!drag||event.pointerId!==drag.id)return;state.rotation=[drag.rotation[0]+(event.clientX-drag.x)*0.4,Math.max(-89,Math.min(89,drag.rotation[1]-(event.clientY-drag.y)*0.4))];draw();};
    const end=()=>{drag=null;};$('map').onpointerup=end;$('map').onpointercancel=end;$('map').onlostpointercapture=end;
    new ResizeObserver(draw).observe($('map'));$('loading').hidden=true;update();
  }catch(error){$('loading').textContent='The map could not load. Reload to try again.';console.error(error);}
}
init();

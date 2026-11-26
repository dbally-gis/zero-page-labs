/* Port of Orbits' spherical tangent-plane construction demonstration. */
'use strict';
const constructionKinds={
  gnomonic:{ordinate:a=>Math.tan(a),explanation:"Light at Earth's center. Rays meet a tangent plane. Great-circle routes become straight lines; the horizon cannot fit on a finite map."},
  stereographic:{ordinate:a=>2*Math.tan(a/2),explanation:'Light at the opposite surface point. Rays pass through the sphere to a tangent plane. Local angles are preserved, while area stretches.'},
  orthographic:{ordinate:a=>Math.sin(a),explanation:'Parallel rays from an infinitely distant viewpoint. This shows one hemisphere, like viewing a globe from space.'},
  mercator:{ordinate:a=>Math.log(Math.tan(Math.PI/4+a/2)),explanation:'No single light source produces Mercator. Latitude is stretched mathematically: y/R = ln(tan(π/4 + φ/2)). This cylinder section illustrates the receiving surface, not an optical construction.'}
};
function construction(){
  const kind=document.getElementById('construction-kind').value;
  const degrees=Number(document.getElementById('construction-angle').value),radians=degrees*Math.PI/180;
  const {ordinate,explanation}=constructionKinds[kind];
  const svg=document.getElementById('construction-diagram');
  const point=(x,y)=>[210+x*52,190-y*52];
  const line=(a,b,color,width=1)=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="${width}"/>`;
  let drawing='<circle cx="210" cy="190" r="52" fill="#0b2534" stroke="#8cdae3"/>';
  drawing+=line(point(1,-3),point(1,3),'#e6e9e7',2);
  for(let angle=-60;angle<=60;angle+=20){const a=angle*Math.PI/180;const surface=point(Math.cos(a),Math.sin(a));const source=kind==='gnomonic'?point(0,0):kind==='stereographic'?point(-1,0):point(-2,Math.sin(a));drawing+=line(kind==='mercator'?surface:source,point(1,ordinate(a)),'#625439');}
  const surface=point(Math.cos(radians),Math.sin(radians)),target=point(1,ordinate(radians));
  const source=kind==='gnomonic'?point(0,0):kind==='stereographic'?point(-1,0):point(-2,Math.sin(radians));
  drawing+=line(kind==='mercator'?surface:source,target,kind==='mercator'?'#ed9c45':'#f4d46c',2);
  if(kind==='gnomonic'||kind==='stereographic')drawing+=`<circle cx="${source[0]}" cy="${source[1]}" r="4" fill="#f4d46c"/>`;
  drawing+=line(point(1,ordinate((degrees-3)*Math.PI/180)),point(1,ordinate((degrees+3)*Math.PI/180)),'#589da5',8);
  for(const p of [surface,target])drawing+=`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#8cdae3"/>`;
  drawing+=`<g fill="#c8d4d9" font-family="monospace" font-size="12" text-anchor="middle"><text x="280" y="26">${kind==='mercator'?'CYLINDER SECTION':'TANGENT PLANE'}</text><text x="280" y="358">${kind==='mercator'?'ORANGE: MATHEMATICAL MAPPING':'YELLOW: PROJECTION RAYS'}</text></g>`;
  svg.innerHTML=drawing;
  svg.setAttribute('aria-label',`${kind} construction. Angular separation ${degrees} degrees. Projected coordinate ${ordinate(radians).toFixed(2)} Earth radii. ${explanation}`);
  document.getElementById('construction-explanation').textContent=explanation;
  document.getElementById('angle-label').textContent=kind==='mercator'?'Latitude':'Signed angle from projection center';
  document.getElementById('construction-value').textContent=`${degrees}° · Projected offset: ${ordinate(radians).toFixed(2)} × Earth radius`;
}
document.getElementById('construction-kind').onchange=construction;
document.getElementById('construction-angle').oninput=construction;
construction();

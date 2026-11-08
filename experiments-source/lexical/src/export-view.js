export function exportDimensions(w,h){const width=Math.round(Math.min(1600,Math.max(1000,w*2),2100*w/h));return {width,height:Math.round(width*h/w)}}
export function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
export async function scenePNG({canvas,svg,title,mode,words,color,count,total=count}){
 let image=canvas,objectURL;
 if(svg){objectURL=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));image=new Image();image.src=objectURL;await image.decode()}
 try{
  if(!image)throw Error('The scene is still loading. Try again in a moment.');
  const originalW=svg?svg.viewBox.baseVal.width:image.width,originalH=svg?svg.viewBox.baseVal.height:image.height;
  const {width,height:pictureHeight}=exportDimensions(originalW,originalH);
  const output=document.createElement('canvas');output.width=width;const ctx=output.getContext('2d');ctx.font='18px sans-serif';
  let x=32,row=0;const legend=words.map(word=>{const label=word.length>24?word.slice(0,22)+'…':word,measure=ctx.measureText(label).width+36;if(x+measure>width-32){x=32;row++}const item={word,label,x,row};x+=measure;return item});
  const copyrightY=pictureHeight+155+row*26;output.height=copyrightY+30;
  ctx.fillStyle='#121610';ctx.fillRect(0,0,width,output.height);ctx.drawImage(image,0,0,width,pictureHeight);
  ctx.fillStyle='#f1ead7';ctx.font='bold 26px sans-serif';ctx.fillText(title.slice(0,70),32,pictureHeight+43);
  ctx.fillStyle='#b8c0ad';ctx.font='16px sans-serif';const countLabel=count===total?`${count} occurrences`:`${count} of ${total} occurrences shown`;
  ctx.fillText(`${mode==='matrix'?'Lexical Atlas · synthetic sheets of 250 filtered words':'Throughline · spelling coordinates'} · ${countLabel}`,32,pictureHeight+74);
  ctx.font='18px sans-serif';for(const item of legend){ctx.fillStyle=color(item.word);ctx.fillRect(item.x,pictureHeight+99+item.row*26,10,10);ctx.fillText(item.label,item.x+17,pictureHeight+111+item.row*26)}
  ctx.fillStyle='#b8c0ad';ctx.font='13px monospace';ctx.fillText('LEXICAL / ZERO PAGE LABS     zeropagelabs.com',32,copyrightY);
  return await new Promise((resolve,reject)=>output.toBlob(blob=>blob?resolve(blob):reject(Error('PNG export failed. Please try again.')),'image/png'));
 }finally{if(objectURL)URL.revokeObjectURL(objectURL)}
}

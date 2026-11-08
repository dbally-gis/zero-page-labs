// User activation is supplied by the Full screen button; never enter on load.
export async function enterChartFullscreen(element,doc=document){
 if(!element)throw Error('The chart is still loading.');
 if(doc.fullscreenEnabled&&typeof element.requestFullscreen==='function'){
  try{await element.requestFullscreen();return 'native'}catch{return 'fallback'}
 }
 return 'fallback';
}

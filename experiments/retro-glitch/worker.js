import {applyPipeline} from './effects.mjs';
self.onmessage=({data})=>{try{const pixels=applyPipeline(data.pixels,data.width,data.height,data.effects,data.seed);self.postMessage({id:data.id,pixels},[pixels.buffer])}catch(error){self.postMessage({id:data.id,error:error.message})}};

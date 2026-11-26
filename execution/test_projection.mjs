import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const root=new URL('../experiments/projection/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
test('vendored projection assets retain their recorded source fingerprints',()=>{
  for(const [name,record] of Object.entries(JSON.parse(read('provenance.json'))))assert.equal(createHash('sha256').update(readFileSync(new URL(name,root))).digest('hex'),record.sha256,name);
});
test('24 maps render finite geography at globe, half-unfolded, and map endpoints',()=>{
  const scope={};vm.createContext(scope);vm.runInContext(read('projection-engine.js'),scope);
  const catalog=JSON.parse(read('catalog.json')),coasts=JSON.parse(read('earth-coastlines.json'));
  assert.equal(catalog.length,24);assert.equal(new Set(catalog.map(item=>item.name)).size,24);
  for(const width of [335,950])for(const [index,item] of catalog.entries())for(const unfold of [0,.5,1]){
    let points=0;
    const context=new Proxy({}, {get:(_,name)=>(...args)=>{if(['moveTo','lineTo','arc'].includes(name)){assert(args.every(Number.isFinite),`${item.name} at ${unfold}`);points++;}},set:()=>true});
    const canvas={clientWidth:width,clientHeight:width===335?310:560,getContext:()=>context};
    scope.AtlasProjections.render({index,unfold,zoom:1,observer:null,center:false,circles:true,rings:false,gridcore:false},canvas,coasts);
    assert(points>100,`${item.name} must render geography`);
  }
});

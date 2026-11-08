import test from 'node:test';
import assert from 'node:assert/strict';
import {EFFECTS,applyEffect,applyPipeline} from '../experiments/retro-glitch/effects.mjs';
import {validateImage} from '../experiments/retro-glitch/image-intake.mjs';
import {validateText} from '../experiments-source/lexical/src/intake.js';
const w=31,h=23,input=new Uint8ClampedArray(w*h*4);
for(let i=0;i<input.length;i+=4){input[i]=(i*7)%256;input[i+1]=(i*13)%256;input[i+2]=(i*19)%256;input[i+3]=i%255;}
for(const [key,name]of EFFECTS)test(name+' preserves dimensions, alpha, input, and repeatability',()=>{const before=input.slice(),a=applyEffect(input,w,h,key,63,42),b=applyEffect(input,w,h,key,63,42);assert.equal(a.length,input.length);assert.deepEqual(a,b);assert.deepEqual(input,before);for(let i=3;i<a.length;i+=4)assert.equal(a[i],input[i]);assert.notDeepEqual(a,input)});
test('reset pipeline is pixel identical',()=>assert.deepEqual(applyPipeline(input,w,h,[],42),input));
test('random effects respond to seed',()=>assert.notDeepEqual(applyEffect(input,w,h,'snoise',50,1),applyEffect(input,w,h,'snoise',50,2)));
test('invalid effect fails explicitly',()=>assert.throws(()=>applyEffect(input,w,h,'oops')));
test('dimension mismatch fails before processing',()=>assert.throws(()=>applyEffect(input,w+1,h,'pix')));
function png(width,height){const b=new Uint8Array(24),v=new DataView(b.buffer);v.setUint32(0,0x89504e47);v.setUint32(4,0x0d0a1a0a);v.setUint32(16,width);v.setUint32(20,height);return b}
test('PNG dimensions validated before decode',()=>assert.deepEqual(validateImage(png(1200,800)),{width:1200,height:800}));
test('JPEG dimensions validated before decode',()=>{const b=Uint8Array.from([255,216,255,192,0,17,8,3,32,4,176,3,1,17,0,2,17,0,3,17,0,255,217]);assert.deepEqual(validateImage(b),{height:800,width:1200})});
test('oversized dimensions rejected',()=>assert.throws(()=>validateImage(png(50000,50000)),/24 megapixels/));
test('zero dimensions rejected',()=>assert.throws(()=>validateImage(png(0,1200))));
test('non-image rejected',()=>assert.throws(()=>validateImage(new TextEncoder().encode('<script>'))));
test('oversized file rejected',()=>assert.throws(()=>validateImage(new Uint8Array(10*1024*1024+1)),/10 MB/));
test('valid local passage accepted',()=>assert.equal(validateText('Curious words return across the pages.'),''));
test('oversized text rejected',()=>assert.match(validateText('abc '.repeat(5001)),/20,000/));
test('empty text rejected',()=>assert.match(validateText('   '),/text/));
test('binary text rejected',()=>assert.match(validateText('words\0here'),/plain-text/));
test('unmapped character input rejected',()=>assert.match(validateText('12345 !'),/English/));

test('palette intensity changes the output',()=>{for(const key of ['gb','nes','c64','atari'])assert.notDeepEqual(applyEffect(input,w,h,key,20),applyEffect(input,w,h,key,100));});

import {TEXT_EXAMPLES} from '../experiments-source/lexical/src/text-examples.js';
test('built-in examples have unique identities',()=>assert.equal(new Set(TEXT_EXAMPLES.map(e=>e.id)).size,TEXT_EXAMPLES.length));
for(const example of TEXT_EXAMPLES)test('example '+example.id+' is valid bounded text with available focus words',()=>{assert.equal(validateText(example.text),'');assert.ok(['matrix','sequence'].includes(example.mode));const words=example.text.toLowerCase().match(/\b[a-z]+\b/g)||[];for(const word of example.focusWords)assert.ok(words.filter(w=>w===word).length>=2,word+' recurs');});

import {buildModel,wordColor,atlasPosition,letterPosition,excerpt,flatLayout,fittedCamera,validateSavedView,shareHash,readSharedView} from '../experiments-source/lexical/src/model.js';
test('model keeps exact offsets through case, punctuation, and linking words',()=>{const text='The Map, then MAP; a map.';const m=buildModel(text);assert.equal(m.counts.map,3);for(const t of m.byWord.map)assert.equal(text.slice(t.start,t.end).toLowerCase(),'map');assert.equal(m.tokens.length,4);assert.equal(m.byWord.map[2].index,3)});
test('model treats reserved property names as ordinary words',()=>{const m=buildModel('constructor constructor __proto__ toString bright');assert.equal(Object.getPrototypeOf(m.counts),null);assert.equal(m.counts.constructor,2);assert.equal(m.counts.proto,undefined);assert.equal(Object.getPrototypeOf(m.byWord),null);assert.equal(m.counts.tostring,1);assert.deepEqual(m.byWord.constructor.map(t=>t.index),[0,1])});
test('word colors are stable independent of selection order and letter case',()=>{for(const w of ['map','signal','question','constructor']){assert.match(wordColor(w),/^#[0-9a-f]{6}$/);assert.equal(wordColor(w),wordColor(w.toUpperCase()))}assert.equal(wordColor('map'),['signal','map'].map(wordColor)[1]);assert.notEqual(wordColor('map'),wordColor('signal'))});
test('Atlas sheet boundaries use all mapped words',()=>{const m=buildModel('signal '.repeat(501));assert.equal(m.sheetCount,3);assert.equal(m.tokens.length,501);assert.ok(atlasPosition(249)[2]===0);assert.equal(atlasPosition(250,.7)[2],-.7);assert.equal(atlasPosition(500,.7)[2],-1.4)});
test('2D positions cover the entire supported passage without truncation',()=>{const m=buildModel('signal '.repeat(1000));for(const mode of ['sequence','matrix']){const layout=flatLayout(m,mode);const positions=m.tokens.map(layout.point);assert.equal(positions.length,1000);for(const p of positions){assert.ok(p.x>=0&&p.x<layout.width);assert.ok(p.y>=0&&p.y<layout.height)}if(mode==='matrix')assert.equal(layout.sheets.length,4)}});
test('excerpts preserve original capitalization and context',()=>{const text='A curious Map crosses the page. Another map returns.';const m=buildModel(text);const e=excerpt(text,m.byWord.map[0]);assert.equal(e.hit,'Map');assert.ok(e.before.includes('curious'));assert.ok(e.after.includes('crosses'))});
test('spelling coordinates are deliberately shared by same prefix/length',()=>{assert.deepEqual(letterPosition({word:'bright'}),letterPosition({word:'bridge'}))});
test('fitted cameras are finite for phone, desktop, single word and empty filters',()=>{for(const model of [buildModel('signal'),buildModel(TEXT_EXAMPLES[0].text),{tokens:[]}])for(const mode of ['matrix','sequence'])for(const aspect of [.7,1.8]){const c=fittedCamera(model,mode,.7,aspect);for(const n of [...c.target,...c.position,c.distance])assert.ok(Number.isFinite(n));assert.ok(c.distance>0)}});
test('built-in share links restore view settings without storing text',()=>{const e=TEXT_EXAMPLES[1],view={version:1,text:e.text,exampleId:e.id,mode:'matrix',words:['signal','station'],at:24,flat:true,depth:1.1,opacity:.13,background:false};const hash=shareHash(view);assert.ok(!hash.includes('text='));assert.ok(!decodeURIComponent(hash).includes('The signal returns'));const restored=readSharedView(hash,TEXT_EXAMPLES);for(const key of ['text','exampleId','mode','at','flat','depth','opacity','background'])assert.equal(restored[key],view[key]);assert.deepEqual(restored.words,view.words)});
test('custom text cannot be included in a share link',()=>assert.throws(()=>shareHash({exampleId:'',text:'private words'}),/stay local/));
test('saved custom views retain text without claiming built-in identity',()=>{const v=validateSavedView({version:1,text:'Curious words return. Curious words stay.',exampleId:'workshop',words:['curious'],mode:'sequence',at:3},TEXT_EXAMPLES);assert.equal(v.exampleId,'');assert.equal(v.text,'Curious words return. Curious words stay.');assert.deepEqual(v.words,['curious'])});
test('saved views reject oversized input',()=>assert.throws(()=>validateSavedView({version:1,text:'word '.repeat(5000)},TEXT_EXAMPLES),/20,000/));
test('saved view settings are bounded and unavailable terms are removed',()=>{const v=validateSavedView({version:1,text:'signal station return',words:['constructor','signal','signal'],depth:99,opacity:99},TEXT_EXAMPLES);assert.deepEqual(v.words,['signal']);assert.equal(v.depth,1.5);assert.equal(v.opacity,.3)});
test('bare example links get useful focus words',()=>assert.deepEqual(readSharedView('#example=workshop',TEXT_EXAMPLES).words,['map','signal','question']));
test('abnormally long words fail before creating graphics labels',()=>assert.throws(()=>buildModel('a'.repeat(101)),/100 letters/));

import {exportDimensions} from '../experiments-source/lexical/src/export-view.js';
test('tall PNG exports retain their source aspect ratio',()=>{for(const [w,h] of [[1040,1690],[1600,700],[335,420]]){const out=exportDimensions(w,h);assert.ok(out.height<=2101);assert.ok(Math.abs(out.width/out.height-w/h)<.002)}});
test('view restoration retains filters, labels, frequency sizing and camera',()=>{const e=TEXT_EXAMPLES[3],v={version:1,text:e.text,exampleId:e.id,mode:'sequence',words:['star'],at:0,flat:false,depth:.7,opacity:.1,background:false,labels:false,letter:'s',range:55,weighted:true,camera:{position:[2,1,8],target:[0,0,0]}};const restored=readSharedView(shareHash(v),TEXT_EXAMPLES);for(const key of ['labels','letter','range','weighted'])assert.equal(restored[key],v[key]);assert.deepEqual(restored.camera,v.camera)});
test('invalid camera and filter values are bounded safely',()=>{const v=validateSavedView({version:1,text:'signal station return',words:['signal'],camera:{position:[Infinity,0,1],target:[0,0,0]},letter:'<script>',range:500},TEXT_EXAMPLES);assert.equal(v.camera,null);assert.equal(v.letter,'s');assert.equal(v.range,100)});

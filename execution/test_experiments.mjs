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

import {countWords,indexWords} from '../experiments-source/lexical/src/word-maps.js';
test('JavaScript property names are ordinary corpus words',()=>{const words=['constructor','__proto__','toString','constructor'];const nodes=words.map((word,index)=>({word,index}));const counts=countWords(nodes),indices=indexWords(nodes);assert.equal(Object.getPrototypeOf(counts),null);assert.equal(counts.constructor,2);assert.equal(counts.__proto__,1);assert.equal(counts.toString,1);assert.deepEqual(indices.constructor,[0,3]);assert.deepEqual(indices.__proto__,[1]);assert.deepEqual(indices.toString,[2]);});
test('palette intensity changes the output',()=>{for(const key of ['gb','nes','c64','atari'])assert.notDeepEqual(applyEffect(input,w,h,key,20),applyEffect(input,w,h,key,100));});

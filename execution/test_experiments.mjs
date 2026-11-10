import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {EFFECTS,applyEffect,applyPipeline} from '../experiments/retro-glitch/effects.mjs';
import {validateImage} from '../experiments/retro-glitch/image-intake.mjs';
import {validateText} from '../experiments-source/lexical/src/intake.js';

test('Rack Lab ships the independently verified binary COME AT ME! STL', () => {
  const filename = 'come-at-me-8-slot.stl';
  const source = readFileSync(new URL(`../experiments-source/rack-lab/public/${filename}`, import.meta.url));
  const published = readFileSync(new URL(`../experiments/rack-lab/${filename}`, import.meta.url));
  assert.equal(createHash('sha256').update(published).digest('hex'),
    'f09d2f195ffb48ac52a64befca504befe1402b06006bdf6dcb347ff8c76ca5ad');
  assert.deepEqual(published, source);
});
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

import {TEXT_EXAMPLES,DEFAULT_EXAMPLE_ID} from '../experiments-source/lexical/src/text-examples.js';
test('built-in examples have unique identities',()=>assert.equal(new Set(TEXT_EXAMPLES.map(e=>e.id)).size,TEXT_EXAMPLES.length));
for(const example of TEXT_EXAMPLES)test('example '+example.id+' is valid bounded text with available focus words',()=>{assert.equal(validateText(example.text,example.id==='sherlock'?1000000:20000),'');assert.ok(['matrix','sequence'].includes(example.mode));const words=example.text.toLowerCase().match(/\b[a-z]+\b/g)||[];for(const word of example.focusWords)assert.ok(words.filter(w=>w===word).length>=2,word+' recurs');});

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
test('view restoration retains filters, labels, frequency sizing and camera',()=>{const e=TEXT_EXAMPLES[3],v={version:1,layoutRevision:2,text:e.text,exampleId:e.id,mode:'sequence',words:['star'],at:0,flat:false,depth:.7,opacity:.1,background:false,labels:false,letter:'s',range:55,weighted:true,camera:{position:[2,1,8],target:[0,0,0]}};const restored=readSharedView(shareHash(v),TEXT_EXAMPLES);for(const key of ['labels','letter','range','weighted'])assert.equal(restored[key],v[key]);assert.deepEqual(restored.camera,v.camera)});
test('invalid camera and filter values are bounded safely',()=>{const v=validateSavedView({version:1,text:'signal station return',words:['signal'],camera:{position:[Infinity,0,1],target:[0,0,0]},letter:'<script>',range:500},TEXT_EXAMPLES);assert.equal(v.camera,null);assert.equal(v.letter,'s');assert.equal(v.range,100)});

test('explicitly followed common and short words retain canonical passage offsets',()=>{const text='The map and a map. The map.';const normal=buildModel(text),chosen=buildModel(text,['the','a']);assert.equal(normal.byWord.the,undefined);assert.equal(chosen.byWord.the.length,2);assert.equal(chosen.byWord.a.length,1);assert.equal(chosen.byWord.the[1].start,text.lastIndexOf('The'));assert.deepEqual(chosen.tokens.map(t=>t.index),chosen.tokens.map((_,i)=>i));});
test('saved views restore explicitly followed common words',()=>{const text='The map and the signal.';const view=validateSavedView({version:1,text,words:['the'],at:2},[]);assert.deepEqual(view.words,['the']);assert.equal(buildModel(view.text,view.words).byWord.the.length,2);});

test('explicit one-letter words have finite Throughline positions and fitted camera',()=>{const model=buildModel('A map and I follow a signal.',['a','i']);for(const token of model.tokens)assert.ok(letterPosition(token).every(Number.isFinite));const fit=fittedCamera(model,'sequence',.7,.5);assert.ok(fit.position.every(Number.isFinite));assert.ok(fit.target.every(Number.isFinite));});

import {atlasLayout,spreadAtlasPosition} from '../experiments-source/lexical/src/model.js';
import {DEFAULT_TEXT_URL,MAX_URL_BYTES,validateTextURL,fetchURLText,prepareImportedText} from '../experiments-source/lexical/src/url-intake.js';
test('responsive Atlas spread uses two wide sheets on desktop and one column on phone',()=>{assert.equal(atlasLayout(2,5.5,.7).columns,2);assert.equal(atlasLayout(2,1,.7).columns,1);for(const aspect of [.7,1.5,5.5])for(const count of [1,2,20]){const layout=atlasLayout(count,aspect,.7);for(let i=0;i<count*250;i++)assert.ok(spreadAtlasPosition(i,.7,layout).every(Number.isFinite))}});
test('3D book camera shows depth and fits every portrait page closely',()=>{const model=buildModel(TEXT_EXAMPLES.find(e=>e.id===DEFAULT_EXAMPLE_ID).text);for(const aspect of [.8,5.5]){const fit=fittedCamera(model,'matrix',.7,aspect),direction=fit.position.map((n,i)=>n-fit.target[i]),length=Math.hypot(...direction),f=direction.map(n=>n/length),r=[f[2]/Math.hypot(f[0],f[2]),0,-f[0]/Math.hypot(f[0],f[2])],u=[f[1]*r[2],f[2]*r[0]-f[0]*r[2],-f[1]*r[0]],dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0),ys=[];assert.ok(f[0]>.5);for(const point of bookCorners(model,.7)){const p=point.map((n,i)=>n-fit.target[i]),distance=length-dot(p,f),nx=dot(p,r)/(distance*Math.tan(25*Math.PI/180)*aspect),ny=dot(p,u)/(distance*Math.tan(25*Math.PI/180));assert.ok(Math.abs(nx)<=1);assert.ok(Math.abs(ny)<=1);ys.push(ny)}if(aspect>1)assert.ok((Math.max(...ys)-Math.min(...ys))/2>=.75)}});
test('URL input rejects private locations, credentials, and unsafe schemes',()=>{assert.equal(validateTextURL(DEFAULT_TEXT_URL),DEFAULT_TEXT_URL);for(const value of ['file:///etc/passwd','http://example.com','https://localhost/a','https://127.0.0.1/a','https://[::1]/','https://user:password@example.com/','https://example.local/'])assert.throws(()=>validateTextURL(value))});
test('default Gutenberg URL uses the local licensed copy without sending credentials',async()=>{let target,options;const result=await fetchURLText(DEFAULT_TEXT_URL,{fetchImpl:async(url,opts)=>{target=url;options=opts;return new Response('A public text.',{headers:{'content-type':'text/plain'}})}});assert.equal(target,'/experiments/lexical/texts/sherlock-holmes.txt');assert.equal(options.credentials,'omit');assert.equal(result.bundled,true);assert.equal(result.text,'A public text.')});
test('URL text retries transient HTTP failures and retains readable content',async()=>{let attempts=0;const result=await fetchURLText('https://example.com/text',{fetchImpl:async()=>++attempts===1?new Response('',{status:503,headers:{'retry-after':'0'}}):new Response('Signal returns.')});assert.equal(attempts,2);assert.equal(result.text,'Signal returns.')});
test('URL text does not retry missing files',async()=>{let attempts=0;await assert.rejects(fetchURLText('https://example.com/missing',{fetchImpl:async()=>{attempts++;return new Response('',{status:404})}}),/404/);assert.equal(attempts,1)});
test('URL text bounds declared and streamed response sizes',async()=>{await assert.rejects(fetchURLText('https://example.com/huge',{fetchImpl:async()=>new Response('word',{headers:{'content-length':String(MAX_URL_BYTES+1)}})}),/2 MB/);await assert.rejects(fetchURLText('https://example.com/huge',{fetchImpl:async()=>new Response('x'.repeat(MAX_URL_BYTES+1))}),/2 MB/)});
test('URL text rejects binary MIME and explains cross-origin failures',async()=>{await assert.rejects(fetchURLText('https://example.com/image',{fetchImpl:async()=>new Response('bytes',{headers:{'content-type':'image/png'}})}),/not a text/);await assert.rejects(fetchURLText('https://example.com/blocked',{fetchImpl:async()=>{throw new TypeError('Failed to fetch')}}),/browser imports/)});
test('URL text aborts on timeout and caller cancellation',async()=>{const pending=async(_,options)=>new Promise((resolve,reject)=>{options.signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')),{once:true});if(options.signal.aborted)reject(new DOMException('Cancelled','AbortError'))});await assert.rejects(fetchURLText('https://example.com/slow',{fetchImpl:pending,timeoutMs:5}),/timed out/);const controller=new AbortController();controller.abort();await assert.rejects(fetchURLText('https://example.com/slow',{fetchImpl:pending,signal:controller.signal}),error=>error.name==='AbortError')});
test('long Gutenberg sources expose bounded sections without license boilerplate in the map',()=>{const body='A map returns to the garden.\n\n'.repeat(2000),source='Title: A public book\n*** START OF THE PROJECT GUTENBERG EBOOK TEST ***\n'+body+'\n*** END OF THE PROJECT GUTENBERG EBOOK TEST ***\nLicense kept in source.';const imported=prepareImportedText(source);assert.equal(imported.title,'A public book');assert.ok(imported.sections.length>1);for(const part of imported.sections){assert.ok(part.length<=20000);assert.ok(!part.includes('License'));assert.ok(buildModel(part).tokens.length>0)}assert.equal(imported.sections.join('').replace(/\s/g,''),body.replace(/\s/g,''))});
test('URL section titles survive saved view restoration',()=>{const v=validateSavedView({version:1,text:'A signal and a map.',words:['map'],title:'Sherlock Holmes · Part2'},[]);assert.equal(v.title,'Sherlock Holmes · Part2')});

test('legacy Atlas cameras are refitted while current layout views retain camera and aspect',()=>{const value={version:1,text:TEXT_EXAMPLES[0].text,exampleId:'workshop',mode:'matrix',words:['map'],camera:{position:[2,1,8],target:[0,0,0],aspect:4}};assert.equal(validateSavedView(value,TEXT_EXAMPLES).camera,null);const restored=readSharedView(shareHash({...value,layoutRevision:3}),TEXT_EXAMPLES);assert.deepEqual(restored.camera,value.camera);assert.equal(restored.layoutRevision,3)});

import {compatibleCameraPose} from '../experiments-source/lexical/src/model.js';
test('book cameras re-fit after a meaningful aspect change',()=>{const model=buildModel('signal '.repeat(1900)),pose={position:[0,0,12],target:[0,0,0],aspect:3.9};assert.equal(compatibleCameraPose(pose,model,'matrix',.7,3.7),null);assert.equal(compatibleCameraPose(pose,model,'matrix',.7,3.9),pose)});
import {bookCorners} from '../experiments-source/lexical/src/model.js';
test('Sherlock Holmes maps the complete book with meaningful default tags',()=>{assert.equal(DEFAULT_EXAMPLE_ID,'sherlock');const e=TEXT_EXAMPLES.find(e=>e.id===DEFAULT_EXAMPLE_ID);assert.equal(e.mode,'matrix');assert.ok(e.text.includes('To Sherlock Holmes'));assert.ok(!e.text.includes('\uFFFD'));assert.ok(e.text.length>500000);assert.ok(e.text.includes('Copper Beeches'));assert.ok(buildModel(e.text).sheetCount>200);assert.deepEqual(e.focusWords,['holmes','watson','adler','lestrade','london','baker','letter','photograph','mystery','murder'])});

import {enterChartFullscreen} from '../experiments-source/lexical/src/fullscreen.js';
test('fullscreen uses the native API only after explicit entry',async()=>{let calls=0;assert.equal(await enterChartFullscreen({requestFullscreen:async()=>{calls++}},{fullscreenEnabled:true}),'native');assert.equal(calls,1)});
test('fullscreen gracefully expands in-tab when unsupported or rejected',async()=>{assert.equal(await enterChartFullscreen({}, {fullscreenEnabled:false}),'fallback');assert.equal(await enterChartFullscreen({requestFullscreen:async()=>{throw Error('Unavailable')}},{fullscreenEnabled:true}),'fallback');await assert.rejects(enterChartFullscreen(null,{}),/loading/)});

import {matchingWords,bookSheetDepth,MAX_FOLLOWED_WORDS} from '../experiments-source/lexical/src/model.js';
test('word search prioritizes exact and prefix matches with frequency counts',()=>{const model=buildModel('Holmes home home homeland homecoming.');assert.deepEqual(matchingWords(model,'HOME'),['home','homecoming','homeland']);assert.deepEqual(matchingWords(model,'xyz'),[]);assert.equal(matchingWords(model,'',2).length,2)});
test('book-scale spacing keeps all sheets in a bounded portrait stack',()=>{assert.equal(bookSheetDepth(8,1.2),1.2);const step=bookSheetDepth(220,1.2);assert.ok(Math.abs(step*219-8.4)<1e-8)});
test('full-book saved view restores ten word tags',()=>{const e=TEXT_EXAMPLES.find(e=>e.id==='sherlock');const restored=validateSavedView({version:1,text:e.text,exampleId:e.id,words:e.focusWords},TEXT_EXAMPLES);assert.equal(MAX_FOLLOWED_WORDS,10);assert.deepEqual(restored.words,e.focusWords)});

import {readingWindows} from '../experiments-source/lexical/src/reading-windows.js';
test('book reader windows preserve the complete original text and global offsets',()=>{const text=TEXT_EXAMPLES.find(e=>e.id==='sherlock').text,windows=readingWindows(text);assert.equal(windows.map(w=>text.slice(w.start,w.end)).join(''),text);assert.ok(windows.length>30);for(let i=0;i<windows.length;i++){const w=windows[i];assert.ok(w.end-w.start<=16000);if(i)assert.equal(w.start,windows[i-1].end);if(i<windows.length-1)assert.ok(/\s/.test(text[w.end-1]))}});

test('bare Sherlock links match the single initial focus with ten available tags',()=>{const e=TEXT_EXAMPLES.find(e=>e.id==='sherlock');assert.equal(e.focusWords.length,10);assert.deepEqual(readSharedView('#example=sherlock',TEXT_EXAMPLES).words,['holmes'])});

import {threadEmphasis} from '../experiments-source/lexical/src/model.js';
test('active word emphasis transfers while context remains visible',()=>{const active=threadEmphasis('holmes','holmes'),dim=threadEmphasis('watson','holmes');assert.ok(active.opacity>dim.opacity*10);assert.ok(dim.opacity>0);assert.ok(active.width>dim.width);assert.ok(active.nodeScale>dim.nodeScale);assert.equal(active.nodeColor,wordColor('holmes'));assert.deepEqual(threadEmphasis('watson','watson'),{...active,nodeColor:wordColor('watson')});assert.deepEqual(threadEmphasis('holmes','watson'),dim)});
test('non-book mode preserves full word styling',()=>{assert.deepEqual(threadEmphasis('holmes',null),threadEmphasis('holmes','holmes'))});

import {bookVisibleWords} from '../experiments-source/lexical/src/model.js';
test('solo book view switches active word without mutating followed tags',()=>{const selected=['holmes','watson','adler'];assert.deepEqual(bookVisibleWords(selected,'watson',true),['watson']);assert.deepEqual(bookVisibleWords(selected,'adler',true),['adler']);assert.deepEqual(bookVisibleWords(selected,'adler',false),selected);assert.deepEqual(selected,['holmes','watson','adler'])});
test('saved and shared views round-trip solo book preference',()=>{const e=TEXT_EXAMPLES[0],view={version:1,text:e.text,exampleId:e.id,words:e.focusWords,mode:'matrix',hideOthers:true};assert.equal(validateSavedView(view,TEXT_EXAMPLES).hideOthers,true);assert.equal(readSharedView(shareHash(view),TEXT_EXAMPLES).hideOthers,true);assert.equal(readSharedView('#example='+e.id,TEXT_EXAMPLES).hideOthers,false)});

import {sortedWordTags,bookOverviewPositions} from '../experiments-source/lexical/src/model.js';
test('curated word tags sort by count without changing Holmes default',()=>{const e=TEXT_EXAMPLES.find(e=>e.id==='sherlock'),m=buildModel(e.text),tags=sortedWordTags(e.focusWords,m.counts);assert.deepEqual(tags,['holmes','watson','baker','london','lestrade','letter','photograph','mystery','adler','murder']);assert.deepEqual(readSharedView('#example=sherlock',TEXT_EXAMPLES).words,['holmes']);assert.deepEqual(sortedWordTags(['zebra','alpha','alpha','missing'],{zebra:2,alpha:2}),['alpha','zebra'])});
test('whole-book overview maps every occurrence in its original position',()=>{const e=TEXT_EXAMPLES.find(e=>e.id==='sherlock'),m=buildModel(e.text),p=bookOverviewPositions(m,1.2);assert.equal(p.length,54411*3);assert.equal(m.sheetCount,218);const last=atlasPosition(m.tokens.length-1,bookSheetDepth(m.sheetCount,1.2));for(let axis=0;axis<3;axis++)assert.ok(Math.abs(p[p.length-3+axis]-last[axis])<1e-5)});
test('overview state round-trips in saved and shared views',()=>{const e=TEXT_EXAMPLES[0],v={version:1,text:e.text,exampleId:e.id,words:e.focusWords,mode:'matrix',overview:true};assert.equal(validateSavedView(v,TEXT_EXAMPLES).overview,true);assert.equal(readSharedView(shareHash(v),TEXT_EXAMPLES).overview,true);assert.equal(readSharedView('#example='+e.id,TEXT_EXAMPLES).overview,false)});

import {VISIT_KEY,readVisit,writeVisit,startingVisit} from '../experiments-source/lexical/src/visit-memory.js';
function memoryStorage(){const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)}}
function sampleVisit(){const e=TEXT_EXAMPLES.find(e=>e.id==='sherlock');return {version:1,layoutRevision:3,text:e.text,exampleId:e.id,title:e.title,mode:'matrix',words:['holmes','watson'],at:buildModel(e.text,['holmes','watson']).byWord.watson[5].index,flat:true,hideOthers:true,overview:false,depth:1.1,opacity:.08,labels:false,weighted:true,letter:'',range:100,camera:{position:[12,4,15],target:[0,0,-4],aspect:1.8}}}
test('return visits restore word, occurrence, settings and camera without intro',()=>{const storage=memoryStorage(),view=sampleVisit();assert.equal(writeVisit(storage,view,TEXT_EXAMPLES,{showWordControls:true}),true);const initial=startingVisit({storage,examples:TEXT_EXAMPLES,fallback:{}});assert.equal(initial.introOpen,false);for(const k of ['at','flat','hideOthers','depth','opacity','labels','weighted'])assert.equal(initial[k],view[k]);assert.deepEqual(initial.words,view.words);assert.deepEqual(initial.camera,view.camera);assert.equal(initial.showWordControls,true);const raw=JSON.parse(storage.getItem(VISIT_KEY));assert.equal(raw.seenIntro,true);assert.equal('text' in raw.view,false);assert.ok(storage.getItem(VISIT_KEY).length<2000)});
test('fresh visits open unfiltered intro; shared links override remembered word',()=>{const storage=memoryStorage(),fallback={words:['holmes']};assert.equal(startingVisit({storage,examples:TEXT_EXAMPLES,fallback}).introOpen,true);writeVisit(storage,sampleVisit(),TEXT_EXAMPLES);const linked=startingVisit({hash:'#example=sherlock&words=adler',storage,examples:TEXT_EXAMPLES,fallback});assert.deepEqual(linked.words,['adler']);assert.equal(linked.introOpen,false)});
test('corrupt, oversized and denied storage fall back without throwing',()=>{const storage=memoryStorage();for(const raw of ['{','null','{}',JSON.stringify({version:99,seenIntro:true}),'x'.repeat(200001)]){storage.setItem(VISIT_KEY,raw);assert.equal(readVisit(storage,TEXT_EXAMPLES),null)}const denied={getItem(){throw Error('denied')},setItem(){throw Error('quota')}};assert.equal(readVisit(denied,TEXT_EXAMPLES),null);assert.equal(writeVisit(denied,sampleVisit(),TEXT_EXAMPLES),false);assert.equal(startingVisit({storage:denied,examples:TEXT_EXAMPLES,fallback:{}}).introOpen,true)});
test('custom passages remain local in a bounded remembered view',()=>{const storage=memoryStorage(),view={...sampleVisit(),exampleId:'',text:'A private map returns. A private map stays.',words:['map'],at:0};assert.equal(writeVisit(storage,view,TEXT_EXAMPLES),true);assert.equal(readVisit(storage,TEXT_EXAMPLES).view.text,view.text);assert.equal(writeVisit(storage,{...view,text:'word '.repeat(5000)},TEXT_EXAMPLES),false)});

import {readablePage,pageWordAt} from '../experiments-source/lexical/src/book-reading.js';
test('book reading detail appears only for a nearby page in the view',()=>{
  const front={x:0,y:0,z:-1},origin={x:0,y:0,z:8};
  assert.equal(readablePage(5,1,origin,front,500),null);
  assert.deepEqual(readablePage(5,1,{...origin,z:4},front,500),{page:0,back:false});
  assert.equal(readablePage(5,1,{x:2,y:0,z:4},front,500),null);
  assert.deepEqual(readablePage(5,1,{x:0,y:0,z:-6},{x:0,y:0,z:1},500),{page:4,back:true});
});
test('reading detail hit targets preserve mapped indices from either side',()=>{
  const index=317,[x,y]=atlasPosition(index),u=.5+x/3.5,v=.5+y/5;
  assert.equal(pageWordAt(1,false,u,v,400),index);
  assert.equal(pageWordAt(1,true,1-u,v,400),index);
  assert.equal(pageWordAt(1,false,u,v,300),null);
  assert.equal(pageWordAt(1,false,0,1,400),null);
});

import { duration as tackDuration, parts as bellonaParts, sampleTack, sources as bellonaSources } from '../experiments/bellona/study.mjs';

test('Bellona brings the main yards around before the fore yards', () => {
  const start = sampleTack(0);
  const crossing = sampleTack(17);
  const end = sampleTack(tackDuration);
  assert.ok(start.heading < 0 && end.heading > 0);
  assert.equal(crossing.heading, 0);
  assert.equal(crossing.rudder, 0);
  assert.ok(crossing.main < 0 && crossing.fore > 0);
  assert.ok(end.main < 0 && end.fore < 0);
});

test('Bellona tack samples are bounded and repeatable when scrubbing', () => {
  assert.deepEqual(sampleTack(-4), sampleTack(0));
  assert.deepEqual(sampleTack(100), sampleTack(tackDuration));
  for (let time = 0; time <= tackDuration; time += .125) {
    const pose = sampleTack(time);
    assert.ok(Object.values(pose).every(Number.isFinite));
    assert.deepEqual(sampleTack(time), pose);
  }
});

test('Bellona evidence cards resolve to sources with a reconstruction note', () => {
  assert.equal(new Set(bellonaParts.map(part => part.id)).size, bellonaParts.length);
  for (const part of bellonaParts) {
    assert.ok(part.limit && part.refs.length);
    for (const ref of part.refs) assert.match(bellonaSources[ref][1], /^https:\/\//);
  }
});

import { gunCrew, gunDuration, gunPhases, sampleGun } from '../experiments/bellona/drill.mjs';

test('Bellona gun drill runs out before discharge, recoils, then sponges and reloads', () => {
  assert.equal(sampleGun(0).carriage, 0);
  assert.equal(sampleGun(16).carriage, 1);
  assert.equal(sampleGun(20.9).flash, 0);
  assert.equal(sampleGun(21).flash, 1);
  assert.ok(sampleGun(21.3).carriage < 1);
  assert.equal(sampleGun(22).carriage, 0);
  assert.ok(sampleGun(29).sponge > 0);
  assert.ok(sampleGun(35).ram > 0);
  assert.equal(sampleGun(gunDuration).flash, 0);
  assert.equal(sampleGun(gunDuration).phase, gunPhases.length - 1);
});

test('Bellona gun poses replay identically after a backward seek', () => {
  const recoil = sampleGun(21.3);
  sampleGun(40);
  assert.deepEqual(sampleGun(21.3), recoil);
  assert.deepEqual(sampleGun(-1), sampleGun(0));
  assert.deepEqual(sampleGun(gunDuration + 1), sampleGun(gunDuration));
});

test('Bellona crew stations each describe an action at every drill phase boundary', () => {
  assert.equal(new Set(gunCrew.map(member => member.name)).size, 5);
  for (const member of gunCrew) {
    assert.ok(member.station.trim());
    assert.equal(member.actions.length, gunPhases.length);
    for (const { at } of gunPhases) {
      assert.ok(member.actions[sampleGun(at).phase].trim());
    }
  }
});

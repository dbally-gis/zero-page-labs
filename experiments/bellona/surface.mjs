import * as T from '../maritime/vendor/three-0.160.1.module.min.js';

// Painted surface detail and studio lighting shared by the ship and the gun deck.
// Every texture is drawn at load; nothing here is photographed or scanned from the ship.
const hasCanvas = typeof document !== 'undefined';

export function random(seed) {
  return () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function texture(width, height, draw, { color = true, repeat = [1, 1] } = {}) {
  if (!hasCanvas) return null;
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const map = new T.CanvasTexture(canvas);
  map.wrapS = map.wrapT = T.RepeatWrapping;
  map.repeat.set(...repeat);
  if (color) map.colorSpace = T.SRGBColorSpace;
  map.anisotropy = 8;
  return map;
}

// Soft blotches: weathering in a colour map, shallow dents in a height map.
export function mottle(c, w, h, next, count, size, tones) {
  for (let i = 0; i < count; i++) {
    const x = next() * w, y = next() * h, r = size * (.4 + next());
    for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) {
      if (x + dx + r < 0 || x + dx - r > w || y + dy + r < 0 || y + dy - r > h) continue;
      const blot = c.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
      const tone = tones[i % tones.length];
      blot.addColorStop(0, tone);
      blot.addColorStop(1, tone.replace(/[\d.]+\)$/, '0)'));
      c.fillStyle = blot;
      c.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
    }
  }
}

// Grain runs along the canvas x axis. `rows` splits the sheet into planks with caulked seams.
function drawWood(c, w, h, { seed, rows = 0, height = false, butts = true }) {
  const next = random(seed);
  c.fillStyle = height ? '#8c8c8c' : '#d9d2c6';
  c.fillRect(0, 0, w, h);
  if (rows && !height) {
    for (let row = 0; row < rows; row++) {
      const shade = next();
      c.fillStyle = shade < .5 ? `rgba(70,48,28,${shade * .22})` : `rgba(255,246,228,${(shade - .5) * .26})`;
      c.fillRect(0, row * h / rows, w, h / rows);
    }
  }
  mottle(c, w, h, next, 26, w * .16, height ? ['rgba(120,120,120,.10)', 'rgba(160,160,160,.08)'] :
    ['rgba(84,58,34,.10)', 'rgba(255,244,220,.10)']);
  for (let i = 0; i < h * 2.2; i++) {
    const y = next() * h, x = next() * w, len = w * (.25 + next() * .9), bend = (next() - .5) * 5;
    const light = next() < .42, alpha = .035 + next() * (height ? .07 : .10);
    c.strokeStyle = height ? `rgba(${light ? '215,215,215' : '40,40,40'},${alpha})` :
      `rgba(${light ? '255,240,212' : '52,31,14'},${alpha})`;
    c.lineWidth = .5 + next() * 1.9;
    for (const dx of [0, -w]) {
      c.beginPath();
      c.moveTo(x + dx, y);
      c.bezierCurveTo(x + dx + len / 3, y + bend, x + dx + len * 2 / 3, y - bend, x + dx + len, y + bend * .4);
      c.stroke();
    }
  }
  if (!rows) return;
  const seam = height ? '#1c1c1c' : 'rgba(26,17,10,.86)';
  for (let row = 0; row < rows; row++) {
    const y = row * h / rows;
    c.fillStyle = seam;
    c.fillRect(0, y - 1.2, w, 2.4);
    if (!row) c.fillRect(0, h - 1.2, w, 1.2);
    if (!height) { c.fillStyle = 'rgba(255,244,222,.16)'; c.fillRect(0, y + 1.4, w, 1.2); }
    if (!butts) continue;
    const joint = next() * w;
    c.fillStyle = seam;
    c.fillRect(joint - 1, y, 2, h / rows);
    for (const side of [-1, 1]) for (const across of [.28, .72]) {
      c.fillStyle = height ? '#6a6a6a' : 'rgba(64,42,24,.55)';
      c.beginPath();
      c.arc((joint + side * 9 + w) % w, y + across * h / rows, 2.1, 0, 7);
      c.fill();
    }
  }
}

export function wood({ seed = 1, rows = 0, repeat = [1, 1], butts = true, size = 512 } = {}) {
  return {
    map: texture(size, size, (c, w, h) => drawWood(c, w, h, { seed, rows, butts }), { repeat }),
    bumpMap: texture(size, size, (c, w, h) => drawWood(c, w, h, { seed, rows, butts, height: true }), { color: false, repeat }),
  };
}

function drawWeave(c, w, h, seed, height) {
  const next = random(seed);
  c.fillStyle = height ? '#808080' : '#e6e2da';
  c.fillRect(0, 0, w, h);
  for (let i = 0; i < w; i += 2) {
    c.fillStyle = `rgba(${height ? '30,30,30' : '70,60,48'},${.05 + next() * .13})`;
    c.fillRect(i, 0, 1, h);
    c.fillStyle = `rgba(${height ? '225,225,225' : '255,252,244'},${.04 + next() * .12})`;
    c.fillRect(0, i, w, 1);
  }
}

export function weave(seed = 5, repeat = [6, 6]) {
  return {
    map: texture(128, 128, (c, w, h) => drawWeave(c, w, h, seed, false), { repeat }),
    bumpMap: texture(128, 128, (c, w, h) => drawWeave(c, w, h, seed, true), { color: false, repeat }),
  };
}

// Worn cloth: creases that run around a limb, over a fine weave. Height map, with a colour
// map that carries the same creases as grime.
function drawFolds(c, w, h, height) {
  const next = random(29);
  c.fillStyle = height ? '#808080' : '#ebe7df';
  c.fillRect(0, 0, w, h);
  if (!height) mottle(c, w, h, next, 30, w * .2, ['rgba(96,78,54,.10)', 'rgba(255,252,244,.10)']);
  for (let i = 0; i < 15; i++) {
    const x = next() * w, y = next() * h, len = w * (.18 + next() * .34), slope = (next() - .5) * h * .3;
    const sag = (next() - .5) * h * .1, dark = next() < .55, depth = .5 + next() * .5;
    for (const [width, alpha] of [[26, .04], [16, .05], [8, .06]]) {
      c.strokeStyle = height ? `rgba(${dark ? '0,0,0' : '255,255,255'},${alpha * depth})` :
        `rgba(${dark ? '70,56,40' : '255,253,246'},${alpha * depth * .3})`;
      c.lineWidth = width;
      c.lineCap = 'round';
      for (const dx of [-w, 0]) for (const dy of [-h, 0, h]) {
        c.beginPath();
        c.moveTo(x + dx, y + dy);
        c.quadraticCurveTo(x + dx + len / 2, y + dy + sag + slope / 2, x + dx + len, y + dy + slope);
        c.stroke();
      }
    }
  }
  for (let i = 0; i < w; i += 2) {
    c.fillStyle = `rgba(${height ? '20,20,20' : '70,60,48'},${.03 + next() * .07})`;
    c.fillRect(i, 0, 1, h);
    c.fillStyle = `rgba(${height ? '235,235,235' : '255,252,244'},${.03 + next() * .06})`;
    c.fillRect(0, i, w, 1);
  }
}

// One square sail: u across the yard, v from foot (0) to head (1).
function drawSail(c, w, h, height) {
  const next = random(71);
  c.fillStyle = height ? '#8a8a8a' : '#efe6d2';
  c.fillRect(0, 0, w, h);
  if (!height) {
    mottle(c, w, h, next, 34, w * .22, ['rgba(120,96,58,.07)', 'rgba(255,250,236,.10)', 'rgba(96,84,66,.05)']);
    for (let i = 0; i < 70; i++) {
      c.fillStyle = `rgba(92,74,48,${.02 + next() * .04})`;
      c.fillRect(next() * w, 0, 1 + next() * 3, h * (.3 + next() * .7));
    }
  }
  const cloths = 22;
  for (let i = 0; i <= cloths; i++) {
    const x = i * w / cloths;
    c.fillStyle = height ? 'rgba(40,40,40,.75)' : 'rgba(104,84,54,.34)';
    c.fillRect(x - 1, 0, 2, h);
    if (!height) { c.fillStyle = 'rgba(255,252,240,.20)'; c.fillRect(x + 1.5, 0, 2, h); }
  }
  for (const band of [.13, .25]) {
    c.fillStyle = height ? 'rgba(220,220,220,.7)' : 'rgba(128,104,70,.34)';
    c.fillRect(0, band * h - 3, w, 6);
    for (let i = 0; i < cloths * 2; i++) {
      c.fillStyle = height ? 'rgba(235,235,235,.8)' : 'rgba(84,64,40,.5)';
      c.fillRect((i + .5) * w / cloths / 2 - .8, band * h, 1.6, h * .035);
    }
  }
  c.strokeStyle = height ? 'rgba(225,225,225,.8)' : 'rgba(116,92,60,.42)';
  c.lineWidth = 9;
  c.strokeRect(0, 0, w, h);
}

function drawSpeckle(c, w, h, seed, base, tones, count) {
  const next = random(seed);
  c.fillStyle = base;
  c.fillRect(0, 0, w, h);
  mottle(c, w, h, next, 40, w * .14, tones);
  for (let i = 0; i < count; i++) {
    c.fillStyle = tones[i % tones.length].replace(/[\d.]+\)$/, `${.1 + next() * .25})`);
    c.fillRect(next() * w, next() * h, 1 + next() * 1.6, 1 + next() * 1.6);
  }
}

function drawRope(c, w, h, height) {
  c.fillStyle = height ? '#909090' : '#e2d4b6';
  c.fillRect(0, 0, w, h);
  const next = random(9);
  for (let i = -8; i < 16; i++) {
    c.strokeStyle = height ? 'rgba(20,20,20,.85)' : 'rgba(74,52,26,.62)';
    c.lineWidth = 3;
    c.beginPath(); c.moveTo(i * w / 8, 0); c.lineTo(i * w / 8 + w, h); c.stroke();
    c.strokeStyle = height ? 'rgba(240,240,240,.35)' : 'rgba(255,246,220,.22)';
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(i * w / 8 + w / 16, 0); c.lineTo(i * w / 8 + w + w / 16, h); c.stroke();
  }
  if (!height) for (let i = 0; i < 300; i++) {
    c.fillStyle = `rgba(60,42,22,${next() * .14})`;
    c.fillRect(next() * w, next() * h, 2, 1);
  }
}

// A soft round puff for smoke and muzzle flash sprites.
export function puff() {
  return texture(128, 128, (c, w) => {
    const next = random(3), glow = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    glow.addColorStop(0, 'rgba(255,255,255,.95)');
    glow.addColorStop(.45, 'rgba(255,255,255,.5)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = glow;
    c.fillRect(0, 0, w, w);
    c.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 26; i++) {
      const a = next() * 7, r = w * (.2 + next() * .28), size = w * (.05 + next() * .11);
      const hole = c.createRadialGradient(w / 2 + Math.cos(a) * r, w / 2 + Math.sin(a) * r, 0, w / 2 + Math.cos(a) * r, w / 2 + Math.sin(a) * r, size);
      hole.addColorStop(0, `rgba(0,0,0,${.2 + next() * .3})`);
      hole.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = hole;
      c.fillRect(0, 0, w, w);
    }
  });
}

let shared;
// Built once and shared by the ship and the gun deck.
export function surfaces() {
  if (shared) return shared;
  const standard = (color, maps, extra = {}) => new T.MeshStandardMaterial({
    color, roughness: .78, bumpScale: 1.4, ...maps, ...extra,
  });
  const grain = wood({ seed: 11 }), spar = wood({ seed: 23, repeat: [1, 3] });
  const planking = wood({ seed: 37, rows: 4 }), decking = wood({ seed: 53, rows: 8 });
  const cloth = weave(), fine = weave(8, [14, 14]);
  const folds = {
    map: texture(256, 256, (c, w, h) => drawFolds(c, w, h, false), { repeat: [1, 1] }),
    bumpMap: texture(256, 256, (c, w, h) => drawFolds(c, w, h, true), { color: false, repeat: [1, 1] }),
  };
  // Spars map their texture around the pole, so the grain is turned to run along it.
  for (const map of Object.values(spar)) if (map) map.rotation = Math.PI / 2;
  const iron = {
    map: texture(256, 256, (c, w, h) => drawSpeckle(c, w, h, 4, '#cfcfcf',
      ['rgba(255,255,255,.10)', 'rgba(40,40,40,.14)', 'rgba(150,92,52,.07)'], 1500)),
    bumpMap: texture(256, 256, (c, w, h) => drawSpeckle(c, w, h, 4, '#808080',
      ['rgba(230,230,230,.16)', 'rgba(30,30,30,.18)'], 2600), { color: false }),
  };
  const rope = {
    map: texture(64, 64, (c, w, h) => drawRope(c, w, h, false), { repeat: [1, 6] }),
    bumpMap: texture(64, 64, (c, w, h) => drawRope(c, w, h, true), { color: false, repeat: [1, 6] }),
  };
  const sail = {
    map: texture(1024, 1024, (c, w, h) => drawSail(c, w, h, false)),
    bumpMap: texture(1024, 1024, (c, w, h) => drawSail(c, w, h, true), { color: false }),
  };
  shared = {
    standard, grain, spar, planking, decking, cloth, fine, folds, iron, rope, sail,
    // Cast iron under blacking: mostly a dull coat, with the metal showing in the highlights.
    gunmetal: standard(0x34383a, iron, { roughness: .44, metalness: .55, bumpScale: .16 }),
    wrought: standard(0x2b2f31, iron, { roughness: .58, metalness: .5, bumpScale: .3 }),
    brass: standard(0xb58a46, {}, { roughness: .34, metalness: .85 }),
    hemp: standard(0xb9945c, rope, { roughness: .95, bumpScale: 2.2 }),
    line: standard(0xd9c9a4, rope, { roughness: .95, bumpScale: 2 }),
  };
  return shared;
}

// A photographer's studio as image-based light: a bright ceiling, a warm key panel on the
// sun side and a cool fill opposite. Gives metal and wet paint something to reflect.
export function studio(renderer) {
  const room = new T.Scene();
  const shell = new T.Mesh(new T.SphereGeometry(60, 32, 16), new T.ShaderMaterial({
    side: T.BackSide,
    vertexShader: 'varying vec3 at; void main(){at=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `varying vec3 at;
      void main(){
        float up=normalize(at).y;
        vec3 tone=mix(vec3(.50,.45,.38),vec3(1.05,1.0,.92),smoothstep(-.15,.85,up));
        tone=mix(vec3(.30,.25,.20),tone,smoothstep(-.7,-.05,up));
        gl_FragColor=vec4(tone,1.);
      }`,
  }));
  room.add(shell);
  const panels = [[[5.5, 5.0, 4.3], [34, 24], [28, 40, 30]], [[1.3, 1.7, 2.1], [26, 34], [-46, 12, -18]], [[2.2, 2.1, 1.9], [40, 14], [-6, 54, -4]]];
  for (const [tone, size, place] of panels) {
    const panel = new T.Mesh(new T.PlaneGeometry(...size), new T.MeshBasicMaterial({ color: new T.Color(...tone), side: T.DoubleSide }));
    panel.position.set(...place);
    panel.lookAt(0, 0, 0);
    room.add(panel);
  }
  const generator = new T.PMREMGenerator(renderer);
  const map = generator.fromScene(room, .035).texture;
  generator.dispose();
  room.traverse(part => { part.geometry?.dispose(); part.material?.dispose(); });
  return map;
}

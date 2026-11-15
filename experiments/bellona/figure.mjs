import * as T from '../maritime/vendor/three-0.160.1.module.min.js';
import { mottle, random, surfaces, texture } from './surface.mjs';

// A jointed seaman about 1.7 m tall, facing +x. Dress is generic working rig of the later
// eighteenth century (short jacket or waistcoat, loose trousers, neckcloth). It illustrates
// the stations; it is not evidence for what Bellona's people wore.
const upperArm = .28, foreArm = .25, thigh = .43, shin = .40;
const up = new T.Vector3(0, 1, 0), span = new T.Vector3(), flat = new T.Vector3();
const vector = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z);

function aim(part, from, to) {
  span.subVectors(to, from);
  const length = span.length() || 1e-6;
  part.position.copy(from);
  part.scale.y = length;
  part.quaternion.setFromUnitVectors(up, span.divideScalar(length));
}

// Two-bone reach: places the middle joint on the side the pole points to.
function bend(root, target, first, second, pole, middle, end) {
  span.subVectors(target, root);
  const distance = span.length() || 1e-6, reach = Math.min(distance, (first + second) * .998);
  span.divideScalar(distance);
  const along = (first * first - second * second + reach * reach) / (2 * reach);
  const off = Math.sqrt(Math.max(0, first * first - along * along));
  flat.copy(pole).addScaledVector(span, -pole.dot(span)).normalize();
  middle.copy(root).addScaledVector(span, along).addScaledVector(flat, off);
  end.copy(root).addScaledVector(span, reach);
}

// Stacked rounded-rectangle rings: [height, half width, half depth, forward shift].
function loft(rings, around = 20, squareness = 2.6) {
  const positions = [], uvs = [], indices = [];
  rings.forEach(([y, wide, deep, shift = 0], row) => {
    for (let k = 0; k <= around; k++) {
      const a = Math.PI + 2 * Math.PI * k / around, c = Math.cos(a), s = Math.sin(a);
      positions.push(shift + deep * Math.sign(c) * Math.abs(c) ** (2 / squareness), y,
        wide * Math.sign(s) * Math.abs(s) ** (2 / squareness));
      uvs.push(k / around, row / (rings.length - 1));
    }
  });
  const step = around + 1;
  for (let row = 0; row < rings.length - 1; row++) for (let k = 0; k < around; k++) {
    const a = row * step + k, b = a + 1, c = a + step, d = c + 1;
    indices.push(a, c, b, b, c, d);
  }
  for (const [row, flip] of [[0, false], [rings.length - 1, true]]) {
    const centre = positions.length / 3, [y, , , shift = 0] = rings[row];
    positions.push(shift, y, 0); uvs.push(.5, row ? 1 : 0);
    for (let k = 0; k < around; k++) {
      const a = row * step + k;
      indices.push(...(flip ? [centre, a + 1, a] : [centre, a, a + 1]));
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  // Close the shading seam down the back, where each ring starts and ends.
  const normal = geometry.attributes.normal;
  for (let row = 0; row < rings.length; row++) {
    const a = row * step, b = a + around;
    span.fromBufferAttribute(normal, a).add(flat.fromBufferAttribute(normal, b)).normalize();
    normal.setXYZ(a, span.x, span.y, span.z);
    normal.setXYZ(b, span.x, span.y, span.z);
  }
  return geometry;
}

const turned = (profile, segments = 14) => new T.LatheGeometry(profile.map(p => new T.Vector2(...p)), segments);

function skull() {
  const geometry = new T.SphereGeometry(1, 30, 22), position = geometry.attributes.position;
  const bump = (value, centre, width) => Math.exp(-(((value - centre) / width) ** 2));
  for (let i = 0; i < position.count; i++) {
    const n = span.fromBufferAttribute(position, i).normalize();
    const low = Math.max(0, -n.y), front = Math.max(0, n.x);
    let x = n.x * .098, z = n.z * .076 * (1 - .30 * low ** 1.4);
    const y = n.y * (n.y > 0 ? .108 : .122);
    if (n.x < 0) x *= 1 - .30 * low;
    x += front * (
      .020 * bump(n.z, 0, .15) * bump(n.y, -.10, .17) +
      .006 * bump(n.y, .24, .09) +
      .009 * bump(n.y, -.72, .2) * bump(n.z, 0, .3) +
      .004 * bump(n.y, -.42, .08) * bump(n.z, 0, .22) -
      .009 * bump(Math.abs(n.z), .36, .14) * bump(n.y, .11, .09));
    z += Math.sign(n.z) * .004 * bump(n.y, -.02, .2) * front;
    position.setXYZ(i, x, y, z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

// The head texture wraps the skull with the face at the centre column and the nape at the edges.
function face(c, w, h, { skin, hair, seed, stubble }) {
  const next = random(seed), mid = w / 2;
  c.fillStyle = skin;
  c.fillRect(0, 0, w, h);
  mottle(c, w, h, next, 30, w * .05, ['rgba(150,70,50,.06)', 'rgba(255,225,190,.06)']);
  const soft = (x, y, radius, tone) => {
    const blot = c.createRadialGradient(x, y, 0, x, y, radius);
    blot.addColorStop(0, tone);
    blot.addColorStop(1, tone.replace(/[\d.]+\)$/, '0)'));
    c.fillStyle = blot;
    c.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  };
  for (const side of [-1, 1]) {
    soft(mid + side * .075 * w, .57 * h, .05 * w, 'rgba(176,74,52,.20)');
    soft(mid + side * .054 * w, .455 * h, .034 * w, 'rgba(58,32,22,.34)');
    c.fillStyle = '#e9e2d6';
    c.beginPath(); c.ellipse(mid + side * .054 * w, .462 * h, .0165 * w, .016 * h, 0, 0, 7); c.fill();
    c.fillStyle = '#2c2019';
    c.beginPath(); c.arc(mid + side * .054 * w, .462 * h, .0085 * w, 0, 7); c.fill();
    c.strokeStyle = 'rgba(40,24,16,.8)';
    c.lineWidth = h * .009;
    c.beginPath(); c.ellipse(mid + side * .054 * w, .462 * h, .018 * w, .019 * h, 0, Math.PI, 2 * Math.PI); c.stroke();
    c.strokeStyle = hair;
    c.lineWidth = h * .017;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(mid + side * .028 * w, .422 * h);
    c.quadraticCurveTo(mid + side * .058 * w, .400 * h, mid + side * .088 * w, .424 * h);
    c.stroke();
    soft(mid + side * .017 * w, .570 * h, .009 * w, 'rgba(50,24,16,.55)');
    soft(mid + side * .25 * w, .49 * h, .03 * w, 'rgba(120,56,40,.22)');
  }
  soft(mid, .585 * h, .035 * w, 'rgba(70,36,24,.20)');
  if (stubble) for (let i = 0; i < 1500; i++) {
    const x = mid + (next() - .5) * .34 * w, y = (.58 + next() * .22) * h;
    if (Math.abs(x - mid) < .03 * w && y < .62 * h) continue;
    c.fillStyle = `rgba(40,30,24,${.10 + next() * .18})`;
    c.fillRect(x, y, 1.2, 1.2);
  }
  c.strokeStyle = 'rgba(108,44,36,.85)';
  c.lineWidth = h * .012;
  c.beginPath();
  c.moveTo(mid - .036 * w, .640 * h);
  c.quadraticCurveTo(mid, .648 * h, mid + .036 * w, .640 * h);
  c.stroke();
  soft(mid, .664 * h, .022 * w, 'rgba(190,96,80,.30)');
  const line = [[.10, .30], [.17, .355], [.20, .47], [.225, .42], [.262, .40], [.268, .52], [.285, .64], [.5, .66]];
  c.fillStyle = hair;
  c.beginPath();
  c.moveTo(0, 0); c.lineTo(w, 0);
  for (const [du, v] of [...line].reverse()) c.lineTo(mid + du * w, v * h);
  c.lineTo(mid, .31 * h);
  for (const [du, v] of line) c.lineTo(mid - du * w, v * h);
  c.closePath();
  c.fill();
  for (let i = 0; i < 900; i++) {
    const back = next() < .6, x = back ? (mid + (.29 + next() * .42) * w) % w : next() * w;
    const y = next() * (back ? .6 : .27) * h;
    c.strokeStyle = next() < .5 ? `rgba(255,236,200,${next() * .16})` : `rgba(10,6,4,${next() * .28})`;
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + (next() - .5) * 5, y + 6 + next() * 12); c.stroke();
  }
}

let parts;
function shapes() {
  parts ??= {
    thigh: turned([[.090, 0], [.094, .18], [.084, .62], [.073, 1]]),
    shin: turned([[.073, 0], [.077, .28], [.068, .78], [.072, .84], [.066, .86]]),
    ankle: turned([[.046, .74], [.036, .94], [.040, 1]], 10),
    sleeve: turned([[.058, 0], [.064, .22], [.056, 1]]),
    cuff: turned([[.056, 0], [.058, .55], [.052, .93], [.058, .94], [.058, 1]]),
    forearm: turned([[.046, 0], [.049, .25], [.037, .82], [.033, 1]], 12),
    joint: new T.SphereGeometry(1, 14, 10),
    pelvis: loft([[-.115, .10, .085], [-.06, .155, .112], [.02, .162, .116], [.10, .146, .106], [.17, .136, .100]]),
    // The shirt or jacket hangs outside the waistband, so its hem covers the hip joint when the man bends.
    chest: loft([[-.04, .192, .146], [.03, .180, .134], [.15, .154, .113], [.24, .147, .107], [.36, .170, .122, .012],
      [.45, .184, .116, .008], [.505, .170, .098], [.545, .098, .078, -.004], [.575, .058, .058, -.004]], 24),
    neck: new T.CylinderGeometry(.047, .054, .13, 12),
    skull: skull(),
    ear: new T.SphereGeometry(1, 10, 8),
    hat: turned([[0, .088], [.070, .088], [.084, .078], [.087, .004], [.148, 0], [.150, -.008], [0, -.008]], 28),
    scarf: new T.SphereGeometry(1, 22, 12, 0, Math.PI * 2, 0, Math.PI * .56),
    neckcloth: new T.TorusGeometry(.060, .015, 8, 20),
    fist: new T.SphereGeometry(1, 12, 9),
    thumb: new T.CapsuleGeometry(.010, .03, 3, 6),
    finger: new T.CapsuleGeometry(.0088, .034, 3, 6),
    shoe: new T.CapsuleGeometry(.047, .15, 5, 12),
    sole: new T.BoxGeometry(.255, .02, .084),
    heel: new T.BoxGeometry(.07, .028, .078),
    queue: new T.CapsuleGeometry(.017, .09, 3, 8),
    button: new T.SphereGeometry(.009, 8, 6),
  };
  return parts;
}

export function createFigure(parent, look) {
  const { standard, fine, folds, brass } = surfaces(), form = shapes();
  const figure = new T.Group();
  figure.scale.setScalar(look.height ?? 1);
  parent.add(figure);
  const add = (target, geometry, material, x = 0, y = 0, z = 0) => {
    const mesh = new T.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    target.add(mesh);
    return mesh;
  };
  const skinTone = `#${new T.Color(look.skin).getHexString()}`, hairTone = `#${new T.Color(look.hair).getHexString()}`;
  const skin = standard(look.skin, {}, { roughness: .58 });
  const head = standard(0xffffff, {
    map: texture(512, 256, (c, w, h) => face(c, w, h, { skin: skinTone, hair: hairTone, seed: look.seed, stubble: look.stubble }), { repeat: [1, 1] }),
  }, { roughness: .6 });
  if (!head.map) head.color.set(look.skin);
  const coat = standard(look.coat, folds, { roughness: .93, bumpScale: 1.5 });
  const shirt = standard(look.shirt, folds, { roughness: .9, bumpScale: 1.7 });
  const trousers = standard(look.trousers, folds, { roughness: .92, bumpScale: 1.7 });
  const leather = standard(0x231c17, {}, { roughness: .5 });
  const hairy = standard(look.hair, {}, { roughness: .8 });
  const felt = standard(0x211f1d, fine, { roughness: .97, metalness: 0 });
  const long = look.sleeves === 'long';

  const hips = add(figure, form.pelvis, trousers);
  const torso = new T.Group();
  figure.add(torso);
  add(torso, form.chest, coat);
  add(torso, form.neck, skin, -.002, .615, 0);
  const neckcloth = add(torso, form.neckcloth, standard(look.neckcloth, fine, { roughness: .85 }), -.002, .572, 0);
  neckcloth.rotation.x = Math.PI / 2;
  neckcloth.scale.set(1, 1, 1.5);
  add(torso, form.fist, neckcloth.material, .062, .545, 0).scale.set(.02, .028, .022);
  if (long) for (const y of [.20, .28, .36, .44]) add(torso, form.button, brass, .114 + (y > .3 ? .008 : 0), y, .012);
  const crown = new T.Group();
  crown.position.set(.006, .715, 0);
  torso.add(crown);
  add(crown, form.skull, head);
  for (const side of [-1, 1]) add(crown, form.ear, skin, -.006, -.004, side * .074).scale.set(.012, .027, .011);
  if (look.head === 'hat') {
    const hat = add(crown, form.hat, felt, -.004, .052, 0);
    hat.rotation.z = .07;
  } else if (look.head === 'scarf') {
    const scarf = add(crown, form.scarf, standard(look.scarf, fine, { roughness: .88 }), -.004, .012, 0);
    scarf.scale.set(.104, .104, .083);
    scarf.rotation.z = .16;
    add(crown, form.fist, scarf.material, -.105, .0, 0).scale.set(.022, .03, .028);
  }
  if (look.queue) {
    const queue = add(crown, form.queue, hairy, -.098, -.085, 0);
    queue.rotation.z = -.28;
  }

  const limbs = [-1, 1].map(side => {
    const arm = add(figure, form.sleeve, long ? coat : shirt);
    const lower = new T.Group();
    figure.add(lower);
    if (long) add(lower, form.cuff, coat);
    else add(lower, form.forearm, skin);
    const roll = long ? null : add(figure, form.joint, shirt);
    roll?.scale.set(.062, .05, .062);
    const elbow = add(figure, form.joint, long ? coat : skin);
    elbow.scale.setScalar(long ? .056 : .046);
    const shoulder = add(figure, form.joint, long ? coat : shirt);
    shoulder.scale.setScalar(.061);
    const hand = new T.Group();
    figure.add(hand);
    add(hand, form.fist, skin, 0, .042, 0).scale.set(.021, .045, .039);
    for (let i = 0; i < 4; i++) {
      const finger = add(hand, form.finger, skin, .014, .092, (i - 1.5) * .0185);
      finger.rotation.z = -.75;
    }
    add(hand, form.thumb, skin, .022, .045, -side * .034).rotation.set(-side * .5, 0, -.6);
    const leg = add(figure, form.thigh, trousers);
    const calf = new T.Group();
    figure.add(calf);
    add(calf, form.shin, trousers);
    add(calf, form.ankle, skin);
    const knee = add(figure, form.joint, trousers);
    knee.scale.setScalar(.073);
    const foot = new T.Group();
    figure.add(foot);
    const shoe = add(foot, form.shoe, leather, .062, .048, 0);
    shoe.rotation.z = Math.PI / 2;
    shoe.scale.set(.8, 1, .9);
    add(foot, form.sole, leather, .062, .010, 0);
    add(foot, form.heel, leather, -.03, .014, 0);
    add(foot, form.button, brass, .085, .088, 0).scale.set(2.2, .7, 2.6);
    return { side, arm, lower, roll, elbow, shoulder, hand, leg, calf, knee, foot };
  });

  const pelvis = vector(), socket = vector(), wrist = vector(), middle = vector(), end = vector();
  const rest = vector(), work = vector(), hip = vector(), sole = vector(), pole = vector();
  const lead = look.lead ?? 1;

  function move(x, z, heading, effort, reach = effort) {
    figure.position.set(x, 0, z);
    figure.rotation.y = heading;
    const lean = effort * .44, crouch = effort * .11, easy = 1 - Math.min(1, effort * 3);
    pelvis.set(-effort * .05, .93 - crouch, lead * easy * .018);
    hips.position.copy(pelvis);
    hips.rotation.z = -lean * .6;
    torso.position.copy(pelvis);
    torso.rotation.set(lead * easy * .035, 0, -lean);
    crown.rotation.set(0, (look.glance ?? 0) * easy, lean * .72);
    const working = T.MathUtils.smoothstep(reach, .13, .42);
    for (const limb of limbs) {
      const { side } = limb;
      socket.set(Math.sin(lean) * .475, Math.cos(lean) * .475, side * .182).add(pelvis);
      rest.set(socket.x + .05 + side * lead * .02, socket.y - .505, socket.z + side * .045);
      work.set(.12 + reach * .42, 1.02 - effort * .15, side * .085);
      wrist.lerpVectors(rest, work, working);
      pole.set(-.55, -.6, side * .6);
      bend(socket, wrist, upperArm, foreArm, pole, middle, end);
      aim(limb.arm, socket, middle);
      aim(limb.lower, middle, end);
      limb.elbow.position.copy(middle);
      limb.roll?.position.copy(middle);
      limb.roll?.quaternion.copy(limb.lower.quaternion);
      limb.shoulder.position.copy(socket);
      limb.hand.position.copy(end);
      limb.hand.quaternion.copy(limb.lower.quaternion);

      hip.set(pelvis.x, pelvis.y - .045, pelvis.z + side * .088);
      const stride = side * lead * (.035 * easy + .21 * effort);
      sole.set(stride - .015, .085, side * (.105 + .045 * effort));
      pole.set(1, .1, side * .22);
      bend(hip, sole, thigh, shin, pole, middle, end);
      aim(limb.leg, hip, middle);
      aim(limb.calf, middle, end);
      limb.knee.position.copy(middle);
      limb.foot.position.set(end.x, end.y - .085, end.z);
      limb.foot.rotation.y = -side * .2;
    }
  }
  return { figure, move };
}

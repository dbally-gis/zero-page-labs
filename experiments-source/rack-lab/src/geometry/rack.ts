// Builds the rack as a Manifold: a drafted wedge, optional hollow underside,
// edge treatments, and tilted card slots. Everything is plane trims + booleans.
import type { Manifold, ManifoldToplevel } from "manifold-3d";
import { ceilingCells, derive, endRadius, PLAYER_LABEL_H, RIM_T, type EdgeSpec, type RackParams } from "./params";
import { engraveCutter } from "./digits";
import { raiseWordmark } from "./frontWordmark";

type V3 = [number, number, number];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const unit = (a: V3): V3 => scale(a, 1 / Math.sqrt(dot(a, a)));
const BIG = 1000;

interface Plane {
  n: V3; // outward unit normal
  d: number; // n . x = d on the surface; body is n . x <= d
}

/** Point on both planes closest to the origin. */
function edgePoint(n1: V3, d1: number, n2: V3, d2: number): V3 {
  const a = dot(n1, n1), b = dot(n1, n2), c = dot(n2, n2);
  const det = a * c - b * b;
  return add(scale(n1, (d1 * c - d2 * b) / det), scale(n2, (a * d2 - b * d1) / det));
}

const keepBelow = (m: Manifold, n: V3, d: number) => m.trimByPlane([-n[0], -n[1], -n[2]], -d);

function trimEdge(m: Manifold, f1: Plane, f2: Plane, e: EdgeSpec): Manifold {
  if (e.style === "none" || e.size <= 0) return m;
  const cosB = dot(f1.n, f2.n);
  const beta = Math.acos(Math.min(1, Math.max(-1, cosB)));
  if (beta < 1e-3 || beta > Math.PI - 1e-3) return m;
  if (e.style === "chamfer") {
    const q = edgePoint(f1.n, f1.d, f2.n, f2.d);
    const u1 = unit(add(f2.n, scale(f1.n, -cosB)).map((v) => -v) as V3); // along face 1, away from edge
    const mid = unit(add(f1.n, f2.n));
    return keepBelow(m, mid, dot(mid, add(q, scale(u1, e.size))));
  }
  const r = e.size;
  const p = edgePoint(f1.n, f1.d - r, f2.n, f2.d - r);
  const k = 4;
  let out = m;
  for (let j = 0; j < k; j++) {
    const phi = (j + 0.5) / k;
    const mj = unit(add(scale(f1.n, Math.sin((1 - phi) * beta)), scale(f2.n, Math.sin(phi * beta))));
    out = keepBelow(out, mj, dot(mj, p) + r);
  }
  return out;
}

export interface RackFaces {
  bottom: Plane; left: Plane; right: Plane; front: Plane; back: Plane; top: Plane;
}

export function faces(p: RackParams): RackFaces {
  const { t, s, c } = derive(p);
  const k = Math.sqrt(1 + t * t);
  const ks = Math.sqrt(1 + s * s + c * c);
  const a = p.frontHeight - (c * p.width) / 2; // plane height at x = 0, y = 0
  return {
    bottom: { n: [0, 0, -1], d: 0 },
    left: { n: [-1 / k, 0, t / k], d: 0 },
    right: { n: [1 / k, 0, t / k], d: p.width / k },
    front: { n: [0, -1 / k, t / k], d: 0 },
    back: { n: [0, 1 / k, t / k], d: p.depth / k },
    top: { n: [-c / ks, -s / ks, 1 / ks], d: a / ks },
  };
}

function buildOuter(api: ManifoldToplevel, p: RackParams): Manifold {
  const { Manifold } = api;
  const f = faces(p);
  let m = Manifold.cube([BIG, BIG, BIG], true);
  for (const pl of Object.values(f)) m = keepBelow(m, pl.n, pl.d);
  const e = (a: Plane, b: Plane, s: EdgeSpec) => (m = trimEdge(m, a, b, s));
  for (const side of [f.left, f.right, f.front, f.back]) e(f.top, side, p.topEdge);
  for (const side of [f.left, f.right, f.front, f.back]) e(f.bottom, side, p.bottomEdge);
  e(f.left, f.front, p.cornerEdge);
  e(f.left, f.back, p.cornerEdge);
  e(f.right, f.front, p.cornerEdge);
  e(f.right, f.back, p.cornerEdge);
  return m;
}

function buildCavity(api: ManifoldToplevel, p: RackParams): Manifold | null {
  const { Manifold } = api;
  const d = derive(p);
  const { t, s, c, tsv } = d;
  if (p.height - (p.sideSlope ? Math.abs(p.sideDelta) / 2 : 0) - tsv < 0.5) return null;
  const k = Math.sqrt(1 + t * t);
  const w = p.wall;
  let base = Manifold.cube([BIG, BIG, BIG], true).trimByPlane([0, 0, 1], -1);
  base = base.trimByPlane([1 / k, 0, -t / k], w / k); // x - t z >= w
  base = base.trimByPlane([-1 / k, 0, -t / k], -(p.width - w) / k);
  base = base.trimByPlane([0, 1 / k, -t / k], w / k);
  base = base.trimByPlane([0, -1 / k, -t / k], -(p.depth - w) / k);
  if (p.ceiling === "sloped") {
    // Parallel to the ramp front to back but LEVEL across the width: the slot floors are level, so a roof that
    // tilted with the cross slope would rise above them on the high side and cut the slots loose.
    // z - s y <= hf - tsv
    const ks = Math.sqrt(1 + s * s);
    return base.trimByPlane([0, s / ks, -1 / ks], -(p.frontHeight - tsv) / ks);
  }
  const pieces: Manifold[] = [];
  const cells = ceilingCells(p, s, c, tsv).filter((cell) => cell.z >= 0.2);
  const at = (iy: number, ix: number) => cells.find((q) => q.iy === iy && q.ix === ix);
  const EPS = 0.03; // a lower cell reaches this far into a higher neighbour so the union fuses (no zero-thickness slivers)
  for (const cell of cells) {
    const reach = (n: typeof cell | undefined) => (n && n.z >= cell.z - 1e-9 ? EPS : 0);
    const y0 = cell.y0 - reach(at(cell.iy - 1, cell.ix)), y1 = cell.y1 + reach(at(cell.iy + 1, cell.ix));
    const x0 = cell.x0 - reach(at(cell.iy, cell.ix - 1)), x1 = cell.x1 + reach(at(cell.iy, cell.ix + 1));
    let piece = base.trimByPlane([0, 1, 0], y0).trimByPlane([0, -1, 0], -y1).trimByPlane([0, 0, -1], -cell.z);
    if (x0 > 0) piece = piece.trimByPlane([1, 0, 0], x0);
    if (x1 < p.width) piece = piece.trimByPlane([-1, 0, 0], -x1);
    if (!piece.isEmpty()) pieces.push(piece);
  }
  return pieces.length ? Manifold.union(pieces) : null;
}

/** One slot cutter in world coordinates (axis leans back by `lean`). */
function slotCutter(api: ManifoldToplevel, p: RackParams, y: number, z: number, depth: number): Manifold {
  const { Manifold } = api;
  const d = derive(p);
  const OUT = 5 + p.flange; // overshoot past an open side (and through the flange)
  const T = p.slotThickness;
  const L = (p.lean * Math.PI) / 180;
  // Face x at this slot's height (drafted faces lean inward as they rise).
  const faceL = d.t * z;
  const faceR = p.width - d.t * z;
  const lip = p.lipGap > 0 && p.lipGap < T ? Math.min(p.lipLength, (faceR - faceL) / 3) : 0; // never more than a third of the span each end
  const x0 = p.openLeft ? faceL + lip : d.sideInset; // main cutter extents
  const x1 = p.openRight ? faceR - lip : p.width - d.sideInset;
  // Rounded closed ends: the closed end of the slot is a cylinder of radius R about the slot axis (R > T/2 gives a relief hole).
  const closedL = !p.openLeft, closedR = !p.openRight;
  const R0 = endRadius(p);
  const R = x1 - x0 - 2 * R0 > 0.5 ? R0 : 0; // too short a slot stays square
  const r0 = closedL ? R : 0, r1 = closedR ? R : 0;
  const place = (m: Manifold, xa: number, xb: number) => m.translate([(xa + xb) / 2, y, z]);
  const box = (xa: number, xb: number, th: number) =>
    Manifold.cube([xb - xa, th, depth + 200])
      .translate([-(xb - xa) / 2, -th / 2, -depth])
      .rotate([-p.lean, 0, 0]);
  const parts: Manifold[] = [place(box(x0 + r0, x1 - r1, T), x0 + r0, x1 - r1)];
  if (lip > 0) {
    if (p.openLeft) parts.push(place(box(-OUT, x0 + 0.01, p.lipGap), -OUT, x0 + 0.01));
    if (p.openRight) parts.push(place(box(x1 - 0.01, p.width + OUT, p.lipGap), x1 - 0.01, p.width + OUT));
  } else {
    // no lip: run the full-thickness slot out through the open side(s)
    const xa = p.openLeft ? -OUT : x0 + r0;
    const xb = p.openRight ? p.width + OUT : x1 - r1;
    parts[0] = place(box(xa, xb, T), xa, xb);
  }
  if (R > 0) {
    const cyl = (cx: number) =>
      Manifold.cylinder(depth + 200, R, R, 28).translate([0, 0, -depth]).rotate([-p.lean, 0, 0]).translate([cx, y, z]);
    if (closedL) parts.push(cyl(x0 + R));
    if (closedR) parts.push(cyl(x1 - R));
  }
  const lead = p.slotLeadIn;
  if (lead > 0) {
    // Lead-in: hull from a slab `lead` below the ramp to a rectangle lying in the ramp plane,
    // flared `lead` mm each way. (A 45 degree funnel about the slot axis fails here: on a ramp the
    // plane climbs at ~atan(ramp + lean) in the slot frame and buries the funnel.)
    const xa = lip > 0 || !p.openLeft ? x0 + r0 : -OUT;
    const xb = lip > 0 || !p.openRight ? x1 - r1 : p.width + OUT;
    const xc = (xa + xb) / 2, hw = (xb - xa) / 2;
    const pts: [number, number, number][] = [];
    const local = (xx: number, yl: number, zl: number): [number, number, number] =>
      [xc + xx, y + yl * Math.cos(L) + zl * Math.sin(L), z - yl * Math.sin(L) + zl * Math.cos(L)];
    for (const xx of [-hw, hw])
      for (const yl of [-T / 2, T / 2]) pts.push(local(xx, yl, -lead));
    const half = T / 2 / Math.cos(L) + lead;
    for (const off of [-half, half])
      for (const xx of [-hw, hw]) {
        const yw = y + off, zw = p.frontHeight + d.s * yw + d.c * (xc + xx - p.width / 2);
        pts.push([xc + xx, yw, zw], [xc + xx, yw, zw + 0.5]);
      }
    parts.push(Manifold.hull(pts));
  }
  return Manifold.union(parts);
}


/**
 * Sawtooth fin tops: between neighbouring slots the top is cut down by `sawtooth` mm at one slot wall and rises back to
 * the ramp at the other (steep wall + shallow slope, as on a Rack-O). Each wedge starts/ends inside the slot gap so no
 * sliver of full-height material is left against the low wall.
 */
function sawtoothCutters(api: ManifoldToplevel, p: RackParams): Manifold[] {
  if (p.sawtooth <= 0) return [];
  const { Manifold } = api;
  const d = derive(p);
  const A = p.sawtooth;
  const L = (p.lean * Math.PI) / 180;
  const half = p.slotThickness / (2 * Math.cos(L));
  const a = p.frontHeight - (d.c * p.width) / 2; // ramp plane: z = a + s y + c x
  const out: Manifold[] = [];
  const tops = [...d.slotYs.slice(1), d.yBackTop + 3]; // each fin ends at the next slot, the last at the back face
  d.slotYs.forEach((yk, i) => {
    const flip = p.sawtoothFlip;
    const ys = yk + half - 0.3 - (flip ? 0 : A * Math.tan(L));
    const ye = i < d.slotYs.length - 1 ? tops[i] - half + 0.3 - (flip ? A * Math.tan(L) : 0) : tops[i];
    const len = ye - ys;
    if (len < 2) return;
    const sSaw = flip ? d.s - A / len : d.s + A / len;
    const aSaw = flip ? a + (A * ys) / len : a - (A * ye) / len;
    const k1 = Math.hypot(d.c, sSaw, 1), k2 = Math.hypot(d.c, d.s, 1);
    const wedge = Manifold.cube([BIG, BIG, BIG], true)
      .trimByPlane([0, 1, 0], ys)
      .trimByPlane([0, -1, 0], -ye)
      .trimByPlane([-d.c / k1, -sSaw / k1, 1 / k1], aSaw / k1) // above the sawtooth plane
      .trimByPlane([d.c / k2, d.s / k2, -1 / k2], -(a + 1) / k2); // and no more than 1 mm above the ramp
    if (!wedge.isEmpty()) out.push(wedge);
  });
  return out;
}

/** Flat rim around the base, outside the shell; the underside stays open. */
function flangeRing(api: ManifoldToplevel, p: RackParams): Manifold | null {
  if (p.flange <= 0) return null;
  const { Manifold } = api;
  const F = p.flange, t = p.flangeThickness;
  const outer = Manifold.cube([p.width + 2 * F, p.depth + 2 * F, t]).translate([-F, -F, 0]);
  const hole = Manifold.cube([p.width - 1.6, p.depth - 1.6, t + 2]).translate([0.8, 0.8, -1]); // overlaps the wall so the union fuses
  let ring = outer.subtract(hole);
  if (p.rim > 0) {
    // Grip rim on the outer edge of the flange. An open side stays clear so cards can still slide out past it.
    const H = t + p.rim, T = RIM_T;
    const wall = Manifold.cube([p.width + 2 * F, p.depth + 2 * F, H]).translate([-F, -F, 0])
      .subtract(Manifold.cube([p.width + 2 * F - 2 * T, p.depth + 2 * F - 2 * T, H + 2]).translate([-F + T, -F + T, -1]));
    let rim = wall;
    if (p.openLeft) rim = rim.subtract(Manifold.cube([F + 0.01, p.depth + 2 * F + 2, H + 2]).translate([-F - 0.5, -F - 1, -1]));
    if (p.openRight) rim = rim.subtract(Manifold.cube([F + 0.01, p.depth + 2 * F + 2, H + 2]).translate([p.width - 0.01 + 0, -F - 1, -1]));
    ring = ring.add(rim);
  }
  return ring;
}

const LABEL_DEPTH = 0.6;

/** Cutter for every engraved number on the rack (slot numbers and the player number). */
export function labelCutters(api: ManifoldToplevel, p: RackParams): Manifold[] {
  const d = derive(p);
  const f = faces(p);
  const out: Manifold[] = [];
  const add = (m: Manifold | null) => { if (m) out.push(m); };
  if (p.labelSides !== "none") {
    const zc = 1.5 + p.labelHeight / 2;
    d.slotYs.forEach((y, i) => {
      const text = String((i + 1) * p.labelStep);
      for (const [side, plane] of [["left", f.left], ["right", f.right]] as const) {
        if (p.labelSides !== "both" && p.labelSides !== side) continue;
        const x = (plane.d - plane.n[1] * y - plane.n[2] * zc) / plane.n[0];
        add(engraveCutter(api, text, [x, y, zc], plane.n, [0, 0, 1], p.labelHeight, LABEL_DEPTH));
      }
    });
  }
  if (p.playerLabel > 0) {
    const zc = 2 + PLAYER_LABEL_H / 2;
    const x = p.width / 2;
    const face = p.frontWordmark ? f.back : f.front;
    const y = (face.d - face.n[2] * zc) / face.n[1];
    add(engraveCutter(api, String(p.playerLabel), [x, y, zc], face.n, [0, 0, 1], PLAYER_LABEL_H, LABEL_DEPTH));
  }
  return out;
}

export function buildRack(api: ManifoldToplevel, p: RackParams): Manifold {
  const d = derive(p);
  let body = buildOuter(api, p);
  if (p.nest) {
    const cav = buildCavity(api, p);
    if (cav) body = body.subtract(cav);
  }
  const ring = flangeRing(api, p);
  if (ring) body = body.add(ring);
  if (p.frontWordmark) body = raiseWordmark(api, body, p, d);
  // Through-slots run 3 mm past the table so they open out of the bottom face.
  const cutters = d.slotYs.map((y, i) => slotCutter(api, p, y, p.frontHeight + d.s * y, d.slotDepths[i] + (p.throughSlots ? 3 : 0)));
  cutters.push(...labelCutters(api, p), ...sawtoothCutters(api, p));
  return dropSlivers(api, body.subtract(api.Manifold.union(cutters)));
}

/** Number of separate solid parts (a printable rack is exactly 1). */
export function pieceCount(m: Manifold): number {
  return m.decompose().filter((c) => c.volume() > 1).length;
}

/** Zero-volume fragments (boolean leftovers where faces graze) are not parts: drop them so the STL is one body. */
function dropSlivers(api: ManifoldToplevel, m: Manifold): Manifold {
  const parts = m.decompose();
  if (parts.length <= 1) return m;
  const real = parts.filter((c) => c.volume() > 1);
  return real.length === 1 ? real[0] : api.Manifold.compose(real);
}

/** A 57x89 card (with index zone marker) seated in slot i, as plain geometry for tests and preview. */
export function cardBox(api: ManifoldToplevel, p: RackParams, i: number): Manifold {
  const d = derive(p);
  const y = d.slotYs[i];
  const z = p.frontHeight + d.s * y;
  const card = api.Manifold.cube([p.cardWidth, 0.35, p.cardHeight])
    .translate([-p.cardWidth / 2, -0.175, -d.slotDepths[i] + 0.05]);
  return card.rotate([-p.lean, 0, 0]).translate([d.cardX, y, z]);
}

export function toStl(m: Manifold): ArrayBuffer {
  const mesh = m.getMesh();
  const np = mesh.numProp;
  const v = mesh.vertProperties;
  const tri = mesh.triVerts;
  const n = tri.length / 3;
  const buf = new ArrayBuffer(84 + n * 50);
  const dv = new DataView(buf);
  const header = "rack-lab parametric card rack";
  for (let i = 0; i < header.length; i++) dv.setUint8(i, header.charCodeAt(i));
  dv.setUint32(80, n, true);
  let o = 84;
  for (let i = 0; i < n; i++) {
    const a = tri[3 * i] * np, b = tri[3 * i + 1] * np, c = tri[3 * i + 2] * np;
    const ux = v[b] - v[a], uy = v[b + 1] - v[a + 1], uz = v[b + 2] - v[a + 2];
    const wx = v[c] - v[a], wy = v[c + 1] - v[a + 1], wz = v[c + 2] - v[a + 2];
    let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    for (const val of [nx, ny, nz]) { dv.setFloat32(o, val, true); o += 4; }
    for (const idx of [a, b, c]) for (let q = 0; q < 3; q++) { dv.setFloat32(o, v[idx + q], true); o += 4; }
    o += 2;
  }
  return buf;
}

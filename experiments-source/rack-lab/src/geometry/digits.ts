// Seven-segment digits as printable engraving. Segment geometry is plain boxes so the
// result is robust to boolean operations and prints with 0.4 mm nozzles at >= 3 mm height.
import type { Manifold, ManifoldToplevel } from "manifold-3d";

type V3 = [number, number, number];

// a=top b=upper-right c=lower-right d=bottom e=lower-left f=upper-left g=middle
const SEGMENTS: Record<string, string> = {
  "0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg", "4": "bcfg",
  "5": "acdfg", "6": "acdefg", "7": "abc", "8": "abcdefg", "9": "abcdfg",
};

export const GLYPH_W = 0.6; // width as a fraction of height
export const GLYPH_GAP = 0.3; // gap between glyphs as a fraction of height

export function textWidth(text: string, h: number): number {
  return text.length * GLYPH_W * h + (text.length - 1) * GLYPH_GAP * h;
}

const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };

/** Digit prism in a local frame: u = reading direction, v = up, z = toward the viewer. Spans z in [-depth, 1]. */
function localDigits(api: ManifoldToplevel, text: string, h: number, stroke: number, depth: number): Manifold | null {
  const { Manifold } = api;
  const w = GLYPH_W * h;
  const boxes: Manifold[] = [];
  const total = textWidth(text, h);
  let x0 = -total / 2;
  for (const ch of text) {
    const segs = SEGMENTS[ch];
    if (segs === undefined) throw new Error(`unsupported character '${ch}'`);
    const horiz = (yc: number) => Manifold.cube([w, stroke, depth + 1]).translate([x0, yc - stroke / 2, -depth]);
    const vert = (xc: number, ya: number, yb: number) =>
      Manifold.cube([stroke, yb - ya, depth + 1]).translate([x0 + xc - stroke / 2, ya, -depth]);
    const top = h / 2, mid = 0, bot = -h / 2;
    for (const sg of segs) {
      if (sg === "a") boxes.push(horiz(top - stroke / 2));
      if (sg === "d") boxes.push(horiz(bot + stroke / 2));
      if (sg === "g") boxes.push(horiz(mid));
      if (sg === "b") boxes.push(vert(w - stroke / 2, mid - stroke / 2, top));
      if (sg === "c") boxes.push(vert(w - stroke / 2, bot, mid + stroke / 2));
      if (sg === "f") boxes.push(vert(stroke / 2, mid - stroke / 2, top));
      if (sg === "e") boxes.push(vert(stroke / 2, bot, mid + stroke / 2));
    }
    x0 += w + GLYPH_GAP * h;
  }
  return boxes.length ? Manifold.union(boxes) : null;
}

/**
 * Cutter that engraves `text` into a face. `normal` points out of the body toward the viewer;
 * `up` is the in-plane direction that reads as "up"; `center` is a point on the face.
 * Not mirrored: reading direction u = up x normal, so u, up, normal is right-handed.
 */
export function engraveCutter(
  api: ManifoldToplevel,
  text: string,
  center: V3,
  normal: V3,
  up: V3,
  h: number,
  depth: number,
  stroke = Math.max(0.7, h * 0.18),
): Manifold | null {
  const N = unit(normal);
  const k = dot(up, N);
  const V = unit([up[0] - k * N[0], up[1] - k * N[1], up[2] - k * N[2]]);
  const U = cross(V, N);
  const m = localDigits(api, text, h, stroke, depth);
  if (!m) return null;
  // column-major 4x4: columns are U, V, N, translation
  return m.transform([
    U[0], U[1], U[2], 0,
    V[0], V[1], V[2], 0,
    N[0], N[1], N[2], 0,
    center[0], center[1], center[2], 1,
  ]);
}

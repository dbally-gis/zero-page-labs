import type { Manifold, ManifoldToplevel } from "manifold-3d";
import type { Derived, EdgeSpec, RackParams } from "./params";
import { WORDMARK_ASPECT, WORDMARK_OUTLINES } from "./wordmarkOutlines";

const RELIEF = 0.8; // horizontal projection beyond the drafted face, mm
const EMBED = 0.25; // overlap into the wall for a solid union, mm
const RISE = 1.25; // upwards shear per mm of relief, to support each printed layer
const cut = (edge: EdgeSpec) => edge.style === "none" ? 0 : edge.size;

export function wordmarkLayout(p: RackParams, d: Derived) {
  const base = Math.max(cut(p.bottomEdge) + 1, RELIEF / d.t, p.flange > 0 ? p.flangeThickness + p.rim : 0);
  const frontTop = p.frontHeight - Math.abs(d.c) * p.width / 2 - cut(p.topEdge);
  // Stay inside the bed footprint and below the point where a stacked rack begins.
  const top = Math.min(frontTop, p.nest ? d.stackRise : Infinity) - 0.5;
  const width = p.width - 2 * (d.t * top + 1.5 * cut(p.cornerEdge) + 1);
  const height = Math.min(8, top - base - 0.5, width / WORDMARK_ASPECT);
  return height >= 4.5 ? { height, z: (base + 0.5 + top - height) / 2 } : null;
}

export function raiseWordmark(api: ManifoldToplevel, body: Manifold, p: RackParams, d: Derived): Manifold {
  const layout = wordmarkLayout(p, d);
  if (!layout) return body;
  const outlines = WORDMARK_OUTLINES.map((path) =>
    path.map(([x, y]): [number, number] => [x * layout.height, y * layout.height]));
  const section = api.CrossSection.ofPolygons(outlines, "NonZero");
  try {
    // Local XY is the lettering plane. Local extrusion rises as it projects out from y = draft * z.
    const z = layout.z - RELIEF * RISE;
    const wordmark = api.Manifold.extrude(section, RELIEF + EMBED).transform([
      1, 0, 0, 0,
      0, d.t, 1, 0,
      0, d.t * RISE - 1, RISE, 0,
      p.width / 2, d.t * (z - EMBED * RISE) + EMBED, z - EMBED * RISE, 1,
    ]);
    return body.add(wordmark);
  } finally {
    section.delete();
  }
}

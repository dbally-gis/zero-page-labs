// Slot tolerance coupon: one bar with vertical slots of increasing thickness, each labelled
// (in tenths of a mm) on the top face. Print it first, find the slot your cards slide in.
import type { Manifold, ManifoldToplevel } from "manifold-3d";
import { engraveCutter } from "./digits";
import { RIM_MIN_FLANGE, RIM_T } from "./params";

export const COUPON_THICKNESSES = Array.from({ length: 11 }, (_, i) => Math.round((0.6 + i * 0.1) * 10) / 10);
export const COUPON = { width: 46, pitch: 5, depth: 9, height: 14, slotX0: 10, slotX1: 42, margin: 3.5 };

export function buildCoupon(api: ManifoldToplevel): Manifold {
  const { Manifold } = api;
  const c = COUPON;
  const len = COUPON_THICKNESSES.length * c.pitch + 2 * c.margin;
  let bar = Manifold.cube([c.width, len, c.height]);
  const cuts: Manifold[] = [];
  COUPON_THICKNESSES.forEach((t, i) => {
    const y = c.margin + c.pitch * (i + 0.5);
    cuts.push(Manifold.cube([c.slotX1 - c.slotX0, t, c.depth + 1]).translate([c.slotX0, y - t / 2, c.height - c.depth]));
    const label = engraveCutter(api, String(Math.round(t * 10)), [5.5, y, c.height], [0, 0, 1], [0, 1, 0], 3.5, 0.5);
    if (label) cuts.push(label);
  });
  bar = bar.subtract(Manifold.union(cuts));
  return bar;
}

/**
 * Grip-rim coupon: a corner of the flange with the rim as set, 45 mm long on each leg. Print it to check the 1.6 mm wall,
 * how the rim feels to grip, and how it bonds to the flange, before committing to a full rack.
 */
export function buildRimCoupon(api: ManifoldToplevel, flange: number, flangeThickness: number, rim: number): Manifold {
  const { Manifold } = api;
  const L = 45, T = RIM_T, F = Math.max(flange, RIM_MIN_FLANGE), H = flangeThickness + Math.max(rim, 1);
  const plate = Manifold.cube([L, L, flangeThickness]);
  const wallX = Manifold.cube([L, T, H]);
  const wallY = Manifold.cube([T, L, H]);
  // The rim stands on the outer edge of an F mm wide flange strip; cut the plate to an L so only the strip remains.
  const strip = plate.subtract(Manifold.cube([L, L, flangeThickness + 2]).translate([F, F, -1]));
  return strip.add(wallX).add(wallY);
}

// Bambu Lab A1 mini (0.4 mm nozzle, PLA) limits and plate layout.
// Values follow crater-lab/knowledge/domain/stl_print_settings.md.
import type { Manifold, ManifoldToplevel } from "manifold-3d";
import { buildRack } from "./rack";
import { footprint, maxHeight, type RackParams, type Warning } from "./params";

export const A1_MINI = {
  name: "Bambu Lab A1 mini",
  bed: [180, 180, 180] as const,
  nozzle: 0.4,
  layerHeight: 0.2,
  minFeature: 0.8, // 2 x nozzle (crater-lab calibration)
  minFin: 1.2, // 3 perimeters
  plateGap: 6,
};

export function bedWarnings(p: RackParams): Warning[] {
  const w: Warning[] = [];
  const [bx, by, bz] = A1_MINI.bed;
  const fp = footprint(p);
  if (fp.w > bx) w.push({ level: "error", text: `Width ${fp.w} mm${p.flange ? " (with flange)" : ""} exceeds the A1 mini bed (${bx} mm).` });
  if (fp.d > by) w.push({ level: "error", text: `Depth ${fp.d} mm${p.flange ? " (with flange)" : ""} exceeds the A1 mini bed (${by} mm).` });
  if (maxHeight(p) > bz) w.push({ level: "error", text: `Height ${maxHeight(p)} mm exceeds the A1 mini build height (${bz} mm).` });
  if (p.ceiling === "sloped" && p.nest) w.push({ level: "warn", text: "Sloped ceiling needs supports under the ramp on the A1 mini." });
  if (p.slotThickness < A1_MINI.minFeature) w.push({ level: "warn", text: `Slot thickness below ${A1_MINI.minFeature} mm will not print cleanly with a 0.4 mm nozzle.` });
  return w;
}

export interface Placement { index: number; x: number; y: number }

/** Grid-pack identical footprints onto A1 mini plates; returns racks per plate in order. */
export function arrangePlates(width: number, depth: number, count: number): Placement[][] {
  const [bx, by] = A1_MINI.bed;
  const g = A1_MINI.plateGap;
  const cols = Math.max(1, Math.floor((bx + g) / (width + g)));
  const rows = Math.max(1, Math.floor((by + g) / (depth + g)));
  const per = cols * rows;
  const plates: Placement[][] = [];
  for (let i = 0; i < count; i++) {
    const plate = Math.floor(i / per);
    const k = i % per;
    (plates[plate] ??= []).push({ index: i, x: (k % cols) * (width + g), y: Math.floor(k / cols) * (depth + g) });
  }
  return plates;
}

/** One manifold per plate; racks are labelled with their player number when `label` is set. */
export function buildPlates(api: ManifoldToplevel, p: RackParams, count: number, label = true): Manifold[] {
  const fp = footprint(p);
  return arrangePlates(fp.w, fp.d, count).map((plate) =>
    api.Manifold.compose(
      plate.map((pl) => buildRack(api, { ...p, playerLabel: label ? pl.index + 1 : p.playerLabel }).translate([pl.x, pl.y, 0])),
    ),
  );
}

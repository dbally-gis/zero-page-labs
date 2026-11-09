// Constraint engine: every control change goes through `accept`, which repairs dependent settings
// (depth, front height, edge sizes, side walls...) and only allows the change if the result is valid.
// So the UI never shows an error to chase: a control either moves (possibly adjusting others) or stops at its limit.
import type { ManifoldToplevel } from "manifold-3d";
import { buildRack, pieceCount } from "./rack";
import { bedWarnings } from "./printer";
import { scoped } from "./memory";
import {
  MIN_FIN, RIM_MIN_FLANGE, autoDepth, autoFrontHeight, derive, effective, endRadius, footprint, maxSawtooth, solveHeightForExposure, validate, type RackParams,
} from "./params";

export type Patch = Partial<RackParams>;
export interface Outcome {
  ok: boolean;
  params: RackParams; // the new state when ok, the previous state when not
  note: string | null; // why it was held, or what else was adjusted
}

/** Numeric controls: range and step used by the sliders and by the feasibility scan. */
export const CONTROLS = {
  slots: { min: 1, max: 20, step: 1 },
  width: { min: 30, max: 175, step: 0.5 },
  depth: { min: 30, max: 175, step: 1 },
  height: { min: 20, max: 180, step: 1 },
  frontHeight: { min: 4, max: 60, step: 0.5 },
  spacing: { min: 4, max: 30, step: 0.5 },
  spacingTaper: { min: -1.5, max: 1.5, step: 0.1 },
  lean: { min: 0, max: 25, step: 1 },
  slotThickness: { min: 0.8, max: 3, step: 0.05 }, // 0.8 = two nozzle widths, the A1 mini's limit
  slotDepth: { min: 4, max: 30, step: 0.5 },
  slotLeadIn: { min: 0, max: 3, step: 0.25 },
  sideWall: { min: 1.5, max: 12, step: 0.5 },
  lipGap: { min: 0, max: 1.4, step: 0.05 },
  lipLength: { min: 2, max: 20, step: 1 },
  labelStep: { min: 1, max: 10, step: 1 },
  labelHeight: { min: 3, max: 9, step: 0.5 },
  playerLabel: { min: 0, max: 9, step: 1 },
  wall: { min: 1.2, max: 6, step: 0.2 },
  draft: { min: 2, max: 20, step: 1 },
  nestClearance: { min: 0.1, max: 1, step: 0.05 },
  narrowPercent: { min: 20, max: 100, step: 5 },
  sawtooth: { min: 0, max: 6, step: 0.5 },
  slotEndRadius: { min: 0, max: 3, step: 0.1 },
  flange: { min: 0, max: 15, step: 1 },
  flangeThickness: { min: 0.8, max: 3, step: 0.2 },
  rim: { min: 0, max: 12, step: 1 },
  cardWidth: { min: 30, max: 100, step: 0.5 },
  cardHeight: { min: 40, max: 140, step: 0.5 },
} as const;
export type ControlKey = keyof typeof CONTROLS;

/** Everything that must be false for a state to be reachable: rule errors plus the 180 mm printer bed. */
export const stateErrors = (raw: RackParams): string[] => {
  const q = effective(raw);
  return [...validate(q), ...bedWarnings(q)].filter((w) => w.level === "error").map((w) => w.text);
};

const FRIENDLY: Partial<Record<keyof RackParams, string>> = {
  sawtooth: "sawtooth", flange: "flange", rim: "grip rim", slotEndRadius: "slot end radius",
  depth: "depth", frontHeight: "front height", height: "height", width: "width", spacing: "slot spacing", ceiling: "ceiling",
  labelSides: "slot numbers", throughSlots: "through slots", narrow: "narrow", openLeft: "open left", openRight: "open right",
  sideDelta: "side slope", topEdge: "ramp edge", bottomEdge: "base edge", cornerEdge: "corner edge", slotDepth: "slot depth",
};

/**
 * Adjust everything that depends on what the user just changed. `changed` names the controls the user touched:
 * where two settings conflict, the one just touched wins.
 */
export function repair(input: RackParams, changed: ReadonlySet<string>): RackParams {
  const p: RackParams = { ...input, topEdge: { ...input.topEdge }, bottomEdge: { ...input.bottomEdge }, cornerEdge: { ...input.cornerEdge } };

  // 1. Mutually exclusive modes. Through-slots need one closed side to hold the strips together, and a centred narrow
  //    rack opens both, so with through-slots a narrow rack becomes a rail instead (unless the user just picked "centred").
  if (p.throughSlots && p.narrow && p.narrowAlign === "center") {
    if (changed.has("narrowAlign")) p.throughSlots = false; else p.narrowAlign = "left";
  }
  if (p.throughSlots && !p.narrow && p.openLeft && p.openRight) { if (changed.has("openRight") && !changed.has("openLeft")) p.openLeft = false; else p.openRight = false; }
  if (p.sideSlope && changed.has("sideSlope") && Math.abs(p.sideDelta) < 1) p.sideDelta = 10;

  // 2. Numbers cannot sit on an open through-slot side.
  if (p.throughSlots && p.labelSides !== "none") {
    const wantL = p.labelSides === "left" || p.labelSides === "both";
    const wantR = p.labelSides === "right" || p.labelSides === "both";
    const ef = effective(p); // a rail decides its own open side
    const L = wantL && !ef.openLeft, R = wantR && !ef.openRight;
    p.labelSides = L && R ? "both" : L ? "left" : R ? "right" : "none";
  }

  // 3. Slot fins must stay printable: spacing follows slot thickness.
  const finMin = p.slotThickness + MIN_FIN + Math.max(0, Math.abs(p.spacingTaper) * (p.slots / 2));
  if (changed.has("slotThickness") || changed.has("spacingTaper") || changed.has("slots")) p.spacing = Math.max(p.spacing, Math.ceil(finMin * 2) / 2);

  // 4. Edge sizes cannot exceed what the rack can carry.
  const maxEdge = Math.max(0.5, Math.min(p.frontHeight * 0.5, p.sideWall * 2 + 4, 8));
  for (const e of [p.topEdge, p.bottomEdge, p.cornerEdge]) if (e.style !== "none") e.size = Math.min(Math.max(e.size, 0.5), maxEdge);

  // 5. A sloped ceiling pokes through a cross-sloped ramp when the slab is thin: use the stepped one.
  if (p.nest && p.sideSlope && p.ceiling === "sloped" && stateErrors(p).some((t) => /roof is only/.test(t))) p.ceiling = "stepped";

  // 6. Fit the footprint: raise the front until floors clear the base, then deepen until the walls hold.
  p.frontHeight = autoFrontHeight(p);
  p.depth = Math.max(p.depth, autoDepth(effective(p)));

  // 7. Rack-O details depend on the final shape: sawtooth no deeper than the slab and fin allow, slot ends within 3 mm,
  //    and a flange that still fits the 180 mm bed.
  const ef = effective(p);
  if (p.sawtooth > 0) {
    const max = Math.floor(maxSawtooth(ef, derive(ef).minGap) * 2) / 2;
    p.sawtooth = Math.min(p.sawtooth, max);
  }
  if (p.slotEndRadius > 0) p.slotEndRadius = Math.min(Math.max(p.slotEndRadius, 0), 3);
  if (p.flange > 0) {
    const room = Math.floor(Math.min(180 - ef.width, 180 - ef.depth) / 2);
    p.flange = Math.max(0, Math.min(p.flange, room));
  }
  // A grip rim stands on the flange: asking for a rim brings a flange, shrinking the flange takes the rim away, and it
  // never rises above the nesting step.
  if (p.rim > 0) {
    if (p.flange < RIM_MIN_FLANGE && !changed.has("flange")) {
      const room = Math.floor(Math.min(180 - ef.width, 180 - ef.depth) / 2);
      p.flange = Math.max(p.flange, Math.min(RIM_MIN_FLANGE, room));
    }
    if (p.flange < RIM_MIN_FLANGE) p.rim = 0;
    else if (p.nest) p.rim = Math.max(0, Math.min(p.rim, Math.floor(derive(ef).stackRise - 0.5 - p.flangeThickness)));
  }
  return p;
}

/** What else moved, in plain words (only things the user did not touch). */
function adjustNote(prev: RackParams, next: RackParams, changed: ReadonlySet<string>): string | null {
  const parts: string[] = [];
  for (const k of Object.keys(FRIENDLY) as (keyof RackParams)[]) {
    if (changed.has(k)) continue;
    const a = JSON.stringify(prev[k]), b = JSON.stringify(next[k]);
    if (a === b) continue;
    const label = FRIENDLY[k]!;
    if (typeof prev[k] === "number" && typeof next[k] === "number") parts.push(`${label} ${prev[k]} → ${next[k]}`);
    else parts.push(`${label} changed`);
  }
  return parts.length ? `Also adjusted: ${parts.join(", ")}.` : null;
}

/** Try a change. Returns the new state, or the old state plus the reason it was held. */
export function accept(prev: RackParams, patch: Patch, api?: ManifoldToplevel | null): Outcome {
  const changed = new Set(Object.keys(patch));
  let next = repair({ ...prev, ...patch }, changed);
  // More (or fewer) slots lengthen the rack and flatten the ramp, hiding more of each card: keep the index as readable
  // as it was by raising the height (never above the printer, never lowering the user's height).
  if (changed.has("slots") && !changed.has("height")) {
    const before = derive(effective(prev)).exposure;
    const now = derive(effective(next)).exposure;
    if (before >= 8 && now < before - 0.2) {
      const h = Math.ceil(solveHeightForExposure(effective(next), before));
      if (h > next.height) {
        const taller = repair({ ...next, height: h }, new Set(["height"]));
        if (stateErrors(taller).length === 0) next = taller;
      }
    }
  }
  const errs = stateErrors(next);
  if (errs.length) return { ok: false, params: prev, note: `Held: ${errs[0]}` };
  if (api) {
    const sound = scoped(() => {
      const m = buildRack(api, effective(next));
      return m.status() === "NoError" && !m.isEmpty() && pieceCount(m) === 1;
    });
    if (!sound) return { ok: false, params: prev, note: "Held: that combination would split the rack into separate pieces." };
  }
  return { ok: true, params: next, note: adjustNote(prev, next, changed) };
}

/** Largest interval around the current value where `makePatch(v)` is accepted (bisection; feasibility is contiguous). */
export function feasibleInterval(
  raw: RackParams, makePatch: (v: number) => Patch, read: (p: RackParams) => number, cur: number, min: number, max: number, step: number,
): { min: number; max: number } {
  // A value only counts if it sticks: repair may quietly push a too-low depth back up, and that is a stop, not a free move.
  const ok = (v: number) => { const r = accept(raw, makePatch(v)); return r.ok && Math.abs(read(r.params) - v) <= step * 0.51; };
  const snap = (v: number) => Math.round(v / step) * step;
  const edge = (from: number, to: number): number => {
    if (ok(to)) return to;
    let good = from, bad = to;
    while (Math.abs(bad - good) > step * 1.01) {
      const mid = snap((good + bad) / 2);
      if (mid === good || mid === bad) break;
      if (ok(mid)) good = mid; else bad = mid;
    }
    return good;
  };
  if (!ok(cur)) return { min: cur, max: cur };
  return { min: edge(cur, min), max: edge(cur, max) };
}

/** Why a toggle cannot be flipped right now, or null if it can. */
export function toggleBlocked(raw: RackParams, patch: Patch): string | null {
  const r = accept(raw, patch);
  return r.ok ? null : r.note;
}

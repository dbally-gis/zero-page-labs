// Parameters, derived values and validation for the rack. Units: mm, degrees.
// Axes: X = width, Y = depth (front 0 -> back), Z = up.
import { wordmarkLayout } from "./frontWordmark";

export type EdgeStyle = "none" | "chamfer" | "fillet";
export interface EdgeSpec {
  style: EdgeStyle;
  size: number;
}
export type CeilingStyle = "stepped" | "sloped";
export type LabelSides = "none" | "left" | "right" | "both";
export type NarrowAlign = "center" | "left" | "right";
export type CardPreset = "bridge" | "poker" | "mini" | "custom";

export const CARD_PRESETS: Record<Exclude<CardPreset, "custom">, { label: string; w: number; h: number }> = {
  bridge: { label: "Bridge 57 x 89", w: 57, h: 89 },
  poker: { label: "Poker 63.5 x 88.9", w: 63.5, h: 88.9 },
  mini: { label: "Mini 41 x 63", w: 41, h: 63 },
};

export interface RackParams {
  slots: number;
  width: number; // outer X at the base
  autoWidth: boolean; // derive width from the card size, height and draft so the slot always fits
  narrow: boolean; // rack narrower than the card: cards overhang both sides (forces both sides open)
  narrowPercent: number; // narrow racks: width at the top as % of the card (centred), or the % of the card a rail guides
  narrowAlign: NarrowAlign; // centred (both sides open) or a connected left / right rail (one closed side, card overhangs the other)
  depth: number; // outer Y (footprint at the base)
  height: number; // ramp surface height at the back edge (average of left and right when side slope is on)
  sideSlope: boolean; // ramp also tilts left to right
  sideDelta: number; // right back-corner height minus left (mm); only used when sideSlope
  spacing: number; // mean slot-to-slot distance along Y
  spacingTaper: number; // change in gap per slot, front to back (mm)
  frontHeight: number; // ramp surface height at the front edge
  lean: number; // card lean-back angle
  slotThickness: number;
  slotDepth: number; // card seating depth measured along the lean
  slotLeadIn: number; // 45 degree funnel size at slot mouth
  sideWall: number; // wall beside the slot ends
  openLeft: boolean; // slots run out through the left side so cards slide out
  openRight: boolean;
  sawtooth: number; // mm: each fin top is cut down by this much at one slot wall and rises back to the ramp (0 = flat ramp)
  sawtoothFlip: boolean; // false: teeth rise toward the back and drop at the slot wall behind them (like a Rack-O); true: the reverse
  slotEndRadius: number; // mm: rounded closed end of each slot; larger than half the slot thickness gives a relief hole (0 = square)
  flange: number; // mm: flat rim around the base, outside the shell (0 = none)
  flangeThickness: number;
  rim: number; // mm: grip rim standing above the flange on the closed sides, front and back (0 = none)
  throughSlots: boolean; // slots cut right through the rack: cards pass into the hollow underside and rest on the table
  lipGap: number; // slot thickness in the last lipLength mm at an open end (0 = no lip)
  lipLength: number;
  labelSides: LabelSides; // engrave slot numbers on the side faces
  labelStep: number; // number printed for slot i is (i + 1) * labelStep
  labelHeight: number;
  playerLabel: number; // engrave this number on the front face, or back with a wordmark (0 = none)
  frontWordmark: boolean; // raised COME AT ME! wordmark
  floor: number; // solid under each slot floor
  draft: number; // outer wall taper from vertical (enables nesting)
  nest: boolean; // hollow underside so racks stack
  wall: number; // shell wall thickness when nesting
  nestClearance: number;
  ceiling: CeilingStyle;
  topEdge: EdgeSpec;
  bottomEdge: EdgeSpec;
  cornerEdge: EdgeSpec;
  cardPreset: CardPreset;
  cardWidth: number;
  cardHeight: number;
}

export const DEFAULTS: RackParams = {
  slots: 8,
  width: 86,
  autoWidth: true,
  narrow: false,
  narrowPercent: 50,
  narrowAlign: "center",
  depth: 118,
  height: 70,
  sideSlope: false,
  sideDelta: 0,
  spacing: 13,
  spacingTaper: 0,
  frontHeight: 16,
  lean: 15,
  slotThickness: 1.4,
  slotDepth: 14,
  slotLeadIn: 1,
  sideWall: 3,
  openLeft: false,
  openRight: false,
  sawtooth: 0,
  sawtoothFlip: false,
  slotEndRadius: 0,
  flange: 0,
  flangeThickness: 1.2,
  rim: 0,
  throughSlots: false,
  lipGap: 0.8,
  lipLength: 6,
  labelSides: "none",
  labelStep: 5,
  labelHeight: 4,
  playerLabel: 0,
  frontWordmark: false,
  floor: 2.5,
  draft: 8,
  nest: true,
  wall: 2.4,
  nestClearance: 0.4,
  ceiling: "stepped",
  topEdge: { style: "chamfer", size: 1.5 },
  bottomEdge: { style: "chamfer", size: 1 },
  cornerEdge: { style: "fillet", size: 3 },
  cardPreset: "bridge",
  cardWidth: 57,
  cardHeight: 89,
};

export const PLAYER_LABEL_H = 7;
export const NUDGE = 8; // mm a card is assumed to be knocked off-centre when judging margin
export const MAX_HEIGHT = 180; // A1 mini build height
export const MIN_WALL = 2.5; // minimum material between a slot and the outside
export const MIN_FIN = 2.5; // mm of fin between slots (3 perimeters plus margin for the sawtooth and slot ends)

const rad = (d: number) => (d * Math.PI) / 180;

export interface Derived {
  t: number; // tan(draft)
  s: number; // ramp slope (rise / run)
  rampDeg: number;
  yFrontTop: number; // where the ramp meets the drafted front face
  yBackTop: number;
  slotYs: number[]; // slot axis position on the ramp surface
  minGap: number; // smallest slot-to-slot gap
  floorZ0: number; // lowest point of the first slot floor
  slotWidth: number;
  sideInset: number; // distance from the base edge to the slot end on a closed side
  topWidth: number; // body width at the highest point
  tsv: number; // vertical thickness of solid under the ramp (slot depth + floor)
  stackRise: number; // vertical offset between nested racks
  exposure: number; // visible card length above the card in front
  stepWidth: number;
  frontMargin: number; // material between first slot and the front face
  backMargin: number;
  supportWidth: number; // slot floor length under the highest slot
  c: number; // cross slope (rise per mm, left to right)
  crossDeg: number;
  heightLeft: number; // back-left top corner
  heightRight: number;
  lowSideDepth: number; // slot depth at the lower side of the ramp (= slotDepth, measured there)
  slotDepths: number[]; // centre-line depth of each slot: deeper than slotDepth by the ramp drop across the low half
  tipDeg: number | null; // sideways tip-over angle of a CENTRED card; null when end walls hold it
  tipNudgedDeg: number | null; // same, with the card shifted NUDGE mm toward the weaker edge
  cardX: number; // x of the card centre: centred, or pushed against the closed side of a rail
  guidePct: number; // share of the card's width that the slot guides at the highest slot (1 = fully enclosed)
}

/** Highest point of the body. */
export const maxHeight = (p: RackParams) => p.height + (p.sideSlope ? Math.abs(p.sideDelta) / 2 : 0);

/**
 * Ramp plane z = hf + s*y + c*(x - W/2). `height` +- sideDelta/2 are the true back-left / back-right
 * top corners, where the plane meets the drafted back and side faces; iterate because the faces lean.
 */
export function solveRamp(p: RackParams): { s: number; c: number } {
  const t = Math.tan(rad(p.draft));
  const dl = p.sideSlope ? p.sideDelta : 0;
  const hl = p.height - dl / 2, hr = p.height + dl / 2;
  let s = (p.height - p.frontHeight) / (p.depth - t * p.height), c = 0;
  for (let i = 0; i < 60; i++) {
    c = ((hr - hl) * (1 + t * s)) / (p.width - t * (hr + hl));
    s = (hl - p.frontHeight + c * (p.width / 2 - hl * t)) / (p.depth - hl * t);
  }
  return { s, c };
}

export interface CeilingCell { iy: number; ix: number; x0: number; x1: number; y0: number; y1: number; z: number; maxRamp: number }

/** Flat-topped cavity cells under the ramp (print without supports); also drives the nesting rise. */
export function ceilingCells(p: RackParams, s: number, c: number, tsv: number): CeilingCell[] {
  const step = p.spacing;
  const nx = Math.abs(c) < 1e-6 ? 1 : Math.min(12, Math.max(1, Math.ceil((Math.abs(c) * p.width) / 4)));
  const out: CeilingCell[] = [];
  let iy = 0;
  for (let y = 0; y < p.depth - p.wall - 0.5; y += step, iy++) {
    for (let i = 0; i < nx; i++) {
      const x0 = nx === 1 ? -1 : i === 0 ? -1 : (i * p.width) / nx;
      const x1 = nx === 1 ? p.width + 1 : i === nx - 1 ? p.width + 1 : ((i + 1) * p.width) / nx;
      const xa = Math.max(x0, 0) - p.width / 2, xb = Math.min(x1, p.width) - p.width / 2;
      const lo = Math.min(c * xa, c * xb), hi = Math.max(c * xa, c * xb);
      const centerLo = p.frontHeight + s * y;
      out.push({ iy, ix: i, x0, x1, y0: y, y1: y + step, z: Math.min(centerLo + lo, centerLo) - tsv, maxRamp: p.frontHeight + s * (y + step) + hi });
    }
  }
  return out;
}


/** Outer footprint including the flange. */
export const RIM_T = 1.6; // rim wall thickness (4 perimeters)
export const RIM_MIN_FLANGE = 4; // flange needed to carry a rim

export const footprint = (p: RackParams) => ({ w: p.width + 2 * p.flange, d: p.depth + 2 * p.flange });

/** The rounded end radius actually cut: 0 when off, never smaller than half the slot thickness. */
export const endRadius = (p: RackParams) => (p.slotEndRadius > 0 ? Math.max(p.slotEndRadius, p.slotThickness / 2) : 0);

/** Length (along y) of the sloped top of one sawtooth, for amplitude `a`, between the slot walls either side. */
export function sawLength(p: RackParams, minGap: number, a = p.sawtooth): number {
  const L = rad(p.lean);
  return minGap - p.slotThickness / Math.cos(L) + 0.6 + a * Math.tan(L);
}

/** Largest sawtooth that keeps the slab thick enough and the tooth long enough. */
export function maxSawtooth(p: RackParams, minGap: number): number {
  const slab = p.throughSlots ? p.slotDepth - 4 : p.slotDepth - 6; // what is left at the low edge
  return Math.max(0, Math.min(6, slab, 0.6 * sawLength(p, minGap, 0)));
}

const d_t = (t: number, z: number) => t * z; // inward lean of a drafted side face at height z

export function derive(p: RackParams): Derived {
  const t = Math.tan(rad(p.draft));
  // `height` is the true highest point of the body: the ramp meets the drafted back face there.
  const { s, c } = solveRamp(p);
  const hMax = maxHeight(p);
  const yFrontTop = (t * p.frontHeight) / (1 - t * s);
  const yBackTop = (p.depth - t * p.frontHeight) / (1 + t * s);
  const mid = (yFrontTop + yBackTop) / 2;
  const gaps = Array.from({ length: Math.max(p.slots - 1, 0) }, (_, i) => p.spacing + p.spacingTaper * (i - (p.slots - 2) / 2));
  const rel = [0];
  for (const g of gaps) rel.push(rel[rel.length - 1] + g);
  const span = rel[rel.length - 1];
  const slotYs = rel.map((r) => mid + r - span / 2);
  const minGap = gaps.length ? Math.min(...gaps) : p.spacing;
  const L = rad(p.lean);
  // The drafted side faces lean inward, so the slot ends are set from the narrowest point (the top).
  const sideInset = p.sideWall + t * hMax;
  // `slotDepth` is the depth at the LOW side of a sloped ramp. Cards stay upright and level, so the slot floor is
  // level and each slot's centre line is deeper by the ramp drop across the low half (to the slot end, or to the
  // outer face when that side is open).
  const lowOpen = c > 0 ? p.openLeft : c < 0 ? p.openRight : false;
  const slotDepths = slotYs.map((y) => {
    // Through-slots: the card runs down the axis to the table, so its depth is the axis length from the ramp to z = 0.
    if (p.throughSlots) return (p.frontHeight + s * y) / Math.cos(L);
    if (!p.sideSlope) return p.slotDepth;
    const z = p.frontHeight + s * y;
    const halfLow = lowOpen ? p.width / 2 - t * z : p.width / 2 - sideInset;
    // The slot axis climbs at cos(lean) while the ramp also rises front to back (s), so the axis meets the lower
    // ramp edge cos(lean) - s*sin(lean) per mm of drop.
    return p.slotDepth + (Math.abs(c) * Math.max(halfLow, 0)) / (Math.cos(L) - s * Math.sin(L));
  });
  // Slab under the ramp: slot depth + floor when slots have floors; with through-slots there is no floor and
  // `slotDepth` is just the slab (guide) thickness.
  const tsv = p.throughSlots ? p.slotDepth : Math.max(...slotDepths, p.slotDepth) + p.floor;
  const stepWidth = p.spacing;
  const wallRise = (p.wall + p.nestClearance) / Math.max(t, 1e-6);
  const ceilRise = p.ceiling === "stepped"
    ? Math.max(...ceilingCells(p, s, c, tsv).map((cell) => cell.maxRamp - Math.max(cell.z, 0))) + p.nestClearance
    : tsv + Math.abs(c) * (p.width / 2) + p.nestClearance; // level roof, ramp higher on one side by up to |c| W/2
  const stackRise = Math.max(wallRise, ceilRise) + 0.2;
  const exposure = minGap * (Math.sin(L) + s * Math.cos(L));

  // Slot cut extremes in local (y,z) -> world offsets (see rack.ts for the rotation).
  const hw = p.slotThickness / 2;
  const frontOf = (depth: number) => ({ y: -hw * Math.cos(L) - depth * Math.sin(L), z: hw * Math.sin(L) - depth * Math.cos(L) });
  const front = frontOf(slotDepths[0]); // slot 1 (the front-most, usually the deepest bite into the front wall)
  const lead = p.slotLeadIn;
  const half = hw / Math.cos(L) + lead; // lead-in extent on the ramp surface
  const y0 = slotYs[0];
  const z0 = p.frontHeight + s * y0;
  const yN = slotYs[slotYs.length - 1];
  const zN = p.frontHeight + s * yN;
  const frontMargin = y0 + front.y - t * (z0 + front.z);
  const zNmax = zN + Math.abs(c) * (p.width / 2 - t * zN); // ramp is higher on one side
  const backMargin = p.depth - t * (zNmax + s * half) - (yN + half);
  const lowSideDepth = p.slotDepth * Math.cos(L);
  // In-plane tip-over: a card pivots on the edge of the slot floor under it. dist = horizontal distance
  // from the card's centre of mass to the nearest support edge it is free to pivot on.
  const zf = zN + frontOf(slotDepths[slotDepths.length - 1]).z; // lowest point of the highest slot floor (the narrowest support)
  const xL = p.openLeft ? d_t(t, zf) : sideInset;
  const xR = p.openRight ? p.width - d_t(t, zf) : p.width - sideInset;
  const supportWidth = xR - xL;
  // A rail rack is narrower than the card: the card sits against the closed side and overhangs the open one.
  const railSide = p.narrow ? p.narrowAlign : "center";
  const cardX = railSide === "left" ? sideInset + 0.3 + p.cardWidth / 2
    : railSide === "right" ? p.width - sideInset - 0.3 - p.cardWidth / 2
    : p.width / 2;
  // How much of the card the slot actually guides, measured at the highest (narrowest) slot.
  const spans = slotYs.map((y) => {
    const z = p.frontHeight + s * y;
    const xa = p.openLeft ? d_t(t, z) : sideInset;
    const xb = p.openRight ? p.width - d_t(t, z) : p.width - sideInset;
    return xb - xa;
  });
  const guidePct = p.openLeft || p.openRight ? Math.min(1, Math.min(...spans) / p.cardWidth) : 1;
  let tipDeg: number | null = null;
  let tipNudgedDeg: number | null = null;
  if (!p.throughSlots && (p.openLeft || p.openRight)) { // through-slots: the card stands on the table, nothing to tip over
    const dist = p.openLeft && p.openRight
      ? Math.min(supportWidth, p.cardWidth) / 2
      : Math.min(supportWidth - p.cardWidth / 2, p.cardWidth / 2); // card rests against the closed end wall
    // Rolling sideways about the front-back axis through the support edge: lateral arm `dist`,
    // centre of mass (cardHeight/2 * cos lean) above the floor. Assumes a rigid card, no friction, no lip.
    const hCom = (p.cardHeight / 2) * Math.cos(L);
    tipDeg = (Math.atan2(dist, hCom) * 180) / Math.PI;
    tipNudgedDeg = (Math.atan2(dist - NUDGE, hCom) * 180) / Math.PI;
  }
  return {
    t, s, rampDeg: (Math.atan(s) * 180) / Math.PI, yFrontTop, yBackTop, slotYs, minGap, floorZ0: p.throughSlots ? 0 : z0 + front.z,
    sideInset, topWidth: p.width - 2 * t * hMax, c, crossDeg: (Math.atan(c) * 180) / Math.PI, heightLeft: p.height - (p.sideSlope ? p.sideDelta : 0) / 2, heightRight: p.height + (p.sideSlope ? p.sideDelta : 0) / 2, lowSideDepth, slotDepths,
    slotWidth: p.width - (p.openLeft ? 0 : sideInset) - (p.openRight ? 0 : sideInset), tsv, stackRise, exposure, stepWidth, frontMargin, backMargin, supportWidth, tipDeg, tipNudgedDeg, cardX, guidePct,
  };
}

export interface Warning {
  level: "error" | "warn";
  text: string;
}

export function validate(p: RackParams): Warning[] {
  const d = derive(p);
  const w: Warning[] = [];
  const edgeCut = (e: EdgeSpec) => (e.style === "none" ? 0 : e.size);
  if (p.frontWordmark && !wordmarkLayout(p, d))
    w.push({ level: "error", text: "The COME AT ME! wordmark needs more clear space on the front face." });
  if (p.slots < 1 || p.slots > 30) w.push({ level: "error", text: "Slots must be 1-30." });
  if (p.height <= p.frontHeight) w.push({ level: "error", text: "Height must exceed the front height (ramp must rise)." });
  if (d.minGap < p.slotThickness + MIN_FIN)
    w.push({ level: "error", text: `Closest slots are ${d.minGap.toFixed(1)} mm apart: fins thinner than ${MIN_FIN} mm. Use at least ${(p.slotThickness + MIN_FIN).toFixed(1)}.` });
  if ((p.openLeft || p.openRight) && p.lipGap > 0) {
    if (p.lipGap >= p.slotThickness) w.push({ level: "warn", text: "End lip gap is not thinner than the slot, so it holds nothing." });
    else if (p.lipGap < 0.45) w.push({ level: "warn", text: `End lip gap ${p.lipGap} mm is close to a card's thickness; cards may jam.` });
  }
  if (p.labelSides !== "none") {
    const top = 1.5 + p.labelHeight;
    if (p.throughSlots) {
      // An open through-slot runs the full height of that side face, so numbers there would be cut by every slot.
      const onLeft = p.labelSides === "left" || p.labelSides === "both";
      const onRight = p.labelSides === "right" || p.labelSides === "both";
      if ((onLeft && p.openLeft) || (onRight && p.openRight))
        w.push({ level: "error", text: "Slot numbers cross the open through-slots on that side; put them on the closed side." });
    } else if ((p.openLeft || p.openRight) && top + 1.5 > d.floorZ0)
      w.push({ level: "error", text: `Slot numbers (${top.toFixed(1)} mm up) collide with the open slot floors at ${d.floorZ0.toFixed(1)} mm. Reduce label height or raise the front.` });
    const low0 = p.frontHeight + d.s * d.slotYs[0] - Math.abs(d.c) * (p.width / 2 - d.t * p.frontHeight); // low side of slot 1
    if (low0 < top + 1.5)
      w.push({ level: "error", text: "Rack is too low at the first slot (on its low side) to engrave slot numbers." });
  }
  if (p.playerLabel > 0 && p.frontHeight + d.s * d.yFrontTop < PLAYER_LABEL_H + 3)
    w.push({ level: "error", text: `Front face is too low for the ${PLAYER_LABEL_H} mm player number; raise front height.` });
  if (p.openLeft || p.openRight) {
    if (d.tipDeg !== null && d.tipDeg < 3)
      w.push({ level: "error", text: `Card is not held: the support under the back slots is ${d.supportWidth.toFixed(1)} mm, so the card's weight sits past the edge (tip angle ${d.tipDeg.toFixed(1)}°). Widen the rack or close a side.` });
    else if (d.tipDeg !== null && d.tipDeg < 15)
      w.push({ level: "warn", text: `Marginal: a centred card tips over sideways at ${d.tipDeg.toFixed(0)}° (support ${d.supportWidth.toFixed(0)} mm), ${Math.max(d.tipNudgedDeg ?? 0, 0).toFixed(0)}° if knocked ${NUDGE} mm off-centre. Static estimate only (no friction or lip). Widen the rack for more margin.` });
  }
  if (p.openLeft !== p.openRight && !p.narrow && p.width < p.cardWidth + 2 * d.sideInset + 0.5)
    w.push({ level: "error", text: `The closed end wall would hit the ${p.cardWidth} mm card (need width >= ${(p.cardWidth + 2 * d.sideInset + 0.5).toFixed(1)}).` });
  if (p.sawtoothFlip && p.sawtooth > 0 && p.slotEndRadius > 0)
    w.push({ level: "error", text: "Rounded slot ends need the standard sawtooth direction (turn off the flip, or set the end radius to 0)." });
  if (!(p.openLeft || p.openRight) && d.slotWidth < p.cardWidth + 0.5)
    w.push({ level: "error", text: `Slot width ${d.slotWidth.toFixed(1)} mm is too narrow for a ${p.cardWidth} mm card (need width >= ${(p.cardWidth + 0.5 + 2 * d.sideInset).toFixed(1)}).` });
  if (d.frontMargin - edgeCut(p.topEdge) < MIN_WALL)
    w.push({ level: "error", text: `Front wall too thin (${d.frontMargin.toFixed(1)} mm). Increase depth (try ${autoDepth(p)} mm).` });
  if (d.backMargin - edgeCut(p.topEdge) < MIN_WALL)
    w.push({ level: "error", text: `Back wall too thin (${d.backMargin.toFixed(1)} mm). Increase depth (try ${autoDepth(p)} mm).` });
  for (const [name, e] of [["Ramp", p.topEdge], ["Base", p.bottomEdge], ["Corner", p.cornerEdge]] as const)
    if (e.style !== "none" && e.size > Math.min(p.frontHeight * 0.5, p.sideWall * 2 + 4, 8))
      w.push({ level: "error", text: `${name} edge size ${e.size} mm is too large for this rack (max ${Math.min(p.frontHeight * 0.5, p.sideWall * 2 + 4, 8).toFixed(1)} mm).` });
  // A level (sloped-ceiling) roof sits tsv under the CENTRE-line ramp; on a cross slope the low side of the ramp drops
  // by |c| * half-span, so a thin slab lets the roof poke through the ramp and strands loose pieces.
  if (p.nest && p.ceiling === "sloped" && p.sideSlope) {
    const lowSlab = d.tsv - Math.abs(d.c) * (p.width / 2 - d.t * p.frontHeight);
    if (lowSlab < 2.5)
      w.push({ level: "error", text: `With a sloped ceiling the roof is only ${Math.max(lowSlab, 0).toFixed(1)} mm below the ramp on the low side (need 2.5). Use the stepped ceiling, a thicker slab or a gentler slope.` });
  }
  if (p.throughSlots) {
    if (p.slotDepth < 4) w.push({ level: "error", text: `A ${p.slotDepth} mm slab gives the card no guidance (need at least 4 mm; 8 or more is better).` });
    // Strips hang from the closed side wall (or bridge between two walls) over the hollow underside.
    const zN = p.frontHeight + d.s * d.slotYs[d.slotYs.length - 1];
    const span = p.width - d.sideInset - (p.openLeft || p.openRight ? d.t * zN : d.sideInset);
    if (span / Math.max(p.slotDepth, 1) > 8)
      w.push({ level: "warn", text: `Each slab strip spans ${span.toFixed(0)} mm but is only ${p.slotDepth} mm thick; it may sag or break. Thicken the slab or narrow the rack.` });
  }
  if (p.draft < 2) w.push({ level: "error", text: "Draft below 2 degrees: racks cannot nest." });
  if (p.narrow && p.narrowAlign !== "center") {
    if (d.guidePct < 0.15)
      w.push({ level: "error", text: `The rail would guide only ${(d.guidePct * 100).toFixed(0)}% of the card; the card would not stay in the slot. Use a wider rail.` });
    else if (d.guidePct < 0.3)
      w.push({ level: "warn", text: `The rail guides only ${(d.guidePct * 100).toFixed(0)}% of the card's width, so expect it to wobble or twist. 50% or more is steadier.` });
  }
  if (p.sawtooth > 0 && p.sawtooth > maxSawtooth(p, d.minGap) + 1e-9)
    w.push({ level: "error", text: `A ${p.sawtooth} mm sawtooth leaves too little slab or fin (max ${maxSawtooth(p, d.minGap).toFixed(1)} mm for these slots).` });
  if (p.slotEndRadius > 0 && endRadius(p) > 3)
    w.push({ level: "error", text: `Rounded slot ends are limited to 3 mm (slot thickness ${p.slotThickness} mm needs at least ${(p.slotThickness / 2).toFixed(2)}).` });
  if (p.rim > 0) {
    if (p.flange < RIM_MIN_FLANGE) w.push({ level: "error", text: `A grip rim needs a base flange of at least ${RIM_MIN_FLANGE} mm to stand on.` });
    if (p.nest && p.flangeThickness + p.rim > d.stackRise - 0.5)
      w.push({ level: "error", text: `The rim (${(p.flangeThickness + p.rim).toFixed(1)} mm above the base) is taller than the nesting step (${d.stackRise.toFixed(1)} mm), so racks could not nest. Lower the rim.` });
  }
  if (p.flange < 0 || p.flange > 15) w.push({ level: "error", text: "Flange must be 0 to 15 mm." });
  if (p.throughSlots && p.openLeft && p.openRight)
    w.push({ level: "error", text: `Through-slots need one closed side wall: with both sides open the slots cut the rack into ${p.slots + 1} separate pieces.${p.narrow ? " Narrow mode opens both sides; turn it off or turn through-slots off." : " Close the left or right side."}` });
  if (!p.throughSlots && d.floorZ0 < p.floor)
    w.push({ level: "error", text: `The slot floors of the front slot would sit ${Math.max(d.floorZ0, 0).toFixed(1)} mm above the base (need ${p.floor}). ${p.sideSlope ? "A sloped rack makes the slots deeper at the centre line; " : ""}raise the front height or reduce the ${p.sideSlope ? "slope or " : ""}slot depth.` });
  if (p.sideSlope) {
    const lowSide = Math.min(d.heightLeft, d.heightRight);
    if (lowSide <= p.frontHeight + 1)
      w.push({ level: "error", text: `The lower side (${lowSide.toFixed(0)} mm) must stay above the front height (${p.frontHeight} mm) so the ramp still rises.` });
    const lowFront = p.frontHeight - Math.abs(d.c) * (p.width / 2 - d.t * p.frontHeight);
    if (lowFront < 4)
      w.push({ level: "error", text: `The ramp would be only ${Math.max(lowFront, 0).toFixed(1)} mm tall at the low front corner (need 4). Raise the front height or reduce the slope.` });
  }
  if (d.topWidth < 8) w.push({ level: "error", text: `The rack is only ${d.topWidth.toFixed(1)} mm wide at the top; widen it or reduce the draft or height.` });
  if (p.nest && p.height - (p.sideSlope ? Math.abs(p.sideDelta) / 2 : 0) - 0.01 < d.tsv) w.push({ level: "warn", text: "Rack is too low to hollow out; it will print solid." });
  if (d.exposure < 8) w.push({ level: "warn", text: `Only ${d.exposure.toFixed(1)} mm of each card shows. Raise height, spacing, or lean for a readable index.` });
  if (p.slotDepth < 8) w.push({ level: "warn", text: p.throughSlots ? "Thin slab: the slots guide the card over less than 8 mm, so it may wobble." : "Shallow slots: cards may tip out." });
  return w;
}

/** Smallest depth (whole mm) that keeps front/back walls at MIN_WALL. Bisection: the margins only grow with depth. */
export function autoDepth(p: RackParams): number {
  const cut = (e: EdgeSpec) => (e.style === "none" ? 0 : e.size);
  const ok = (depth: number) => {
    const d = derive({ ...p, depth });
    return d.frontMargin - cut(p.topEdge) >= MIN_WALL && d.backMargin - cut(p.topEdge) >= MIN_WALL;
  };
  const start = Math.max(10, Math.ceil(p.slots * p.spacing * 0.5));
  if (ok(start)) return start;
  if (!ok(600)) return p.depth;
  let lo = start, hi = 600;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (ok(mid)) hi = mid; else lo = mid; }
  return hi;
}

/** Height (average, when side slope is on) at which the centre-line ramp angle equals `deg`. */
export function solveHeightForRamp(p: RackParams, deg: number): number {
  let lo = p.frontHeight + 0.5, hi = 400;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (derive({ ...p, height: mid }).rampDeg < deg) lo = mid; else hi = mid;
  }
  return hi;
}

/** Smallest height whose exposed card index (along the card) reaches `target` mm; capped at MAX_HEIGHT. */
export function solveHeightForExposure(p: RackParams, target: number): number {
  let lo = p.frontHeight + 0.5, hi = MAX_HEIGHT - (p.sideSlope ? Math.abs(p.sideDelta) / 2 : 0); // the high corner must stay on the bed
  if (derive({ ...p, height: hi }).exposure < target) return hi;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (derive({ ...p, height: mid }).exposure < target) lo = mid; else hi = mid;
  }
  return Math.round(hi * 10) / 10;
}

/** Base width that gives a slot 3 mm wider than the card, with `sideWall` kept at the narrow top. */
export function widthForCard(p: RackParams, cardWidth: number): number {
  const t = Math.tan(rad(p.draft));
  return Math.ceil(cardWidth + 3 + 2 * (p.sideWall + t * maxHeight(p)));
}

export function applyCardPreset(p: RackParams, preset: CardPreset): RackParams {
  if (preset === "custom") return { ...p, cardPreset: preset };
  const c = CARD_PRESETS[preset];
  const q = { ...p, cardPreset: preset, cardWidth: c.w, cardHeight: c.h };
  return p.autoWidth ? { ...q, width: widthForCard(q, c.w) } : q; // keep a manual width the user chose
}

/** Slope-off params carry no stray delta. */
const flat = (p: RackParams): RackParams => (p.sideSlope ? p : { ...p, sideDelta: 0 });

/** Params with the width resolved (auto-fit when enabled). Use this for everything downstream. */
/** A lip thinner than a card (0.35 mm) would block it outright, so anything under 0.4 mm means "no lip". */
export const MIN_LIP = 0.4;

export function effective(p: RackParams): RackParams {
  const q = effective0(p);
  return q.lipGap > 0 && q.lipGap < MIN_LIP ? { ...q, lipGap: 0 } : q;
}

function effective0(p: RackParams): RackParams {
  if (p.narrow) {
    const t = Math.tan(rad(p.draft));
    const q = flat(p);
    const rail = q.narrowAlign !== "center";
    // Centred: the rack is pct of the card wide at the top. Rail: pct is the share of the card the slot guides, so the
    // closed side wall is added to the width (the other side is open).
    const width = Math.ceil((q.cardWidth * q.narrowPercent) / 100 + (rail ? q.sideWall : 0) + 2 * t * maxHeight(q));
    return { ...q, openLeft: q.narrowAlign !== "left", openRight: q.narrowAlign !== "right", autoWidth: false, width };
  }
  const q = flat(p);
  return q.autoWidth ? { ...q, width: widthForCard(q, q.cardWidth) } : q;
}

/** Smallest front height (whole mm, never lowering it) that keeps the front slot floor above the base and the low front corner tall enough. */
export function autoFrontHeight(p: RackParams): number {
  const ok = (h: number) => {
    const q = effective({ ...p, frontHeight: h });
    const d = derive(q);
    const lowFront = q.frontHeight - Math.abs(d.c) * (q.width / 2 - d.t * q.frontHeight);
    return (q.throughSlots || d.floorZ0 >= q.floor + 0.5) && lowFront >= 4;
  };
  const lo0 = Math.ceil(p.frontHeight), hiMax = Math.min(Math.floor(p.height) - 2, 120);
  if (lo0 > hiMax) return p.frontHeight;
  if (ok(lo0)) return lo0;
  if (!ok(hiMax)) return p.frontHeight;
  let lo = lo0, hi = hiMax;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (ok(mid)) hi = mid; else lo = mid; }
  return hi;
}

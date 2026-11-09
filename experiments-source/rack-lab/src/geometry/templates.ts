// Curated starting points. Each is built through `repair`, so it is valid; tests build every one and check
// it is one piece, nests, seats its cards and stays valid under moves of every control.
import { DEFAULTS, applyCardPreset, effective, solveHeightForExposure, type RackParams } from "./params";
import { repair } from "./constraints";

export interface Template {
  id: string;
  name: string;
  blurb: string;
  params: RackParams;
}

const fit = (o: Partial<RackParams>): RackParams => repair({ ...DEFAULTS, ...o }, new Set(Object.keys(o)));
const withExposure = (o: Partial<RackParams>, mm: number): RackParams => {
  const base = fit(o);
  return fit({ ...o, height: Math.round(solveHeightForExposure(effective(base), mm)) });
};

export const TEMPLATES: Template[] = [
  { id: "come-at-me", name: "COME AT ME! — 8 slots", blurb: "Bridge cards, a raised front wordmark, and a nesting shell. Download the STL and slice flat on its base.", params: fit({ frontWordmark: true }) },
  { id: "classic", name: "Classic 8 — hollow, nests", blurb: "8 slots, bridge cards, closed ends. The safe default.", params: fit({}) },
  { id: "through", name: "Through slots (Rack-O style)", blurb: "Cards pass through to the table. One side closed. Needs supports when printing (+3 h).", params: fit({ throughSlots: true }) },
  { id: "through-slide", name: "Through slots, slide out left", blurb: "As above with the left side open and a light lip so cards slide out sideways.", params: fit({ throughSlots: true, openLeft: true, lipGap: 0.8 }) },
  { id: "slide-left", name: "Floored slots, slide out left", blurb: "Normal slot floors, left side open with a light lip. Prints without supports.", params: fit({ openLeft: true, lipGap: 0.8 }) },
  { id: "light50", name: "Light — half-width rack", blurb: "Rack 50% of the card width, cards overhang. About 45% less material.", params: fit({ narrow: true, narrowPercent: 50 }) },
  { id: "rail-left", name: "Left rail — cards on the table", blurb: "A narrow rail along the left. Cards pass through to the table and overhang to the right. The rail guides half the card; use the 25/50/75 buttons.", params: fit({ narrow: true, narrowAlign: "left", throughSlots: true, narrowPercent: 50, lipGap: 0 }) },
  { id: "rail-right", name: "Right rail — cards on the table", blurb: "Mirror of the left rail.", params: fit({ narrow: true, narrowAlign: "right", throughSlots: true, narrowPercent: 50, lipGap: 0 }) },
  { id: "rack-o", name: "Rack-O look", blurb: "Through slots with a numbered left rail, sawtooth fin tops, rounded slot ends a flat base flange and a raised grip rim, after the original.", params: fit({ throughSlots: true, openRight: true, lipGap: 0, labelSides: "left", labelStep: 5, sawtooth: 3, slotEndRadius: 1.2, flange: 5, rim: 6 }) },
  { id: "slope-right", name: "Sloped — high on the right", blurb: "Ramp rises left to right (10 mm). Cards stay upright.", params: fit({ sideSlope: true, sideDelta: 10 }) },
  { id: "slope-left", name: "Sloped — high on the left", blurb: "Mirror of the above for left-handed play.", params: fit({ sideSlope: true, sideDelta: -10 }) },
  { id: "numbered", name: "Slots numbered 1–8", blurb: "Engraved slot numbers 1 to 8 on both side walls, matching the rulebook.", params: fit({ labelSides: "both", labelStep: 1 }) },
  { id: "poker8", name: "Poker-size cards (63.5 × 88.9)", blurb: "8 slots sized for poker cards.", params: fit(applyCardPreset(DEFAULTS, "poker")) },
  { id: "compact6", name: "Compact — 6 slots", blurb: "Shorter rack and round; fits a small table.", params: fit({ slots: 6 }) },
  { id: "big10", name: "Big hand — 10 slots", blurb: "10 slots on a taller ramp so the card numbers stay readable.", params: withExposure({ slots: 10 }, 9.5) },
  { id: "kids", name: "Big numbers for small players", blurb: "Taller ramp showing 13 mm of each card.", params: withExposure({}, 13) },
];

export const templateById = (id: string): Template => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

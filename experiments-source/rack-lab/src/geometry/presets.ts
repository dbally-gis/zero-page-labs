import { applyCardPreset, DEFAULTS, type RackParams } from "./params";

export interface Preset {
  name: string;
  params: RackParams;
}

const FORMAT = "rack-lab-preset";

export function serializePreset(p: Preset): string {
  return JSON.stringify({ format: FORMAT, version: 1, name: p.name, params: p.params }, null, 2);
}

/** Validate an untrusted params object (file import or localStorage); throws on a bad value. */
export function sanitizeParams(input: unknown): RackParams {
  const src = input as Record<string, any>;
  if (typeof src !== "object" || src === null) throw new Error("params must be an object");
  const params: Record<string, unknown> = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS) as (keyof RackParams)[]) {
    const v = src[key];
    if (v === undefined) continue;
    const ref = DEFAULTS[key];
    if (typeof ref === "number") {
      if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(`Bad value for ${key}`);
      params[key] = v;
    } else if (typeof ref === "boolean") {
      if (typeof v !== "boolean") throw new Error(`Bad value for ${key}`);
      params[key] = v;
    } else if (typeof ref === "string") {
      if (typeof v !== "string") throw new Error(`Bad value for ${key}`);
      params[key] = v;
    } else {
      if (typeof v !== "object" || v === null || typeof v.size !== "number" || typeof v.style !== "string") throw new Error(`Bad value for ${key}`);
      params[key] = { style: v.style, size: v.size };
    }
  }
  return params as unknown as RackParams;
}

/** Parse and validate a preset file; unknown keys are dropped, missing keys take defaults. */
export function parsePreset(text: string): Preset {
  const raw = JSON.parse(text);
  if (raw?.format !== FORMAT || typeof raw.params !== "object" || raw.params === null)
    throw new Error("Not a Rack Lab preset file.");
  return { name: typeof raw.name === "string" && raw.name ? raw.name : "Imported", params: sanitizeParams(raw.params) };
}

export const BUILT_IN_PRESETS: Preset[] = [
  { name: "Bridge cards, 8 slots", params: DEFAULTS },
  { name: "Poker cards, 8 slots", params: applyCardPreset({ ...DEFAULTS, depth: 118 }, "poker") },
  { name: "Mini cards, 6 slots", params: { ...applyCardPreset({ ...DEFAULTS, slots: 6, depth: 92, height: 56, spacing: 12 }, "mini") } },
  { name: "Open right, numbered", params: { ...DEFAULTS, openRight: true, labelSides: "left" as const } },
];

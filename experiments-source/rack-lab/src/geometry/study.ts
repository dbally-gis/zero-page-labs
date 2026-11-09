// Width study: build the same rack at several widths and report what narrowing costs and saves.
// All rows are hollow/nesting. The full row has closed ends and side walls, so its saving figure mixes
// two changes: narrowing AND removing the end walls.
import type { ManifoldToplevel } from "manifold-3d";
import { buildRack } from "./rack";
import { derive, effective, validate, type RackParams } from "./params";

export interface StudyRow {
  label: string;
  percent: number | null; // null = full width, closed ends
  width: number;
  topWidth: number;
  volume: number; // mm3
  savedPct: number;
  tipDeg: number | null;
  guidePct: number; // share of the card the slot guides (1 = enclosed)
  verdict: "holds" | "marginal" | "will not hold" | "invalid";
}

export const STUDY_PERCENTS = [75, 50, 25];

export function widthStudy(api: ManifoldToplevel, base: RackParams): StudyRow[] {
  const rows: StudyRow[] = [];
  const variants: { label: string; percent: number | null; p: RackParams }[] = [
    { label: "Full, closed ends", percent: null, p: { ...base, narrow: false, autoWidth: true, openLeft: false, openRight: false, nest: true } },
    ...STUDY_PERCENTS.map((pc) => ({ label: `${pc}% of card`, percent: pc, p: { ...base, narrow: true, narrowPercent: pc, nest: true } })),
  ];
  let full = 0;
  for (const v of variants) {
    const q = effective(v.p);
    const d = derive(q);
    const errs = validate(q).filter((w) => w.level === "error");
    const m = errs.length ? null : buildRack(api, q);
    const volume = m && m.status() === "NoError" ? m.volume() : 0;
    if (v.percent === null) full = volume;
    const verdict: StudyRow["verdict"] = !volume ? (d.tipDeg !== null && d.tipDeg < 3 ? "will not hold" : "invalid")
      : d.tipDeg === null ? (q.narrow && d.guidePct < 0.3 ? "marginal" : "holds") : d.tipDeg < 15 ? "marginal" : "holds";
    rows.push({
      label: v.label, percent: v.percent, width: q.width, topWidth: d.topWidth, volume,
      savedPct: full && volume ? (1 - volume / full) * 100 : 0, tipDeg: d.tipDeg, guidePct: d.guidePct, verdict,
    });
  }
  return rows;
}

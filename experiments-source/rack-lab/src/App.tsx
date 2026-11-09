import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ManifoldToplevel } from "manifold-3d";
import { freshEngine, isEngineCrash, loadEngine } from "./engine";
import { buildRack, pieceCount, toStl } from "./geometry/rack";
import { scoped } from "./geometry/memory";
import {
  CARD_PRESETS, MAX_HEIGHT, applyCardPreset, derive, effective, footprint, maxHeight, solveHeightForExposure, solveHeightForRamp, validate,
  type CardPreset, type CeilingStyle, type EdgeSpec, type EdgeStyle, type LabelSides, type RackParams,
} from "./geometry/params";
import {
  CONTROLS, accept, feasibleInterval, repair, stateErrors, toggleBlocked, type ControlKey, type Patch,
} from "./geometry/constraints";
import { TEMPLATES, templateById } from "./geometry/templates";
import { A1_MINI, arrangePlates, bedWarnings, buildPlates } from "./geometry/printer";
import { buildCoupon, buildRimCoupon, COUPON_THICKNESSES } from "./geometry/coupon";
import { widthStudy } from "./geometry/study";
import { makeZip } from "./geometry/zip";
import { parsePreset, sanitizeParams, serializePreset, type Preset } from "./geometry/presets";
import Viewer, { type MeshData, type ViewName } from "./Viewer";

const STORE = "rack-lab.params.v4";
const PRESET_STORE = "rack-lab.presets.v2";
// Print time per cm3 measured by slicing the default rack in Bambu Studio (12h31m / 175 cm3; fast 9h36m).
const HOURS_PER_CM3 = { standard: 0.0716, fast: 0.0549 };
const REBUILD_ENGINE_AFTER = 300; // builds; the engine's WASM heap only grows (see engine.ts)

/** A stored or imported design is only usable if it is reachable: repair it, and refuse it if it is still invalid. */
function usable(p: RackParams): RackParams | null {
  const r = repair(p, new Set());
  return stateErrors(r).length ? null : r;
}
function loadParams(): RackParams {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return usable(sanitizeParams(JSON.parse(raw))) ?? TEMPLATES[0].params;
  } catch { /* storage unavailable or corrupt: fall back to the first template */ }
  return TEMPLATES[0].params;
}
function loadPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(PRESET_STORE);
    if (raw) {
      return (JSON.parse(raw) as Preset[]).flatMap((x) => {
        const p = usable(sanitizeParams(x.params));
        return p ? [{ name: String(x.name), params: p }] : [];
      });
    }
  } catch { /* corrupt: start empty */ }
  return [];
}

function save(name: string, data: BlobPart, type: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ---------------------------------------------------------------- controls
type Interval = { min: number; max: number };
interface Ctl {
  raw: RackParams;
  ranges: Partial<Record<string, Interval>>;
  change: (patch: Patch) => void;
}
const CtlContext = createContext<Ctl | null>(null);
const useCtl = () => useContext(CtlContext)!;

/** A slider whose unreachable zones are greyed out and which stops at the edge of the reachable zone. */
function Slider({ value, min, max, step, feas, onSet }: { value: number; min: number; max: number; step: number; feas?: Interval; onSet: (v: number) => void }) {
  const lo = feas ? ((Math.max(feas.min, min) - min) / (max - min)) * 100 : 0;
  const hi = feas ? ((Math.min(feas.max, max) - min) / (max - min)) * 100 : 100;
  const set = (raw: string) => {
    let v = parseFloat(raw);
    if (!Number.isFinite(v)) return;
    if (feas) v = Math.min(Math.max(v, feas.min), feas.max); // hard stop
    onSet(v);
  };
  const style = { "--track": `linear-gradient(to right, var(--off) 0 ${lo}%, var(--accent) ${lo}% ${hi}%, var(--off) ${hi}% 100%)` } as React.CSSProperties;
  return (
    <>
      <input type="range" className="limited" style={style} min={min} max={max} step={step} value={value} onChange={(e) => set(e.target.value)} />
      <span className="field-num">
        <input type="number" min={feas ? Math.max(feas.min, min) : min} max={feas ? Math.min(feas.max, max) : max} step={step} value={value} onChange={(e) => set(e.target.value)} />
      </span>
    </>
  );
}

function Num({ k, label, unit = "mm", value, hint, round, rk }: { k: ControlKey; label: string; unit?: string; value?: number; hint?: string; round?: boolean; rk?: string }) {
  const { raw, ranges, change } = useCtl();
  const spec = CONTROLS[k];
  const v = value ?? (raw[k] as number);
  return (
    <label className="field" title={hint}>
      <span className="field-label">{label}</span>
      <Slider value={v} min={spec.min} max={spec.max} step={spec.step} feas={ranges[rk ?? k]} onSet={(x) => change({ [k]: round ? Math.round(x) : x } as Patch)} />
      <em>{unit}</em>
    </label>
  );
}

function Seg<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="edge-row">
      <span className="field-label">{label}</span>
      <div className="seg">
        {options.map((s) => <button key={s} className={value === s ? "on" : ""} onClick={() => onChange(s)}>{s}</button>)}
      </div>
    </div>
  );
}

/** A checkbox that disables itself, with the reason, when ticking or clearing it would make the rack impossible. */
function Check({ k, label, hint, patch }: { k: keyof RackParams; label: string; hint?: string; patch?: (on: boolean) => Patch }) {
  const { raw, change } = useCtl();
  const on = Boolean(raw[k]);
  const next = patch ? patch(!on) : ({ [k]: !on } as Patch);
  const blocked = useMemo(() => toggleBlocked(raw, next), [raw, on]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <label className={`check ${blocked ? "blocked" : ""}`} title={blocked ?? hint}>
      <input type="checkbox" checked={on} disabled={Boolean(blocked)} onChange={() => change(next)} /> {label}
      {blocked && <small className="why">{blocked.replace(/^Held: /, "")}</small>}
    </label>
  );
}

function Edge({ label, value, onChange }: { label: string; value: EdgeSpec; onChange: (e: EdgeSpec) => void }) {
  return (
    <div className="edge-row">
      <span className="field-label">{label}</span>
      <span className="field-num">
        <input type="number" min={0.5} max={8} step={0.5} disabled={value.style === "none"} value={value.size}
          onChange={(e) => onChange({ ...value, size: parseFloat(e.target.value) || 0.5 })} />
        <em>mm</em>
      </span>
      <div className="seg">
        {(["none", "chamfer", "fillet"] as EdgeStyle[]).map((s) => (
          <button key={s} className={value.style === s ? "on" : ""} onClick={() => onChange({ ...value, style: s, size: value.size || 1.5 })}>{s}</button>
        ))}
      </div>
    </div>
  );
}

type Shape = "full width" | "centred narrow" | "left rail" | "right rail";

type BuildResult =
  | { kind: "idle" }
  | { kind: "bad" }
  | { kind: "split" }
  | { kind: "crash" }
  | { kind: "ok"; data: MeshData; stl: ArrayBuffer; tris: number; volume: number };

export default function App() {
  const [raw, setRaw] = useState<RackParams>(loadParams);
  const p = useMemo(() => effective(raw), [raw]);
  const [templateId, setTemplateId] = useState<string>(() => {
    const start = loadParams();
    return TEMPLATES.find((t) => JSON.stringify(t.params) === JSON.stringify(start))?.id ?? "custom";
  });
  const [note, setNote] = useState<{ text: string; held: boolean } | null>(null);
  const [api, setApi] = useState<ManifoldToplevel | null>(null);
  const [showCards, setShowCards] = useState(true);
  const [stack, setStack] = useState(1);
  const [targetIndex, setTargetIndex] = useState(11);
  const [quality, setQuality] = useState<"standard" | "fast">("standard");
  const [setCount, setSetCount] = useState(4);
  const [view, setView] = useState<{ name: ViewName; n: number }>({ name: "iso", n: 0 });
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [saved, setSaved] = useState<Preset[]>(loadPresets);
  const [presetName, setPresetName] = useState("My rack");
  const fileInput = useRef<HTMLInputElement>(null);
  const builds = useRef(0);
  const crashes = useRef(0);
  const lastGood = useRef<RackParams>(raw);

  /** Every control goes through here: dependents adjust, and an impossible change simply stops. */
  const change = (patch: Patch) => {
    const r = accept(raw, patch, api);
    setNote(r.note ? { text: r.note, held: !r.ok } : null);
    if (r.ok) { setRaw(r.params); setTemplateId("custom"); }
  };

  useEffect(() => { loadEngine().then(setApi); }, []);
  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(raw)); } catch { /* ignore */ } }, [raw]);
  useEffect(() => { try { localStorage.setItem(PRESET_STORE, JSON.stringify(saved)); } catch { /* ignore */ } }, [saved]);

  const d = useMemo(() => derive(p), [p]);
  const warnings = useMemo(() => [...validate(p), ...bedWarnings(p)], [p]);

  // Where each slider may go right now. Cheap (a few ms for every control), so it is recomputed live.
  const ranges = useMemo(() => {
    const out: Partial<Record<string, Interval>> = {};
    for (const k of Object.keys(CONTROLS) as ControlKey[]) {
      if (k === "width" && raw.autoWidth) continue;
      const s = CONTROLS[k];
      out[k] = feasibleInterval(raw, (v) => ({ [k]: v }) as Patch, (q) => q[k] as number, raw[k] as number, s.min, s.max, s.step);
    }
    if (raw.sideSlope) {
      const hl = raw.height - raw.sideDelta / 2, hr = raw.height + raw.sideDelta / 2;
      out.left = feasibleInterval(raw, (v) => ({ height: (v + hr) / 2, sideDelta: hr - v }), (q) => q.height - q.sideDelta / 2, hl, 20, 180, 1);
      out.right = feasibleInterval(raw, (v) => ({ height: (hl + v) / 2, sideDelta: v - hl }), (q) => q.height + q.sideDelta / 2, hr, 20, 180, 1);
    }
    return out;
  }, [raw]);

  const [result, setResult] = useState<BuildResult>({ kind: "idle" });
  useEffect(() => {
    if (!api) return;
    try {
      const r = scoped((): BuildResult => {
        const m = buildRack(api, p);
        if (m.status() !== "NoError" || m.isEmpty()) return { kind: "bad" };
        if (pieceCount(m) > 1) return { kind: "split" }; // safety net behind the rules: never offer loose parts
        const mesh = m.getMesh();
        const np = mesh.numProp;
        const positions = new Float32Array((mesh.vertProperties.length / np) * 3);
        for (let i = 0, j = 0; i < mesh.vertProperties.length; i += np, j += 3) {
          positions[j] = mesh.vertProperties[i];
          positions[j + 1] = mesh.vertProperties[i + 1];
          positions[j + 2] = mesh.vertProperties[i + 2];
        }
        return { kind: "ok", data: { positions, indices: new Uint32Array(mesh.triVerts) }, stl: toStl(m), tris: m.numTri(), volume: m.volume() };
      });
      builds.current++;
      setResult(r);
    } catch (e) {
      console.error(e);
      setResult({ kind: isEngineCrash(e) ? "crash" : "bad" });
    }
  }, [api, p]);

  // Engine health: swap in a fresh engine after a crash or every few hundred builds.
  useEffect(() => {
    if (result.kind === "crash" && crashes.current >= 1) {
      // The fresh engine crashed on the same design: stop looping and go back to the last good one.
      crashes.current = 0;
      setNote({ text: "Held: that design crashed the geometry engine, so it was undone.", held: true });
      setRaw(lastGood.current);
      return;
    }
    if (result.kind !== "crash") crashes.current = 0;
    if (result.kind === "crash" || builds.current >= REBUILD_ENGINE_AFTER) {
      if (result.kind === "crash") crashes.current++;
      builds.current = 0;
      freshEngine().then(setApi);
    }
  }, [result]);
  // Backstop: a combination the rules missed splits the rack. Go back to the last good design.
  useEffect(() => {
    if (result.kind === "ok") lastGood.current = raw;
    else if (result.kind === "split") {
      setNote({ text: "Held: that combination would split the rack into separate pieces, so it was undone.", held: true });
      setRaw(lastGood.current);
    }
  }, [result]); // eslint-disable-line react-hooks/exhaustive-deps

  const built = result.kind === "ok" ? result : null;
  const study = useMemo(() => {
    if (!api) return [];
    try { return scoped(() => widthStudy(api, raw)); } catch { return []; }
  }, [api, raw]);

  const baseName = templateId === "come-at-me"
    ? "come-at-me-8-slot"
    : `rack_${p.slots}slot_${p.width}x${p.depth}x${p.height}_p${p.spacing}${p.nest ? "_nest" : "_solid"}`;
  // Through-slot racks print with build-plate supports: +26% measured (12h50m -> 16h08m for the default rack).
  const hours = built ? (built.volume / 1000) * HOURS_PER_CM3[quality] * (p.throughSlots ? 1.26 : 1) : 0;
  const fp = footprint(p);
  const plates = arrangePlates(fp.w, fp.d, setCount);
  const perPlate = plates[0]?.length ?? 1;
  const say = (ok: boolean, text: string) => setStatus({ ok, text });

  const downloadStl = () => { if (built) save(`${baseName}.stl`, built.stl, "model/stl"); };

  const downloadSet = () => {
    if (!api || !built) return;
    const entries = scoped(() => buildPlates(api, p, setCount, true).map((m, i) => {
      const first = plates[i][0].index + 1, last = plates[i].at(-1)!.index + 1;
      const label = first === last ? `P${first}` : `P${first}-P${last}`;
      return { name: `plate${i + 1}_${label}.stl`, data: new Uint8Array(toStl(m)) };
    }));
    save(`${baseName}_set_of_${setCount}.zip`, makeZip(entries), "application/zip");
    say(true, `${entries.length} plate STL${entries.length > 1 ? "s" : ""} zipped (${perPlate} rack${perPlate > 1 ? "s" : ""} per A1 mini plate, numbered 1-${setCount}).`);
  };

  const downloadCoupon = () => {
    if (!api) return;
    save("slot_test_coupon.stl", scoped(() => toStl(buildCoupon(api))), "model/stl");
    say(true, `Coupon: slots ${COUPON_THICKNESSES[0]}-${COUPON_THICKNESSES.at(-1)} mm, labelled in tenths of a mm. Pick the slot your card slides in, then set Slot thickness.`);
  };

  const downloadRimCoupon = () => {
    if (!api || p.rim <= 0) return;
    save("grip_rim_coupon.stl", scoped(() => toStl(buildRimCoupon(api, p.flange, p.flangeThickness, p.rim))), "model/stl");
    say(true, `Rim coupon: ${p.flange} mm flange, ${p.rim} mm rim, 1.6 mm wall. Check how it grips and bonds before printing a rack.`);
  };

  const loadTemplate = (id: string) => {
    const t = templateById(id);
    setRaw(t.params);
    setTemplateId(t.id);
    setNote({ text: `Started from “${t.name}”.`, held: false });
  };
  const savePreset = () => {
    const name = presetName.trim() || "Untitled";
    setSaved((s) => [...s.filter((x) => x.name !== name), { name, params: raw }]);
    say(true, `Saved “${name}”.`);
  };
  const loadPreset = (name: string) => {
    const pr = saved.find((x) => x.name === name);
    if (pr) { setRaw(pr.params); setPresetName(pr.name); setTemplateId("custom"); }
  };
  const importPreset = async (f: File) => {
    try {
      const pr = parsePreset(await f.text());
      const ok = usable(pr.params);
      if (!ok) { say(false, "That file describes a rack that cannot be built, so it was not loaded."); return; }
      setRaw(ok); setPresetName(pr.name); setTemplateId("custom");
      setSaved((s) => [...s.filter((x) => x.name !== pr.name), { name: pr.name, params: ok }]);
      say(true, `Imported “${pr.name}”.`);
    } catch (e) { say(false, `Import failed: ${(e as Error).message}`); }
  };

  const applyCard = (preset: CardPreset) => {
    const q = applyCardPreset(raw, preset);
    change({ cardPreset: q.cardPreset, cardWidth: q.cardWidth, cardHeight: q.cardHeight });
  };

  const shape: Shape = raw.narrow ? (raw.narrowAlign === "left" ? "left rail" : raw.narrowAlign === "right" ? "right rail" : "centred narrow") : "full width";
  const endsOpen = p.openLeft || p.openRight;
  const fitsCard = endsOpen || d.slotWidth >= p.cardWidth + 0.5;
  const template = templateId === "custom" ? null : templateById(templateId);
  const ctl: Ctl = { raw, ranges, change };

  return (
    <CtlContext.Provider value={ctl}>
      <div className="shell">
        <aside className="panel">
          <header>
            <a className="lab-link" href="/experiments/">← Zero Page Labs Experiments</a>
            <h1>Rack Lab</h1>
            <p>Design a card rack in your browser. Export an STL to slice and print.</p>
            <a className="lab-link" href={`${import.meta.env.BASE_URL}come-at-me-8-slot.stl`} download>Download the COME AT ME! STL</a>
          </header>

          {note && <div className={`banner ${note.held ? "held" : "info"}`} role="status">{note.text}</div>}

          <section>
            <h2>Start from a template</h2>
            <div className="row">
              <select value={templateId} onChange={(e) => e.target.value !== "custom" && loadTemplate(e.target.value)} aria-label="Template">
                {templateId === "custom" && <option value="custom">Custom (changed)</option>}
                {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <p className="note">{template ? template.blurb : "Pick a template to start over. Every control below only moves to settings that work, and adjusts related settings for you."}</p>
          </section>

          <section>
            <h2>Cards</h2>
            <label className="field plain">
              <span className="field-label">Card size</span>
              <select value={p.cardPreset} onChange={(e) => applyCard(e.target.value as CardPreset)}>
                {Object.entries(CARD_PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                <option value="custom">Custom…</option>
              </select>
            </label>
            {p.cardPreset === "custom" && (
              <>
                <Num k="cardWidth" label="Card width" />
                <Num k="cardHeight" label="Card height" />
              </>
            )}
          </section>

          <section>
            <h2>Rack</h2>
            <Num k="slots" label="Slots" unit="" round />
            <Num k="spacing" label="Slot spacing" hint="Distance between slot centres along the depth" />
            {!raw.sideSlope && <Num k="height" label="Height" hint="Highest point of the ramp (back)" />}
            <div className="row tight">
              <span className="field-label">Ramp angle</span>
              {[18, 26, 34].map((deg) => (
                <button key={deg} className="mini" onClick={() => change({ height: Math.round(solveHeightForRamp(p, deg) * 2) / 2 })}>{deg}°</button>
              ))}
              <em className="hint">now {d.rampDeg.toFixed(1)}°</em>
            </div>
            <div className="row tight">
              <span className="field-label">Index showing</span>
              <input type="number" className="num-sm" min={4} max={30} step={0.5} value={targetIndex} onChange={(e) => setTargetIndex(parseFloat(e.target.value) || 0)} />
              <em className="hint">mm</em>
              <button className="mini" onClick={() => {
                const h = solveHeightForExposure(p, targetIndex);
                change({ height: h });
                if (derive({ ...p, height: h }).exposure < targetIndex - 0.05) say(false, `A ${targetIndex} mm index needs more than ${MAX_HEIGHT} mm height; raise spacing or lean instead.`);
                else say(true, `Height ${h} mm shows ${targetIndex} mm of each card.`);
              }}>Solve height</button>
            </div>

            <Check k="throughSlots" label="Through slots (cards rest on the table)"
              hint="Each slot cuts right through the rack: cards pass into the hollow underside and rest on the table, like a Rack-O rack. One side wall stays closed to hold the rack together." />
            {raw.throughSlots && <p className="note">One side wall stays closed so the slab strips stay attached; the other side may be open. The 3MF turns on build-plate supports under the strips.</p>}
            <Check k="openLeft" label="Open left side (cards slide out)" />
            <Check k="openRight" label="Open right side (cards slide out)" />
            <Check k="sideSlope" label="Side slope (ramp also tilts left ↔ right)" />
            {raw.sideSlope && (
              <>
                <label className="field" title="Top of the back-left corner">
                  <span className="field-label">Left height</span>
                  <Slider value={d.heightLeft} min={20} max={180} step={1} feas={ranges.left}
                    onSet={(v) => { const hr = raw.height + raw.sideDelta / 2; change({ height: (v + hr) / 2, sideDelta: hr - v }); }} /><em>mm</em>
                </label>
                <label className="field" title="Top of the back-right corner">
                  <span className="field-label">Right height</span>
                  <Slider value={d.heightRight} min={20} max={180} step={1} feas={ranges.right}
                    onSet={(v) => { const hl = raw.height - raw.sideDelta / 2; change({ height: (hl + v) / 2, sideDelta: v - hl }); }} /><em>mm</em>
                </label>
                <p className="note">Cross slope {Math.abs(d.crossDeg).toFixed(1)}°, high on the {d.c >= 0 ? "right" : "left"}. Cards stay upright and level.</p>
              </>
            )}
            <Seg<Shape> label="Rack shape" value={shape} options={["full width", "centred narrow", "left rail", "right rail"]}
              onChange={(m) => change(
                m === "full width" ? { narrow: false, autoWidth: true }
                : m === "centred narrow" ? { narrow: true, narrowAlign: "center" }
                : { narrow: true, narrowAlign: m === "left rail" ? "left" : "right", throughSlots: true })} />
            {raw.narrow && (
              <>
                <Seg<string> label={raw.narrowAlign === "center" ? "Rack ÷ card" : "Rail guides"} value={`${raw.narrowPercent}%`} options={["25%", "50%", "75%"]}
                  onChange={(v) => change({ narrowPercent: parseInt(v) })} />
                <Num k="narrowPercent" label="Fine tune" unit="%" hint="Percentage of the card width. Centred: the rack's width at the top. Rail: how much of each card the slot guides." />
                <p className="note">
                  {raw.narrowAlign === "center"
                    ? `Rack is ${d.topWidth.toFixed(0)} mm wide at the top; a ${p.cardWidth} mm card overhangs both sides, so both sides are open.`
                    : `A rail along the ${raw.narrowAlign}: it joins every slot, cards pass through and stand on the table, and overhang the ${raw.narrowAlign === "left" ? "right" : "left"} side. The rail guides ${(d.guidePct * 100).toFixed(0)}% of each card.`}
                </p>
              </>
            )}
            <Check k="nest" label="Hollow underside (racks nest and stack)" />
          </section>

          <details className="adv">
            <summary>Advanced</summary>
            <section>
              <h2>Footprint</h2>
              <Num k="depth" label="Depth" hint="Outer Y at the base. It never goes below what the slots need." />
              <Num k="frontHeight" label="Front height" hint="Ramp height at the front" />
              {!raw.narrow && (
                <Seg<"fit card" | "manual"> label="Width" value={raw.autoWidth ? "fit card" : "manual"} options={["fit card", "manual"]}
                  onChange={(m) => change(m === "fit card" ? { autoWidth: true } : { autoWidth: false, width: p.width })} />
              )}
              {!raw.narrow && !raw.autoWidth && <Num k="width" label="Width (base)" value={p.width} />}
              <Num k="spacingTaper" label="Spacing taper" hint="Each gap is this much wider than the one in front. Wider gaps at the back show more of the cards that are hardest to see." />
            </section>
            <section>
              <h2>Slots</h2>
              <Num k="lean" label="Lean back" unit="°" />
              <Num k="slotThickness" label="Slot thickness" hint="Bridge cards are about 0.3 mm. Print the slot coupon to pick this." />
              <Num k="slotDepth" label={p.throughSlots ? "Guide depth" : "Slot depth"}
                hint={p.throughSlots ? "Thickness of the slab that guides the card." : "How far a card sits in. With side slope on this is the depth at the low side."} />
              <Num k="slotLeadIn" label="Mouth chamfer" />
              <Num k="sideWall" label="Side wall" />
              <Num k="lipGap" label="End lip gap" hint="Slot thickness in the last few mm at an open end. Thinner than the slot gives a light friction hold. Below 0.4 mm means no lip." />
              <Num k="lipLength" label="End lip length" />
            </section>
            <section>
              <h2>Rack-O details</h2>
              <Num k="sawtooth" label="Sawtooth tops" hint="Each fin top is cut down by this much at one slot wall and rises back to the ramp, like a Rack-O. 0 = a flat ramp." />
              {raw.sawtooth > 0 && (
                <Seg<string> label="Teeth rise toward" value={raw.sawtoothFlip ? "front" : "back"} options={["back", "front"]} onChange={(v) => change({ sawtoothFlip: v === "front" })} />
              )}
              <Num k="slotEndRadius" label="Round slot ends" hint="Rounds the closed end of each slot. Larger than half the slot thickness makes a small relief hole (a Rack-O has one). 0 = square." />
              <Num k="flange" label="Base flange" hint="A flat rim around the base, outside the shell. 0 = none. Counts toward the 180 mm printer bed." />
              {raw.flange > 0 && <Num k="flangeThickness" label="Flange thickness" />}
              <Num k="rim" label="Grip rim" hint="A raised wall around the flange (closed sides, front and back) so you can pick the rack up and show the cards. Needs a flange of 4 mm or more, which it adds for you. 0 = none." />
            </section>
            <section>
              <h2>Markings</h2>
              <Check k="frontWordmark" label="Raised COME AT ME! wordmark" />
              <Seg<LabelSides> label="Slot numbers" value={p.labelSides} options={["none", "left", "right", "both"]} onChange={(v) => change({ labelSides: v })} />
              <Num k="labelStep" label="Step" unit="" round hint="Slot 1 reads this number, slot 2 twice it (the rulebook uses 1)" />
              <Num k="labelHeight" label="Digit height" />
              <Num k="playerLabel" label="Player number" unit="" round hint="Engraved on the back when the wordmark is enabled. 0 = none." />
            </section>
            <section>
              <h2>Nesting</h2>
              <Seg<CeilingStyle> label="Ceiling" value={p.ceiling} options={["stepped", "sloped"]} onChange={(v) => change({ ceiling: v })} />
              <p className="note">Stepped prints without supports (+{(d.s * d.stepWidth).toFixed(1)} mm per rack). Sloped is tighter but needs supports.</p>
              <Num k="wall" label="Wall" />
              <Num k="draft" label="Draft" unit="°" hint="Outer wall taper; steeper stacks tighter" />
              <Num k="nestClearance" label="Clearance" />
            </section>
            <section>
              <h2>Edges</h2>
              <Edge label="Ramp edges" value={p.topEdge} onChange={(e) => change({ topEdge: e })} />
              <Edge label="Base edges" value={p.bottomEdge} onChange={(e) => change({ bottomEdge: e })} />
              <Edge label="Corners" value={p.cornerEdge} onChange={(e) => change({ cornerEdge: e })} />
            </section>
          </details>

          <details className="adv">
            <summary>Saved designs</summary>
            <section>
              <div className="row">
                <select value="" onChange={(e) => e.target.value && loadPreset(e.target.value)} aria-label="Saved designs">
                  <option value="">{saved.length ? "Load a saved design…" : "Nothing saved yet"}</option>
                  {saved.map((x) => <option key={x.name}>{x.name}</option>)}
                </select>
              </div>
              <div className="row">
                <input className="text" value={presetName} onChange={(e) => setPresetName(e.target.value)} aria-label="Design name" />
                <button className="mini" onClick={savePreset}>Save</button>
              </div>
              <div className="row">
                <button className="mini" onClick={() => save(`${presetName || "rack"}.rackpreset.json`, serializePreset({ name: presetName, params: raw }), "application/json")}>Export JSON</button>
                <button className="mini" onClick={() => fileInput.current?.click()}>Import JSON</button>
                <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importPreset(f); e.target.value = ""; }} />
              </div>
            </section>
          </details>

          <section>
            <h2>Width study</h2>
            <p className="note">Same hollow, nesting rack at several widths. Click a row to use it. Static estimate for a centred card (no friction or lip); the full row also has end walls, so its saving mixes narrowing with removing them.</p>
            <table className="study">
              <thead><tr><th>Width</th><th>Volume</th><th>Saved</th><th>Tip-over</th></tr></thead>
              <tbody>
                {study.map((r) => (
                  <tr key={r.label} className={(r.percent === null ? !raw.narrow : raw.narrow && raw.narrowPercent === r.percent) ? "on" : ""}
                    onClick={() => change(r.percent === null ? { narrow: false, autoWidth: true } : { narrow: true, narrowPercent: r.percent })}>
                    <td>{r.label}<small>{r.topWidth.toFixed(0)} mm top</small></td>
                    <td>{r.volume ? `${(r.volume / 1000).toFixed(0)} cm³` : "—"}</td>
                    <td>{r.percent === null ? "—" : `${r.savedPct.toFixed(0)}%`}</td>
                    <td className={r.verdict === "holds" ? "okc" : r.verdict === "marginal" ? "warnc" : "badc"}>{r.tipDeg === null ? (r.guidePct < 1 ? `${(r.guidePct * 100).toFixed(0)}% guided` : "held by walls") : `${r.tipDeg.toFixed(0)}° ${r.verdict}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2>Print · {A1_MINI.name}</h2>
            <Seg<"standard" | "fast"> label="Quality" value={quality} options={["standard", "fast"]} onChange={setQuality} />
            <p className="note">
              {quality === "standard" ? "0.20 mm layers, 3 walls, 12% gyroid." : "0.28 mm layers, 2 walls, 8% gyroid; coarser ramp surface."} PLA, 0.4 mm nozzle{p.throughSlots ? ", build-plate supports" : ", no supports"}, flat on the base.
              {built && <> Estimate ≈ <b>{hours.toFixed(1)} h</b> (scaled from a sliced default rack{p.throughSlots ? ", +26% for supports" : ""}).</>}
            </p>
            <div className="row">
              <button className="primary wide" disabled={!built} onClick={downloadStl}>STL</button>
            </div>
            <div className="row tight">
              <span className="field-label">Set of</span>
              <input type="number" className="num-sm" min={1} max={8} value={setCount} onChange={(e) => setSetCount(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))} />
              <em className="hint">{perPlate}/plate · {plates.length} plate{plates.length > 1 ? "s" : ""}</em>
              <button className="mini" disabled={!built} onClick={downloadSet}>Zip</button>
            </div>
            <div className="row">
              <button className="mini" onClick={downloadCoupon}>Slot test coupon STL</button>
              <button className="mini" disabled={p.rim <= 0} title={p.rim <= 0 ? "Set a grip rim first" : undefined} onClick={downloadRimCoupon}>Grip rim coupon STL</button>
            </div>
            {status && <p className={`note ${status.ok ? "okc" : "badc"}`}>{status.text}</p>}
          </section>
        </aside>

        <main className="stage">
          <Viewer mesh={built?.data ?? null} params={p} showCards={showCards} stack={stack} view={view} />
          <div className="toolbar">
            <div className="seg views">
              {(["iso", "underside", "side", "top"] as ViewName[]).map((n) => (
                <button key={n} className={view.name === n ? "on" : ""} onClick={() => setView((v) => ({ name: n, n: v.n + 1 }))}>{n}</button>
              ))}
            </div>
            <label className="check"><input type="checkbox" checked={showCards} onChange={(e) => setShowCards(e.target.checked)} /> Cards</label>
            <label className="check">
              Stack
              <select value={stack} onChange={(e) => setStack(parseInt(e.target.value))}>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
          {!api && <div className="overlay">Loading geometry engine…</div>}
          {api && !built && result.kind !== "idle" && <div className="overlay">{result.kind === "crash" ? "Restarting the geometry engine…" : "Could not build this rack. Try another template."}</div>}

          <div className="readout">
            {warnings.map((w, i) => <div key={i} className={`warn ${w.level}`}>{w.text}</div>)}
            <dl>
              <div><dt>Ramp angle</dt><dd>{d.rampDeg.toFixed(1)}°</dd></div>
              <div><dt>Card index showing</dt><dd>{d.exposure.toFixed(1)} mm</dd></div>
              <div><dt>Width at top</dt><dd>{d.topWidth.toFixed(1)} mm</dd></div>
              <div><dt>Slot width</dt><dd className={fitsCard ? "" : "bad"}>{endsOpen ? "open ends" : `${d.slotWidth.toFixed(1)} mm ${fitsCard ? "✅" : "⚠️"}`}</dd></div>
              <div><dt>Card tip-over</dt><dd className={d.tipDeg !== null && d.tipDeg < 15 ? "bad" : ""}>{d.tipDeg === null ? (p.throughSlots ? "stands on the table" : "held by end walls") : `${d.tipDeg.toFixed(0)}° ${d.tipDeg >= 15 ? "✅" : "⚠️"} (${Math.max(d.tipNudgedDeg ?? 0, 0).toFixed(0)}° if nudged)`}</dd></div>
              {d.guidePct < 1 && <div><dt>Card guided over</dt><dd className={d.guidePct < 0.3 ? "bad" : ""}>{(d.guidePct * 100).toFixed(0)}% of its width</dd></div>}
              <div><dt>Stack rise</dt><dd>{p.nest ? `${d.stackRise.toFixed(1)} mm` : "—"}</dd></div>
              <div><dt>Stack of {stack}</dt><dd>{(maxHeight(p) + (stack - 1) * (p.nest ? d.stackRise : maxHeight(p))).toFixed(0)} mm tall</dd></div>
              <div><dt>A1 mini bed</dt><dd>{fp.w}×{fp.d}×{maxHeight(p).toFixed(0)} of 180³</dd></div>
              <div><dt>Mesh</dt><dd>{built ? `${built.tris.toLocaleString()} tris · ${(built.volume / 1000).toFixed(0)} cm³` : "—"}</dd></div>
            </dl>
          </div>
        </main>
      </div>
    </CtlContext.Provider>
  );
}

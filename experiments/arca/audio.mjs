// Four voices on a soft, organ-like tone, scheduled on the Web Audio clock.
let ctx;
const PAN = [-0.35, -0.12, 0.12, 0.35];

function voiceNote(out, midi, start, dur, pan) {
  const f = 440 * 2 ** ((midi - 69) / 12);
  const g = ctx.createGain();
  const p = ctx.createStereoPanner();
  p.pan.value = pan;
  g.connect(p).connect(out);
  const a = 0.03, r = Math.min(0.12, dur * 0.3);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(0.16, start + a);
  g.gain.setValueAtTime(0.16, start + dur - r);
  g.gain.linearRampToValueAtTime(0, start + dur);
  for (const [type, mult, level] of [['triangle', 1, 1], ['sine', 2, 0.35], ['sine', 4, 0.12]]) {
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.type = type; o.frequency.value = f * mult; og.gain.value = level;
    o.connect(og).connect(g);
    o.start(start); o.stop(start + dur + 0.02);
  }
}

/**
 * Play settings (from engine.compose). onStep(globalIndex) fires as each slot sounds,
 * onEnd() at the finish. Returns a stop function.
 */
export function play(settings, secondsPerMinim, onStep, onEnd) {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  const out = ctx.createGain();
  out.gain.value = 0.8;
  out.connect(ctx.destination);
  const t0 = ctx.currentTime + 0.12;
  const cues = [];
  let k = 0;
  for (const s of settings) {
    for (const e of s.events) {
      const start = t0 + (s.start + e.t) * secondsPerMinim, dur = e.minims * secondsPerMinim;
      if (!e.rest) e.pitches.forEach((p, v) => voiceNote(out, p.midi, start, dur * 0.97, PAN[v]));
      cues.push({ at: start, k: k++ });
    }
  }
  const end = t0 + settings.reduce((m, s) => Math.max(m, s.start + s.length), 0) * secondsPerMinim;
  let raf, last = -1, stopped = false;
  const tick = () => {
    if (stopped) return;
    const now = ctx.currentTime;
    while (last + 1 < cues.length && cues[last + 1].at <= now) onStep(cues[++last].k);
    if (now >= end) { onEnd(); return; }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    out.gain.cancelScheduledValues(ctx.currentTime);
    out.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
    setTimeout(() => out.disconnect(), 300);
  };
}

/** Sound one chord briefly (tapping a column on the stick). */
export function playChord(midis, dur = 0.9) {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  const out = ctx.createGain(); out.gain.value = 0.8; out.connect(ctx.destination);
  const t0 = ctx.currentTime + 0.03;
  midis.forEach((m, v) => voiceNote(out, m, t0, dur, PAN[v]));
  setTimeout(() => out.disconnect(), (dur + 0.4) * 1000);
}

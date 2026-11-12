export const sources = {
  lines: ['ZAZ1357 · Body, sheer and half-breadth', 'https://www.rmg.co.uk/collections/objects/rmgc-object-81148'],
  profile: ['ZAZ1359 · Inboard profile', 'https://www.rmg.co.uk/collections/objects/rmgc-object-81150'],
  frame: ['Bellona · Construction model', 'https://www.rmg.co.uk/collections/objects/rmgc-object-66464'],
  model: ['Bellona · Fitted model', 'https://www.rmg.co.uk/collections/objects/rmgc-object-66299'],
  facts: ['Bellona · Dimensions and armament', 'https://www.rmg.co.uk/stories/maritime-history/bellona-third-rate-74'],
  tack: ['1797 · Seamanship, Encyclopædia Britannica', 'https://jimclifford.ca/britannica-articles-1/a/EB.5/191253800/49.html'],
};

export const parts = [
  { id: 'hull', name: 'Hull & keel', point: [2, -5.2, 3.2], evidence: 'Plan-derived',
    text: 'The keel runs along the ship’s bottom. Transverse frames give the hull its shape, and planking closes the gaps between them.',
    limit: 'The overall length and breadth use the published dimensions. The model interpolates a small set of sections estimated from the drawing. The straight keel, sternpost, and deadwood are schematic. Individual timber sizes and joinery are illustrative.', refs: ['lines', 'frame', 'facts'] },
  { id: 'lower', name: 'Lower gun deck', point: [-3, 1.2, 0], evidence: 'Plan-derived',
    text: 'Bellona carried 28 long 32-pounders here, 14 to a side. The heavier battery sat below the lighter 18-pounders.',
    limit: 'Deck order and gun count are documented. Gun carriage geometry, port spacing, and deck thickness are approximated.', refs: ['profile', 'facts'] },
  { id: 'upper', name: 'Upper gun deck', point: [8, 3.55, 0], evidence: 'Plan-derived',
    text: 'The second full battery carried 28 18-pounders. Above it, the quarterdeck aft and forecastle forward carried smaller guns.',
    limit: 'The sheer and stacked deck arrangement follow the inboard profile. The display simplifies openings, fittings, and interior divisions.', refs: ['profile', 'facts'] },
  { id: 'hold', name: 'Hold & orlop', point: [10, -2.5, 0], evidence: 'Plan-derived',
    text: 'Beneath the gun decks sits the orlop, a low platform above the hold. Stores and ballast occupy space low in the ship.',
    limit: 'The inboard drawing anchors the vertical arrangement. Barrels, their placement, and the exposed cross-section are interpretive.', refs: ['profile', 'frame'] },
  { id: 'rig', name: 'Masts & yards', point: [-2.8, 30, 0], evidence: 'Reconstructed',
    text: 'A yard is the crossbeam that carries a square sail. Braces turn the yard around the mast so the crew can set the sail to the wind.',
    limit: 'Mast positions follow period proportions for the gun-deck length. Mast heights and yard lengths are approximate for a 74 of this size. The selected sails and visible rigging are a simplified reconstruction.', refs: ['lines', 'model', 'tack'] },
  { id: 'helm', name: 'Wheel & rudder', point: [-22, -1.8, 0], evidence: 'Reconstructed',
    text: 'The wheel operates the steering gear. The rudder redirects flow at the stern to turn the ship while she has way on.',
    limit: 'The museum model documents a double wheel. Steering gear and rudder motion here show the principle in simplified form.', refs: ['model', 'tack'] },
];

export const duration = 32;
export const phases = [
  { at: 0, name: 'Gather way', short: 'Build speed', text: 'Begin on starboard tack with wind on the right side. Give the ship room to gather speed so water flowing past the rudder can turn her.' },
  { at: 5, name: 'Helm a-lee', short: 'Turn into wind', text: 'Put the helm down so the bow comes up toward the wind. Ease the forward sheets. Watch the forward sails lose their drive as the bow turns.' },
  { at: 13, name: 'Main yards come round', short: 'Shift main yards', text: 'As the wind comes nearly ahead, brace the main yards onto the new side. The fore yards stay on the old side, where the wind can press the front of those sails and help pay the bow round.' },
  { at: 17, name: 'Bow crosses the wind', short: 'Cross the wind', text: 'The wind passes from the starboard bow to the port bow. The rudder is back at the center, and the ship’s existing turn carries her through.' },
  { at: 24, name: 'Fore yards come round', short: 'Shift fore yards', text: 'Brace the fore yards onto the new side. The after sails are already filling. As the forward sails fill again, the ship begins to gather way.' },
  { at: 29, name: 'Settle on port tack', short: 'Fill and steady', text: 'Wind now comes from the port side. Trim the sails and steady the heading. The ship has turned through the wind without going astern in this example.' },
];

// Heading is measured from the direction the wind comes FROM, positive to starboard.
// Yard angles are measured from square. Braced sharp up at 53°, a yard lies 37° from the keel.
const keys = [
  // Seconds, heading, fore yards, main yards, mizzen yards, rudder, relative speed
  [0, -67, 53, 53, 51, 0, .85],
  [5, -68, 53, 53, 51, 0, 1],
  [7, -57, 53, 53, 51, 28, .93],
  [9, -41, 53, 53, 51, 30, .80],
  [11, -27, 53, 53, 51, 30, .64],
  [13, -16, 53, 53, 51, 24, .48],
  [15, -7, 53, 0, 0, 12, .34],
  [17, 0, 53, -42, -40, 0, .22],
  [18, 4, 53, -53, -51, 0, .18],
  [20, 15, 53, -53, -51, 0, .13],
  [22, 29, 53, -53, -51, 0, .14],
  [24, 44, 53, -53, -51, 0, .20],
  [26, 57, 0, -53, -51, -3, .32],
  [28, 66, -48, -53, -51, -8, .46],
  [30, 69.5, -53, -53, -51, -8, .62],
  [32, 67, -53, -53, -51, 0, .78],
];

// Monotone cubic slopes (Fritsch–Carlson): rates stay continuous and values never overshoot a key.
const rise = (i, c) => (keys[i + 1][c] - keys[i][c]) / (keys[i + 1][0] - keys[i][0]);
const slopes = keys.map((_, i) => keys[0].map((_, c) => {
  if (!c || !i || i === keys.length - 1) return 0;
  const a = rise(i - 1, c), b = rise(i, c);
  return a * b <= 0 ? 0 : 2 * a * b / (a + b);
}));

export function sampleTack(seconds) {
  const time = Math.max(0, Math.min(duration, seconds));
  const end = keys.findIndex(key => key[0] > time);
  const r = end < 0 ? keys.length - 1 : end, l = r - 1;
  const span = keys[r][0] - keys[l][0];
  const s = (time - keys[l][0]) / span;
  const [, heading, fore, main, mizzen, rudder, drive] = keys[l].map((value, c) =>
    (2 * s ** 3 - 3 * s ** 2 + 1) * value + (s ** 3 - 2 * s ** 2 + s) * span * slopes[l][c] +
    (3 * s ** 2 - 2 * s ** 3) * keys[r][c] + (s ** 3 - s ** 2) * span * slopes[r][c]);
  const phase = phases.findLastIndex(step => step.at <= time);
  return { time, heading, fore, main, mizzen, rudder, drive, phase };
}

// Signed angle at which the wind meets a square sail: positive fills it, negative backs it.
export const incidence = (heading, yard) => Math.asin(-Math.cos((heading - yard) * Math.PI / 180)) * 180 / Math.PI;

// Teaching path in ship-speed units: x across the wind, y to windward.
// The ship makes leeway while she sails and drifts downwind as she loses way.
const leeway = Math.tan(8 * Math.PI / 180), drift = .1;
export function tackTrack(step = .1) {
  const track = [{ x: 0, y: 0 }];
  for (let i = 1; i <= Math.round(duration / step); i++) {
    const { heading, drive } = sampleTack(i * step);
    const h = heading * Math.PI / 180;
    const lee = leeway * drive * Math.max(-1, Math.min(1, heading / 20));
    const p = track.at(-1);
    track.push({
      x: p.x + step * (Math.sin(h) * drive + Math.cos(h) * lee),
      y: p.y + step * (Math.cos(h) * drive - Math.sin(h) * lee - drift * (1 - drive)),
    });
  }
  return track;
}

// Position on that path at any time, interpolated so the ship moves smoothly along it.
const fineTrack = tackTrack(.1);
export function tackPosition(seconds) {
  const at = Math.max(0, Math.min(duration, seconds)) * 10;
  const i = Math.min(fineTrack.length - 2, Math.floor(at)), mix = at - i;
  const a = fineTrack[i], b = fineTrack[i + 1];
  return { x: a.x + (b.x - a.x) * mix, y: a.y + (b.y - a.y) * mix };
}

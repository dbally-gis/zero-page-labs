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
    limit: 'The overall length and breadth use the published dimensions. The model interpolates a small set of sections estimated from the drawing. Individual timber sizes and joinery are illustrative.', refs: ['lines', 'frame', 'facts'] },
  { id: 'lower', name: 'Lower gun deck', point: [-3, 1.2, 0], evidence: 'Plan-derived',
    text: 'Bellona carried 28 long 32-pounders here, 14 to a side. The heavier battery sat below the lighter 18-pounders.',
    limit: 'Deck order and gun count are documented. Gun carriage geometry, port spacing, and deck thickness are approximated.', refs: ['profile', 'facts'] },
  { id: 'upper', name: 'Upper gun deck', point: [8, 3.55, 0], evidence: 'Plan-derived',
    text: 'The second full battery carried 28 18-pounders. Above it, the quarterdeck aft and forecastle forward carried smaller guns.',
    limit: 'The sheer and stacked deck arrangement follow the inboard profile. The display simplifies openings, fittings, and interior divisions.', refs: ['profile', 'facts'] },
  { id: 'hold', name: 'Hold & orlop', point: [10, -2.5, 0], evidence: 'Plan-derived',
    text: 'Beneath the gun decks sits the orlop, a low platform above the hold. Stores and ballast occupy space low in the ship.',
    limit: 'The inboard drawing anchors the vertical arrangement. Barrels, their placement, and the exposed cross-section are interpretive.', refs: ['profile', 'frame'] },
  { id: 'rig', name: 'Masts & yards', point: [0, 26, 0], evidence: 'Reconstructed',
    text: 'A yard is the crossbeam that carries a square sail. Braces turn the yard around the mast so the crew can set the sail to the wind.',
    limit: 'Mast positions follow the profile approximately. The spar lengths, selected sails, and visible rigging are a simplified reconstruction.', refs: ['lines', 'model', 'tack'] },
  { id: 'helm', name: 'Wheel & rudder', point: [-22, -1.8, 0], evidence: 'Reconstructed',
    text: 'The wheel operates the steering gear. The rudder redirects flow at the stern to turn the ship while she has way on.',
    limit: 'The museum model documents a double wheel. Steering gear and rudder motion here show the principle in simplified form.', refs: ['model', 'tack'] },
];

export const duration = 32;
export const phases = [
  { at: 0, name: 'Gather way', short: 'Build speed', text: 'Begin on starboard tack with wind on the right side. Give the ship room to gather speed so water flowing past the rudder can turn her.' },
  { at: 5, name: 'Helm a-lee', short: 'Turn into wind', text: 'Put the helm down so the bow comes up toward the wind. Ease the forward sheets. Watch the forward sails lose their drive as the bow turns.' },
  { at: 11, name: 'Main yards come round', short: 'Shift main yards', text: 'As the wind comes nearly ahead, brace the main yards onto the new side. The fore yards stay on the old side, where the wind can press the front of those sails and help pay the bow round.' },
  { at: 17, name: 'Bow crosses the wind', short: 'Cross the wind', text: 'The wind passes from the starboard bow to the port bow. Bring the rudder toward the center as the ship’s existing turn carries her through.' },
  { at: 22, name: 'Fore yards come round', short: 'Shift fore yards', text: 'Brace the fore yards onto the new side. The after sails are already filling. As the forward sails fill again, the ship begins to gather way.' },
  { at: 28, name: 'Settle on port tack', short: 'Fill and steady', text: 'Wind now comes from the port side. Trim the sails and steady the heading. The ship has turned through the wind without going astern in this example.' },
];

// Heading is measured from the direction the wind comes FROM, positive to starboard.
const keys = [
  // Seconds, heading, fore yards, main yards, mizzen yards, rudder, relative drive
  [0, -62, 37, 37, 35, 0, .85],
  [5, -58, 37, 37, 35, 0, 1],
  [9, -37, 27, 27, 12, 27, .72],
  [11, -26, 24, 26, -10, 25, .48],
  [16, -4, 22, -28, -25, 5, .24],
  [17, 0, 22, -30, -26, 0, .21],
  [22, 40, 22, -32, -30, 0, .34],
  [27, 66, -32, -32, -31, -6, .65],
  [32, 62, -37, -37, -35, 0, .88],
];

export function sampleTack(seconds) {
  const time = Math.max(0, Math.min(duration, seconds));
  const end = keys.findIndex(key => key[0] > time);
  const right = keys[end < 0 ? keys.length - 1 : end];
  const left = keys[end < 0 ? keys.length - 2 : end - 1];
  const mix = (time - left[0]) / (right[0] - left[0]);
  const [, heading, fore, main, mizzen, rudder, drive] = left.map((value, index) => value + (right[index] - value) * mix);
  const phase = phases.findLastIndex(step => step.at <= time);
  return { time, heading, fore, main, mizzen, rudder, drive, phase };
}

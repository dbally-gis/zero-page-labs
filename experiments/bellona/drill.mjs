export const gunDuration = 44;
export const gunPhases = [
  { at: 0, name: 'Sponge the bore', short: 'Sponge', state: 'Inboard · empty', text: 'The gun is already cast loose and inboard. The sponger works a damp sponge down the bore to put out any embers from the previous shot.' },
  { at: 5, name: 'Load cartridge and shot', short: 'Load', state: 'Inboard · loading', text: 'The loaders put in the powder cartridge and its wad, then the iron round shot and another wad. The rammer seats each in turn. The 32-pound designation refers to the round shot.' },
  { at: 12, name: 'Run out the gun', short: 'Run out', state: 'Moving toward the port', text: 'The side tackles give the crew leverage to haul the loaded gun and its wheeled carriage out to the open gunport. The heavy breeching rope has slack at this point.' },
  { at: 16, name: 'Prime and point', short: 'Prime & point', state: 'Run out · loaded', text: 'The gun captain prepares the vent at the rear of the barrel and directs the aim. Falconer describes a match applied to the priming for discharge.' },
  { at: 21, name: 'Fire and check recoil', short: 'Fire & recoil', state: 'Discharge · recoiling inboard', text: 'The shot leaves the muzzle. The carriage rolls back until the breeching takes the strain. Watch the heavy rope straighten as the gun comes inboard.' },
  { at: 26, name: 'Sponge after firing', short: 'Sponge again', state: 'Inboard · empty again', text: 'The crew keeps clear of the recoil path. With the gun back inboard, the sponger clears the bore before the next cartridge comes forward.' },
  { at: 32, name: 'Reload for the next shot', short: 'Reload', state: 'Inboard · reloading', text: 'A fresh cartridge goes in, followed by shot and wad. The drill ends with the gun loaded inboard, ready to be run out again.' },
];

// These are the five illustrated stations, in the same order as the scene figures.
export const gunCrew = [
  {
    name: 'Gun captain',
    station: 'Beside the breech, following the carriage as it runs out.',
    actions: [
      'Waits by the breech while the sponger clears the bore.',
      'Oversees the loading from the breech end.',
      'Follows the carriage toward the port as the tackle crew hauls.',
      'Prepares the vent, directs the aim, and brings the match to the priming.',
      'Touches off the priming from beside the gun and stays clear of the carriage as it recoils.',
      'Stays beside the breech while the bore is sponged again.',
      'Oversees the next load from the breech end.',
    ],
  },
  {
    name: 'Sponger and rammer',
    station: 'On the near side of the muzzle, where the long staff can enter the bore.',
    actions: [
      'Works the damp sponge down the empty bore to clear embers.',
      'Uses the rammer to seat the cartridge and wad, then the shot and its wad.',
      'Draws back from the muzzle to clear the gun’s path to the port.',
      'Waits clear of the muzzle while the gun is aimed.',
      'Stays beside the gun, clear of the muzzle and carriage.',
      'Works the sponge down the bore once the carriage is back inboard.',
      'Rams home the next charge and shot, with their wads.',
    ],
  },
  {
    name: 'Loader',
    station: 'On the far side of the muzzle when the gun is inboard.',
    actions: [
      'Waits with the loading team while the sponger clears the bore.',
      'Feeds the powder cartridge and wad, then the iron ball and its wad, into the muzzle.',
      'Moves clear of the muzzle so the loaded gun can run out.',
      'Waits to the side while the gun captain primes and points.',
      'Keeps clear of the carriage as it rolls back.',
      'Holds the next load back until the sponger has cleared the bore.',
      'Feeds the next cartridge and shot, with their wads, for the rammer.',
    ],
  },
  {
    name: 'Near-side hauler',
    station: 'Along the near-side tackle, on the viewer’s side in the starting view.',
    actions: [
      'Stands clear of the sponger’s working space.',
      'Waits at the side tackle while the loaders work.',
      'Hauls on the near-side tackle to help roll the carriage toward the port.',
      'Stays by the tackle while the gun captain prepares the shot.',
      'Keeps to the side as the breeching rope takes the strain of recoil.',
      'Holds back from the muzzle while the sponger works.',
      'Waits at the tackle for the next run-out.',
    ],
  },
  {
    name: 'Far-side hauler',
    station: 'Along the opposite tackle, across the gun from the near-side hauler.',
    actions: [
      'Waits on the far side while the sponger works at the muzzle.',
      'Leaves room for the loader to bring forward the cartridge and shot.',
      'Hauls on the far-side tackle alongside the other hauler.',
      'Stands clear on the far side while the gun is aimed.',
      'Stays outside the carriage’s recoil path on the far side.',
      'Waits at the far tackle while the bore is cleared.',
      'Keeps the loading area clear until the gun is ready to run out again.',
    ],
  },
];

const clamp = value => Math.max(0, Math.min(1, value));
const span = (time, start, end) => clamp((time - start) / (end - start));
const ease = value => value * value * (3 - 2 * value);
const envelope = (time, start, end) => ease(span(time, start, start + .65)) * (1 - ease(span(time, end - .65, end)));
const stroke = (time, start, end) => Math.sin(Math.PI * span(time, start, end)) ** 2;

export function sampleGun(seconds) {
  const time = Math.max(0, Math.min(gunDuration, seconds));
  const phase = gunPhases.findLastIndex(step => step.at <= time);
  const running = ease(span(time, 12, 15.6));
  const recoil = 1 - (1 - span(time, 21, 21.75)) ** 3;
  const carriage = running * (1 - recoil);
  const sponge = stroke(time, .3, 4.7) + stroke(time, 26.3, 31.6);
  const ram = stroke(time, 6.2, 8.2) + stroke(time, 9.4, 11.6) +
    stroke(time, 33.4, 36.4) + stroke(time, 38.2, 41.5);
  const cartridge = time < 20 ? span(time, 5, 6.5) : span(time, 32, 34);
  const shot = time < 20 ? span(time, 8.2, 9.6) : span(time, 36.4, 38.4);
  const loading = 1 - ease(span(time, 11.25, 12.2)) + ease(span(time, 25.7, 26.4));
  const haul = envelope(time, 12, 16) * (.52 + .34 * Math.sin((time - 12) * 5) ** 2);
  const aim = envelope(time, 16, 21.2);
  const match = time >= 19.1 && time < 21.05;
  return { time, phase, carriage, recoil, sponge, ram, cartridge, shot, match, loading, haul, aim,
    flash: time >= 21 && time < 21.24 ? 1 - span(time, 21, 21.24) : 0,
    smoke: time >= 21 && time < 25.7 ? 1 - span(time, 21, 25.7) : 0,
  };
}

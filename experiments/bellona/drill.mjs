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

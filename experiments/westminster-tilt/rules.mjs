// The Westminster Tilt, 1511 — rules, scoring and history, kept pure for tests.

export const sources = {
  roll: ['The 1511 Westminster Tournament Roll (Wikipedia)', 'https://en.wikipedia.org/wiki/1511_Westminster_Tournament_Roll'],
  challenge: ['The Westminster Tournament Challenge (Wikipedia)', 'https://en.wikipedia.org/wiki/The_Westminster_Tournament_Challenge'],
  prince: ['Henry, Duke of Cornwall (Wikipedia)', 'https://en.wikipedia.org/wiki/Henry,_Duke_of_Cornwall'],
  fiction: ['Grand gesture: Henry VIII and the Westminster Tournament (Medievalists.net)', 'https://www.medievalists.net/2018/02/grand-gesture-henry-viii-westminster-tournament/'],
  tiptoft: ['Tiptoft’s ordinances of 1466, transcribed from Harl. MS 69', 'https://willscommonplacebook.blogspot.com/2012/06/tiptoft-rules-1466.html'],
  tiptoftMs: ['Ordinances for jousts, by John Tiptoft, 1466 (Bodleian catalogue)', 'https://archives.bodleian.ox.ac.uk/repositories/2/archival_objects/825721'],
  cheque: ['Chivalry and pageantry: reading a 1520 jousting cheque (Society of Antiquaries)', 'https://stories.sal.org.uk/henryviii/chivalry-and-pageantry/'],
};

// The four challengers, as named in the Challenge text and on the Roll.
export const challengers = [
  { id: 'henry', motto: 'Cueur Loyal', english: 'Loyal Heart', name: 'Henry VIII', aim: 'helm', spread: 30,
    colors: { cloth: '#6f2a8c', trim: '#d9b64a', device: '#d9b64a' }, device: 'HK',
    note: 'The king himself. In this game he aims for the helm and rides tight.' },
  { id: 'knyvet', motto: 'Vaillant Desir', english: 'Valiant Desire', name: 'Sir Thomas Knyvet', aim: 'helm', spread: 38,
    colors: { cloth: '#1d5a3a', trim: '#ece3cf', device: '#ece3cf' }, device: 'VD',
    note: 'In this game he aims for the helm but strays more often.' },
  { id: 'courtenay', motto: 'Bon Vouloir', english: 'Good Will', name: 'Sir William Courtenay', aim: 'body', spread: 32,
    colors: { cloth: '#a3322b', trim: '#ece3cf', device: '#ece3cf' }, device: 'BV',
    note: 'In this game he aims for the body and rarely strays.' },
  { id: 'neville', motto: 'Joyeulx Penser', english: 'Joyful Thought', name: 'Sir Edward Neville', aim: 'body', spread: 42,
    colors: { cloth: '#244a86', trim: '#d9b64a', device: '#d9b64a' }, device: 'JP',
    note: 'In this game he aims for the body, a little wild.' },
];

export const PLAYER = { motto: 'The Answerer', name: 'You', colors: { cloth: '#ece3cf', trim: '#3a2c1c', device: '#8c2f22' }, device: '✦' };

export const COURSES = 3;

// Target heights in the aim view (0 = top). The tilt hides the horse, so a low lance meets the barrier.
export const ZONES = [
  { id: 'miss', top: -Infinity, bottom: 34 },
  { id: 'helm', top: 34, bottom: 96, centre: 66, clean: 18 },
  { id: 'body', top: 96, bottom: 172, centre: 134, clean: 28 },
  { id: 'saddle', top: 172, bottom: 200 },
  { id: 'tilt', top: 200, bottom: Infinity },
];
export const AIM_HEIGHT = 260;

export function zoneAt(y) { return ZONES.find((z) => y >= z.top && y < z.bottom); }

/** Resolve one lance. `rng` returns [0,1). Returns what the herald would record. */
export function strike(y, rng = Math.random) {
  const z = zoneAt(y);
  const r = { y, zone: z.id, attaint: null, broken: false, unhorsed: false, fault: null, points: 0 };
  if (z.id === 'helm' || z.id === 'body') {
    r.attaint = z.id === 'helm' ? 'head' : 'body';
    const off = Math.abs(y - z.centre);
    r.broken = off <= z.clean;
    if (r.broken) r.points = z.id === 'helm' ? 2 : 1;
    if (z.id === 'helm' && off <= 8 && rng() < 0.2) { r.unhorsed = true; r.points = 3; }
  } else if (z.id === 'saddle') { r.broken = true; r.fault = 'saddle'; r.points = -1; }
  else if (z.id === 'tilt') r.fault = 'tilt';
  return r;
}

/** Apply Tiptoft’s tilt penalty, which grows on the second strike. Mutates and returns the bout record. */
export function record(rider, result) {
  if (result.fault === 'tilt') {
    rider.tiltHits += 1;
    result.points = rider.tiltHits === 1 ? -2 : -3;
  }
  rider.courses.push(result);
  rider.score += result.points;
  if (result.attaint === 'head') rider.helmHits += 1;
  if (result.unhorsed) rider.unhorsings += 1;
  return rider;
}

export function newRider() { return { courses: [], score: 0, helmHits: 0, tiltHits: 0, unhorsings: 0 }; }

/** Tiptoft’s order of merit, simplified to one bout. Returns { winner: 'you'|'them'|null, reason }. */
export function verdict(you, them) {
  const out = (w, reason) => ({ winner: w, reason });
  const youOut = you.tiltHits >= 3, themOut = them.tiltHits >= 3;
  if (youOut !== themOut) return out(youOut ? 'them' : 'you', 'Three strikes on the tilt forfeit the prize.');
  if (you.unhorsings !== them.unhorsings) return out(you.unhorsings > them.unhorsings ? 'you' : 'them', 'Bearing a man out of the saddle outranks every other feat.');
  const y3 = you.helmHits >= 3, t3 = them.helmHits >= 3;
  if (y3 !== t3) return out(y3 ? 'you' : 'them', 'Three strikes in the sight of the helm outrank broken spears.');
  if (you.score !== them.score) return out(you.score > them.score ? 'you' : 'them', 'Most spears broken as they ought to be.');
  return out(null, 'Level on spears broken, with no unhorsing and no three helm strikes. The judges would weigh who ran the fairest course.');
}

/** Herald’s cheque marks for one rider, following the 1520 cheque’s layout. */
export function chequeMarks(rider) {
  const marks = { aboveTop: 0, belowTop: 0, middle: 0, bottom: 0 };
  for (const c of rider.courses) {
    if (c.attaint === 'head') marks.aboveTop++;
    if (c.attaint === 'body') marks.belowTop++;
    if (c.broken && !c.fault) marks.middle++;
    if (c.fault) marks.bottom++;
  }
  return marks;
}

/** The lance tip’s bob from the gallop, in aim-view pixels. Deterministic for a given phase. */
export function gallopBob(t, phase = 0) {
  return 20 * Math.sin(2 * Math.PI * 2.1 * t + phase) + 7 * Math.sin(2 * Math.PI * 0.7 * t + phase * 1.7);
}

/** An opponent’s lance height at impact. */
export function opponentAim(challenger, rng = Math.random) {
  const target = ZONES.find((z) => z.id === challenger.aim).centre;
  const gauss = Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng());
  return target + gauss * challenger.spread;
}

export function describe(result) {
  if (result.unhorsed) return 'Unhorsed! A spear broken that bears the rider out of the saddle';
  if (result.zone === 'helm') return result.broken ? 'Spear broken on the helm' : 'A fair attaint on the helm, spear unbroken';
  if (result.zone === 'body') return result.broken ? 'Spear broken on the body' : 'An attaint on the body, spear unbroken';
  if (result.zone === 'saddle') return 'Broken on the saddle: disallowed';
  if (result.zone === 'tilt') return 'Struck the tilt: a fault';
  return 'Missed clean';
}

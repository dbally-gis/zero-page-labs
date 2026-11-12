import { eventsFor, eventSource, CONTACT } from './battle-events.mjs?v=atlas-review';
import { damageStages } from './damage.mjs';

const eventKinds = {
  muzzle: 'Gunfire', timber: 'Impact', armor: 'Impact', shell: 'Impact',
  ram: 'Ram', 'reported-fire': 'Fire', explosion: 'Explosion'
};

const shooterRoles = { ram: 'Rammer' };
const targetRoles = { ram: 'Ship struck', 'reported-fire': 'Ship on fire', explosion: 'Ship affected' };

export function replayMoments(battle) {
  const moments = eventsFor(battle).map(event => ({
    key: `event:${event.id}`, at: event.at, ship: event.focus,
    kind: eventKinds[event.kind] ?? 'Battle event', title: event.title,
    text: event.text, note: event.certainty, source: eventSource(battle, event),
    roles: [
      { ship: event.shooter, label: event.representativeFiring || event.certainty===CONTACT ? 'Representative firing ship' : shooterRoles[event.kind] ?? 'Fired' },
      { ship: event.target, label: event.certainty===CONTACT ? 'Representative target' : targetRoles[event.kind] ?? 'Hit' }
    ].filter(role => role.ship)
  }));
  for (const ship of battle.ships) {
    for (const [index, stage] of damageStages(battle, ship).entries()) {
      moments.push({
        key: `damage:${ship.id}:${index}`, at: stage.at, ship: ship.id,
        kind: 'Damage', title: `${ship.name} · ${stage.title}`,
        text: stage.text, note: 'Documented damage · schematic timing', source: stage.source,
        roles: [{ ship: ship.id, label: 'Damaged ship' }]
      });
    }
    const fate = ship.fate;
    if (fate) {
      const sunk = fate.kind === 'sunk';
      moments.push({
        key: `fate:${ship.id}`, at: fate.at, ship: ship.id,
        kind: sunk ? 'Loss' : 'Capture', title: `${ship.name} · ${sunk ? 'Sunk' : 'Captured'}`,
        text: fate.text, note: 'Documented outcome · schematic timing', source: battle.sources[fate.source],
        roles: [{ ship: ship.id, label: sunk ? 'Ship lost' : 'Captured ship' }]
      });
    }
  }
  return moments.sort((a, b) => a.at - b.at);
}

export function momentAt(moments, progress, key, chapterStart) {
  if (key) {
    const chosen = moments.find(moment => moment.key === key && moment.at === progress);
    if (chosen) return chosen;
  }
  return lastMatching(moments, moment => moment.at >= chapterStart && moment.at <= progress);
}

export function adjacentMoment(moments, progress, key, direction) {
  const index = moments.findIndex(moment => moment.key === key && moment.at === progress);
  if (index !== -1) return moments[index + direction];
  return direction < 0
    ? lastMatching(moments, moment => moment.at < progress - .0005)
    : moments.find(moment => moment.at > progress + .0005);
}

function lastMatching(moments, matches) {
  for (let index = moments.length - 1; index >= 0; index--) {
    if (matches(moments[index])) return moments[index];
  }
}

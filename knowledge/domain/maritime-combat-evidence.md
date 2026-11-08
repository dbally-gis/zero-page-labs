---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-08T17:06:01-06:00"
---
# Selected combat evidence across twelve encounters

`battle-events.mjs` supplies50source-linked cards,32animated episodes. Every offset is an authored replay position, never an exact historical clock time. `combat.mjs` now has no nearest-target logic, global salvo cadence, arbitrary hit ratio or synthetic near misses. New battles must have evidence-backed episodes or the coverage test fails.

## Source-to-effect map

| Encounter | Evidence basis | What is represented | Boundary |
|---|---|---|---|
| Diu | Portuguese Ministry of Defence study, artillery passage | Flor’s discharge, barrage against Egyptian rear carrack, channel denial | Carrack is individually described but unnamed; one ball stands for a barrage, not a known fatal round. National institutional account. |
| Lepanto | Museo Naval bow-gun/boarding resource and flagships PDF | Representative bow discharges, boarding/capture narrative | No particular impact is assigned from general artillery evidence. |
| Gravelines | NMRN Armada Map10; Greenwich object155962 identifies Revenge | Drake/Revenge engaging San Martín; timber response | Calendar labels vary; no per-round hit log. |
| Downs | Dutch Aemilia ship record; Historic England wreck record | Fleet-level muzzle discharge, fireships narrative | No Aemilia hit assigned to an anonymous target; fireship victims not silently mapped onto generic hulls. |
| Quiberon | Greenwich object11888, commentary on the two flagships | Representative reciprocal exchange; timber debris | Not measured reload timing; Superbe’s weather/gunfire loss remains separate. |
| Chesapeake | NPS Battle of the Capes, paragraph beginning “The wind direction” | Leading-fleet discharges, damage/disengagement narrative | Command symbols are representative; rear-half inactivity and unknown individual hits are preserved. |
| Nile | Greenwich beginning-of-action; Mariners Museum CL20622; Nelson dispatch via NHHC | Representative fleet discharges; separate Orient explosion | No fabricated incoming fatal projectile or ignition source. |
| Trafalgar | Prior RMG and Lucas evidence | Rake, reciprocal exchange, attributed stern fire | See trafalgar-evidence.md. |
| Hampton Roads | NOAA Hampton Roads account,9March paragraph | Armour deflections, forward pilothouse impact | Brief sparks/ricochet; no penetration or fire inferred; exact damage geometry remains generic. |
| Lissa | Italian Navy battle and Re d’Italia ship record | Fleet muzzle fire, documented ram | Ram is not gunfire or a magazine explosion. |
| Yalu | USNI1895 Battle of the Yalu including corrections | Attributed Zhenyuan/Chen Yuen shell damage and Matsushima fire | Accounts differ; no settled calibre, time or casualty count claimed. |
| Manila | Olympia/Dewey reports hosted by NHHC; Montojo report; modern NHHC | Forward mounting discharge, reported shell hit, separate fires and scuttling | Forward describes turret location, not researched train angle. Shell-burst duration and fire onset are illustrative. |

Direct source URLs and displayed uncertainty labels live beside the episode descriptions in battle-events.mjs; source indices resolve against each encounter’s bibliography. Participant claims are attributed, not presented as independently corroborated facts.

## Rendering contract

Timber contact: dust/debris, no flame. Armour: brief sparks plus ricochet for the deflection examples, no sustained fire. Shell: small round short burst, not a persistent flame. Reported fire: fixed-size flame/smoke following the vessel, ending at sourced loss. Explosion: separate broad burst without muzzle/projectile. Ram: contact debris without muzzle/projectile/fire. Muzzle-only: no target, impact, ripple or projectile. Glowing cannonball trails removed.

`impactStyle` shares bounded age/material parameters between SVG and3D. Effects derive only from replay progress; pause/scrub are deterministic; the five-slot pool remains bounded. Reduced-motion suppresses flashes, bursts, moving particles and projectiles. No damage score, boarding simulation or alternate outcome calculation is introduced.

## Checks

194Node tests include12event/source sets, typed responses, material-specific no-fire assertions, pair provenance regression, fire-loss cutoffs, deterministic scrubbing and bounded effects. Deep static verification covers10pages. Browsermatrix:12eventguides,50workingcards/links, seeks pause correctly;375pxYalu source card has no overflow; classic armour5sparks/noflame and ram7fragments/noflash; Manila two fires disappear after their source-backed loss thresholds.

---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-08T10:05:44-06:00"
---
# Trafalgar evidence boundary

The replay depicts selected episodes, not every gun, ship, round or minute. Replay offsets are pedagogical; they are not historical clock times. No probability or nearest-target system supplies Trafalgar shots.

| Episode / treatment | Evidence | Boundary |
|---|---|---|
| Two columns approach | [RMG BHC0548 commentary](https://www.rmg.co.uk/collections/objects/rmgc-object-12040) | No named first shooter is assigned. Royal Sovereign’s separate action is not animated in this focused pass. |
| Victory rakes Bucentaure from astern | RMG BHC0548, paragraph beginning “Almost in the centre” | One representative projectile; not an individual confirmed hit, measured trajectory or ammunition load. |
| Victory / Redoutable reciprocal broadsides | [Captain Lucas report, paragraphs beginning “At a quarter before twelve” and “The enemy, however”](https://www.napoleon.org/en/history-of-the-two-empires/articles/captain-lucass-report-concerning-the-loss-of-the-vessel-redoutable-at-the-battle-of-trafalgar) | The two sample shots do not establish first shooter or reload time. Do not adopt the report’s clock times/casualty totals as independently confirmed. |
| Timber damage rather than per-hit flames | Lucas reasons for surrender describe shattered structural timber and shot-through decks; [Victory embedded shot KTP1138](https://www.rmg.co.uk/collections/objects/rmgc-object-36990) is physical context | Dust and fragments are illustrative. No claim that each observed broadside used only one ammunition type. |
| Redoutable fire astern | Lucas reason 8 for surrender | Attributed eyewitness report; exact ignition time/cause/duration unknown. Depicted late as a reported condition, separate from impacts. No flash/projectile starts the fire; visual size stays bounded as replay time advances. |

Other battles still use explicitly synthetic gunfire. No full fleet reconstruction, reload simulation, measured gunnery ranges, musketry, boarding casualties or damage adjudication was added.

Implementation: `experiments/maritime/trafalgar-events.mjs` contains episode descriptions/source links; `combat.mjs` handles deterministic representative events; both 3D and classic SVG show timber debris instead of impact flame for Trafalgar.

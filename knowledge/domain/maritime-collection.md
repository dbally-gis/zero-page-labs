---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-08T16:49:32-06:00"
---
# Maritime collection and vessel outcomes

The selected collection contains12 landmark encounters within1400–1900: Diu1509, Lepanto1571, Gravelines1588, Downs1639, Quiberon Bay1759, Chesapeake1781, Nile1798, Trafalgar1805, Hampton Roads1862, Lissa1866, Yalu1894, Manila Bay1898. It is a curated teaching collection, not a claim to the definitive12most famous battles. Each has5chapters and3curated questions. New encounter data lives in `extra-battles.mjs`; source records link museum, navy, heritage and park accounts. Routes, intervals and fleet markers remain schematic. Trafalgar alone has the earlier selected evidence-led firing episodes; other gunfire remains explicitly illustrative.

## Outcome semantics

`ship.fate={kind,at,source,text}` is historical narrative data, independent of `combat.mjs` hits. `at` is an authored teaching threshold, never an exact historical minute. Only identified ships with evidence receive outcomes. No unnamed formation marker is assigned a fate.

| Vessel | Status | Evidence |
|---|---|---|
| Sultana | Captured | Museo Naval flagship teaching resource already linked in Lepanto |
| Superbe | Sunk in battle, gunfire/weather | RMG Quiberon commentary, object11888 |
| Orient | Destroyed by explosion | Mariners Museum CL20622 |
| Re d’Italia | Sunk after ramming by Ferdinand Max | Italian Navy ship record |
| Reina Cristina | Scuttled in shallow water after damage | NHHC H018-5 Manila Bay account |
| Castilla | Burnt and sunk | Montojo report hosted by NHHC |

Sunk ships stop at their threshold position, lose their hull/wake/engine smoke, retain a selectable thick cross and explicit `Sunk` label, and do not fire or receive synthetic shots. Weapons sectors disappear. SVG and3Duse the same fate model. Captured ships retain their hull and receive an inspector label; no sinking X. Reverse scrubbing restores the pre-event state without accumulating damage. Ship outcome controls jump directly to the sourced state.

Soleil Royal’s destruction the following day and Trafalgar’s post-battle storm losses are not portrayed as battle sinkings. Downs wreck identities are uncertain; no individual lost marker is inferred. Chesapeake deliberately demonstrates strategic sea control without invented sinking.

## Validation

`node --test execution/test_experiments.mjs execution/test_maritime.mjs execution/test_maritime_combat.mjs`; `python3 execution/build_site.py`; `python3 execution/verify_site.py --deep`.
Browser:12chooser entries,5chapters/3questions each, vessel/model counts match;375pxlayout; loss jump, reverse scrub, classic markers, capture distinction. Independent review against original user request is required for a later major collection expansion.

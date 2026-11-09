---
generated_by: "OpenAI Codex (GPT-6; exact variant not exposed)"
timestamp: "2026-11-08T17:20:34.479438-06:00"
---

# Maritime progressive damage

Victory's fore-topsail uses the surviving sail documented by [Royal Navy Museums](https://www.royalnavymuseums.org.uk/news/caring-hms-victorys-fore-topsail). Redoutable's main and mizzen mast loss uses [Captain Lucas's report](https://www.napoleon.org/en/history-of-the-two-empires/articles/captain-lucass-report-concerning-the-loss-of-the-vessel-redoutable-at-the-battle-of-trafalgar). The stage threshold is illustrative; it is not a recorded onset or order of individual hits.

Damage is selected from replay progress, never calculated by accumulating combat particles. Cached 3D variants preserve shared geometry. Classic chart switches diagrams at the same thresholds. Seeking backward restores the original model. Inspector damage buttons stay mounted through playback.

Sinking starts at the existing sourced loss threshold, which still stops movement and combat. During the next 3.5% of progress the dimensional hull lists and descends through the sea surface; Classic chart fades the silhouette. The X appears after the transition. Reduced motion goes straight to the final state. Captures never sink. Manila uses a shallow wreck silhouette supported by [archival photographs](https://www.history.navy.mil/our-collections/photography/numerical-list-of-images/nhhc-series/nh-series/USN-902000/USN-902927.html); Reina Cristina's scuttling remains distinct from Castilla's fire and sinking.

Sinking motion, heel, depth, and hole geometry are illustrative. Redoutable's next-day loss remains outside this replay.

## 2026-11-08 · Collection expansion

The 11 other encounters have 14 additional stages, accessible from Ship Damage below the timeline and from the selected ship’s inspector. Stage visuals are explicit snapshots. Later snapshots retain earlier visible damage where applicable. Both renderers derive state from the same authored threshold, and the stage button pauses and selects the vessel.

- Diu: the documented large Gujarati ship receives the hull breach and late sinking. This is separate from the Egyptian rear carrack.
- Lepanto and Gravelines: Real’s damaged forward rail and San Martín’s holed planking use the published Spanish naval histories.
- Downs: Historic England supports Santa Teresa’s fire and destruction. The replay illustrates the documented fire phase, with no assigned sinking mechanics.
- Quiberon and Chesapeake: Magnanime loses its foreyard. Intrepid’s damage return supports damaged topsails, a broken fore topsail yard and starboard hull damage.
- Nile: the contemporary British account describes Bellerophon dismasted and drifting away before Orient exploded.
- Hampton Roads and Lissa: Greene’s letter describes Monitor’s cracked pilothouse and displaced hatch. The Lissa naval study locates the ram breach on Re d’Italia’s port side.
- Yalu and Manila Bay: Matsushima’s deck and funnel stages follow the Japanese naval report. Montojo describes Reina Cristina’s hull, fire and smoke-pipe damage and Castilla’s fire before loss.

The source links are stored alongside the stage data in `experiments/maritime/damage.mjs`. Anonymous formation markers do not receive damage. Onset, outline and generic vessel geometry are schematic.

## Follow Ship

The close-up follows the same replay position as the model, including the clamped position after a documented sinking. Its zoom is separate from overview framing. Shared `view=follow` moments open paused. Classic chart uses the same tracked center. The dimensional view looks across the port quarter and keeps a fixed bearing under reduced motion.

Watch Ship Action seeks before the next sourced gunfire, damage or loss involving the selected ship. Reduced motion jumps to the corresponding still state. The close-up exposed inward-facing hull triangles in the generic models. Correct winding lets the hull sides render from the lower viewing angle.

## Replay Desk

The desk reserves the viewport for the chart, playback and a bounded details pane. Moment, Ship and Battle share one scroll area. The mobile pane starts collapsed. Switching tabs opens it, and collapsing on desktop returns the width to the scene. View options holds the overlays and Classic chart. The chapter guide, curated questions and reading list live in Battle.

`replay-moments.mjs` combines firing episodes, damage stages and outcomes into a chronological index without discarding coincident evidence. The moment picker, next and previous buttons, and replay marks use that index. An optional shared moment key identifies one entry when multiple sources use the same teaching threshold. It is accepted only when it matches a moment at the shared progress. The camera and historical data remain replay-derived.

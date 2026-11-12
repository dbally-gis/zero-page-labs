---
generated_by: "OpenAI Codex (GPT-6; exact variant not exposed)"
timestamp: "2026-11-10T09:50:00-06:00"
---

# HMS Bellona study

- [ZAZ1357](https://www.rmg.co.uk/collections/objects/rmgc-object-81148) provides the shared body, sheer, and longitudinal half-breadth plan. The viewer uses visually estimated stations and published gun-deck length and breadth. It interpolates the sections.
- [ZAZ1359](https://www.rmg.co.uk/collections/objects/rmgc-object-81150) provides the inboard profile. The shared design and later alterations are distinct marks on the sheet. Deck levels and sheer are approximate readings of the original arrangement.
- [Construction model](https://www.rmg.co.uk/collections/objects/rmgc-object-66464) illustrates framing and planking. Timber dimensions, joints, framing count, gun carriages, barrel placement, and exact fittings in the viewer are interpretive. The scene omits much of the standing and running rigging.
- [Published ship details](https://www.rmg.co.uk/stories/maritime-history/bellona-third-rate-74) support the dimensions and allocation of 74 guns. The model follows the original two gun decks with lighter batteries above. It does not model later refits.
- [1797 seamanship account](https://jimclifford.ca/britannica-articles-1/a/EB.5/191253800/49.html) gives the sequence for a successful tack under way. The rudder starts the turn. The main yards come round near head to wind. The fore yards follow after the bow has crossed. Timing, speeds, yard and rudder angles, wind, sail billow and path are illustrative values.

The exhibit imports the pinned Three module from Maritime. If WebGL is disabled, the original schematic cover plate, source notes, and interactive tack chart are still usable. Museum scans were inspected for reference and are linked in the exhibit.

## Lower gun deck drill

[William Falconer’s Exercise entry](https://www.gutenberg.org/files/57705/57705-h/57705-h.htm#:~:text=Exercise%20is%20the%20preparatory%20practice) anchors the sequence. The printed exercise begins with a prepared gun and puts firing before sponging and loading. The exhibit enters the repeating cycle one operation earlier, with the empty gun already inboard, then proceeds through run-out, pointing, firing, and the next reload. It ends before the next run-out. RMG documents the lower deck’s 28 32-pounders. The lesson’s gun bay geometry, crew stations and number shown, tackle routing, motion, recoil travel, smoke, and playback seconds are interpretive. The 3D bay and SVG side plate share the same deterministic samples.

### Inspecting the crew

The five labels identify tasks assigned to the illustrated figures. The same seven phase boundaries drive the scene and the selected crew member’s activity. Falconer documents the exercise sequence. The division of work, the five stations, and the descriptions of what a given figure is doing are teaching inferences. Near and far refer to the starting camera view. The crew buttons expose these same descriptions alongside the 2D schematic.

## Learnings — 2026-11-10 modeling corrections (Claude Code CLI, Claude Fable 5.2)

A numerical review of the exhibit's own tables found the motion contradicted its narration. The corrected conventions:

- **Yard angles are stored from square.** Braced sharp up is 53°, which puts the yard 37° from the keel. The earlier 37° from square left 9° of wind on the sails. `incidence(heading, yard)` in `study.mjs` gives the signed angle at which the wind meets a sail, and the tests hold it at 20° or more when close-hauled.
- **Close-hauled is 67° off the wind**, about six points. The after yards (main and mizzen) swing together from 13 s. The fore yards stay braced on the old tack until 24 s, when the main yards have filled.
- **Tack keys use monotone cubic interpolation**, so the turn rate is continuous and no value overshoots a key. The turn rate is lowest as the bow crosses the wind and highest early, under full way and helm.
- **The chart path comes from `tackTrack()`**: heading and speed plus 8° of leeway and a small downwind drift as the ship loses way. Both values are illustrative.
- **Recoil is in metres and seconds.** It starts at 3.2 m/s (momentum balance for a 32 lb shot and charge against about 3.3 t), slows at 1.2 m/s², and the breeching stops the carriage after 2.48 m with about 2 m/s still on. At 1× the recoil runs at about true speed while the crew work stays compressed.
- **`slackCurve()` draws the breeching at fixed length.** Slack drops to the deck and lies in a bight. The no-WebGL side plate only droops the rope and does not hold its length.
- **The keel is straight to a sternpost.** The station table's third column is the bottom of the hull body. Deadwood fills the gap aft, and the rudder reaches the keel line.
- **The rig is near full size**: main truck 56 m above the waterline, main yard 29 m, masts at about 12%, 55%, and 85% of the gun deck from the bow. The cutaway keeps its tighter frame, so the upper masts run off the plate there.

The real-ship figures used for these corrections (yard bracing limit, spar dimensions, mast stations, recoil masses, time for a tack or a round) came from the reviewing agent's general knowledge and were not checked against Lavery, Steel, or the Admiralty drawings. Treat them as approximate until sourced.

## Learnings — 2026-11-11 shadows and 3D tack track

- One directional light casts shadows for both scales. `aimLight` in `scene.mjs` re-aims it and resizes its shadow camera when the view changes: 72 m reach for the ship, 6.5 m for the gun bay.
- Sails cast shadows but do not receive them (`userData.castOnly`). Receiving produced curved banding on the billowed cloth.
- The ground plane is `ground = -7.2`. A `ShadowMaterial` floor sits just below the grid and takes the ship's shadow.
- In the guided tack view the ship stays at the origin. The path strips and the grid slide under her by `tackPosition(time) * trackScale` (12 m per path unit, about four ship lengths for the tack).
- Scene mapping: path y (to windward) is world x, path x (across the wind) is world z.
- The SVG chart stays as the overview and as the no-WebGL fallback.

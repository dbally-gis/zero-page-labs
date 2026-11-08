---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T17:04:06.403311-06:00"
---

# Zero Page Labs — Experiments launch
Goal: Publish browser-ready Retro-Glitch Studio and Lexical with an Experiments section.
Agent: OpenAI Codex
Handoff-from: OpenAI Codex
Handoff-type: continuation
Status: Complete. Both public browser experiments are live; original workshop repositories remain unchanged.

## Current checkpoint
- Public contract appended to task.md.
- Read-only readiness reviewer confirmed Retro has24effects and requires a browser port; Lexical needs URL/proxy removal, input limits, mobile controls, local runtime assets, dependency fixes.
- Publication adaptation lives in experiments-source/lexical; output goes to experiments/lexical. postprocessing stays6.x. Vite6.4.5 with patched transitive dependencies currently audits clean.
- Retro browser-native edition in experiments/retro-glitch is being implemented with bounded PNG/JPEG input, worker rendering,24effects, comparison/reset/export.
- Existing hourly Pebble sync and Render hook workflow remains deployment path. Prior live site includes original Gridcore plates and transparent Thumbwords phone.

## Handoff / next
Finish public UI, run meaningful tests and production browser QA atdesktop/mobile, fresh independent verification, then publish through the existing workflow. Prior completed launch and gallery work remains in archive/launch-and-catalog-20261107.md and Git history.

## Readiness / verification checkpoint
Source blockers resolved: static hosting adaptation; proxy removal; bounded intake; null-prototype dictionaries; inert HTML extraction; local font/HDR removal; mobile controls. Independent verifier PASS after reserved-word/palette fixes.41Node tests and17Python tests PASS; deep static verifier PASS9pages; full npm audit0. Browser verified photo import→effect→PNG export (actual file decoded), reset, text paste, local text-file loading, constructor regression, both modes, selectable2D fallback, back links,375px layouts including opacity controls. Source/output manifest is checked during normal site builds. Deployment next.

## Checkpoint Log

- 2026-11-07 18:31 — commit: Launch browser-native Retro-Glitch and Lexical experiments | .github/workflows/sync-pebble.yml,assets/experiment-lexical.svg,assets/experiment-retro.svg,data/experiments-build.json,data/experiments-provenance.json

- 2026-11-07 18:34 — commit: Record verified public experiments deployment | knowledge/INDEX.md,knowledge/REFLECTIONS.jsonl,knowledge/SESSION.md,knowledge/domain/experiments-readiness.md,task.md
- 2026-11-07 19:34 — commit: Show real filter examples with one-click recipes | experiments/retro-glitch/index.html,experiments/retro-glitch/studio.css,experiments/retro-glitch/studio.js,knowledge/SESSION.md,task.md
- 2026-11-07 19:36 — commit: Record verified filter example publication | knowledge/SESSION.md,task.md
- 2026-11-07 20:35 — commit: Link verified public GitHub repositories on project pages | data/experiments-build.json,data/public-repositories.json,execution/build_site.py,experiments-source/lexical/src/components/FuturisticHUD.jsx,experiments/index.html
- 2026-11-07 20:46 — commit: Add guided built-in text examples to Lexical | data/experiments-build.json,execution/test_experiments.mjs,experiments-source/lexical/src/App.jsx,experiments-source/lexical/src/components/FuturisticHUD.jsx,experiments-source/lexical/src/components/InterpretationRail.jsx
- 2026-11-07 20:48 — commit: Record verified Lexical examples deployment | knowledge/SESSION.md,task.md
- 2026-11-07 21:31 — commit: Rebuild Lexical as a connected reading playground | data/experiments-build.json,directives/publish_experiments.md,execution/test_experiments.mjs,experiments-source/lexical/src/App.jsx,experiments-source/lexical/src/components/BookMatrix.jsx
- 2026-11-07 21:33 — commit: Record verified Lexical playground deployment | knowledge/REFLECTIONS.jsonl,knowledge/SESSION.md,task.md
- 2026-11-07 21:38 — commit: Promote full passage access to top of Lexical reader | data/experiments-build.json,experiments-source/lexical/src/components/ReadingPanel.jsx,experiments-source/lexical/src/index.css,experiments/lexical/assets/index-B8hiIk7e.js,experiments/lexical/assets/index-Bt2qb0ns.css
- 2026-11-07 22:59 — commit: Build reviewed Maritime naval battle atlas | .github/workflows/sync-pebble.yml,assets/experiment-maritime.svg,directives/publish_experiments.md,execution/test_maritime.mjs,experiments/index.html
- 2026-11-08 09:06 — commit: Record verified Maritime production deployment | knowledge/INDEX.md,knowledge/REFLECTIONS.jsonl,knowledge/SESSION.md,knowledge/domain/maritime-readiness.md,task.md
- 2026-11-08 09:12 — commit: Open Lexical passages in a spacious reading dialog | data/experiments-build.json,experiments-source/lexical/src/components/ReadingPanel.jsx,experiments-source/lexical/src/index.css,experiments/lexical/assets/index-C3Hg6db7.js,experiments/lexical/assets/index-Dy1nqw8C.js
- 2026-11-08 09:27 — commit: Follow any passage word directly from Lexical reader | data/experiments-build.json,execution/test_experiments.mjs,experiments-source/lexical/src/App.jsx,experiments-source/lexical/src/components/ReadingPanel.jsx,experiments-source/lexical/src/index.css
- 2026-11-08 09:29 — commit: Record verified direct passage selection release | knowledge/ERRORS.md,knowledge/domain/lexical-passage-selection.md
- 2026-11-08 09:33 — commit: Keep Lexical reader open while selecting words | data/experiments-build.json,experiments-source/lexical/src/App.jsx,experiments-source/lexical/src/components/ReadingPanel.jsx,experiments-source/lexical/src/index.css,experiments/lexical/assets/index-B3-WkFZD.js
- 2026-11-08 09:39 — commit: Navigate word occurrences inside Lexical reading view | data/experiments-build.json,experiments-source/lexical/src/components/ReadingPanel.jsx,experiments-source/lexical/src/index.css,experiments/lexical/assets/index-B3-WkFZD.js,experiments/lexical/assets/index-BPatPcGc.css
- 2026-11-08 09:42 — commit: Add arrow-key navigation to Lexical reading view | data/experiments-build.json,experiments-source/lexical/src/components/ReadingPanel.jsx,experiments/lexical/assets/index-CVwzsnoU.js,experiments/lexical/assets/index-Df9twVN2.js,experiments/lexical/index.html
- 2026-11-08 09:48 — commit: Wrap Lexical occurrence navigation at both ends | data/experiments-build.json,experiments-source/lexical/src/components/ReadingPanel.jsx,experiments/lexical/assets/index-Bwq9BBKc.js,experiments/lexical/assets/index-Df9twVN2.js,experiments/lexical/index.html
- 2026-11-08 09:53 — commit: Search and follow words inside Lexical reading view | data/experiments-build.json,experiments-source/lexical/src/components/ReadingPanel.jsx,experiments-source/lexical/src/index.css,experiments/lexical/assets/index-6ngln1rW.css,experiments/lexical/assets/index-Bwq9BBKc.js
- 2026-11-08 09:54 — commit: Publish dimensional Maritime replay with illustrative gunfire effects | .github/workflows/sync-pebble.yml,data/maritime-vendor.json,directives/publish_experiments.md,execution/test_maritime_combat.mjs,execution/verify_site.py
- 2026-11-08 09:57 — commit: Record verified Maritime visual deployment | knowledge/SESSION.md,task.md
- 2026-11-08 09:58 — commit: Choose Lexical search results with arrow keys | data/experiments-build.json,experiments-source/lexical/src/components/ReadingPanel.jsx,experiments-source/lexical/src/index.css,experiments/lexical/assets/index-6ngln1rW.css,experiments/lexical/assets/index-CjcBzUCS.js
- 2026-11-08 10:01 — commit: Focus Lexical reading search with slash and clear with Escape | data/experiments-build.json,experiments-source/lexical/src/components/ReadingPanel.jsx,experiments/lexical/assets/index-Bbm89vQS.js,experiments/lexical/assets/index-CjcBzUCS.js,experiments/lexical/index.html
- 2026-11-08 10:05 — commit: Add discoverable keyboard shortcut help to Lexical reader | data/experiments-build.json,experiments-source/lexical/src/components/ReadingPanel.jsx,experiments-source/lexical/src/index.css,experiments/lexical/assets/index-Bbm89vQS.js,experiments/lexical/assets/index-C-u228OK.js
- 2026-11-08 10:05 — commit: Ground Trafalgar gunfire in sourced episodes and timber impacts | execution/test_maritime_combat.mjs,experiments/maritime/battles.mjs,experiments/maritime/combat.mjs,experiments/maritime/index.html,experiments/maritime/maritime.css
- 2026-11-08 10:40 — commit: Simplify Lexical into one chart workspace and a focused reader | data/experiments-build.json,experiments-source/lexical/src/App.jsx,experiments-source/lexical/src/components/ReadingPanel.jsx,experiments-source/lexical/src/index.css,experiments/lexical/assets/index-BIeDGysw.css
- 2026-11-08 10:42 — commit: Record verified Lexical flow redesign deployment | knowledge/SESSION.md,knowledge/domain/lexical-workspace-flow.md,task.md
- 2026-11-08 11:09 — commit: Fill Lexical charts and import text from URLs | data/experiments-build.json,directives/publish_experiments.md,execution/test_experiments.mjs,experiments-source/lexical/public/texts/sherlock-holmes-source.json,experiments-source/lexical/public/texts/sherlock-holmes.txt
- 2026-11-08 11:12 — commit: Record verified chart framing and URL import deployment | knowledge/SESSION.md,knowledge/domain/lexical-url-framing.md,task.md
- 2026-11-08 12:24 — commit: Restore the 3D book and start with Sherlock Holmes | data/experiments-build.json,execution/build_experiments.py,execution/test_experiments.mjs,experiments-source/lexical/src/App.jsx,experiments-source/lexical/src/components/PlaygroundScene.jsx
- 2026-11-08 12:28 — commit: Record verified restored book and Sherlock default | knowledge/REFLECTIONS.jsonl,knowledge/SESSION.md,knowledge/domain/lexical-book-identity.md,task.md
- 2026-11-08 12:44 — commit: Give the 3D book a larger default focus view | data/experiments-build.json,experiments-source/lexical/src/App.jsx,experiments-source/lexical/src/index.css,experiments/lexical/assets/index-52J37cGA.js,experiments/lexical/assets/index-BzodXtzl.css
- 2026-11-08 12:47 — commit: Record verified larger default book deployment | knowledge/SESSION.md,knowledge/domain/lexical-book-identity.md,task.md
- 2026-11-08 13:04 — commit: Add full-screen exploration to Lexical book view | data/experiments-build.json,execution/test_experiments.mjs,experiments-source/lexical/src/App.jsx,experiments-source/lexical/src/fullscreen.js,experiments-source/lexical/src/index.css
- 2026-11-08 13:05 — commit: Record fullscreen deployment verification | knowledge/SESSION.md,knowledge/domain/lexical-book-identity.md,task.md
- 2026-11-08 14:10 — commit: Keep word following controls in fullscreen Lexical | data/experiments-build.json,experiments-source/lexical/src/App.jsx,experiments-source/lexical/src/index.css,experiments/lexical/assets/index-0EaGaWCK.css,experiments/lexical/assets/index-CXwBgZ_B.js
- 2026-11-08 14:17 — commit: Record fullscreen word controls verification | knowledge/SESSION.md,knowledge/domain/lexical-book-identity.md,task.md
- 2026-11-08 14:40 — commit: Map complete Sherlock book and search fullscreen words | data/experiments-build.json,execution/build_experiments.py,execution/test_experiments.mjs,experiments-source/lexical/src/App.jsx,experiments-source/lexical/src/components/PlaygroundScene.jsx
- 2026-11-08 14:42 — commit: Record complete-book search release verification | knowledge/DECISIONS.md,knowledge/ERRORS.md,knowledge/INDEX.md,knowledge/SESSION.md,knowledge/domain/lexical-book-identity.md
- 2026-11-08 14:45 — commit: Focus active Lexical word and dim context threads | data/experiments-build.json,execution/test_experiments.mjs,experiments-source/lexical/src/components/FlatView.jsx,experiments-source/lexical/src/components/PlaygroundScene.jsx,experiments-source/lexical/src/model.js
- 2026-11-08 14:50 — commit: Record verified active-thread emphasis release | knowledge/SESSION.md,knowledge/domain/lexical-book-identity.md,task.md
- 2026-11-08 14:59 — commit: Add solo active-word toggle to Lexical book | data/experiments-build.json,execution/test_experiments.mjs,experiments-source/lexical/src/App.jsx,experiments-source/lexical/src/components/FlatView.jsx,experiments-source/lexical/src/components/PlaygroundScene.jsx
- 2026-11-08 15:01 — commit: Record solo-thread verification and review gap | knowledge/ERRORS.md,knowledge/INDEX.md,knowledge/SESSION.md,knowledge/domain/lexical-book-identity.md,task.md
## Published result
Source commit324794cfc3053c3e771cb5deefd928722785206e. GitHub run42430166067 passed tests, build, Render deployment, and public fingerprint verification. Live homepage Experiments section and /experiments/ observed. Live Retro mutation completed3effects with export ready; live Lexical switched to Throughline with398mapped nodes. Console error/warning logs empty on these live checks. Screenshot:.tmp/experiments-live.jpg. Ready for public experiment use within documented limits; physical iPhone/Safari testing remains open.

S.D.G.: Curious visitors can transform an image or explore a passage immediately, with their content staying on their own device.
Feynman gap: Chrome desktop,375px layout, actual PNG export, independent source review and deployment are verified; physical mobile Safari and forced WebGL-unavailable behavior remain untested.

## Filter examples
Added four original/effect cards before the studio: Pocket console (Game Boy), Worn-out videotape (chromatic aberration plus VHS tracking), Pixels out of place (pixel sort), and Terminal transmission (ASCII on the Thumbwords handset). Previews use the shipped processing worker at 960×640. Each Try button reuses its displayed source, recipe, and seed42.

Desktop preview inspection, videotape/handset recipe loading, comparison/reset, and375px no-overflow checks passed. Fresh verifier found no source blockers. A transient disk-space failure interrupted a local build; the unchanged source subsequently rebuilt successfully, deep static verification passed, and41Node tests passed. Cloud publication is being verified.

Filter examples published: source63d8ea1; cloud run42434861213 passed tests/build/deploy/public fingerprint verification. Live four-card gallery observed with working previews and clean console. Screenshot:.tmp/filter-examples-live.jpg.

S.D.G.: Visitors can recognize four filter outcomes before choosing settings.
Feynman gap: Desktop and375px layout plus recipe loading/reset verified; physical-device checks remain open.

## Public GitHub links
Verified current public repository visibility through GitHub. Added project/data/browser-edition links with accurate scope, eight matching watchface source links, and shared site-source footers. Original private repositories remain private. Source mapping persists independently of hourly watchface refresh. Local build/deep verifier and17Python tests passed. Browser inspected mobile Lexical source link with no overflow, Thumbwords data scope label, and eight watchface source anchors without nested anchors. Published source96d5412. Cloud run42439233250 passed tests/build/deploy/fingerprint verification. Live Thumbwords word-data link and site-source footer observed; screenshot:.tmp/public-github-links-live.jpg.

## Lexical built-in text examples
Added a visible Example text selector with four original passages: The workshop, The returning signal, Three neighborhoods, and Letters & lengths. Each loads its text, suggested mode, focus terms, and viewing guide. Custom paste clears sample identity; Reset example restores the active sample or Workshop. Example focus words are included in customWords so question renders despite being outside the top8. Tablet widths now use the flow layout to avoid topbar clipping. Desktop/375px/768px checks passed; all four selections, prior-filter clearing, custom-text clearing and reset were exercised. Console clean. Fresh source verifier PASS;46Node tests and17Python tests pass; deep static verifier passes9pages. Deployment next.

Published Lexical examples: sourcea1d4ae0, cloud run42439966350 succeeded through public fingerprint verification. Live The returning signal selected270nodes and three focus terms, with matching built-in guide; console clean. Screenshot:.tmp/lexical-examples-live.jpg.

S.D.G.: Visitors can explore spelling and recurrence patterns immediately from four built-in texts.
Feynman gap: Four sample flows, custom text/reset, desktop/375px/768px layouts, independent source review and public deployment verified; physical mobile remains untested.

## Full Lexical playground update — active
Goal: implement the complete approved review recommendations. Agent: OpenAI Codex. Handoff-type: continuation. Status: complete. Scope includes unified colors, focused stage, advanced drawer, camera reset, linked reader/occurrences, PNG/clean view, honest complete2D, optional decoration, meaningful labels, mobile controls, shareable built-in views and local saved sessions. No original project edits or server-side content processing. Binary contract in task.md.

### Implementation verified
Unified colors, instanced framed stage, collapsed advanced controls, camera reset, linked excerpts/full reader, complete 2D, optional particles, explanatory coordinates/sheets, Clean view and contextual PNG are implemented. Built-in views serialize bounded settings without text; local JSON restores custom text/settings/camera. 63 Node tests, 17 Python tests and deep static verification pass. Actual browser PNG downloads and local session roundtrip passed; maximum 20,000-character passage rendered 5,000 occurrences over20 sheets. Phone375px and tablet768px have no overflow. Browser policy blocked opening a copied share URL; restoration is unit-tested, with a visible copyable link as fallback. Physical Safari remains open. Deployment pending.

### Published result
Source7b90574ebda496b8b33923875e104be9aca17ef0. GitHub run42443111179 passed tests/build/Render deployment/public fingerprint verification. Independent final source review PASS. Live Next occurrence changed reader selection; complete2D exposed398 occurrences/2sheets; returning3D rendered correctly; error/warning logs empty. Screenshot:.tmp/lexical-playground-live.jpg. Status: complete.

S.D.G.: Curious readers can follow recurring words into their context and keep a visual result while their custom passage stays on-device.
Feynman gap: Real PNG downloads, local session restoration, responsive layouts, automated link restoration and public deployment are verified; physical Safari and direct browser share-link navigation remain unverified.

## Maritime — active implementation
Goal: Build the approved tactical naval battle explorer, run review-app, fix its recommendations, publish to Zero Page Labs.
Agent: OpenAI Codex
Handoff-from: OpenAI Codex
Handoff-type: continuation
Status: complete. Prior SESSION modifications preserved.
Surface: experiments/maritime plus home/directory discovery; existing Render deployment pipeline. Contract in task.md. The project has no review-pp skill; review-app is the matching available workflow. Historical source research underway. No live generative endpoint is implied by contextual curated explanations.

### Maritime — reviewed, awaiting deployment
Four encounter atlas implemented in experiments/maritime. Independent review-app pass completed after fixes to anchor navigation, narrative/path alignment, unsupported sectors, shared pause, marker margins and context. 84 JS tests +17 Python tests pass; deep verifier10pages passes. Desktop/375px/768px browser checks passed. Public release pending. Terminal DNS cannot resolve GitHub; connector write requires unavailable approval. Signed-in GitHub browser upload interface is available and is being used to publish reviewed files through normal UI. Existing source dirty SESSION lines were preserved.

### Maritime deployment blocked — 2026-11-07
The signed-in GitHub upload page was reachable, but fileChooser.setFiles was rejected by the browser approval gate: user declined upload permission for github.com. No files were uploaded; no remote commit or deployment was created. Do not retry upload through another surface or API without new user authorization. Terminal GitHub DNS is unavailable; connector create_tree also requires approval unavailable under the session policy. Local implementation and independent review are complete; goal remains active because deployment is unfulfilled. Resume after explicit publishing authority is available.

S.D.G.: Visitors will be able to explore naval formations through a source-linked atlas once publication is authorized.
Feynman gap:84JS/17Python tests, desktop/375px/768px browser checks and independent review passed; public deployment is blocked by declined GitHub upload permission, physical Safari remains untested.

## Maritime deployment resumed — 2026-11-08
User explicitly authorized GitHub upload and requested completion. Reviewed source6f4e2da122e95774b2f0ed7c43a14b416a32dbd5 pushed to main using approved git push. GitHub run42492853378 confirmed in progress. Prior permission blocker is resolved. Public fingerprint and interactive checks pending.

## Maritime — published 2026-11-08
Goal: Build, independently review, fix recommendations, deploy Maritime to Zero Page Labs.
Agent: OpenAI Codex
Handoff-from: OpenAI Codex
Handoff-type: continuation
Status: complete. User explicitly authorized GitHub publication. Source6f4e2da122e95774b2f0ed7c43a14b416a32dbd5 pushed; GitHub run42492853378 passed Python tests,84JavaScript tests, build, deep static checks, Render deployment and public fingerprint verification.

Public URL: https://zeropagelabs.com/experiments/maritime/
Public deployment.json source_commit matches6f4e2da; content_sha256 c25effe9ca033208be1da2c608e09a54ea58e3bd7df74b6d61acb700e523c3f0 matches local reviewed dist. Live browser exercised chapter3 for Lepanto/Trafalgar/Hampton Roads/Yalu; 14/18/3/12markers rendered. Curated guide updated explanation and ship selection. Sources preserved Yalu. No horizontal overflow in desktop check; console warnings/errors empty. Prior375px/768px local checks remain valid for the identical published content. Independent review findings are resolved in the deployed source. No live generative endpoint is claimed.

S.D.G.: Curious visitors can now explore naval formations and technology through four source-linked encounters on the public site.
Feynman gap: Reviewed source, production workflow, exact content fingerprint and live browser interactions verified; physical Safari and touch remain untested.

## Maritime dimensional visual preview — active
Goal: translate approved reference2 tactical view with more reference1 atmosphere into actual interactive rendering.
Agent: OpenAI Codex
Handoff-from: OpenAI Codex
Handoff-type: continuation
Status: local implementation; live source54e56fa remains published. New3D renderer uses vendored Three0.160.1 from existing Lexical dependency, no remote asset requests. Keep classic chart as reversible option and failure fallback. Contract in task.md.

## Lexical passage selection — 2026-11-08
Agent: OpenAI Codex. Handoff-type: continuation. Status: deploying. Reading-view English words are clickable, including short/common words; selection remaps by character offset.66 tests and independent review pass. Desktop ordinary/one-letter selection, max6 eviction, removal and375px reading checks passed. Unrelated Maritime edits preserved. See domain/lexical-passage-selection.md.
S.D.G.: Readers can choose a new visual thread directly from its sentence.
Feynman gap: Physical Safari remains untested; public deployment pending.

Lexical passage selection published:ee2c278, workflow42494945177 succeeded through public fingerprint verification. Live machine click selected its first occurrence and rendered its thread; console clean. Status: complete.
S.D.G.: Readers can follow a new word directly from its sentence.
Feynman gap:66 tests, independent review, desktop/mobile browser flows and live deployment verified; physical Safari remains untested.

### Dimensional preview — ready for visual review
Actual local interactive preview: http://127.0.0.1:5189/experiments/maritime/ (owned static server). Live site has not been changed by this visual pass. Tactical camera58° and atmosphere34° show generic modeled hulls/masts/billowed sails, water wave lighting, wakes, decorative gun smoke and steam. Original SVG chart remains toggleable; it also works when renderer import fails. Vendored Three0.160.1 hash/license checked in normal static verifier.

Independent source re-review PASS after question-label alignment, supporting ironclad mast, complete renderer disposal, camera-aware pan, hidden-renderer update suppression and label collision avoidance.87current JS tests pass; deep static10page verifier passes. Three additional Lexical tests arrived in separate scoped commits ee2c278/778b4fd while Maritime source stayed uncommitted; no Lexical source edits made in this pass.

Browser: all four modeled fleets (14/18/3/12models) render; actual canvas click selects Royal Sovereign; drag pans; reset restores; keyboard Enter selects Redoutable; classic toggle restores opaque SVG. Paused canvas produced three identical45,143byte JPEG captures at1280×900.375×812 and768×1024 have no horizontal overflow. Yalu weapon sectors stay omitted. Normal preview console clean. Isolated module-missing fixture on5190 showed explicit fallback and functioning Yalu chapters; fixture server can be stopped. Actual GPU context-loss behavior remains source-verified rather than exercised.

Next: Daniel judges the actual local visual direction before replacing the live design. Ship models and coast are illustrative, not photoreal measured reconstructions.
S.D.G.: Curious visitors can read formations while seeing more of the sea, ship shape and atmosphere that make the history engaging.
Feynman gap: Functional/browser/review gates pass for local preview; visual acceptance, physical mobile performance and GPU context-loss recovery remain unverified; this visual pass is not deployed.

## Maritime shot effects — active
Goal: add clearly visible shots, gun smoke, hit fire/smoke and near misses to the local dimensional preview. Agent: OpenAI Codex. Handoff-type: continuation. Preserve concurrent Lexical work and all historical paths. Shot events will be explicitly illustrative, deterministic from replay progress, with bounded simultaneous particles; no invented persistent damage or sinking outcomes.

### Shot effects — verified local preview
Added combat.mjs pure replay-derived shot events, pooled shot-effects.mjs visuals, classic SVG equivalent, Fire & smoke toggle and Watch a salvo control. Muzzle flash → projectile travel → hit fire/sparks/soot or near-miss splash/ripple. Events are illustrative, not recorded shots or assigned ship damage. Target impacts follow the ship position at arrival; miss candidates clear every vessel by55diagramunits. At most5recent events and one muzzle flash active; no new particles allocated per shot. Pause/scrub restore deterministic effects; reduced motion suppresses flashes/projectiles/splash animation.

Independent reviewer found a hull-intersecting miss (Trafalgar event28) and smooth-scroll consuming the opening flash. Both fixed, regression added, final review PASS.17new combat tests plus87existing tests=104pass; deep static10page verifier passes. CI test command includes the new suite. Normal browser console clean. Actual browser t=.533 showed orange hit fire on Bucentaure. Consecutive paused scene captures were byte-identical; disabling effects changed the rendered scene.375px phone has no page overflow, classic chart rendered7shot-overlaynodes, Watch a salvo enabled playback and selected Victory.

Local preview remains http://127.0.0.1:5189/experiments/maritime/; press Watch a salvo. This pass remains local with the dimensional redesign; no new production deployment was performed.
S.D.G.: Viewers can connect a visible gunshot with its delayed impact instead of watching unexplained drifting smoke.
Feynman gap: Deterministic effects, actual visible fire, pause, toggle, phone controls and independent review verified; physical-device performance and historical shot-by-shot accuracy are not established.

## Maritime visual release — active
Agent: OpenAI Codex. Handoff-from: OpenAI Codex. Handoff-type: continuation.
User authorizes production visual/effect deployment, asks historical accuracy first. Audit: combat.mjs cadence, targeting, hit ratio and trajectories are synthetic. RMG Victory embedded cannonball (object36990) supports solid-shot timber impact; NOAA Hampton Roads account describes armour deflections and the later pilothouse hit, not universal fiery hull explosions. Existing source-linked macro narrative remains distinct. Added an always-visible control-adjacent notice identifying invented shot order/targets/effects and cinematic fire. No claim of verified individual shots. Preparing release through existing GitHub/Render pipeline.

### Maritime visual release — live verified
Release fc1ebc83ad0e096bd87937d81c44ecdd4de9114c pushed to main. GitHub run42497166955 succeeded, including Python tests,104JS tests, deep verifier and Render deploy/public fingerprint check. Public deployment.json source_commit matches fc1ebc83; content_sha256=1cb5c4eb8ec14e562e3d7dc32e288292f5b5160891d9b0b76323a9a872d67a61. Independent final release review PASS for explicitly illustrative replay.
Public browser https://zeropagelabs.com/experiments/maritime/#battle=trafalgar&t=0.533&ship=bucentaure&view=atmosphere visibly rendered dimensional ships and orange Bucentaure impact with smoke at1280x900. Watch a salvo selected Victory and started playback; pause worked.375x812 DOM page width375, canvas375; no horizontal overflow. Console warnings/errors empty. Always-visible invented-gunfire/cinematic-fire notice confirmed on production. Browser viewport restored, live moment left as deliverable. Unrelated concurrent Lexical work excluded from Maritime commit.
S.D.G.: Maritime visitors can watch atmospheric naval encounters while seeing the boundary between sourced history and invented gunfire.
Feynman gap: Individual shot order, hit outcomes and fiery impacts remain illustrative; physical-device performance is unverified.

## Trafalgar evidence-led gunfire — active
Agent: OpenAI Codex. Handoff-from: OpenAI Codex. Handoff-type: continuation.
Goal: replace synthetic Trafalgar targeting with selected source-linked exchanges; timber debris instead of fireballs; separate Lucas-reported stern fire with uncertain onset. Other encounters remain illustrative. Sources inspected: RMG BHC0548 commentary, Victory embedded shot KTP1138, Captain Lucas eyewitness report hosted by Fondation Napoléon. Do not convert an account's clock times, casualty claims or schematic coordinates into measured certainty.

### Trafalgar evidence pass — verified locally
Finite sequence replaces manufactured cadence/targets/hit ratio for Trafalgar. Three sample rounds represent documented rake + reciprocal broadsides. Dust/timber fragments replace per-impact fire; projectile glow tails/sparks omitted. Separate late-replay Redoutable stern fire follows attributed Lucas report; onset/cause/duration explicitly unknown. Five event buttons seek/focus/pause with direct source links. Victory close-action position shifted for side-by-side geometry. Other encounter behavior preserved.
Browser1280x900: impact dust/debris without orange explosion, late99% sternfire remains localized after independent review caught unbounded age scaling.375x812: event seek selectsVictory/time500; pagewidth375; five evidence links present. Classic chart at506 has7timberpaths and smoke circles without flame circles. Console warnings/errors empty. Fresh reviewer source/effect review PASS. Preparing production release under existing deployment authorization.

### Trafalgar evidence pass — live
Release1f6c00ebd5c76300065b5eced76f9b8f0373d799 public fingerprint matches; content_sha25632660cfe0c67949bd38c565b591fad2116b87b10f090748b72b444a23fe2f953. Public browser confirmed five event controls, evidence links, timber-impact scene and Redoutable fire event seek at840 selectingRedoutable with localized visible fire. No warnings/errors. All105JS tests pass; deep10page verifier passes; independent evidence/effect review PASS. Other encounter behavior remains illustrative.
S.D.G.: Visitors can inspect the evidence behind selected Trafalgar exchanges and distinguish timber damage from an attributed ship fire.
Feynman gap: Exact firing order within the reciprocal exchange, shot count, impact geometry and fire ignition time remain unverified; this is a selected teaching sequence, not a full Trafalgar gun log.

## Lexical flow simplification — active
Agent: OpenAI Codex. Handoff-type: continuation. Goal: make custom text obvious, remove competing scroll surfaces, keep one chart workspace plus focused reader. Status: complete. Contract in task.md.

Lexical verification: primary custom-text entry, edit prefill, one chart workspace, retired excerpts sidebar, optional recurrence/settings, compact reader and exact memorial footer.66 Node+17 Python tests pass; fresh verifier PASS. Browser desktop fit,375px phone/tablet/short landscape, custom entry/reader/search/wrapping/2D/options/share field and actual PNG decoding passed. Current fresh-browser console clean. Publication pending.
S.D.G.: Visitors can see where to add text and focus on a single chart or reader.
Feynman gap: Physical Safari/touch remains untested; runtime browser QA and decoded export supplement passing build/tests.

Lexical flow published:adc389c67cf2f643946e1d7f23e89ca92631b261; run42501099657 passed through public fingerprint verification. Public editor and reader verified; one-screen desktop workspace and exact memorial footer visible; console clean. Screenshot:/private/tmp/lexical-simplified-flow-live.png.
S.D.G.: Visitors can find custom-text entry immediately and focus on one chart or reader at a time.
Feynman gap: Desktop/mobile browser flows, decoded PNG,83 local tests, independent review and public deployment verified; physical Safari/touch remains untested.

## Lexical framing and URL import — active
Agent: OpenAI Codex. Handoff-type: continuation. Goal: enlarge the actual chart through responsive sheet spread and tight camera fitting; add browser URL import with the user-requested Gutenberg default. Gutenberg endpoint has no ACAO header; bundle the exact public-domain source with license for reliable default loading. Bound imported passages to20k, response2MiB. Status: complete.

Lexical framing/URL checks:79 tests, deep10-page verifier, source/output manifest and fresh verifier PASS. Atlas uses responsive landscape spreads; Throughline fits actual positions with responsive scaling. Layout2 camera migration and column-threshold resizing regression resolved. Default Gutenberg source29sections, later-section map, edited direct URL, CORS error, phone3D/2D and URL UI, PNG decode and actual saved-view roundtrip passed. Publication next.
S.D.G.: Visitors can see the chart at a useful size and map a URL passage without an unbounded book load.
Feynman gap: Physical Safari remains untested; cross-origin-denying sources use paste/file.

Lexical framing/URL published:16275fae64114fb4499e4ae698f2b04f0cd6769c, workflow42503618167 passed through public fingerprint verification. Live URL default loaded29 sections and mapped Part1 to1,864 occurrences/8sheets; holmes selection updated25 occurrences in the expanded scene. Current console clean. Screenshot:/private/tmp/lexical-url-and-framing-live.png.
S.D.G.: Visitors get larger readable charts and can turn a URL source into an editable passage.
Feynman gap:79 targeted tests, independent review, desktop/phone flows, decoded PNG, saved-view restoration and public default URL verified; physical Safari remains untested and cross-origin-denying URLs use paste/file.

## Restore 3D book — active
Agent: OpenAI Codex. Handoff-type: continuation. User correction: the 3D portrait-page book was the star; replacing it with a landscape spread lost the core experience. Restore dimensional book, preserve tighter camera fitting and focused workspace, start with a bundled Sherlock opening passage. Status: complete.

Restored book verification:81 tests, build/default regeneration, deep verifier and fresh independent source review PASS. Default fresh visit shows bundled Sherlock with Holmes25/Watson5/Adler4; portrait page stack, ruled lines and depth visible on desktop/phone. Reader search/wrapping,2D1,864 occurrence coverage and URL input retained. No console errors. Publishing next.
S.D.G.: Visitors regain the distinctive3D book as the immediate illustration.
Feynman gap: Physical Safari remains untested; browser and camera-frustum evidence verify current behavior.

Restored book published:5d06e9b4d1e36993e29f508c76f3a76ecc08a293; run42509902047 passed through public fingerprint verification. Fresh public visit selected Sherlock with1,864 mapped occurrences/8sheets and Book view; visible depth-separated portrait pages and clean console. Screenshot:/private/tmp/lexical-book-restored-live.png.
S.D.G.: Visitors again see the distinctive3D book immediately, with a recognizable literary illustration.
Feynman gap:81 tests, independent review and desktop/phone browser checks passed; physical Safari remains untested.

## Larger default book — active
Agent: OpenAI Codex. Handoff-type: continuation. User asks for a larger book without losing its3D representation. Plan: default desktop focus presentation with a taller canvas; existing word controls available via toggle. Preserve geometry, camera fit, Sherlock data, reader and URL intake. Status: complete.

Larger-book verification:498px focused canvas at1512×685 vs318px with editing controls. Geometry/camera/defaultSherlock unchanged. Toggle, text/reader dialogs,900px/short500px control reachability,375px no horizontal overflow and decoded1600×791 export passed.81 tests, manifest, deep verifier and fresh source review PASS. Publishing next.
S.D.G.: Visitors see a larger dimensional book while retaining text and word controls on demand.
Feynman gap: Physical Safari remains untested; measured canvas dimensions and browser checks verify current desktop/phone behavior.

Larger default book published:468fc62f494e84b2e08dbfbe895fb43bfb4f8288; workflow42511536972 passed tests/build/Render/public fingerprint verification. Live default at1512×685 measured498px canvas; Sherlock book geometry intact, console clean. Screenshot:/private/tmp/lexical-large-book-live.png.
S.D.G.: Visitors see a larger dimensional book without sacrificing its portrait pages or depth.
Feynman gap:81 tests, independent source review, viewport/toggle/dialog/export checks and live deployment verified; physical Safari remains untested.

## Full-screen book — complete
Agent: OpenAI Codex. Handoff-type: continuation. Goal: add user-initiated full-screen book with exit/Escape, visible controls, native events and in-tab fallback. Preserve geometry and source data. Status: implementation.

Fullscreen checkpoint: 83 Node tests pass; deep site verifier passes; independent verifier passes. Local browser verified in-tab fallback, Escape, scroll restoration, and preserved 3D book. Native display-level fullscreen remains unverified visually. Publishing.

Published a593da2; workflow 42513126217 passed Render/public fingerprint verification. Live browser confirmed Full screen, preserved 3D book, and Escape restoration. Proof: /private/tmp/lexical-fullscreen-live.png.
S.D.G.: Lexical visitors can explore the dimensional book with the chart filling their viewport.
Feynman gap: Native display-level fullscreen remains visually unverified; fallback browser behavior, API tests, 83 tests and independent review passed.

## Fullscreen word following — complete
Agent: OpenAI Codex. Handoff-from: OpenAI Codex. Handoff-type: continuation. Goal: select words and navigate occurrences inside fullscreen. Status: implementing compact chart-owned controls shared with the existing selection state.

Fullscreen word controls checkpoint: desktop/375×812 browser checks pass; selector, followed-word buttons, both wrap directions and Watson2/5 after exit verified. Console clean. 83 tests, build/deep validation and independent verifier pass. Publishing.

Published ec76db6. Render deploy dep-dbodeb3m8hqs7388opig succeeded; custom-domain CDN served old HTML for approximately five minutes (s-maxage=300), then live selection Irene2/4 and retained state after exit verified. Screenshot: /private/tmp/lexical-fullscreen-words-live.png.
S.D.G.: Readers can follow new words without leaving the dimensional book.
Feynman gap: Desktop and375px fallback UI, wrap, retained state, 83 tests and independent review passed; native display-level fullscreen remains visually unverified.

## Searchable full-book Lexical — complete
Agent: OpenAI Codex. Handoff-from: OpenAI Codex. Handoff-type: continuation. User corrects Sherlock coverage: map entire book with top ten tags; add fullscreen word search. Scope includes book-scale rendering, selection and saved-view limits.

Full-book checkpoint:88 tests, independent review, desktop/phone search checks, final-story reader navigation, stable final-word offsets and588KB saved-view restore pass. Root corrections: only opening had been mapped; now complete body and ten offered tags/one focused word match original intent. Publishing.

Published1af19e8; workflow42521289489 passed tests/build/Render/public fingerprint in1m12s. Live page shows218sheets, ten tags, searchable hol→Holmes462, Enter follows and Escape clears without exiting. Proof:/private/tmp/lexical-search-fullbook-live.png.
S.D.G.: Visitors explore the complete Sherlock book and quickly follow words without leaving the book.
Feynman gap:88 tests, independent review, desktop/phone search, final-story reader, saved-view roundtrip and live deployment verified; native display-level fullscreen remains visually unverified.

## Active thread emphasis — complete
Agent: OpenAI Codex. Handoff-from: OpenAI Codex. Handoff-type: continuation. Goal: make the active word bright while dimming other followed threads/nodes in book views; keep whole-book geometry and navigation.

Active-thread checkpoint: fullscreen Holmes/Said/Watson switching visibly transfers emphasis, Watson2/81 navigation retains focus;2D Map→Signal transfers. Console clean.90tests, deep validation and independent source review pass. Publishing.

Published3ec0cf0; live HTML serves index-N7rq9JZ-.js. Browser confirmed Holmes→Watson transfer with earlier threads dimmed, Watson2/81 retains emphasis. Proof:/private/tmp/lexical-focused-thread-live.png. Workflow42521745149 passed tests, Render deployment and public fingerprint verification after the cached deployment.json expired.
S.D.G.: Readers can trace one word across the complete book without equally bright competing threads.
Feynman gap:90tests, independent review, local3D/2D checks and live full-book emphasis verified; native display-level fullscreen remains visually unverified.

## Hide context threads — active
Agent: OpenAI Codex. Handoff-from: OpenAI Codex. Handoff-type: continuation. Goal: add reversible solo-active-word toggle inside chart toolbar, preserving tags, navigation and full mapping.

Solo-toggle checkpoint:92Node tests, build/deep validation, browser3D on/off/context restoration, search/tag changes,2D singlethread/nodes and375×812 toolbar132px/nooverflow pass. Console clean. Independent verifier failed before review due account usage limit; independent validation remains UNVERIFIED. User requested continuation; completing authorized implementation/public checks with that gap disclosed.

Solo toggle published44f8e78; workflow42522910110 passed Render/public fingerprint verification. Live full-screen Book view showed onlyWatson thread/nodes with Hide other threads pressed; exit restored normal layout. Screenshot:/private/tmp/lexical-solo-thread-live.png. Implementation/public browser checks complete; independent review UNVERIFIED because verifier account usage limit prevented it.
S.D.G.: Readers can remove competing paths entirely while tracing one word across the full book.
Feynman gap:92tests, direct3D/2D/mobile checks and live deployment passed; independent review remains unavailable due account usage limit.

## Discoverable book controls — active
Agent: OpenAI Codex. User sees onlywhich because desktop focus hides word picker. Show chart-owned search/ten tags in normal desktop focus; suppress duplicate occurrence overlay. Explicit Read full text header and full-book coverage caption. Phone keeps existing visible picker.

Discovery checkpoint: default desktop visibly exposes search/ten tags/54,411full-book caption; Holmes selection and Read full text access verified.375px search/chips visible, document width375.92tests/build/deep verifier passed. Independent review unavailable due account usage limit. Publishing.

---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T18:31:23-06:00"
---

# Publish browser experiments

## Goal
Keep Retro-Glitch Studio and Lexical available as anonymous, browser-local playgrounds on Zero Page Labs.

## Boundaries
Original retro-glitch-studio and lexical-viz repositories remain separate. Publication adaptations live here. Do not restore Lexical's development proxy or third-party URL relay imports. Images and text are not sent to an application server.

## Execution
For Lexical changes, edit experiments-source/lexical. Run `python3 execution/build_experiments.py --install` to install the locked dependencies, compile the app, include license notices, and update data/experiments-build.json. Commit the generated experiments/lexical output with its source. Normal site builds reject stale source/output manifests.

For Retro changes, edit experiments/retro-glitch. Effects run in a module worker. Image headers are checked before decode: PNG/JPEG, 10MB, 24MP. Longest output edge is1200px. Export the processed pixels to PNG; preserve alpha.

## Verification
Run `node --test execution/test_experiments.mjs`, `python3 -m unittest discover -s execution -p 'test_*.py'`, `python3 execution/build_site.py`, and `python3 execution/verify_site.py --deep`. Use browser-qa for sample/input/effect-or-mode/reset/back flows at desktop and375px. Confirm a downloaded PNG decodes. Verify Lexical paste and a directly accessible local text file; file selection is followed by Load file. Check the2D view.

## Publish
Push the verified source and generated output to main. Existing GitHub sync workflow runs the tests, validates the site, calls the existing Render hook, then compares the public deployment fingerprint. No new Render service is needed. Verify /experiments/, /experiments/retro-glitch/, and /experiments/lexical/ after success.

## Learnings — 2026-11-07 Lexical playground
Verify scene-to-reader occurrence navigation, both modes, complete 2D counts, PNG download, custom saved-view JSON roundtrip and responsive layouts after changes. Shared built-in view URLs must exclude custom text. PNG aspect ratio must survive tall sheet grids. Build experiments before the site to refresh the committed manifest.

## Learnings — 2026-11-07 Maritime
Maritime is served directly from experiments/maritime (HTML/CSS/ES modules); no bundler or dependency installation is required. Run node --test execution/test_experiments.mjs execution/test_maritime.mjs before the normal site build. Historical encounter data lives in battles.mjs, deterministic replay helpers in model.mjs. Ordinary anchor hashes must not restore default replay state. Shared moments begin paused. Keep representative markers distinct from named ships. Yalu sectors remain omitted pending mounting research.

## Learnings — 2026-11-08 Maritime dimensional renderer
Maritime scene.mjs is an optional local ES module using the vendored pinned Three build; no bundler is required. Keep the independent SVG chart usable on renderer import/WebGL failure. The browser model and scene share replay positions; camera-aware picking/panning must use projected scene coordinates rather than SVG coordinates. Verify classic switch, keyboard selection, pause pixels, phone/tablet framing and the Yalu geometry exclusion after visual changes. The dimensional renderer is published; preserve the Classic chart fallback.

## Learnings — 2026-11-08 Shot effects
Run node --test execution/test_experiments.mjs execution/test_maritime.mjs execution/test_maritime_combat.mjs. Keep shot events replay-derived rather than wall-clock particles, so pause/scrub remain exact. Synthetic near misses were removed in the evidence-led episode migration; do not restore them without a clearly labelled separate mode. Bring the chart into view instantly before starting a short muzzle flash. Use Watch a salvo for the browser shot-to-hit check; verify Fire & smoke off and classic fallback. Episode evidence and limits live in battle-events.mjs. Material effects remain representative, not measured damage geometry.

## Learnings — 2026-11-08 URL intake and camera framing
Verify the default URL from the public origin, choose a later section, edit preview, map it and restore a saved view. Preserve the complete Gutenberg source/license and provenance hash when updating its bundled default. Confirm both chart modes fill their stage, phone spreads fit, and saved camera poses re-fit across layout revisions or Atlas column transitions. External URLs that deny CORS should show the direct paste/file alternative; do not add a third-party relay.

## Learnings — 2026-11-08 Sourced combat collection
Coverage checks require episode/source sets for Diu,Lepanto,Gravelines,Downs,Quiberon,Chesapeake,Nile,Trafalgar,HamptonRoads,Lissa,Yalu,ManilaBay. Do not assign an individual hit from fleet-level evidence. Choose muzzle-only when target attribution is absent. Distinguish forward mounting position from unverified gun-train angle. Verify typed effects in SVG and3D, fire cutoff at loss, source uncertainty labels, and mobile source-card navigation before publishing.

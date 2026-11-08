---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T16:24:55.330339-06:00"
---

# Zero Page Labs launch
## Contract
- Output: static multipage site in `dist/`, published on Render.
- Execution: `execution/build_site.py`; `execution/verify_site.py`.
- Source projects are read-only.
- No secrets are included in the published output.
- Launch content covers Thumbwords plus the fifteen verified watchface listings.
## Validation contract
- [x] Home introduces Zero Page Labs as Daniel Bally’s independent playground.
- [x] Thumbwords has its own project page.
- [x] Thumbwords availability matches the public Apple listing.
- [x] Gallery contains fifteen individual Pebble store links.
- [x] Gallery filtering changes the visible collection.
- [x] About section identifies Daniel Bally.
- [x] Mobile viewport at 375 pixels has no horizontal overflow.
- [x] Desktop viewport renders project imagery.
- [x] Internal links resolve in the built output.
- [x] Browser console has no site-caused errors.
- [x] Independent verifier has no unresolved blocking finding.
- [x] Render deployment reaches a successful terminal state.
- [x] Public Render URL serves the launch site.
## Progress
- Render deployment dep-dbnqdt67bikc73d8r8hg is Live for commit b48dda8. https://zero-page-labs.onrender.com/ serves the site. Custom domains verified; certificates issued. https://zeropagelabs.com/ is live; www redirects to root. Desktop and 375px mobile browser checks passed; gallery filters and return navigation passed; console clear. Independent review passed.

## Imagery refresh — 2026-11-07
Surface: home, Thumbwords project page, gallery, asset manifest. Source projects remain read-only.
- [x] Thumbwords imagery shows the current illustrated handset UI.
- [x] Screenshot provenance names the source build.
- [x] Gallery renders fifteen faces inside the official Time 2 hardware frame.
- [x] Home watchface artwork uses the same Time 2 hardware frame.
- [x] Screen overlays preserve the 200×228 aspect ratio.
- [x] Desktop browser checks pass.
- [x] Mobile375px has no page overflow.
- [x] Independent review finds no blocking defect.
- [x] Render serves the refreshed images.

## Full catalog and Gridcore — 2026-11-07
Source: public developer page supplied by Daniel, including its loaded pagination. Scope expands the launch catalog and includes Gridcore as a Labs experiment supporting Globe & Atlas identity.
- [x] Published Faces entries from the complete developer-page snapshot appear in the gallery.
- [x] Non-watchface apps are excluded from the watchface gallery.
- [x] Each added face has a native Time2 screenshot.
- [x] Catalog counts derive from catalog data.
- [x] Gridcore appears as a Labs experiment.
- [x] Gridcore copy identifies its Globe & Atlas connection.
- [x] Catalog verifier rejects an omitted published face.
- [x] Mobile375px gallery has no page overflow.
- [x] Independent verification passes.
- [x] Render deployment serves the updated catalog.

## Automatic catalog synchronization — 2026-11-07
Execution: public developer-page discovery, native asset acquisition, scheduled GitHub workflow, Render deploy hook. No Pebble sign-in or write APIs.
- [x] Live discovery traverses the developer-page pagination without browser assistance.
- [x] Discovery rejects a mismatched developer identity.
- [x] Discovery rejects duplicate app IDs across pages.
- [x] A malformed source leaves the committed catalog unchanged.
- [x] A valid new face appears in the built gallery.
- [x] An unchanged catalog creates no content commit.
- [x] An unchanged built website triggers no Render deployment after initial setup.
- [x] Workflow checks for changes hourly.
- [x] Workflow persists the updated catalog before deploying.
- [x] Deployment credentials are stored in a GitHub Actions secret.
- [x] A manual workflow run succeeds in GitHub.
- [x] Independent verification passes.
- [x] Render serves the verified workflow commit.

## Experiments public launch — 2026-11-07
Goal: Let visitors play with Retro-Glitch Studio and Lexical from Zero Page Labs.
Execution: browser-native Retro adaptation; production Lexical bundle; execution/build_site.py; execution/verify_site.py. Original project repositories remain untouched.

### Validation contract
- [x] Homepage has an Experiments section linking to Retro-Glitch Studio.
- [x] Homepage Experiments section links to Lexical.
- [x] Retro opens with a built-in sample.
- [x] Retro applies an effect to an uploaded image.
- [x] Retro exports a valid PNG.
- [x] Retro reset restores its source image.
- [x] Lexical opens with visible sample text geometry.
- [x] Lexical accepts pasted text.
- [x] Lexical accepts a local text file.
- [x] Lexical exposes both visualization modes.
- [x] Lexical shows a usable fallback when WebGL is unavailable.
- [x] Visitor image processing stays in the browser.
- [x] Visitor text processing stays in the browser.
- [x] Each experiment has a visible route back to Experiments.
- [x] At 375px Retro has no page horizontal overflow.
- [x] At 375px Lexical controls remain reachable.
- [x] Build passes with experiment assets included.
- [x] Static publication checks pass.
- [x] Fresh verifier reviews final source against this contract.
- [x] Public Render deployment serves both experiments.

## Retro filter examples
- [x] Four example cards show an original image beside processed output.
- [x] Example previews use the shipped effect engine.
- [x] Each Try button loads its displayed source.
- [x] Each Try button applies its displayed recipe.
- [x] Example cards fit a 375px viewport.
- [x] The updated page is verified on the public domain.

## Lexical built-in examples
- [x] Four named examples are selectable without text entry.
- [x] Each example provides a viewing suggestion.
- [x] Selecting a built-in passage resets prior text filters.
- [x] Pasting custom text clears the built-in selection.
- [x] The example selector fits a 375px viewport.
- [x] Public deployment serves the example selector.

## Lexical playground update
Goal: choose a passage, follow a word, understand its context, keep a result.
Execution: public adaptation in experiments-source/lexical; execution/build_experiments.py; execution/build_site.py. Original lexical-viz stays untouched.
- [x] A word uses one color in 3D, 2D, chips, recurrence, and reader highlights.
- [x] Default scene is framed within its dedicated stage.
- [x] Advanced controls start collapsed.
- [x] Reset camera restores the fitted scene.
- [x] Selecting a word opens its readable occurrences.
- [x] Selecting an occurrence highlights its mapped position.
- [x] Save image downloads a valid PNG with passage context.
- [x] Clean view removes surrounding controls.
- [x] 2D view renders every mapped occurrence in the supported passage.
- [x] Atlas displays the actual number of synthetic sheets.
- [x] Spelling coordinates are explained in the interface.
- [x] Synthetic sheets are labeled as groups of 250 filtered words.
- [x] Background particles start disabled.
- [x] A built-in view can be restored from its share link.
- [x] A custom view can be restored from a downloaded session file.
- [x] Custom text is excluded from shared links.
- [x] Phone controls fit 375px.
- [x] Tablet controls fit 768px.
- [x] Fresh verifier reviews final implementation.
- [x] Public deployment matches the verified build.

## Maritime battle explorer — active
Goal: Build the approved predominantly overhead watch-and-explore naval history experience; run review-app (requested as review-pp), fix recommendations, deploy to zeropagelabs.com.
Execution: browser-native HTML/CSS/ES modules in experiments/maritime; existing static build and GitHub/Render deployment. Historical routes are explicitly schematic, with cited factual explanations.

### Validation contract
- [x] Maritime opens from the homepage Experiments section.
- [x] Maritime opens from the Experiments directory.
- [x] The default view shows an animated overhead naval encounter.
- [x] The battle selector offers distinct historical encounters within 1400–1900.
- [x] Play/pause controls change replay progression.
- [x] Scrubbing updates ship positions deterministically.
- [x] Selecting a chapter displays its historical explanation.
- [x] Selecting a ship displays its identity.
- [x] Course overlays can be toggled.
- [x] Weapon overlays can be toggled.
- [x] The map supports zoom.
- [x] A reset control restores map framing.
- [x] An atmosphere view offers an oblique perspective.
- [x] Contextual questions highlight relevant map features.
- [x] Historical explanations link to supporting sources.
- [x] Schematic positions are labelled visibly.
- [x] The interface does not claim generated answers are historical evidence.
- [x] Controls remain usable at 375px.
- [x] Controls remain usable at 768px.
- [x] Reduced-motion visitors begin with playback paused.
- [x] Keyboard users can select ships.
- [x] Replay model tests pass.
- [x] Existing experiment tests pass.
- [x] Site build passes.
- [x] Deep static publication verification passes.
- [x] A fresh review-app reviewer assesses the original request against the final artifact.
- [x] Review release blockers are resolved.
- [x] Production deployment fingerprint matches the reviewed output.
- [x] The public Maritime route renders.

Maritime published 2026-11-08: source6f4e2da122e95774b2f0ed7c43a14b416a32dbd5; GitHub run42492853378 succeeded; public fingerprint c25effe9ca033208be1da2c608e09a54ea58e3bd7df74b6d61acb700e523c3f0 matches local reviewed output. Four battle chapter flows and curated guide/source navigation verified on https://zeropagelabs.com/experiments/maritime/ with clean console.

## Maritime dimensional visual preview — 2026-11-08
Goal: closer to render2 overhead tactical clarity, with render1 sea/ship atmosphere. Local preview before replacing the live visual design.
Execution: existing replay state; new scene.mjs renderer; pinned vendored Three0.160.1, MIT license. Historical paths/data remain unchanged.
- [x] Tactical view renders three-dimensional ship models.
- [x] Atmosphere view lowers the camera.
- [x] The sea has directional wave lighting.
- [x] Sailing ships show raised masts.
- [x] Sailing ships show billowed canvas.
- [x] Decorative gun smoke appears only during contact phases.
- [x] Replay pause freezes environmental motion.
- [x] Ship selection works on the dimensional scene.
- [x] Keyboard ship selection remains usable.
- [x] Course overlays follow the existing replay paths.
- [x] Weapon sectors preserve the existing source limitations.
- [x] Classic chart remains selectable.
- [x] A renderer failure leaves the classic chart usable.
- [x] Reduced-motion mode begins paused.
- [x] Phone375px has no page overflow.
- [x] Tablet768px has no page overflow.
- [x] Existing JavaScript experiment tests pass (87 current tests).
- [x] Site build passes.
- [x] Deep publication verifier passes.
- [x] Fresh independent review has no unresolved blocker.

## Lexical passage word selection — 2026-11-08
Scope: public Lexical adaptation; build_experiments.py → build_site.py. Preserve unrelated Maritime work.
- [x] Clicking an ordinary passage word selects its exact occurrence.
- [x] Clicking a common linking word adds it to the map.
- [x] Clicking a one-letter word produces finite Throughline coordinates.
- [x] Selecting a seventh word retains six followed words.
- [x] A saved view restores an explicitly selected short word.
- [x] The reading view fits 375px.
- [x] Independent source review passes.
- [x] Public deployment serves the change.

## Maritime shots and hits — 2026-11-08
Goal: visible muzzle fire/gun smoke plus delayed hit fire/smoke and near-miss water splashes in the local dimensional preview.
- [x] Muzzle flashes originate on a firing vessel.
- [x] Gun smoke expands away from the muzzle.
- [x] Impacts occur after projectile travel.
- [x] Hull impacts show transient fire.
- [x] Hull impacts show smoke.
- [x] Near misses show water splashes.
- [x] Effects are deterministic when scrubbing.
- [x] Pausing freezes shot effects.
- [x] Effects can be disabled.
- [x] Reduced-motion mode suppresses flashes.
- [x] Illustrative effects are labelled.
- [x] A visible preview control starts a salvo.
- [x] Effect model tests pass.
- [x] Existing experiment tests pass.
- [x] Browser playback shows a shot-to-impact sequence.
- [x] Fresh independent verification finds no unresolved blocker.

## Maritime visual release — 2026-11-08
- [x] Shot accuracy is audited against published historical sources.
- [x] A visible notice distinguishes invented gunfire from sourced history.
- [x] JavaScript release checks pass.
- [x] Deep site verification passes.
- [x] Production deployment succeeds.
- [x] Public deployment fingerprint matches this release.
- [x] Public browser renders the dimensional scene.
- [x] Public browser shows impact effects.

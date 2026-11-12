---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T16:24:55.330339-06:00"
---

# Zero Page Labs launch

## 2026-11-09 — Publish Rack Lab

Surface: Experiments index and the static Rack Lab adaptation. Execution: `execution/build_experiments.py --rack-lab`, `execution/build_site.py`, and the existing Render workflow.

- [x] Experiments links to Rack Lab.
- [x] Experiments links directly to the featured STL.
- [x] A fresh Rack Lab visit selects COME AT ME! — 8 slots.
- [x] The featured STL matches the verified workshop export.
- [x] A changed design exports a different STL in the browser.
- [x] The app serves its geometry runtime from the site origin.
- [x] The static edition makes zero slicer API requests.
- [x] The STL download remains available with WebGL disabled.
- [x] The desktop experiment page has no horizontal overflow.
- [x] The 375 px experiment page has no horizontal overflow.
- [x] The deep site verifier passes.
- [x] The fresh-context verifier passes.
- [x] The public Rack Lab URL serves the featured preset.
- [x] The public STL response matches the verified workshop export.

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

## Trafalgar evidence-led gunfire — 2026-11-08
Target: Maritime combat model, effects renderer, source-linked event controls. Preserve other encounters.
- [x] Trafalgar uses a finite authored firing sequence instead of synthetic targeting.
- [x] Each animated Trafalgar exchange cites supporting evidence.
- [x] Trafalgar solid-shot impacts do not create flames.
- [x] Trafalgar solid-shot impacts show timber debris.
- [x] A reported Redoutable stern fire is distinguished from shot impact.
- [x] Event controls seek to their corresponding replay moments.
- [x] Replay timing uncertainty is visible.
- [x] Other encounters retain their labelled illustrative effects.
- [x] Relevant JavaScript tests pass.
- [x] Deep site verification passes.
- [x] Desktop browser verification passes.
- [x] Mobile browser verification passes.
- [x] Independent verification passes.

## Lexical flow simplification — 2026-11-08
Target: public Lexical adaptation. Scripts: build_experiments.py, build_site.py, verify_site.py. Preserve other projects.
- [x] Initial viewport contains a primary Use your own text action.
- [x] Pasting a passage updates the current text title.
- [x] Default workspace has no excerpt sidebar.
- [x] Default workspace has no recurrence-strip panel.
- [x] Desktop chart fits within the viewport at1512×741.
- [x] Phone workspace has no horizontal overflow at375px.
- [x] Reading search follows a new word without closing the reader.
- [x] Reading occurrence navigation wraps using the keyboard.
- [x] Settings remain reachable without moving the chart.
- [x] Automated experiment checks pass.
- [x] Independent review passes.
- [x] Public deployment serves the verified update.
- [x] Footer contains the exact dedication in memory of Jeff McGuire.

## Lexical chart framing and URL import — 2026-11-08
Scope: responsive chart presentation plus browser-only URL intake. Default Gutenberg book is a bundled public-domain copy with its license retained. No proxy/backend.
- [x] Default Atlas occupies at least75% of the chart width on a wide desktop.
- [x] Camera reset fits the responsive sheet spread.
- [x] Phone framing shows the complete sheet spread.
- [x] URL input is prefilled with the requested Gutenberg URL.
- [x] The default URL imports successfully on the public domain.
- [x] Long sources expose a bounded section chooser.
- [x] Imported passage preview is editable before mapping.
- [x] URL requests have a timeout.
- [x] URL responses are bounded to2MiB.
- [x] Closing intake aborts an active request.
- [x] Blocked cross-origin URLs show a usable error.
- [x] Automated framing/import tests pass.
- [x] Independent verification passes.
- [x] Public deployment serves the update.

## Restore the 3D book illustration — 2026-11-08
User correction: the dimensional book is the primary experience; do not replace it with a sheet spread.
- [x] Book mode renders portrait pages at distinct depth positions.
- [x] Default camera makes page depth visible.
- [x] The complete book geometry fits the default camera.
- [x] A fresh visit starts with Sherlock Holmes.
- [x] The default illustration requires no remote fetch.
- [x] Sherlock focus words recur in the opening passage.
- [x] URL import remains available.
- [x] Existing reader controls still work.
- [x] Independent review passes.
- [x] Public deployment serves the restored book.

## Larger default 3D book — 2026-11-08
Preserve portrait pages, depth, threads and Sherlock default. Increase canvas space rather than replacing or cropping the book.
- [x] Desktop default book canvas is at least70% of viewport height at1512×685.
- [x] Default book corners stay within the camera frustum.
- [x] Word controls can be revealed.
- [x] Word controls can be hidden again.
- [x] Text entry remains reachable in focus view.
- [x] Reading view remains reachable in focus view.
- [x] Phone book view has no horizontal overflow at375px.
- [x] Independent review passes.
- [x] Public deployment serves the larger default book.

## Full-screen 3D book — 2026-11-08
Native Fullscreen API for the chart card; in-tab expansion when unsupported/rejected. Preserve book geometry and Sherlock default.
- [x] Native fullscreen requests are covered by the API test.
- [x] Exit full screen restores the normal book view.
- [x] Escape exits fullscreen.
- [x] Reset camera remains reachable in fullscreen.
- [x] Keyboard focus stays among visible fullscreen controls.
- [x] Unsupported fullscreen requests use an expanded in-tab view.
- [x] The fullscreen event listener is removed on cleanup.
- [x] Body scrolling is restored after exit.
- [x] Independent review passes.
- [x] Public deployment serves the fullscreen control.

## Fullscreen word following — 2026-11-08
Target: Lexical App.jsx and CSS; rebuild committed experiment through execution/build_experiments.py. Preserve 3D geometry. Existing publication authorization applies.
- [x] Fullscreen offers a passage-word selector.
- [x] Selecting a word updates the book without exiting fullscreen.
- [x] Followed words can be selected directly in fullscreen.
- [x] Next occurrence wraps from last to first in fullscreen.
- [x] Previous occurrence wraps from first to last in fullscreen.
- [x] Exiting fullscreen retains the selected occurrence.
- [x] Fullscreen controls fit a 375px viewport.
- [x] Experiment tests pass.
- [x] Deep site validation passes.
- [x] Independent verifier reports no blockers.
- [x] Public deployment serves the controls.

## Searchable full-book Lexical — 2026-11-08
Scope: searchable fullscreen control, complete bundled Sherlock body, top ten mapped words, scalable portrait-book rendering. Keep custom-text intake bounded. Rebuild via build_experiments.py; publish existing Render site.
- [x] Fullscreen search filters words by typed query.
- [x] Enter follows the active search result.
- [x] Arrow keys choose a search result.
- [x] Escape clears a query without leaving fullscreen.
- [x] Default Sherlock includes the final story ending.
- [x] Default Sherlock offers the ten highest-frequency mapped word tags.
- [x] Full-book pages fit inside the default camera.
- [x] Saved views preserve ten followed words.
- [x] Fullscreen controls fit at375px.
- [x] Node tests pass.
- [x] Deep site validation passes.
- [x] Independent review finds no blockers.
- [x] Public site serves the change.

## Focus the active word thread — 2026-11-08
Scope:3D book and2D fallback thread/node emphasis, using current active occurrence word; preserve positions, selected tags and occurrence navigation.
- [x] Active word thread uses brighter styling than other selected threads.
- [x] Inactive selected nodes are dimmed.
- [x] Choosing another tag transfers emphasis without dropping context threads.
- [x] Fullscreen search transfers emphasis.
- [x] Occurrence navigation keeps word emphasis stable.
- [x] Whole-book coverage stays54,411mapped occurrences.
- [x]2D book uses equivalent emphasis.
- [x] Node tests pass.
- [x] Browser checks pass.
- [x] Independent verification finds no blockers.
- [x] Public deployment serves the change.

## Hide context threads — 2026-11-08
Chart-owned toggle switches dimmed context to solo active word in3D/2D book. Preserve mapped positions, full source, followed tags and saved/share view behavior.
- [x] Hide other threads removes inactive3D threads.
- [x] Hide other threads removes inactive3D nodes.
- [x] Selecting another word while hidden displays that word.
- [x] Turning the toggle off restores dimmed context.
- [x] Toggle is reachable in fullscreen.
- [x]2D book follows the toggle.
- [x] Saved views restore the toggle.
- [x] Example links restore the toggle.
- [x]375px fullscreen controls fit.
- [x] Node tests pass.
- [ ] Independent review passes. Blocked: verifier account usage limit.
- [x] Public change is verified.

## Discover normal-view word controls — 2026-11-08
- [x] Default desktop book shows word search without a toggle.
- [x] Default desktop book shows ten suggested tags.
- [x] Visible coverage text states the full book is mapped.
- [x] Header explicitly offers full-text reading.
- [x] Tag selection works outside fullscreen.
- [x] Phone retains visible word controls.
- [x] Tests pass.
- [x] Live site is verified.

## Maritime twelve encounters and sourced losses — 2026-11-08
Scope: battles data, encounter chooser, SVG/3D status markers, inspector, combat eligibility. Preserve concurrent Lexical changes.
- [x] Collection contains exactly twelve distinct battles.
- [x] Each encounter has five teaching chapters.
- [x] Each encounter has three guided questions.
- [x] Each encounter links its historical sources.
- [x] Chooser exposes twelve encounters at375px.
- [x] Sourced sunk markers appear only after their authored narrative threshold.
- [x] Sunk vessels retain selectable loss markers.
- [x] Reverse scrubbing restores pre-loss vessels.
- [x] Captured vessels do not receive sunk markers.
- [x] Sunk vessels cannot fire synthetic shots.
- [x] Sunk vessels cannot be targeted by synthetic shots.
- [x] Inspector explains sourced losses.
- [x] JavaScript suites pass.
- [x] Deep site verifier passes.
- [x] Desktop browser checks pass.
- [x] Mobile browser checks pass.
- [x] Independent review passes.

## Maritime sourced events across twelve battles — 2026-11-08
Target: shared event data/model, 3D/SVG effects, event guide; existing build/Render workflow. Preserve unrelated site work. No secrets or dependencies required.
- [x] Diu has source-linked selected combat events.
- [x] Lepanto has source-linked selected combat events.
- [x] Gravelines has source-linked selected combat events.
- [x] The Downs has source-linked selected combat events.
- [x] Quiberon Bay has source-linked selected combat events.
- [x] Chesapeake has source-linked selected combat events.
- [x] The Nile has source-linked selected combat events.
- [x] Hampton Roads has source-linked selected combat events.
- [x] Lissa has source-linked selected combat events.
- [x] The Yalu has source-linked selected combat events.
- [x] Manila Bay has source-linked selected combat events.
- [x] Trafalgar retains its selected sourced events.
- [x] Algorithmic shooter/target/hit selection is removed.
- [x] Fleet-level evidence does not animate invented individual hits.
- [x] Timber impacts show debris without fireballs.
- [x] Armour impacts show brief sparks without sustained flame.
- [x] Shell bursts differ from persistent fires.
- [x] Ramming events show no cannon muzzle flash.
- [x] Documented fires stop when the ship is lost.
- [x] Event controls seek to their authored moment.
- [x] Scrubbing restores deterministic effects.
- [x] Desktop browser checks pass.
- [x] Mobile browser checks pass.
- [x] Relevant tests pass.
- [x] Deep publication verification passes.
- [x] Independent source/effect review passes.
- [x] Production deployment succeeds.
- [x] Public browser checks pass.

## Sorted tags and whole-book introduction — 2026-11-08
Scope: sort curated/followed tags by descending count; fresh default starts in a whole-book point overview with Holmes active; explicit tag/search selection enters focus; replay overview from toolbar. Saved/shared views retain explicit mode.
- [x] Curated tags are ordered by descending occurrence count.
- [x] Holmes remains active on fresh entry.
- [x] Fresh introduction represents54,411mapped word points.
- [x] Introduction retains218synthetic pages.
- [x] Follow Holmes enters focused view.
- [x] Selecting a tag enters focused view.
- [x] Search selection enters focused view.
- [x] Show whole book restores the overview.
- [x] Show whole book refits the camera to the full book.
- [x] Shared views restore explicit overview state.
- [x] Intro controls fit at375px.
- [x] Node tests pass.
- [x] Browser checks pass.
- [x] Independent verifier finds no blockers.
- [x] Live deployment is verified.

## Remember visits and remove intro filtering — 2026-11-08
Scope: unfiltered overview rendering, local-only validated visit memory, explicit replay; preserve shared-link priority and private custom text on-device.
- [x] Intro renders54,411word points without word threads.
- [x] Intro does not draw an active-word marker.
- [x]2D intro does not draw word threads.
- [x] Returning visitors skip the intro.
- [x] Last selected word survives reload.
- [x] Last occurrence survives reload.
- [x] View settings survive reload.
- [x] User camera movement is saved.
- [x] Replay introduction shows the unfiltered overview.
- [x] Replay does not erase the prior saved view while open.
- [x] Explicit example links override remembered visits.
- [x] Corrupt visit storage falls back safely.
- [x] Unavailable storage leaves the app usable.
- [x] Built-in remembered views omit bundled book text.
- [x] Phone controls fit at375px.
- [x] Tests pass.
- [x] Independent review passes.
- [x] Public behavior is verified.

## Read words when zooming into a book page
- [x] The distant 3D overview shows points.
- [x] A close page shows the original spelling at each mapped word position.
- [x] Clicking a displayed word follows its occurrence.
- [x] Zooming out restores the point overview.
- [x] Focused threads retain their existing behavior.
- [x] Browser and regression checks pass.
- [x] Independent review passes.

## Biblical Travels — 2026-11-12
Source: existing Acts prototype. Output: static experiment under /experiments/biblical-travels/.
- [x] The experiment is discoverable from the Experiments index.
- [x] A fresh visit opens at Samaria.
- [x] A fresh visit follows Philip the Evangelist.
- [x] A fresh visit uses the flat map.
- [x] The Samaria event offers a Peter handoff.
- [x] The Peter handoff preserves the Samaria event.
- [x] The reading link opens the selected Acts passage.
- [x] The cube preserves the selected person.
- [x] The cube preserves the selected event.
- [x] Desktop and mobile browser checks pass.
- [x] A fresh verifier reviews the implementation.

Local verification: 235 Node tests, 17 Python tests, deep build verification, and Chrome checks at 1440px and 375px.

## Jesus’s Gospel journeys
- [x] The default atlas opens at Samaria in Acts.
- [x] The reader can select Matthew.
- [x] The reader can select Mark.
- [x] The reader can select Luke.
- [x] The reader can select John.
- [x] Gospel events open their source verses.
- [x] The cube preserves the selected Gospel stop.
- [x] A fresh verifier reviews the implementation.

## Compare Gospel journeys
- [x] Comparison shows routes from Matthew, Mark, Luke, and John on one map.
- [x] A shared place lists passages in the other accounts.
- [x] A passage handoff preserves the selected place.
- [x] A passage handoff preserves the map view.
- [x] Acts still opens at Samaria.
- [x] A fresh verifier reviews the comparison.

## Clickable Gospel overlap markers
- [x] A shared-place marker is selectable on the flat map.
- [x] A shared-place marker is selectable on the 3D map floor.
- [x] The selected place lists its mapped Gospel passages.
- [x] A passage handoff preserves the current view.
- [x] A keyboard user can select a shared-place marker.
- [x] Acts retains its Samaria opening.

## Atlas map controls and cube layer
- [x] Visible map points open their mapped events.
- [x] Grouped points expose each event in a list.
- [x] Tilt changes the cube projection.
- [x] Zoom reaches 500 percent.
- [x] The space-time frame can be toggled independently.
- [x] Acts still opens flat at Samaria.

## Atlas pan and pinch gestures
- [x] Dragging the zoomed flat map pans it.
- [x] Dragging the 3D map without modifiers rotates it.
- [x] Shift-dragging the zoomed 3D map pans it.
- [x] A two-finger pinch changes zoom in flat view.
- [x] A two-finger pinch changes zoom in 3D.
- [x] A two-finger drag pans the zoomed 3D view.
- [x] Gesture changes preserve the selected event.

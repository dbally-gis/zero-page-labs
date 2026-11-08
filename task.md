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
- [ ] Public deployment matches the verified build.

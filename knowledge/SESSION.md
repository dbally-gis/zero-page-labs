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
Goal: implement the complete approved review recommendations. Agent: OpenAI Codex. Handoff-type: continuation. Status: implementation. Scope includes unified colors, focused stage, advanced drawer, camera reset, linked reader/occurrences, PNG/clean view, honest complete2D, optional decoration, meaningful labels, mobile controls, shareable built-in views and local saved sessions. No original project edits or server-side content processing. Binary contract in task.md.

### Implementation verified
Unified colors, instanced framed stage, collapsed advanced controls, camera reset, linked excerpts/full reader, complete 2D, optional particles, explanatory coordinates/sheets, Clean view and contextual PNG are implemented. Built-in views serialize bounded settings without text; local JSON restores custom text/settings/camera. 63 Node tests, 17 Python tests and deep static verification pass. Actual browser PNG downloads and local session roundtrip passed; maximum 20,000-character passage rendered 5,000 occurrences over20 sheets. Phone375px and tablet768px have no overflow. Browser policy blocked opening a copied share URL; restoration is unit-tested, with a visible copyable link as fallback. Physical Safari remains open. Deployment pending.

### Published result
Source7b90574ebda496b8b33923875e104be9aca17ef0. GitHub run42443111179 passed tests/build/Render deployment/public fingerprint verification. Independent final source review PASS. Live Next occurrence changed reader selection; complete2D exposed398 occurrences/2sheets; returning3D rendered correctly; error/warning logs empty. Screenshot:.tmp/lexical-playground-live.jpg. Status: complete.

S.D.G.: Curious readers can follow recurring words into their context and keep a visual result while their custom passage stays on-device.
Feynman gap: Real PNG downloads, local session restoration, responsive layouts, automated link restoration and public deployment are verified; physical Safari and direct browser share-link navigation remain unverified.

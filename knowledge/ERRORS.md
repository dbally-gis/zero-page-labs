---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T16:31:28.188948-06:00"
---

# Errors
## 2026-11-07 — Phone artwork stretched vertically
Cause: HTML image dimension attributes combined with CSS max-width without height:auto. Fix: apply height:auto to images. Observed in desktop browser; fixed before deployment. Graduated to procedural/deploy_site.md.

## 2026-11-07 — Incomplete gallery from a release batch
Error: Treated fifteen-face round release evidence as the full catalog. Cause: batch evidence answers release provenance, not current developer inventory. Fix: load developer listing to terminal pagination, capture category/IDs, compare build membership to snapshot. Current snapshot38entries=34Faces+4apps. Failure-path test rejects an omitted face.

Public store HTTP200 is not sufficient listing evidence: missing apps return a generic Application title and Application not found. Do not retain these as active listings solely from HTTPstatus. Graduated to procedural/deploy_site.md.

## 2026-11-07 — Automatic sync review corrections
Fresh Git checkouts lack ignored.tmp: test setup now creates it before temporary fixtures. Native header dimensions alone accept truncated images: acquisition now fully verifiesPNG and decodes GIFframes; CI deep-verifies previews before committing. Regressions covered by17tests.

Showing a deployment secret before emitting a full UI observation exposes the value in tool output. It was hidden again; no source or credential file retains it. Future retrieval must capture and rehide the value before observation. Credential handling procedure is in procedural/deploy_site.md.

## 2026-11-07 — Reserved words crashed lexical dictionaries
Error: a corpus containing constructor caused BookMatrix map[word].push to hit an inherited Function. Cause: user words indexed ordinary object literals. Fix: shared null-prototype countWords/indexWords utilities used by App, BookMatrix and SummaryPanel. Regression test covers constructor, __proto__, toString. Browser constructor corpus rendered without console errors. Graduated to experiments-source/lexical/src/word-maps.js and execution/test_experiments.mjs.

## 2026-11-07 — Browser upload QA fixture constraint
CUA selected a .tmp text fixture (project .tmp is a symlink) but its file read never completed. A directly accessible root robots.txt loaded immediately and rendered9nodes. Treat symlinked fixture behavior as a tooling limitation until reproduced independently; use a directly accessible file for upload QA. PNG export succeeded despite the tool's download-event waiter timing out: the actual Downloads/zero-page-retro-glitch.png decoded as555×1200PNG.

## Lexical inconsistent identity and incomplete fallback — resolved 2026-11-07
Independent palettes gave a word different colors across panels; the fallback sampled only 90 occurrences and fixed three pages. Shared model.js wordColor and FlatView now use canonical indices and actual synthetic sheets. Regression tests cover colors, 5,000 occurrences/20 sheets, bounds and restoration. Graduated to the canonical-model decision.

## One-letter Throughline coordinates — resolved 2026-11-08
Explicit reader selection exposed a pre-existing assumption that every word has a second letter: charCodeAt(1) returned NaN for a/I. Missing second letters now use the start of the second-letter axis. Regression verifies finite positions and camera. Graduated to domain/lexical-passage-selection.md.

## 2026-11-08 — Illustrative near miss intersected a ship
Error: Trafalgar shot event28 was labelled a miss, but its water splash lay inside Redoutable's rendered silhouette. Cause: a fixed23unit lateral offset ignored the target's heading and enlarged hull length. Fix: deterministic candidate search clears every vessel by55diagramunits at impact time. Regression: execution/test_maritime_combat.mjs scans the43event range in each of the4encounters. Graduated-to: shot-event placement in experiments/maritime/combat.mjs.

## 2026-11-08 — Sustained fire must not use transient impact growth
The first reported-fire renderer reused impactAge scaling; over a long condition it produced an enormous floating flame and smoke cloud. Bound the visual age of the reported fire independently of its replay duration. Verified late-replay rendering separately from a brief impact. Evidence boundary: knowledge/domain/trafalgar-evidence.md.

## Saved camera cropping after responsive layout changes — resolved2026-11-08
Old portrait-stack poses crop new landscape spreads. New layoutRevision2 re-fits legacy poses. Aspect metadata also re-fits substantial aspect changes and column-count transitions; a small3.9→3.7 resize can change8sheets from4to3columns and crop vertically despite passing a ratio threshold. Regression covers the transition. Graduated to domain/lexical-url-framing.md.

## Fullscreen search overflow on narrow screens — 2026-11-08
Error: search and ten-word chip row expanded to592px inside a347px panel, causing horizontal panning on focus. Cause: intrinsic flex-child minimum sizing in a fixed fullscreen card. Fix: set min-width0 and width100% on search/chips/navigation, then max-width100% on panel children; retain chip-row scrolling. Verification:375px card scrollWidth375, panel x14/width347, search width329. Graduated-to: domain/lexical-book-identity.md.

## Independent verifier unavailable — 2026-11-08
The solo-thread toggle verifier failed before reviewing source because the account usage limit was reached. Direct browser checks and92tests passed, but they do not satisfy independent creator-verifier coverage. Keep this change marked independently unverified until a fresh review is available; do not claim the verifier passed.

## Book focus hid word discovery — 2026-11-08
Symptom: default desktop appeared to offer onlywhich, so the full map and other words seemed inaccessible. Cause: larger-canvas focus CSS hid the word picker while searchable chart controls rendered only in fullscreen. Fix: render the same chart-owned search/tag panel in normal desktop book focus; state complete-book coverage; label the header reader action Read full text. Keep the normal phone picker. Graduated-to: domain/lexical-book-identity.md.

## Whole-book replay retained cropped camera — 2026-11-08
Independent review caught Show whole book initially changing only visible points, retaining prior zoom/orbit because CameraRig dependencies had not changed. Entry now clears cameraPose and increments resetTick, which refits the existing full-book bounds. Graduated-to: domain/lexical-book-identity.md.

## Whole-book intro appeared pre-filtered — 2026-11-08
User screenshot showed brightHolmes path dominating full-book points. Cause: overview added the point cloud but still rendered selected meshes/paths/marker. Fix: overview branch renders colored points only, with no selected layer;2D skips paths/active marker too. Graduated-to: domain/lexical-book-identity.md.

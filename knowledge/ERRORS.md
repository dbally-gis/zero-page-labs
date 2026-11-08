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

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

---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T16:31:28.188948-06:00"
---

# Errors
## 2026-11-07 — Phone artwork stretched vertically
Cause: HTML image dimension attributes combined with CSS max-width without height:auto. Fix: apply height:auto to images. Observed in desktop browser; fixed before deployment. Graduated to procedural/deploy_site.md.

---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T17:21:41.076334-06:00"
---

# Synchronization dependencies
Pillow12.3.0 is pinned in requirements-sync.txt. It validates complete nativePNG/GIF images before unattended publication. Existing local version12.3.0 and current officialPyPI release availability were verified. GitHub installs it before tests. The Render static build stays standard-library-only; it consumes the Git commit already deep-validated by CI. No runtime browser dependency added.

GitHub actions/checkoutv6 and actions/setup-pythonv6 are pinned to verified upstream commitSHAs in the workflow. Python3.12 is selected for the cloud job.

## Browser experiments — 2026-11-07
Lexical's public adaptation uses the existing React18/Three0.160/postprocessing6 stack. Do not upgrade postprocessing to7 independently. Vite6.4.5 is locked for the publication build; uuid13.0.1 and fflate0.8.3 overrides remove reported advisories. Full npm audit and production-only audit reported0vulnerabilities during this session. Exact versions are in experiments-source/lexical/package-lock.json. Build tool dependencies stay out of dist. Runtime Three font is local, with its OFL license. Bundled package notices ship alongside Lexical. Original source repositories were not changed. Retro's public edition adds no dependencies.

## 2026-11-08 — Maritime dimensional preview
Three.js0.160.1 is vendored from the existing locked Lexical dependency into experiments/maritime/vendor/three-0.160.1.module.min.js, with its MIT license. No CDN or new package install is required for static publication. data/maritime-vendor.json records its SHA256; execution/verify_site.py rejects a changed or missing library. The optional scene dynamically imports the self-contained ES module, while replay and the classic SVG remain independent.

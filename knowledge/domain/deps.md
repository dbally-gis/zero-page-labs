---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T17:21:41.076334-06:00"
---

# Synchronization dependencies
Pillow12.3.0 is pinned in requirements-sync.txt. It validates complete nativePNG/GIF images before unattended publication. Existing local version12.3.0 and current officialPyPI release availability were verified. GitHub installs it before tests. The Render static build stays standard-library-only; it consumes the Git commit already deep-validated by CI. No runtime browser dependency added.

GitHub actions/checkoutv6 and actions/setup-pythonv6 are pinned to verified upstream commitSHAs in the workflow. Python3.12 is selected for the cloud job.

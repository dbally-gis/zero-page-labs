---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T16:31:28.188948-06:00"
---

# Deploy Zero Page Labs
Render static site. Build: `python3 execution/build_site.py`. Publish directory: `dist`.

Validate using `python3 execution/verify_site.py`. Native dashboard connects the source repository. For a public repository connection without a Git provider, use Manual Deploy after pushing changes unless a Blueprint or integration explicitly enables automatic deployment.

Custom domain: zeropagelabs.com. Read existing DNS before edits; preserve mail and verification records. Follow the exact DNS targets reported by Render. Do not infer successful TLS from a successful build.

---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T16:31:28.188948-06:00"
---

# Build and verify
1. Edit source HTML, `style.css`, `src/app.js`, or `data/watchfaces.json`.
2. Run `python3 execution/build_site.py`.
3. Run `python3 execution/verify_site.py`.
4. Serve `dist/` locally for desktop/mobile browser QA.
5. Push reviewed source; deploy the corresponding commit in Render.

Build uses an allowlist so knowledge, environment files, and temporary artifacts are excluded. CSS must keep `img { height: auto; }` because explicit HTML width/height attributes otherwise stretch the narrow phone screenshot vertically.

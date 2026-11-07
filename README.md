---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T16:31:28.188948-06:00"
---

# Zero Page Labs
Daniel Bally’s independent playground for wild projects and ideas. Separate from Globe & Atlas.

Launch: Thumbwords project page and fifteen Pebble watchfaces. No future-project placeholders.

## Develop
```sh
python3 execution/build_site.py
python3 execution/verify_site.py
python3 -m http.server 4297 --bind 127.0.0.1 --directory dist
```
HTML/CSS/JavaScript, no package dependencies. Catalog: `data/watchfaces.json`. Build copies only public assets into `dist/`. Hosting: Render static site; configuration in `render.yaml`. Runtime fonts currently load from Google Fonts.

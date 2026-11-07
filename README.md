---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T16:31:28.188948-06:00"
---

# Zero Page Labs
Daniel Bally’s independent playground for wild projects and ideas. Separate from Globe & Atlas.

Projects: Thumbwords, the current public Pebble watchface catalog, and Gridcore (specification-led experiment with a companion interactive demo). No future-project placeholders.

## Develop
```sh
python3 execution/build_site.py
python3 execution/verify_site.py
python3 -m http.server 4297 --bind 127.0.0.1 --directory dist
```
HTML/CSS/JavaScript, no package dependencies. Catalog: `data/watchfaces.json`. Build copies only public assets into `dist/`. Hosting: Render static site; configuration in `render.yaml`. Runtime fonts currently load from Google Fonts.

## Automatic gallery updates
The hourly GitHub workflow discovers Daniel’s public Pebble catalog, validates native previews, persists changes, and deploys changed output to Render. It does not require this Mac to stay awake. Failed or incomplete syncs leave the last successful site published. See knowledge/procedural/deploy_site.md for operations.

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

## Refresh the public watchface inventory
Open https://apps.repebble.com/apps/dev/daniel-bally_e8468a0ff28edd5791d1bced and scroll until loading terminates. Save only public card name,url,category,description,thumbnail fields into data/developer-catalog.json; record reachedBottom/loadedPages/entrycount. The2026-11-07 terminal catalog had38entries across2pages.

Run `python3 execution/sync_catalog.py` to acquire categoryFaces and validate native200×228 PNG/GIF previews. Acquisition is read-only externally, bounded to4workers/4attempts/25second socket timeouts; only transient HTTP/network failures retry. Downloads stage under.tmp before catalog replacement. Run `python3 execution/test_sync_catalog.py`, build, then verifier. The verifier compares publicIDs to the snapshot, so a fixedcount cannot mask omitted faces. Build remains offline. Reconcile removed listings explicitly; generic Application HTML can be HTTP200.

Gridcore companion source is vendored in gridcore/demo; original projects remain untouched. Original specification copies under gridcore/specs are verified by hashes in data/gridcore-provenance.json.

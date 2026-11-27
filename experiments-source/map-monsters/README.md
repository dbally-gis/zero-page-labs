---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-27T16:41:08-06:00"
---

# Map Monsters — sources and rebuild

The published page is `experiments/map-monsters/`. It opens on source scans. The three source plates compare selected European depictions; the artwork retains VIII–X as its original plate numbers. Thirty occupied cells use 31 crops from 25 downloaded scans.

## Rebuild

From the repository root, install the recorded Pillow version in your normal project environment:

```bash
python3 -m pip install -r experiments-source/map-monsters/requirements.txt
python3 execution/rebuild_map_monsters.py --fetch
```

The command downloads missing inputs, verifies SHA-256 checksums, creates output directories, crops the scans, composes three plates, exports 2400/1200 px WebP images, creates highlighted scan-context images, and updates the readable specimen catalogue in `index.html`. Omit `--fetch` for an offline rebuild from the scan cache; use `--verify-only` for checksum validation without rendering. Missing Pillow fails before downloads. A changed upstream image fails checksum verification and is never silently accepted. Check upstream revisions before explicitly updating a manifest entry.

The renderer uses macOS Baskerville at `/System/Library/Fonts/Supplemental/Baskerville.ttc`. It requires that font; other operating systems need an explicitly selected equivalent before rebuilding. Pillow’s paper texture is stochastic, so rebuilds reproduce the composition, not identical output bytes. Pillow is used at the version tested for this rebuild; this is not a claim that the version is the latest available.

Python `-I` isolates imports and environment settings. It does **not** sandbox image decoding. The entry point checks the recorded input hashes; normal Pillow image-size protections remain enabled.

## Files

- `manifest.json` is tracked: exact download URLs, checksums, source dimensions, repository rights statements, captions, interpretations and evidence links for each occupied cell.
- `build/crops.json` is tracked: source pixel boxes and the width basis used for scaled coordinates.
- `build/plate.py` and `build/plates.py` are tracked: source-plate composition and captions. Keep their cell captions aligned with the manifest; the tests check this agreement.
- `sources/`, `crops/`, `build/views/` and rendered PNGs are local caches, excluded from Git. The tracked manifest replaces the former cache-only provenance dependency.
- `renders/prompt-ix.txt`, `renders/prompt-x.txt` and `renders/provenance.json` preserve the available artistic-generation provenance. The original Plate VIII prompt is missing; its absence is recorded explicitly.
- `execution/rebuild_map_monsters.py` is the maintained workflow. The small `build/fetch.py`, `pages.py`, `meta*.py`, `search.py`, `sheet*.py` and `grid.py` helpers preserve earlier research history; they are not required for a normal rebuild.

## Evidence decisions

Montfort’s volume II is dated An X (1801–1802), rather than a secure single year. The supplied reproduction’s own edition remains uncertain. Logy Bay is a 1873 specimen; the bath photograph is conservatively dated c. 1873–1874 because institutional captions conflict. Source dates and event dates are separate. Full evidence notes live in `knowledge/domain/map-monsters-evidence.md` and on the page.

## Verify

```bash
python3 -m unittest discover -s execution -p 'test_map_monsters.py'
node --test execution/test_map_monsters.mjs
python3 execution/build_site.py
python3 execution/verify_site.py --deep
```

Inspect the resulting page at desktop and phone widths, including source/illustrated switching, specimen details, source context, browser Back and keyboard tab controls. The legacy AI images preserve earlier captions and must be presented as artistic interpretations rather than corrected historical evidence.

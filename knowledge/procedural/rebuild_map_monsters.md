---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-27T16:41:08-06:00"
---

# Rebuild Map Monsters

Use `python3 execution/rebuild_map_monsters.py --fetch` from the repository root. See `experiments-source/map-monsters/README.md` for the tested Pillow version and macOS font requirement. The maintained script verifies the tracked manifest before rendering. Source caches and intermediate PNGs stay untracked; publish the generated WebP context images and source plates with the HTML catalogue.

For caption changes, update the corresponding manifest cell and the renderer's row in `build/plate.py` or `build/plates.py`. Update `build/crops.json` only when the actual selected image region changes. Preserve the evidence boundary between event date, print date and reproduction edition. The catalogue and source plate captions must agree; the Python test enforces this.

Run the targeted Python and Node tests named in the README, the site build, and deep verification. If experiment listing text changes, regenerate its share card with `python3 execution/build_share_cards.py`, then rebuild the site. Browser-check the default source view, plate changes, artistic interpretation, browser Back, specimen expansion and a specimen deep link at desktop and 375 px widths. Confirm no overflow or console errors.

Do not infer that a matching checksum authenticates an image's historical attribution: it establishes which digital bytes the plate used. Some supplied scans are already details; only the source record may lead to the complete work.

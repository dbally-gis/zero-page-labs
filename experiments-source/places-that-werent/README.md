---
generated_by: "OpenAI Codex (GPT-6; exact variant not exposed)"
timestamp: "2026-11-27T22:55:09-06:00"
---

# Places That Weren’t

Four selected European cartographic claims: California as an island, Frisland, the Mountains of Kong, Terra Australis. The page is a companion to Map Monsters, not a catalogue of every phantom place.

`cases.json` contains source URLs, original-input SHA-256 hashes, normalised crop rectangles, map dates, collection credit, historical evidence and limitations. `assets.json` records the dimensions and hashes of the published WebP images. `template.html` generates the public HTML; edit the template or case data rather than its generated catalogue. The CSS and browser module are maintained directly in `experiments/places-that-werent/`.

## Rebuild

Run `python3 execution/build_places.py --fetch`. Requires curl and the existing Map Monsters Pillow dependency (`experiments-source/map-monsters/requirements.txt`). Sources are cached in the ignored `sources/` directory. Omit `--fetch` for an offline rebuild. A changed upstream scan fails its recorded checksum rather than silently replacing it. Downloads use a temporary file and preserve a previous cache on failure. Detail and whole-sheet views are cropped/resized from scan pixels, without historical reconstruction or added map features. Whole sheet means the full supplied image, including a book gutter where present.

Run `python3 -m unittest discover -s execution -p 'test_places.py'`, `node --test execution/test_places.mjs`, `python3 execution/build_share_cards.py --check`, `python3 execution/build_site.py`, and `python3 execution/verify_site.py --deep`. Serve `dist/` and verify case selection, image view switching, evidence expansion, shared hashes and browser Back on desktop and at 375px.

## Evidence boundaries

- California: current LOC record and Free to Use set give 1650; older exhibitions say 1639. Label c. 1650 and disclose the discrepancy. The supplied digital image is a Commons mirror of LOC item 99443375.
- Frisland: printed date 1558 is separate from Zeno’s contested account of medieval voyages. The LOC scan is linked from its institutional historical article. Do not assign a universal deletion date or claim the island sank.
- Kong: sheet 1813; Princeton records the London atlas edition as 1815. The fictional continuous range is distinct from real Kong and local terrain. Avoid repeating the exhibition’s sweeping claim that all maps eliminated it at one moment.
- Terra Australis: use the uncoloured 1570 Rumsey 10000.011 copy, not a later coloured impression. The IIIF manifest gives the image service and original dimensions. Rumsey’s explicit publication permission permits digital publication with credit. Original map is public domain; do not mislabel the site’s general CC licence as CC BY. The 1574 Finland record and Osher thumbnail were research leads, not published input.

See `knowledge/domain/places-that-werent-evidence.md` for source decisions and QA handoff.

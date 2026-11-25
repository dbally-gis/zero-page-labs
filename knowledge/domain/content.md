---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T16:31:28.188948-06:00"
---

# Launch content evidence
Checked 2026-11-07: https://apps.apple.com/us/app/thumbwords/id6828192472 — public US listing, six games, free with in-app purchases, optional one-time unlock. Price omitted because local intended price and live listing differ.

Screenshots copied byte-for-byte from `../t9-words/content/app-store/screenshots/v1/`. Watchface catalog URLs come from `../.tmp/round-watchfaces/store/*/public-proof.json`; fifteen listing URLs returned HTTP 200. Watchface images copied from the corresponding `media/round/emery-default.png` when available, otherwise release screenshot URL. Two historical remote PNG URLs returned 404, so do not make runtime site rendering depend on those links. Public store pages may render content via JavaScript; HTTP 200 alone does not establish device compatibility.

## 2026-11-07 — Current imagery refresh
User requested latest Thumbwords visuals, superseding the launch v1 screenshot choice. Real390×844 captures from tagged1.0.2(2026110703), commit7ed1f0f63287c1dd7537001daae3668fae2ae9c9: library/Codebreaker Blue brick; Number Hunt Silver flip. Source projects remain read-only. The page labels screenshots as latest development previews; public six-game descriptions remain grounded in the App Store listing. Asset hashes are in data/imagery-provenance.json.

Hardware frame: https://apps.repebble.com/images/screenshot_slider_background_emery_v2.png (488×700 RGBA), used by the official Pebble appstore. Screens retain native200×228 aspect ratio beneath the frame. No generated gameplay or product imagery.

## 2026-11-07 — Current catalog supersedes release batch
Current developer snapshot has34Faces and4apps. All34nativeTime2 previews are imported;32PNG/2GIF,~107KB total. Counts derive from data. ClassicLCD/Triangle/Lume current pages explicitly return Application not found despite HTTP200. The completeness contract compares IDs to data/developer-catalog.json, not a fixedcount. Gridcore is an approved cross-project experiment: specprimary, demo companion, G&A attribution retained.

## Public repository links
Verify visibility through GitHub before linking a project. Public source inventory is recorded in data/public-repositories.json. Source links belong on the corresponding project page; keep Globe & Atlas attribution where applicable. Thumbwords links only its public vocabulary-data repository, labeled as data rather than game source. Retro links the public Labs browser adaptation because the original workshop repository is private. Lexical links globe-and-atlas/lexical. Gridcore links its specification and Labs demo source. Eight currently listed watchfaces link matching public sources; build-time links use a separate slug map so catalog refreshes preserve them. Public site source appears in the shared marketing-page footers. Recheck repositories when adding future projects.

## Lexical example texts
Public examples are bundled in experiments-source/lexical/src/text-examples.js; original passages require no attribution to external authors or text-fetch services. Metadata specifies view, focus terms, and the guide. Keep focus terms in the rendered word set even when they are outside the frequency top8. Changing examples resets prior corpus filters. Selecting custom text clears example identity. The picker remains visible independently of the input panel.

## 2026-11-25 — Bellona cover illustration
Replaced the schematic card with `assets/experiment-bellona-realistic.png` (1536×1024), generated using built-in imagegen. Artistic model-ship illustration, not a documentary photograph or verified reconstruction. Direction: photorealistic wooden Admiralty model, three masts, furled sails, two gun decks, partial hull cutaway, warm ivory studio background, no text. Original SVG retained. Home and Experiments consume the catalog cover; Bellona and Experiments share cards were regenerated.

## 2026-11-25 — Maritime cover illustration
`assets/experiment-maritime-realistic.png` replaces the schematic fleet card. Built-in imagegen produced a realistic age-of-sail fleet scene in teal water, cream canvas, and warm light. This is an artistic illustration, not a documentary reconstruction. Exact prompt: `data/maritime-cover-generation.json`. Original SVG retained. Maritime share card regenerated; 15-page deep verification and share-card freshness passed. Chrome confirmed the full ship composition in the actual card.

## 2026-11-25 — Biblical Travels cover illustration
`assets/experiment-biblical-travels-realistic.png` replaces the flat map with a realistic Galilee-inspired journey scene: anonymous travelers, olive trees, a stone path, and a lakeside village. Artistic illustration, not a verified reconstruction of a particular site or biblical event. Generated with built-in imagegen; exact prompt in `data/biblical-cover-generation.json`. Original SVG retained. Shared catalog updates homepage and Experiments; Biblical Travels and Experiments share images regenerated. Deep verification passed 15 pages; share-card freshness passed; local desktop and 375px checks passed.

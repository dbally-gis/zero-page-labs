---
generated_by: "Claude Code (Claude Fable 5.2)"
timestamp: "2026-11-16T08:35:00-06:00"
---

# Maintain the showcase

## Goal
Keep the home page, the Experiments page and every page's share image in step with what the site holds.

## Inputs
- `data/experiments.json`: the only list of experiments. Oldest first; catalogue numbers follow list order.
- `data/site.json`: public origin, share-card text for the non-experiment pages, and the optional visitor counter.

## Add or change an experiment
1. Publish the experiment under `experiments/<slug>/` (see `publish_experiments.md`).
2. Add it to the end of `data/experiments.json` with `slug`, `title`, `category`, `added`, `status` (`live` or `prototype`), `summary`, `tagline`, `cta` and `cover`. Set `featured: true` to show it as a full card on the home page; keep the featured count even so the two-column row stays full.
3. Add its URL to `sitemap.xml`.
4. Run `cd execution && python3 build_share_cards.py`. It needs Google Chrome and a network connection for the fonts. Look at the new image in `assets/share/`.
5. Run `python3 execution/build_site.py` and `python3 execution/verify_site.py --deep`.
6. Commit the list, the image and `data/share-cards.json` together.

Do not write experiment cards into `index.html` or `experiments/index.html`; both pages hold a placeholder that the build fills.

## Add a page that is not an experiment
Add it to `sitemap.xml` and to `pages` in `data/site.json` with its share text, or point it at an existing image with `"share": "<name>"`. Then follow steps 4 to 6.

## Tools
- `execution/site_content.py`: renders cards, the home section and share tags; raises `ContentError` on a bad list.
- `execution/build_share_cards.py`: photographs stale cards. `--check` lists stale cards without writing.
- `execution/verify_site.py`: fails when an experiment is missing from a page or the sitemap, numbers differ from the list, or a share image is stale, missing or the wrong size.

## Edge cases
- Share images must not use `assets/catalog-*` files. The hourly sync renames them, and the unattended build has no browser to rebuild a stale image.
- Share tags are added to `dist/` only. Never add them to `experiments/lexical` or `experiments/rack-lab` source pages; those bundles are hash-attested.
- Turning on the visitor counter: put the GoatCounter site code in `analytics.goatcounter`. The script then ships on every page, including the experiments that promise text and images stay on the device, so say so on the site before enabling it.

## Learnings — 2026-11-16
Hand-written cards on two pages drifted within nine days: the home page showed three of seven experiments. Generating both from one list, and failing verification on any mismatch, is what keeps them in step.

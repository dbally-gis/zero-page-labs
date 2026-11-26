---
generated_by: "OpenAI Codex (GPT-6; exact variant not exposed)"
timestamp: "2026-11-26T08:53:53.113336-06:00"
---

# Orbits Projection cabinet browser edition

`experiments/projection/` copies Orbits’ bundled projection engine, Natural Earth coastlines, and software notices. `provenance.json` pins the copied bytes by SHA-256. The browser edition uses a reference orientation with no device-location access. Albers uses fixed 20°/50° parallels here.

The cabinet has 24 identities, illustrated globe unfolding, finite 5° distortion circles, zoom, globe rotation by pointer or arrow keys, and four construction diagrams. Construction equations and ray geometry match `PhoneProjectionCabinet.swift`; Mercator is mathematical stretching, not a light-source projection.

Check `node --test execution/test_projection.mjs` for 144 rendering combinations (24 projections × 3 unfold positions × 2 widths) plus copied-asset integrity. The catalog, home listing, and share tags are generated from `data/experiments.json`; follow `directives/maintain_showcase.md`.

2026-11-26: static deep verification passed 16 pages / 47 watchfaces. Existing experiment tests plus rendering checks passed 242 tests. Browser QA covered desktop 1440px and mobile 375px, Mercator/Dymaxion, unfold, overlays, reset, keyboard rotation, and construction selection/angle controls; no overflow or console warnings/errors observed. Independent verifier checked geometry and 16 construction/angle combinations. Physical touch remains untested.

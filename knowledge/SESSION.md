---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T17:04:06.403311-06:00"
---

# Zero Page Labs — Experiments launch
Goal: Publish browser-ready Retro-Glitch Studio and Lexical with an Experiments section.
Agent: OpenAI Codex
Handoff-from: OpenAI Codex
Handoff-type: continuation
Status: Complete. Both public browser experiments are live; original workshop repositories remain unchanged.

## Current checkpoint
- Public contract appended to task.md.
- Read-only readiness reviewer confirmed Retro has24effects and requires a browser port; Lexical needs URL/proxy removal, input limits, mobile controls, local runtime assets, dependency fixes.
- Publication adaptation lives in experiments-source/lexical; output goes to experiments/lexical. postprocessing stays6.x. Vite6.4.5 with patched transitive dependencies currently audits clean.
- Retro browser-native edition in experiments/retro-glitch is being implemented with bounded PNG/JPEG input, worker rendering,24effects, comparison/reset/export.
- Existing hourly Pebble sync and Render hook workflow remains deployment path. Prior live site includes original Gridcore plates and transparent Thumbwords phone.

## Handoff / next
Finish public UI, run meaningful tests and production browser QA atdesktop/mobile, fresh independent verification, then publish through the existing workflow. Prior completed launch and gallery work remains in archive/launch-and-catalog-20261107.md and Git history.

## Readiness / verification checkpoint
Source blockers resolved: static hosting adaptation; proxy removal; bounded intake; null-prototype dictionaries; inert HTML extraction; local font/HDR removal; mobile controls. Independent verifier PASS after reserved-word/palette fixes.41Node tests and17Python tests PASS; deep static verifier PASS9pages; full npm audit0. Browser verified photo import→effect→PNG export (actual file decoded), reset, text paste, local text-file loading, constructor regression, both modes, selectable2D fallback, back links,375px layouts including opacity controls. Source/output manifest is checked during normal site builds. Deployment next.

## Checkpoint Log

- 2026-11-07 18:31 — commit: Launch browser-native Retro-Glitch and Lexical experiments | .github/workflows/sync-pebble.yml,assets/experiment-lexical.svg,assets/experiment-retro.svg,data/experiments-build.json,data/experiments-provenance.json

- 2026-11-07 18:34 — commit: Record verified public experiments deployment | knowledge/INDEX.md,knowledge/REFLECTIONS.jsonl,knowledge/SESSION.md,knowledge/domain/experiments-readiness.md,task.md
## Published result
Source commit324794cfc3053c3e771cb5deefd928722785206e. GitHub run42430166067 passed tests, build, Render deployment, and public fingerprint verification. Live homepage Experiments section and /experiments/ observed. Live Retro mutation completed3effects with export ready; live Lexical switched to Throughline with398mapped nodes. Console error/warning logs empty on these live checks. Screenshot:.tmp/experiments-live.jpg. Ready for public experiment use within documented limits; physical iPhone/Safari testing remains open.

S.D.G.: Curious visitors can transform an image or explore a passage immediately, with their content staying on their own device.
Feynman gap: Chrome desktop,375px layout, actual PNG export, independent source review and deployment are verified; physical mobile Safari and forced WebGL-unavailable behavior remain untested.

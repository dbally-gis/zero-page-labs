---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T18:32:38-06:00"
---

# Public experiment readiness

Goal: give anonymous visitors an enjoyable creative result from a built-in sample, then support their own local input. This is a craft/showcase release, with no revenue or account goal.

## Release rubric
| Check | Harm weight | Evidence |
|---|---:|---|
| Visitor content remains local | 5 | VERIFIED: browser-only processing; URL proxies removed; inert HTML extraction |
| Public routes start without local servers | 5 | VERIFIED locally: production bundles and module worker; Render verification recorded in SESSION |
| Malformed or oversized input fails clearly | 4 | VERIFIED: header/size bounds, text limits, automated failure tests |
| Photo input reaches PNG export | 4 | VERIFIED: UI upload, effect, export; downloaded PNG decoded as 555×1200 |
| Text reaches both visualization modes | 4 | VERIFIED: pasted constructor corpus; local robots.txt file; both modes rendered |
| Mobile controls remain reachable | 4 | VERIFIED: 375px browser layouts, including page-opacity stepper |
| Reset and return routes work | 3 | VERIFIED: source restoration, sample reset, back-to-Experiments links |
| Graphics limitations have a usable alternative | 3 | VERIFIED: selectable 2D view; INFERRED: automatic WebGL failure path uses the same component |

## Pre-mortem resolved
1. “The app only works on the developer's computer.” Retro's Python runtime was replaced with a browser edition; Lexical's Vite proxy was removed from the public adaptation.
2. “My input freezes or crashes it.” Image limits are checked before decode; text is bounded; constructor-key dictionary collisions have a regression test.
3. “The controls disappear on my phone.” Public mobile layout puts the visualization and controls in document flow, wraps the Atlas controls, and preserves the return link.

## Inventory
Retro exposes 24 browser-adapted effects, three procedural cartridges, mutation, seed, source comparison, reset and PNG export. Browser algorithms are adaptations, not a pixel-identical promise about the Python app. Lexical exposes Throughline and Lexical Atlas, bounded paste/file input, original sample, word search/selection, recurrence, page controls and 2D view. Coordinates describe spelling or page position; they do not measure semantic similarity. Original repositories remain unchanged.

## Review results
Fresh verifier initially blocked a constructor-word crash and found ineffective palette sliders. Both were fixed; regression tests passed. Final independent source review reported no residual release blockers. The 41 Node tests and 17 Python tests passed. Deep static verification passed for nine pages. Full npm audit reported zero vulnerabilities.

## Physical-device follow-up
On an iPhone or Android phone: open a sample, change an effect, import a small photo, export PNG, return to Experiments, load Lexical, switch modes, paste a passage, adjust page opacity, then select 2D view. Watch for download/share behavior, sustained GPU responsiveness, and touch orbit/zoom. Desktop Chrome mobile sizing does not establish physical Safari behavior.

Ship decision: ready for public experiment use with the stated input limits. Physical-device behavior remains a follow-up; this release does not claim comprehensive browser coverage.

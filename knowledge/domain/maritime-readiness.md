---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T22:58:31-06:00"
---

# Maritime release review

## Purpose
An educational watch-and-explore naval atlas, mostly overhead tactical view with optional atmosphere perspective. Four encounters within 1400–1900. The user requested review-pp; no matching skill exists in the available roster, so the available review-app workflow was used.

## Rubric established before review
Historical honesty/source fit 25%; diagram/narration consistency 20%; replay correctness 15%; tactical readability 10%; responsive reachability 10%; keyboard/reduced motion 10%; discovery/sharing 5%; publication/privacy 5%.

Pre-mortem: diagrams contradict narration; visitors cannot operate the controls; schematic paths are mistaken for measured history.

## Measured content
4 encounters; 20 chapters; 12 curated questions; 47 diagram markers; 13 named participants; 11 source records. Runtime has no remote service, analytics or live generative endpoint.

## Findings and resolution
| Finding | Resolution | Evidence |
|---|---|---|
| Sources anchor reset non-default encounter | Only valid battle-state fragments restore replay | VERIFIED source, regression test, browser Yalu→Sources |
| Trafalgar breakthrough preceded actual crossing | Chapter endpoint moves both flagships across line | VERIFIED positions + dedicated model regression |
| Yalu weapons implied unsupported broadside geometry | Omit sectors there; show explicit explanation | VERIFIED source + browser overlay check |
| Shared moments started moving | Valid restored moments begin paused | VERIFIED test + fresh browser reload |
| Initial marker half outside chart | Enforce 35 diagram-unit centre margins | VERIFIED endpoint tests |
| Context omitted Maritime | Context now records purpose and modelling boundaries | VERIFIED documentation |

Independent fresh-context reviewer re-ran tests and deep verifier after fixes: PASS, no remaining release blockers. Reviewer did not edit the tree.

## Validation
- 21 Maritime tests passed, covering chapter endpoints, reverse scrubbing, short heading interpolation, marker margins, bounded replay, safe shared state, anchor guards, initial pause and camera bounds.
- 63 existing JavaScript experiment tests passed.
- 17 existing Python tests passed. The repository .tmp is an external-SSD symlink outside sandbox write roots; test fixture TemporaryDirectory was redirected to /private/tmp/zeropage-maritime/.tmp without changing test assertions or REPO source fixtures.
- Site build passed; deep static verifier passed 10 pages; git diff whitespace check passed.
- Real browser: four battle switches; chapter navigation; questions; selected vessel; weapon overlay; atmosphere; zoom/reset; keyboard selection; keyboard timeline End; source anchor; restored battle/ship/progress/view.
- Layout: desktop1280, phone375×812, tablet768×1024. No horizontal page overflow in inspected widths. Console error/warning logs empty.

## Release boundary
Published 2026-11-08 after explicit user authorization. GitHub run42492853378 succeeded for source6f4e2da122e95774b2f0ed7c43a14b416a32dbd5. Public source_commit matches; content_sha256 c25effe9ca033208be1da2c608e09a54ea58e3bd7df74b6d61acb700e523c3f0 matches reviewed dist. Live four-encounter chapter changes, curated guide and source navigation passed with clean console. Physical Safari and touch behavior are NEEDS DEVICE. Source links were researched using official museum/archive/naval-history pages; some hosts rate-limit full-text access. Routes are teaching illustrations, not exact tracks.

## Ten-minute physical-device check
1. Select Hampton Roads on a phone; confirm the battle changes.
2. Scrub the timeline with a finger; confirm positions follow it.
3. Select a ship through the dropdown; confirm its identity.
4. Zoom in; confirm vessels remain visible.
5. Reset the map; confirm the whole encounter returns.
6. Open a shared moment; confirm it stays paused.
7. Open Sources; confirm the selected encounter persists.

S.D.G.: Curious visitors can see how formations and ship technology changed naval fighting without first learning a command game.
Feynman gap: Local browser, model tests, independent review, production fingerprint and live interactions pass; physical Safari remains untested.

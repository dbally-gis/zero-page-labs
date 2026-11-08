---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-08T09:28:25-06:00"
---
# Direct passage word selection

The reading dialog renders each English word as a keyboard-accessible button while preserving original whitespace and punctuation. Choosing a word keeps the dialog open, updates its highlights, follows the exact occurrence and clears Throughline filters. A separate View in scene button closes the dialog and locates the active occurrence. Short/common words are included only while explicitly followed. Selecting a seventh word replaces the oldest followed word.

The canonical model accepts explicitly included words. Inclusion/removal can change occurrence indices, so selection transitions remap by original character offset. Saved/shared views validate one-letter words. Throughline uses the first second-letter axis position when a word has no second letter; without this fallback single-letter coordinates became NaN.

Verification:66 Node tests pass. Browser exercised workshop, a in Throughline, six-word eviction, short-word removal and375px reading layout. Independent source review passed. Published source ee2c278666d4c40354e042b6b65543a6c48206b5; workflow42494945177 passed tests/build/Render/public fingerprint verification. Live click on machine selected its first occurrence and rendered its colored thread with clean console.

S.D.G.: Readers can move directly from a word in its sentence to its visual pattern.
Feynman gap: Chrome interactions and finite-coordinate regressions passed; physical Safari remains untested.

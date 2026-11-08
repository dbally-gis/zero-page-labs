---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-08T10:40:28-06:00"
---
# Lexical: one workspace, one reader

User feedback: custom-text entry was unclear; excerpts, word lists, recurrence strips, chart and reader created competing scrolling surfaces.

The primary action is now **Use your own text**. It opens a paste/file/saved-view dialog; reopening a custom passage preserves its text for editing. **Create word map** commits the input. The source strip distinguishes EXAMPLE TEXT from YOUR TEXT.

The default workspace contains selected-word chips, compact occurrence navigation and one chart. The excerpt sidebar is retired. View options opens a native modal; recurrence strips are behind an optional Word patterns section there. The chart stays in place. Desktop uses the viewport; phone and short screens use one page scroll with a minimum usable chart height. Chips wrap rather than scrolling internally.

Read & follow opens the focused reader, with search and occurrence navigation in a compact toolbar. The passage itself is the scrolling region; keyboard help starts collapsed. Existing click/search/keyboard/wrap behaviors remain. Search resets when source text changes. Share-link fields appear inside the options modal so they remain visible.

The exact footer dedication is **in memory of Jeff McGuire**, explicitly requested by Daniel.

Validation:66 Node tests,17 Python tests, source/output manifest and deep10-page verifier passed. Fresh independent source review passed. Browser verified custom paste, editing prefill, example switching, reader search/keyboard wrapping, 2D398 occurrence count, options, share field visibility, actual PNG download (1204×967 decoded), desktop viewport fit,375×667 and375×812 no horizontal overflow, tablet768×1024 and short landscape access. A temporary missing old page variable was caught by browser QA and removed before publication; compiled output alone does not prove runtime rendering. Current fresh-browser console is clean.

Publication pending.

S.D.G.: Visitors can find text entry immediately and explore a passage without juggling separate scrolling panels.
Feynman gap: Physical Safari/touch remains untested; independent source review, desktop/mobile browser flows and decoded export provide current evidence.

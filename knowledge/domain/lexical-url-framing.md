---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-08T11:09:59-06:00"
---
# Lexical responsive framing and URL intake

**Later2026-11-08 user correction:** the landscape3D spread below was superseded by the restored portrait-page book and layout revision3. Preserve the book as primary. The spread remains only in2D; URL-intake findings remain valid. See lexical-book-identity.md.

The tiny chart came from portrait sheets stacked in depth plus a conservative spherical camera fit. Atlas now presents landscape sheets in a responsive spread. The camera fits projected geometry, not a bounding sphere. Throughline uses responsive presentation scaling while canonical letterPosition remains stable. The2D renderer uses the same responsive presentation and tight bounds.

Saved/shared layoutRevision2 identifies the new presentation. Legacy cameras are discarded while retaining text/settings. New camera poses carry aspect; they re-fit after a substantial aspect change or any Atlas column-count change. A small3.9→3.7 aspect transition for8sheets changes4→3columns, so ratio threshold alone is insufficient. See compatibleCameraPose regression.

Use your own text → URL is prefilled with https://www.gutenberg.org/cache/epub/1661/pg1661.txt. Gutenberg response headers lacked Access-Control-Allow-Origin on2026-11-08. The exact default maps to a bundled original copy under public/texts/sherlock-holmes.txt. Source JSON records URL, retrieval time and SHA; the complete original license is retained. Other public HTTPS URLs fetch directly in the browser with no cookies/referrer. No proxy or new backend exists; sites blocking cross-site imports produce a paste/file alternative.

url-intake.js centralizes URL validation,15s timeout,2MiB declared/streamed limit, cancellation, MIME checks and one bounded retry for transient HTTP statuses. TextInputDialog aborts on unmount. Long texts are split on paragraph/word boundaries into sections no longer than20k characters. Gutenberg boilerplate is omitted from mapped passages; the complete licensed source stays available. The default book yields29 sections. Users choose/edit a preview before mapping; only that section enters the chart. Section title survives saved-view restoration. Preview source links open the original URL.

Verification:79 Node tests, manifest and deep10-page verifier pass. Fresh independent source review PASS. Browser: default Gutenberg load, section2 selection19,072chars/1,848 mapped words, edited preview, CORS-permitted direct GitHub text, blocked example.com error, phone URL UI without horizontal overflow, complete responsive3D/2D sheets, camera reset, Throughline, actual PNG decode1600×464 and native saved-view roundtrip (title/layout2/aspect retained). Fresh successful-flow console clean. The default wide Throughline projection spans about81% of the chart width; Atlas projection test requires at least75% without corner cropping.

Published source16275fae64114fb4499e4ae698f2b04f0cd6769c. Workflow42503618167 passed tests/build/Render/public fingerprint verification. Public default URL was prefilled correctly, loaded29 sections, and created Part1 with1,864 mapped words/8sheets. Live selected holmes25 occurrences; scene filled its stage; console clean. Screenshot:/private/tmp/lexical-url-and-framing-live.png.

S.D.G.: Visitors get a readable chart immediately and can bring a text URL into a bounded, editable passage.
Feynman gap: Physical Safari remains untested; arbitrary sites that deny cross-origin reads require paste/file import.

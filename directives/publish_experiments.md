---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T18:31:23-06:00"
---

# Publish browser experiments

## Goal
Keep Retro-Glitch Studio and Lexical available as anonymous, browser-local playgrounds on Zero Page Labs.

## Boundaries
Original retro-glitch-studio and lexical-viz repositories remain separate. Publication adaptations live here. Do not restore Lexical's development proxy or third-party URL relay imports. Images and text are not sent to an application server.

## Execution
For Lexical changes, edit experiments-source/lexical. Run `python3 execution/build_experiments.py --install` to install the locked dependencies, compile the app, include license notices, and update data/experiments-build.json. Commit the generated experiments/lexical output with its source. Normal site builds reject stale source/output manifests.

For Retro changes, edit experiments/retro-glitch. Effects run in a module worker. Image headers are checked before decode: PNG/JPEG, 10MB, 24MP. Longest output edge is1200px. Export the processed pixels to PNG; preserve alpha.

## Verification
Run `node --test execution/test_experiments.mjs`, `python3 -m unittest discover -s execution -p 'test_*.py'`, `python3 execution/build_site.py`, and `python3 execution/verify_site.py --deep`. Use browser-qa for sample/input/effect-or-mode/reset/back flows at desktop and375px. Confirm a downloaded PNG decodes. Verify Lexical paste and a directly accessible local text file; file selection is followed by Load file. Check the2D view.

## Publish
Push the verified source and generated output to main. Existing GitHub sync workflow runs the tests, validates the site, calls the existing Render hook, then compares the public deployment fingerprint. No new Render service is needed. Verify /experiments/, /experiments/retro-glitch/, and /experiments/lexical/ after success.

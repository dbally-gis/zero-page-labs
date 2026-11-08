---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T16:31:28.188948-06:00"
---

# Build and verify
1. Edit source HTML, `style.css`, `src/app.js`, or `data/watchfaces.json`.
2. Run `python3 execution/build_site.py`.
3. Run `python3 execution/verify_site.py`.
4. Serve `dist/` locally for desktop/mobile browser QA.
5. Push reviewed source; deploy the corresponding commit in Render.

Build uses an allowlist so knowledge, environment files, and temporary artifacts are excluded. CSS must keep `img { height: auto; }` because explicit HTML width/height attributes otherwise stretch the narrow phone screenshot vertically.

## Automatic watchface inventory
GitHub workflow `.github/workflows/sync-pebble.yml` checks hourly at minute17, on relevantmain pushes, or manualdispatch. It runs without the Mac or this chat. `execution/discover_catalog.py` reads public server-rendered developer data, resolves UTF8 text records as data, validates Daniel’s developerID, follows explicit pagination, rejects duplicates, and caps the page count. No login or Pebble write API.

`python3 execution/sync_catalog.py --refresh` acquires changed native200×228 previews with bounded retries. CompletePNG/GIF decoding requires `python3 -m pip install -r requirements-sync.txt`. An invalid source or large unexpected catalog drop fails the job; the published site remains unchanged. Unknown new face styles useOther. Observation dates alone do not cause source commits.

Cloud order: tests → discover/sync → build → `verify_site.py --deep` → commit/push updated catalog → compare public outputfingerprint → scoped Render hook pinned to the newcommit → poll public deployment.json for verified output. No-content-change runs skip Render. A failed deployment can recover on the next run even if the catalog itself is unchanged. Monthly repositoryheartbeat prevents long periods of no source activity; its metadata is excluded from the outputfingerprint.

The existing Render hook is stored only as GitHub Actions secretRENDER_DEPLOY_HOOK_URL. Localtemporary.env was removed after secret setup. Never print a hook URL or log secret-bearing requestexceptions. When retrieving a hook throughUI, capture it into a variable and hide it again before emitting the next pageobservation.

Manual run: `gh workflow run sync-pebble.yml --repo dbally-gis/zero-page-labs`. Optional `-f force_deploy=true` verifies a deployment even if output is unchanged. Inspect `gh run list --workflow sync-pebble.yml --repo dbally-gis/zero-page-labs` for failures. Scheduled GitHub jobs can be delayed; invalid provider-format changes need a parser fix, not a catalog wipe.

Gridcore companion source is vendored in gridcore/demo; original projects remain untouched. Original specification copies under gridcore/specs are verified by hashes in data/gridcore-provenance.json.

## Verified activation — 2026-11-07
Workflow410738005 is active. Initialpush run https://github.com/dbally-gis/zero-page-labs/actions/runs/42424934350 passed17tests, live discovery34Faces, deepimagevalidation, Renderhook deployment, and publiccommit/hash verification. Renderdep-dbnr5au7bikc73dakerg published6a6b86d. Manualrun https://github.com/dbally-gis/zero-page-labs/actions/runs/42425037120 passed with catalog_unchanged and deployment_unchanged; GitHEAD stayed6a6b86d. No localenv or Mac-owned schedule required.

## Learnings — 2026-11-08 Public fingerprint caching
Observed deployment.json headers: Cache-Control public,max-age=0,s-maxage=300 with a Cloudflare cache hit. An earlier release can remain visible at the old cache key while a fresh diagnostic query returns the new source_commit. A queued workflow may wait behind that earlier public-verification step. Read workflow status and compare the exact expected fingerprint; use a fresh diagnostic query to distinguish cache staleness from a failed deployment. Do not cancel another active owner’s release or treat push success as live verification.

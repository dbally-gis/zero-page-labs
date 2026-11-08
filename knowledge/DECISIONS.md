---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T16:31:28.188948-06:00"
---

# Decisions
## 2026-11-07 — Small static website
Use plain HTML/CSS/JS with a standard-library Python packaging script. A showcase with three routes does not need React or a server runtime. Render is the user-selected host. Publish only the allowlisted `dist/` output.

## 2026-11-07 — Released content
Apple’s public listing advertises six games as of this date. Use released v1 screenshots rather than local seven-game beta assets. Fifteen watchface listings are taken from round release evidence; T9 is omitted because its known reported failure remains unresolved.

## 2026-11-07 — Complete public catalog and Gridcore
Use the terminal browser-observed public developer catalog as the gallery membership contract. Include categoryFaces; exclude PickleballKeeper,VolleyKeeper,Constellation,SatelliteOverpass. Retire ClassicLCD,Triangle,Lume from the site because current public pages report Application not found. Replace hardcoded15counts with catalog-derived counts.

Daniel explicitly approved Gridcore in Labs as an experiment supporting Globe & Atlas identity. Preserve canonical specs byte-for-byte; link original master-branch repository. Host a source-adapted companion demo with synthetic-data disclosure. Keep Labs branding distinct.

## 2026-11-07 — Hourly cloud synchronization
Use deterministic GitHub Actions instead of a laptop-owned timer or recurring LLM task. Discover via the public developer page’s serverdata; keep the static website fast. Commit validated source before calling the existing Render deployment hook. Compare output hashes to skip unchanged deployments and recover failed ones. Store the hook in a GitHub Actions secret. Preserve the last successful site on discovery/acquisition/build/deploy failure.

## 2026-11-07 — Browser-native public experiments
Publish curated adaptations within the existing static Render site. Retro's Python/Streamlit runtime was ported to Canvas and a module worker, avoiding a new backend and keeping images local. Lexical's production bundle is committed with the adapted source plus a correspondence manifest, allowing Python-only Render builds. Remove URL imports instead of shipping the local /proxy or external content relays. Keep local paste/file intake, bounded inputs, original sample, self-hosted font, graphics fallback, and a Labs return route. Original workshop apps remain untouched. User explicitly authorized public launch.

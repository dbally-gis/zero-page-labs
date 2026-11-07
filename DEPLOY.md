---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-07T16:31:28.188948-06:00"
---

# Deploy Zero Page Labs
Render static site. Build: `python3 execution/build_site.py`. Publish directory: `dist`.

Validate using `python3 execution/verify_site.py`. Native dashboard connects the source repository. For a public repository connection without a Git provider, use Manual Deploy after pushing changes unless a Blueprint or integration explicitly enables automatic deployment.

Custom domain: zeropagelabs.com. Read existing DNS before edits; preserve mail and verification records. Follow the exact DNS targets reported by Render. Do not infer successful TLS from a successful build.

## Live service — 2026-11-07
- Repository: https://github.com/dbally-gis/zero-page-labs (public static website source).
- Service: https://dashboard.render.com/static/srv-dbnqdsu7bikc73d8r82g
- Live URL: https://zero-page-labs.onrender.com/
- Initial successful deployment: dep-dbnqdt67bikc73d8r8hg, commit b48dda8.
- Namecheap A `@` → `216.24.57.1`; CNAME `www` → `zero-page-labs.onrender.com`. Existing mail settings retained. Render verified both domains. Certificates issued for both domains. HTTPS site and www-to-root redirect verified.

Imagery refresh deployed2026-11-07: dep-dbnqka6417fc73efqdeg, commita31818d. Latest tagged0703 Thumbwords UI captures and official Time2 frame verified live on the custom domain.

Full catalog/Gridcore deployed2026-11-07: dep-dbnqr6m7bikc73d9rucg, commit1dd67f0. Live34Faces, original spec download hash, and Gridcore Spectral interaction verified on custom domain.

Automatic updates activated2026-11-07: GitHub workflow Sync Pebble gallery checks hourly at minute17. Commit6a6b86d deployed via Renderhook (dep-dbnr5au7bikc73dakerg), verified by public/deployment.json. Manualunchanged run skipped commit/deploy. Operational guidance:knowledge/procedural/deploy_site.md.

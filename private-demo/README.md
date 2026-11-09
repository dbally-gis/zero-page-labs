---
generated_by: "OpenAI Codex (GPT-6; exact variant not exposed)"
timestamp: "2026-11-09"
---

# Manage COME AT ME invites

Run these commands from the Zero Page Labs repository. The signing key is in the owner-only `.tmp/come-at-me-signing-key` file. Issuing an invite records the recipient label, ID, and expiration in the local `.tmp/come-at-me-invites.jsonl` ledger. Keep both files private.

```sh
node private-demo/manage-invites.mjs issue "Publisher name" 14d
node private-demo/manage-invites.mjs issue "Playtester name" 2026-11-30T17:00:00-06:00
node private-demo/manage-invites.mjs list
```

Copy the full URL from the command output. The recipient can open it immediately. The label is kept in the local ledger, and the link can be used by whoever receives it.

To revoke an invite, copy its ID from `list` and run the following command.

```sh
node private-demo/manage-invites.mjs revoke INVITE_ID
```

Copy the full comma-separated value printed by the command into `DEMO_REVOKED_IDS` in the [Render environment](https://dashboard.render.com/web/srv-dbot1hmgekts73f4h1r0/env), then save and deploy. Keep the full list so previous revocations stay in effect. Use the same local ledger for each revocation. The change takes effect when the deploy is live. An already loaded match can continue until the visitor reopens or refreshes the page.

The earlier shared invite is controlled by `DEMO_TOKEN_SHA256`. Remove that variable and deploy if the shared link should be retired. Individual links use `DEMO_SIGNING_KEY`.

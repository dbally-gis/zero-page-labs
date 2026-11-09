---
generated_by: "OpenAI Codex (GPT-6; exact variant not exposed)"
timestamp: "2026-11-09"
---

# Manage COME AT ME invites

## Browser invite manager

Once enabled, open [the private invite manager](https://come-at-me-playtest.onrender.com/admin) and sign in with the owner password. Enter a recipient label, set the expiration in your local time, and create the invite. Copy it from the confirmation or the invite list. Revoke an active invite from that same list. Access stops on the recipient’s next request. A match already loaded in their browser can continue until the page reloads.

The browser manager handles invitations created there. The existing shared link and terminal-issued links retain their current controls below. Forwarding an active link gives the new holder the same access until it expires or is revoked.

## Demo request queue

The showcase opens the public request form at `/request`. It collects a name, an email address, and an optional short note. Only the signed-in owner can read the pending queue. Choose an expiration on a request and select **Approve and create invite**. Copy the link and send it to the email shown on the request. Dismiss removes a request from the pending queue.

The same ledger write moves a request out of the queue and creates its invite. Retrying approval returns the original invite with its original expiration. The private ledger retains request details in its Git history.

### One-time deployment setup

1. Initialize `invites.json` with `[]` in a dedicated private repository. Production’s intended ledger is `dbally-gis/come-at-me-invite-state`.
2. Supply `DEMO_LEDGER_REPO` as the repository’s owner/name and `DEMO_LEDGER_TOKEN` as a fine-grained GitHub credential limited to that repository with Contents read/write. Store the token in the Render environment. Rotate it before expiration.
3. Generate a random 32-byte owner password, encode it as base64url, and keep it in the owner’s password manager. Set `DEMO_ADMIN_SHA256` to the lowercase hexadecimal SHA-256 digest of the encoded password.
4. Keep `DEMO_SIGNING_KEY` stable. The service derives separate keys for browser-issued invites and owner sessions. If using another hostname, set `DEMO_ADMIN_ORIGIN` to its HTTPS origin without a trailing slash.
5. Deploy the demo service. Verify owner sign-in, issuing two synthetic invites, revoking one, and replaying both after a restart.

The ledger stores labels, IDs, expiration timestamps, and revocation state. It never stores the signed URLs or the owner password. Browser-issued links require a matching active ledger entry. If the ledger is unavailable, those links fail closed until it recovers. The shared link and existing terminal-issued links continue using their existing checks.

## Existing terminal-issued invites

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

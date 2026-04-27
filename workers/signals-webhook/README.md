# signals-webhook

Cloudflare Worker that receives TradingView alerts and commits Weinstein signal posts to this repo at `src/content/posts/signals-YYYY-MM-DD.mdoc` on `main`.

## Secrets

Two secrets, both stored in the Worker's encrypted secret store (never in `wrangler.toml`, never in the repo):

| Name | Purpose |
| --- | --- |
| `WEBHOOK_SECRET` | Authenticates inbound TradingView calls (passed as `?secret=` query param). |
| `GITHUB_TOKEN` | Fine-grained GitHub PAT the Worker uses to commit posts via the Contents API. |

Set or rotate either with `wrangler secret put <NAME>` from this directory — the value goes in at the interactive prompt, not on the command line.

## Rotating `GITHUB_TOKEN`

The PAT expires (90 days by default). When it does, alerts stop landing as commits. To rotate:

### 1. Mint the replacement PAT

https://github.com/settings/personal-access-tokens → **Generate new token (Fine-grained)**

- **Resource owner:** `neporshiso`
- **Repository access:** *Only select repositories* → `nep-personal-website`
- **Repository permissions → Contents:** Read and write *(Metadata: Read is added automatically)*
- **Expiration:** 90 days

Copy the token — it's shown exactly once.

### 2. Push it to the Worker

From this directory:

```bash
wrangler secret put GITHUB_TOKEN
```

Paste the token at the prompt. The store overwrites atomically — the next inbound webhook uses the new value. No `wrangler deploy` needed unless `src/index.ts` also changed.

That's it. TradingView will exercise the path on the next alert; if it broke, you'll see it.

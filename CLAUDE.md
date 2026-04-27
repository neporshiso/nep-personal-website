# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a pnpm workspace (Node >= 22.12.0). All commands run from the repo root unless noted.

```bash
pnpm install            # install deps
pnpm dev                # astro dev server (Keystatic CMS at /keystatic)
pnpm build              # production build (output: dist/, deployed via Vercel adapter)
pnpm preview            # preview the built site
pnpm test               # vitest run (no tests exist yet — add under src/**/*.test.ts)
pnpm test:watch         # vitest watch
```

Conventional commits are enforced by a Husky `commit-msg` hook running `commitlint` (`@commitlint/config-conventional`). Non-conforming messages are rejected — do not bypass with `--no-verify`.

The Cloudflare Worker in `workers/signals-webhook/` is deployed independently with `wrangler deploy` from that directory; it is **not** part of the Astro build. See `workers/signals-webhook/README.md` for its operational runbook (notably token rotation).

## Architecture

### Astro + Keystatic, with content as the source of truth

The site is Astro 5 (React 19 islands, Tailwind 4 via `@tailwindcss/vite`, Markdoc for prose, Vercel adapter). Pages live under `src/pages/` — `index.astro`, plus `portfolio/`, `thoughts/`, `books/`, `podcasts/`, each with an `index.astro` and (where applicable) a `[slug].astro` for detail pages.

Content lives in `src/content/` as `.mdoc` and `.yaml` files inside collection directories (`projects`, `posts`, `podcasts`, `books`, `bio`, `social`). It is authored two ways:

1. **Keystatic admin UI** at `/keystatic` (mounted via the `@keystatic/astro` integration). Storage is **local** in dev (`NODE_ENV === 'development'`) and **GitHub** in prod — Keystatic commits directly to `neporshiso/nep-personal-website` via the GitHub API. This is configured in `keystatic.config.ts`.
2. **Programmatic commits** from the `signals-webhook` Worker, which writes `src/content/posts/signals-YYYY-MM-DD.mdoc` files when TradingView alerts fire. End-to-end loop: TradingView → Worker → `git commit` on `main` → Vercel rebuild → published post.

### The two-schema invariant

Content schemas are defined **twice** and must stay in sync:

- `keystatic.config.ts` — used by the Keystatic admin UI to render forms and validate input.
- `src/content.config.ts` — used by Astro's content collections (Zod schemas) to type-check and load content at build time.

If you change a field in one, change it in the other. Both files have a header comment noting this. A drift here surfaces as either build-time Zod errors or silently-missing fields in the CMS.

### Markdoc rendering

Markdoc is the prose format (chosen for its strict, validated syntax). Syntax highlighting is configured in `markdoc.config.mjs` using Shiki with Gruvbox themes (light/dark). When adding code blocks or custom Markdoc tags, that's the file to edit.

### Cloudflare Worker (`workers/signals-webhook/`)

A self-contained Worker — no shared code with the Astro app, its own `wrangler.toml`. Secrets (`WEBHOOK_SECRET`, `GITHUB_TOKEN`) live in the Worker's encrypted secret store; **never** in `wrangler.toml` or the repo. The repo is public, so be especially careful about any file that could accept secret values. See `workers/signals-webhook/README.md` for what each secret does and how to rotate the PAT.

## Conventions worth knowing

- The repo is **public**. Treat all committed files accordingly — no env values, no token-shaped strings, no internal hostnames. `.gitignore` already covers `.env*` and `.dev.vars`, but the same care applies to anything you add.
- The Keystatic GitHub mode means edits made through the CMS in production land as direct commits to `main`. Bot-style commits in `git log` (e.g. `signals: 2025-XX-XX`) are from the Worker, not a human.
- Vercel hosts the Astro site; the Worker runs separately on Cloudflare. They share the repo but not the runtime.

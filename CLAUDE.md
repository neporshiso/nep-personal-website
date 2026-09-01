# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a pnpm workspace (Node >= 22.12.0). All commands run from the repo root unless noted.

```bash
pnpm install            # install deps
pnpm dev                # astro dev server (Keystatic CMS at /keystatic)
pnpm build              # production build (output: dist/, deployed via Vercel adapter)
pnpm preview            # preview the built site
pnpm test               # vitest run — one suite today, add more under src/**/*.test.ts
pnpm test:watch         # vitest watch
```

### Testing the Nanban UI

`src/lib/nanban/nanban.test.ts` is currently the only test suite. Nanban's UI is a single inline
`<script>` inside `src/lib/nanban/index.html`, which is served raw (`?raw` import) rather than
bundled — so it is never typechecked and cannot be imported as a module. The suite reaches it by
reading the HTML, extracting the script, and evaluating it under jsdom with a stubbed `fetch`,
then asserting on captured request payloads.

Assert on **behavior, not source text**. An earlier version of this suite asserted that certain
strings appeared in the script; it passed while the behavior was broken and was rejected in
review. Drive the DOM and check what gets sent.

Conventional commits are enforced by a Husky `commit-msg` hook running `commitlint` (`@commitlint/config-conventional`). Non-conforming messages are rejected — do not bypass with `--no-verify`.

## Architecture

### Astro + Keystatic, with content as the source of truth

The site is Astro 5 (React 19 islands, Tailwind 4 via `@tailwindcss/vite`, Markdoc for prose, Vercel adapter). Pages live under `src/pages/` — `index.astro`, plus `portfolio/`, `thoughts/`, `books/`, `podcasts/`, each with an `index.astro` and (where applicable) a `[slug].astro` for detail pages.

Content lives in `src/content/` as `.mdoc` and `.yaml` files inside collection directories (`projects`, `posts`, `podcasts`, `books`, `bio`, `social`). It is authored through the **Keystatic admin UI** at `/keystatic` (mounted via the `@keystatic/astro` integration). Storage is **local** in dev (`NODE_ENV === 'development'`) and **GitHub** in prod — Keystatic commits directly to `neporshiso/nep-personal-website` via the GitHub API. This is configured in `keystatic.config.ts`.

### The two-schema invariant

Content schemas are defined **twice** and must stay in sync:

- `keystatic.config.ts` — used by the Keystatic admin UI to render forms and validate input.
- `src/content.config.ts` — used by Astro's content collections (Zod schemas) to type-check and load content at build time.

If you change a field in one, change it in the other. Both files have a header comment noting this. A drift here surfaces as either build-time Zod errors or silently-missing fields in the CMS.

### Markdoc rendering

Markdoc is the prose format (chosen for its strict, validated syntax). Syntax highlighting is configured in `markdoc.config.mjs` using Shiki with Gruvbox themes (light/dark). When adding code blocks or custom Markdoc tags, that's the file to edit.

## Conventions worth knowing

- The repo is **public**. Treat all committed files accordingly — no env values, no token-shaped strings, no internal hostnames. `.gitignore` already covers `.env*` and `.dev.vars`, but the same care applies to anything you add.
- The Keystatic GitHub mode means edits made through the CMS in production land as direct commits to `main`.
- Vercel hosts the Astro site.
- A Cloudflare Worker (`workers/signals-webhook/`) used to commit `src/content/posts/signals-*.mdoc` posts from TradingView alerts. It was a spike, stopped producing posts after 2026-05-22, and its code was removed on 2026-08-31 — see commit history if you need it back. The six posts it wrote are ordinary content and remain. `signals: YYYY-MM-DD` commits in `git log` are from that retired Worker, not a human.

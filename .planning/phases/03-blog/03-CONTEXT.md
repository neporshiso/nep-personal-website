# Phase 3: Blog - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete the blog experience by adding syntax highlighting (Shiki), estimated reading time, and an RSS/Atom feed. The blog listing (`/thoughts`) and detail pages (`/thoughts/[slug]`) already exist from Phase 2 — this phase adds polish and feed functionality.

**Important:** The ROADMAP references `/blog/[slug]` which is stale. The actual route is `/thoughts/[slug]` — renamed during Phase 2 smoke test per user direction.

</domain>

<decisions>
## Implementation Decisions

### Syntax highlighting
- **D-01:** Use Shiki with Gruvbox dual theme: `gruvbox-light` in light mode, `gruvbox-dark-hard` in dark mode. Code blocks switch theme with the site's dark/light toggle.
- **D-02:** Must support at minimum: JavaScript, TypeScript, and shell/bash.

### Reading time
- **D-03:** Claude's discretion on placement — detail page only is the recommendation (keeps listing clean, matches minimal aesthetic).
- **D-04:** Format: short form like "5 min read" — matches muted label style (`text-sm text-[var(--muted)]`).

### RSS feed
- **D-05:** Standard RSS/Atom feed at `/rss.xml` containing all published (non-draft) posts. Claude's discretion on Atom vs RSS 2.0 and whether to include full content or excerpts.

### Claude's Discretion
- Reading time placement (detail page only recommended, but flexible)
- RSS feed format (Atom vs RSS 2.0)
- RSS feed content (full post body vs excerpt)
- Feed title and description text
- Code block border/rounding styling within the Gruvbox theme
- Whether to calculate reading time at build time or derive from content length

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI design contract
- `.planning/phases/02-core-pages/02-UI-SPEC.md` — Typography, spacing, color contracts still apply. Code block font: `ui-monospace, 'Cascadia Code', 'Fira Code', 'Fira Mono', monospace`

### Phase 2 context (blog restructuring)
- `.planning/phases/02-core-pages/02-CONTEXT.md` — Phase 2 decisions. Blog renamed to "Thoughts", routes at `/thoughts`
- `.planning/phases/02-core-pages/02-06-SUMMARY.md` — Smoke test restructuring details (blog→thoughts, about→homepage)

### Project requirements
- `.planning/REQUIREMENTS.md` — Phase 3 covers BLOG-01 through BLOG-05
- `.planning/ROADMAP.md` — Phase 3 goal and success criteria (note: SC-1 references `/blog/[slug]` — stale, actual route is `/thoughts/[slug]`)

### Existing implementation
- `src/pages/thoughts/[slug].astro` — Blog detail page (already exists, needs reading time added)
- `src/pages/thoughts/index.astro` — Blog listing page (already exists)
- `src/components/BlogEntry.astro` — Blog list item component (may need reading time if placed on listing)
- `src/content.config.ts` — Posts collection schema
- `astro.config.mjs` — Astro config (Shiki configured here)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `thoughts/[slug].astro`: Blog detail page with title, date, prose body, back links — needs reading time added
- `thoughts/index.astro`: Blog listing with draft filter and newest-first sort — already complete
- `BlogEntry.astro`: List item component with title, date, excerpt — may need reading time prop
- `BaseLayout.astro`: All pages use this — no changes needed for this phase

### Established Patterns
- Content loading: `getCollection('posts')` with Markdoc `.mdoc` files
- Rendering: standalone `render(post)` from `astro:content`
- Styling: Tailwind v4 utilities with CSS custom properties
- Dark mode: `.dark` class toggle — Shiki dual theme must respond to this

### Integration Points
- `astro.config.mjs`: Shiki configuration goes in `markdown.shikiConfig` (Astro has built-in Shiki support)
- RSS feed: Astro's `@astrojs/rss` package provides `rss()` helper for generating feeds
- Reading time: Calculate from post body content length at build time in `[slug].astro`

</code_context>

<specifics>
## Specific Ideas

- Gruvbox dual theme for code blocks — user explicitly chose this to match the site's warm neutral aesthetic
- Keep the listing page (`/thoughts`) clean — reading time on detail pages is preferred over cluttering the listing
- ROADMAP SC-1 needs updating from `/blog/[slug]` to `/thoughts/[slug]`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-blog*
*Context gathered: 2026-03-22*

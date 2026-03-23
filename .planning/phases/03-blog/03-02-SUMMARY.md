---
phase: 03-blog
plan: 02
subsystem: api
tags: [rss, astrojs-rss, feed, blog]

# Dependency graph
requires:
  - phase: 02-core-pages
    provides: "Blog posts collection at getCollection('posts') with draft/publishedDate schema; /thoughts/[slug] routes"
provides:
  - "RSS 2.0 feed at /rss.xml containing all published blog posts with title, date, excerpt, and /thoughts/ links"
  - "site URL configured in astro.config.mjs (required for absolute URLs in feed)"
affects: [04-deploy]

# Tech tracking
tech-stack:
  added: ["@astrojs/rss"]
  patterns: ["Astro API endpoint (GET export) for XML feed generation"]

key-files:
  created:
    - src/pages/rss.xml.ts
    - markdoc.config.mjs
  modified:
    - astro.config.mjs
    - package.json
    - package-lock.json

key-decisions:
  - "RSS 2.0 format chosen over Atom — simpler and has broader RSS reader support"
  - "Excerpt-only in feed items (not full content) — keeps feed lightweight and encourages clickthrough"
  - "Feed title: nep's thoughts — matches the /thoughts page branding"
  - "site: https://neporshiso.com added to astro.config.mjs"
  - "gruvbox-light-hard used as light theme in markdoc.config.mjs — plain gruvbox-light does not exist in Shiki bundle"

patterns-established:
  - "RSS endpoint pattern: src/pages/rss.xml.ts exports GET(context: APIContext), uses context.site for absolute URLs"
  - "Feed items use post.id for slug (Astro v5 Content Layer API)"

requirements-completed: [BLOG-05]

# Metrics
duration: 2min
completed: 2026-03-22
---

# Phase 3 Plan 02: RSS Feed Summary

**RSS 2.0 feed at /rss.xml using @astrojs/rss, serving all published posts with excerpt-only items and /thoughts/ deep links**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-23T01:18:51Z
- **Completed:** 2026-03-23T01:20:22Z
- **Tasks:** 1
- **Files modified:** 5

## Accomplishments

- RSS 2.0 feed endpoint at /rss.xml deployed and verified in production build
- All 3 published blog posts appear in feed with correct titles, dates, excerpts, and /thoughts/ links
- Draft posts are filtered from feed
- Site URL configured in Astro config enabling absolute URL generation

## Task Commits

Each task was committed atomically:

1. **Task 1: Install @astrojs/rss and create RSS feed endpoint** - `dc219e3` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/pages/rss.xml.ts` — RSS 2.0 feed endpoint, filters drafts, sorts newest-first
- `astro.config.mjs` — Added `site: 'https://neporshiso.com'` (required by @astrojs/rss)
- `markdoc.config.mjs` — Shiki code highlighting config (created by 03-01 agent, fixed theme name)
- `package.json` — Added @astrojs/rss dependency
- `package-lock.json` — Lockfile updated

## Decisions Made

- RSS 2.0 over Atom — simpler format with broader reader compatibility
- Excerpt-only feed items — lightweight feed, encourages site visits
- Feed title matches site page title ("nep's thoughts")

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed invalid Shiki theme name in markdoc.config.mjs**
- **Found during:** Task 1 (build verification)
- **Issue:** Parallel agent (03-01) created markdoc.config.mjs with `light: 'gruvbox-light'` — this theme name does not exist in the Shiki bundle. Build failed with `ShikiError: Theme gruvbox-light is not included in this bundle.`
- **Fix:** Changed to `light: 'gruvbox-light-hard'` — the closest available Gruvbox light variant in Shiki
- **Files modified:** markdoc.config.mjs
- **Verification:** `npm run build` completed with exit code 0 after fix
- **Committed in:** dc219e3 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 Rule 3 blocking)
**Impact on plan:** Fix was essential to unblock build verification. No scope creep. The theme name correction maintains the intended Gruvbox aesthetic.

## Issues Encountered

- `npm install @astrojs/rss` failed without `--legacy-peer-deps` due to @keystatic/astro peer dependency mismatch (known pre-existing issue from Phase 1)

## Self-Check

Files created/exist:
- [x] `src/pages/rss.xml.ts` — exists
- [x] `dist/rss.xml` — generated in build, valid XML with 3 post items
- [x] `astro.config.mjs` — site URL added

Commits exist:
- [x] `dc219e3` — feat(03-02): add RSS feed at /rss.xml with all published posts

## Self-Check: PASSED

## Next Phase Readiness

- Blog phase (03) complete — syntax highlighting (03-01) and RSS feed (03-02) delivered
- Ready for Phase 04: Deploy — site URL is now configured in astro.config.mjs which helps with deployment

---
*Phase: 03-blog*
*Completed: 2026-03-22*

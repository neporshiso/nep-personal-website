---
phase: 01-foundation
plan: 02
subsystem: cms
tags: [keystatic, astro, content-collections, zod, markdoc, dark-mode]

# Dependency graph
requires:
  - phase: 01-foundation-01
    provides: Astro 6 + Tailwind v4 + Keystatic integration + BaseLayout + build pipeline
provides:
  - keystatic.config.ts with all five content type schemas (projects, posts, podcasts, books, bio singleton)
  - src/content.config.ts with matching Zod schemas and glob loaders
  - Sample content entries for all five collections passing Zod validation at build time
  - src/pages/about.astro rendering bio singleton via getCollection('bio') + render() from astro:content
  - Build pipeline proven: npm run build exits 0 with content entries loaded
affects:
  - 02-* (all Phase 2 pages depend on these content schemas for getCollection() calls)
  - All phases (content model is the contract for all page data)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Keystatic singleton treated as single-entry glob collection for getCollection() compatibility
    - Astro v5 Content Layer API uses standalone render() import, not entry.render() method
    - Dual schema pattern — Keystatic config drives admin UI, Astro content.config.ts drives Zod validation

key-files:
  created:
    - keystatic.config.ts
    - src/content.config.ts
    - src/content/projects/sample-project.mdoc
    - src/content/posts/sample-post.mdoc
    - src/content/podcasts/sample-podcast.mdoc
    - src/content/books/sample-book.mdoc
    - src/content/bio/index.mdoc
    - src/pages/about.astro
  modified: []

key-decisions:
  - "Astro v5 Content Layer API: render() is a standalone import from astro:content, not entry.render() — fixed at build time"
  - "Bio singleton loaded via getCollection('bio') with glob loader pattern (treats single file as one-entry collection)"
  - "Sample project omits media field (null/optional) — Zod schema uses .nullable() to accept both null and undefined"

patterns-established:
  - "Pattern 4: Dual Schema — Keystatic config + Astro content.config.ts kept in sync; comment in each file references the other"
  - "Pattern 5: Bio singleton as glob collection — bio registered as collection in content.config.ts so getCollection() works"

requirements-completed: [FOUN-01, FOUN-02, FOUN-03]

# Metrics
duration: 6min
completed: 2026-03-21
---

# Phase 1 Plan 02: Content Schemas and CMS Pipeline Summary

**Keystatic CMS schemas + Astro Zod content collections for five content types, sample entries, and about page rendering bio via getCollection()**

## Performance

- **Duration:** ~6 minutes
- **Started:** 2026-03-21T02:53:20Z
- **Completed:** 2026-03-21T02:59:00Z
- **Tasks:** 2 of 3 complete (Task 3 is human-verify checkpoint — pending approval)
- **Files modified:** 8

## Accomplishments

- keystatic.config.ts with all five content types: projects, posts, podcasts, books collections + bio singleton, with full field definitions matching the content schema spec
- src/content.config.ts with matching Zod schemas using Astro v5 glob loaders — validates content at build time
- Five sample .mdoc entries covering all collections — build exits 0, Zod validation accepts all entries
- src/pages/about.astro reads bio via getCollection('bio') + standalone render() import; /about page builds successfully and renders bio text

## Task Commits

Each task was committed atomically:

1. **Task 1: Define Keystatic config and Astro content schemas for all five content types** - `b093dd9` (feat)
2. **Task 2: Create sample content entries and about page with bio via getCollection** - `08e4d40` (feat)

**Task 3:** checkpoint:human-verify — pending user approval

## Files Created/Modified

- `keystatic.config.ts` - Keystatic CMS schema for all 5 content types (4 collections + bio singleton) with storage: { kind: 'local' }
- `src/content.config.ts` - Astro Zod schemas matching Keystatic fields; glob loaders for all 5 collections; exports all collections
- `src/content/projects/sample-project.mdoc` - Sample project with title, techStack, links, year
- `src/content/posts/sample-post.mdoc` - Sample post with title, tags, draft, excerpt, publishedDate
- `src/content/podcasts/sample-podcast.mdoc` - Sample podcast with name, link, category
- `src/content/books/sample-book.mdoc` - Sample book with title, author, status: read, note
- `src/content/bio/index.mdoc` - Bio singleton with placeholder text
- `src/pages/about.astro` - About page using getCollection('bio') + render() for Markdoc rendering

## Decisions Made

- **Astro v5 render() API:** The plan specified `bio.render()` as an instance method, but Astro v5's new Content Layer API exposes `render()` as a standalone import from `astro:content`. Fixed auto-on build failure.
- **Bio as glob collection:** Keystatic bio is a singleton (single file), but Astro loads it via `getCollection('bio')` treating it as a one-entry collection with glob loader `'**/*.mdoc'`. This pattern works and produces the expected entry with Markdoc content.
- **media field nullable:** Sample project omits the optional media field. Zod schema uses `.nullable()` to accept `null` from YAML `~` syntax alongside `undefined` for missing fields.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed bio.render() — Astro v5 Content Layer API uses standalone render() import**
- **Found during:** Task 2 (build verification)
- **Issue:** `bio.render is not a function` — Astro v5's new Content Layer API no longer attaches `render()` as an instance method on collection entries; it's now a named export from `astro:content`
- **Fix:** Changed `import { getCollection } from 'astro:content'` to `import { getCollection, render } from 'astro:content'`; changed `await bio.render()` to `await render(bio)`
- **Files modified:** `src/pages/about.astro`
- **Verification:** Build exits 0; `/about` page generated at `/about/index.html`
- **Committed in:** 08e4d40 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in plan's API assumption for Astro v5)
**Impact on plan:** Required fix to make the about page render. The plan anticipated this possibility and documented the fallback approach. The standalone render() import is the correct v5 pattern.

## Issues Encountered

- Plan's sample code used `bio.render()` (Astro v4 API); Astro v5 Content Layer API changed this to a standalone `render(entry)` function. Detected at build time, fixed inline.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All five content schemas are defined and in sync between Keystatic and Astro configs
- Sample entries pass Zod validation at build time — CMS pipeline proven end-to-end
- Keystatic admin at http://localhost:4321/keystatic shows all five content types in dev mode
- About page renders bio content — Phase 2 can build all remaining content pages using the same getCollection() + render() pattern
- Pending: User must verify Task 3 (dark mode, responsive layout, Keystatic admin, about page) before plan is fully complete

## Self-Check: PASSED

All 8 created files verified on disk. Both task commits (b093dd9, 08e4d40) confirmed in git log.

---
*Phase: 01-foundation*
*Completed: 2026-03-21 (Task 3 checkpoint pending)*

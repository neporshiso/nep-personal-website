---
phase: 02-core-pages
plan: 04
subsystem: ui
tags: [astro, tailwind, content-collections, podcasts, books]

# Dependency graph
requires:
  - phase: 02-core-pages/02-01
    provides: BaseLayout with siteTitle prop, Nav contextual title pattern, design tokens
provides:
  - PodcastCard component (horizontal, full-anchor, 64x64 cover)
  - BookCard component (vertical, portrait cover, status badge)
  - /podcasts listing page with empty state
  - /books listing page with empty state
affects: [02-core-pages, deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - getCollection() CMS data fetch pattern applied to podcasts and books collections
    - Full-anchor card pattern (entire card is <a>) for external links
    - Responsive grid using grid-cols-N with sm/md breakpoints

key-files:
  created:
    - src/components/PodcastCard.astro
    - src/components/BookCard.astro
    - src/pages/podcasts/index.astro
    - src/pages/books/index.astro
  modified: []

key-decisions:
  - "PodcastCard is a full-anchor <a> element opening in new tab (target=_blank rel=noopener noreferrer)"
  - "BookCard status badge: reading uses #d79921 in light mode (WCAG AA for normal text), var(--accent) in dark mode; read/want-to-read use muted"
  - "want-to-read slug renders as 'want to read' for human readability"

patterns-established:
  - "Listing pages: getCollection + conditional empty state with heading + body copy"
  - "Cover image fallback: placeholder div with bg-[var(--border)] — no broken img elements"
  - "sr-only h1 on all listing pages matching Navigation Contract siteTitle"

requirements-completed: [CONT-05, CONT-06]

# Metrics
duration: 8min
completed: 2026-03-22
---

# Phase 2 Plan 04: Podcasts and Books Vertical Slices Summary

**PodcastCard (horizontal, full-anchor) and BookCard (vertical, accent reading badge) components with CMS-backed /podcasts and /books listing pages**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-22T16:41:21Z
- **Completed:** 2026-03-22T16:41:29Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- PodcastCard: horizontal layout with 64x64 cover image, entire card is an anchor to external podcast URL opening in new tab, placeholder div when no cover
- BookCard: vertical portrait card with aspect-[2/3] cover, status badge using accent color for "reading" and muted for "read"/"want-to-read", want-to-read slug humanized
- /podcasts page: single-column grid from getCollection('podcasts'), empty state, contextual siteTitle
- /books page: responsive 2/3/4 column grid from getCollection('books'), empty state, contextual siteTitle
- Both pages include sr-only h1 for accessibility, build passes at 0 errors

## Task Commits

Each task was committed atomically:

1. **Task 1: PodcastCard component and podcasts listing page** - `604a807` (feat)
2. **Task 2: BookCard component and books listing page** - `cf9c559` (feat)

## Files Created/Modified

- `src/components/PodcastCard.astro` - Horizontal podcast card; full-card anchor; 64x64 cover or placeholder; name/category text
- `src/components/BookCard.astro` - Vertical book card; aspect-[2/3] cover or placeholder; title, author, status badge with accent/muted logic
- `src/pages/podcasts/index.astro` - /podcasts listing page; getCollection('podcasts'); grid-cols-1; empty state
- `src/pages/books/index.astro` - /books listing page; getCollection('books'); grid-cols-2 sm:grid-cols-3 md:grid-cols-4; empty state

## Decisions Made

- PodcastCard is a full-card `<a>` anchor (per UI-SPEC) — no inner link element needed
- "reading" badge uses `text-[#d79921]` in light mode (WCAG AA for normal-size text) with `dark:text-[var(--accent)]` per Phase 1 decisions
- "want-to-read" slug humanized to "want to read" for display

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- /podcasts and /books pages are ready — content can be added via Keystatic CMS
- Both pages match navigation contract: siteTitle passes to Nav for contextual display
- Remaining Phase 2 plans: homepage blog listing, portfolio page, about page update, contact section

---
*Phase: 02-core-pages*
*Completed: 2026-03-22*

---
phase: 02-core-pages
plan: 02
subsystem: ui
tags: [astro, tailwind, blog, contact, social, phosphor-icons]

requires:
  - phase: 02-01
    provides: BaseLayout with siteTitle prop, social collection schema, astro-icon install, Nav active link detection

provides:
  - BlogEntry component — renders blog post as linked block with title/date/excerpt
  - ContactSection component — "Get in touch" CTA with social icon links from singleton
  - Homepage (index.astro) — blog listing with draft filter, newest-first sort, empty state
  - About page (about.astro) — bio CMS content with social links row, correct siteTitle

affects:
  - 02-03 (portfolio page — same layout patterns)
  - 02-04 (podcasts page)
  - 02-05 (books page)
  - Phase 3 (blog detail pages rely on BlogEntry slug pattern)

tech-stack:
  added: []
  patterns:
    - "BlogEntry renders full-width anchor wrapping title/date/excerpt — entire row is clickable"
    - "ContactSection fetches social singleton internally (no props) — encapsulates data access"
    - "Draft filter: filter((p) => !p.data.draft) before sort — keeps drafts out of listing"
    - "Astro v5 Content Layer API uses post.id for slug (not post.slug)"
    - "sr-only h1 on listing pages for a11y — nav contextual siteTitle is visible page identifier"

key-files:
  created:
    - src/components/BlogEntry.astro
    - src/components/ContactSection.astro
  modified:
    - src/pages/index.astro
    - src/pages/about.astro

key-decisions:
  - "Homepage uses post.id not post.slug — required for Astro v5 Content Layer API"
  - "ContactSection encapsulates its own social data fetch — clean separation, no prop drilling"
  - "about.astro visible font-bold h1 removed — replaced with sr-only h1 per Navigation Contract"

patterns-established:
  - "Pattern: listing pages use sr-only h1 + contextual siteTitle prop in nav"
  - "Pattern: social data accessed via getCollection('social')[0] singleton pattern"
  - "Pattern: component-internal data fetch for self-contained components (ContactSection)"

requirements-completed: [CONT-01, CONT-04]

duration: 6min
completed: 2026-03-22
---

# Phase 02 Plan 02: Homepage and About Page Summary

**BlogEntry + ContactSection components wired into homepage blog listing and updated about page with social links, sr-only h1, and correct siteTitle prop — all font-bold eliminated**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-03-22T20:41:04Z
- **Completed:** 2026-03-22T20:47:00Z
- **Tasks:** 2
- **Files modified:** 4 (2 created, 2 updated)

## Accomplishments

- BlogEntry component renders blog post title, formatted date (e.g. "March 15, 2026"), and 2-line clamped excerpt as full-row clickable anchor — hover:opacity-80
- ContactSection fetches social singleton internally, renders "Get in touch" heading + mailto CTA with accent color + GitHub/LinkedIn/Email Phosphor icon links — conditional rendering guards empty values
- Homepage (index.astro) rewrites from placeholder to full blog listing: getCollection('posts'), draft filter, newest-first sort, empty state copy per Copywriting Contract
- About page corrected: visible font-bold h1 removed, sr-only h1 added, siteTitle="about nep" passed, social links row added with Phosphor icons

## Task Commits

Each task was committed atomically:

1. **Task 1: Create BlogEntry and ContactSection components** - `f4446f2` (feat)
2. **Task 2: Rewrite homepage as blog listing and update about page** - `9d5f097` (feat)

## Files Created/Modified

- `src/components/BlogEntry.astro` — Blog list item: linked block with title/date/excerpt, hover opacity, first:pt-0 first-entry treatment
- `src/components/ContactSection.astro` — Contact CTA section: fetches social singleton, renders mailto + icon links for GitHub/LinkedIn/Email
- `src/pages/index.astro` — Homepage: blog listing with draft filter, sort, BlogEntry iteration, empty state, ContactSection footer
- `src/pages/about.astro` — About page: siteTitle prop, sr-only h1, bio prose, social links row with icons

## Decisions Made

- Used `post.id` (not `post.slug`) for blog entry slugs — required for Astro v5 Content Layer API (established in plan context from Phase 1 learnings)
- ContactSection self-fetches its social data — avoids prop drilling from parent pages, keeps component self-contained and reusable on any page
- Removed visible `<h1>` from about.astro entirely — Navigation Contract specifies no visible page headings; sr-only h1 satisfies accessibility requirement

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — build passed on first attempt for both tasks.

## Known Stubs

None — all data is wired to live CMS collections. The about page bio displays real content from `src/content/bio/` and social links render from `src/content/social/`.

## Next Phase Readiness

- Homepage and about page complete — primary traffic pages delivered
- BlogEntry slug links to `/blog/${slug}` — these 404 until Phase 3 blog detail pages are built (expected, not a defect)
- ContactSection is reusable — can be added to other pages without modification
- Pattern established for social data access and icon usage — carry forward to portfolio/podcasts/books pages

---
*Phase: 02-core-pages*
*Completed: 2026-03-22*

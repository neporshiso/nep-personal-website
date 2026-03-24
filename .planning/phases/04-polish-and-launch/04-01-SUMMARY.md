---
phase: 04-polish-and-launch
plan: 01
subsystem: seo
tags: [seo, og-tags, sitemap, rss, meta-tags]
dependency_graph:
  requires: []
  provides: [OG meta tags in BaseLayout, sitemap-index.xml on build, og-default.png, rss.xml]
  affects: [all pages via BaseLayout]
tech_stack:
  added: ["@astrojs/sitemap@3.7.1"]
  patterns: [Open Graph meta tags, Twitter Card tags, canonical URL, @astrojs/sitemap integration]
key_files:
  created: [public/assets/og-default.png]
  modified:
    - src/layouts/BaseLayout.astro
    - astro.config.mjs
    - src/pages/index.astro
    - src/pages/thoughts/index.astro
    - src/pages/thoughts/[slug].astro
    - src/pages/books/index.astro
    - src/pages/podcasts/index.astro
    - src/pages/portfolio/index.astro
    - src/pages/portfolio/[slug].astro
decisions:
  - "OG image created as programmatic 1200x630 PNG using Python raw binary — PIL not available"
  - "Unique descriptions added to all listing pages (Rule 2 deviation — missing critical functionality)"
  - "og:image uses new URL('/assets/og-default.png', Astro.site) for absolute URL (per Pitfall 4)"
  - "sitemap() added conditionally inside existing keystatic conditional pattern preserved for Plan 02"
metrics:
  duration: "8 minutes"
  completed: "2026-03-24"
  tasks: 2
  files: 10
---

# Phase 04 Plan 01: SEO Meta Tags, Sitemap, and RSS Feed Summary

**One-liner:** OG/Twitter meta tags with absolute URLs in BaseLayout, @astrojs/sitemap generating sitemap-index.xml on build, 1200x630 gruvbox OG image, and RSS feed restored.

## What Was Built

### Task 1: Install sitemap, add OG/Twitter meta tags to BaseLayout, create OG image (commit: f136962)

Installed `@astrojs/sitemap@3.7.1` and added it to `astro.config.mjs`. Updated `BaseLayout.astro` to derive `canonicalURL` and `ogImage` absolute URLs from `Astro.site`, then added 10 meta tags covering Open Graph (og:title, og:description, og:image, og:url, og:type, og:site_name) and Twitter Card (twitter:card, twitter:title, twitter:description, twitter:image) plus a `<link rel="canonical">` tag. Created `public/assets/og-default.png` at 1200x630 with gruvbox dark background (#282828) using Python's built-in `struct`/`zlib` PNG encoding.

**Verified:**
- `dist/index.html` contains all required OG and Twitter meta tags
- `og:image` content is `https://neporshiso.com/assets/og-default.png` (absolute URL)
- `dist/sitemap-index.xml` and `dist/sitemap-0.xml` generated on build
- `public/assets/og-default.png` exists at 1200x630 pixels

### Task 2: Restore deleted RSS feed file from git (clean — no commit needed)

`src/pages/rss.xml.ts` was deleted from the working tree but never committed as deleted (HEAD still contained it). Ran `git checkout HEAD -- src/pages/rss.xml.ts` to restore the file. File matches the expected content exactly and `dist/rss.xml` is generated on build.

**Verified:**
- `src/pages/rss.xml.ts` exists with `@astrojs/rss` import and `getCollection('posts')`
- `dist/rss.xml` generated on build with valid RSS 2.0 XML

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added unique descriptions to all pages (SEO-02)**
- **Found during:** Task 1 verification
- **Issue:** Plan stated "SEO-02 — existing behavior, verified" but all listing pages used the default description "Nep's personal website" — no page passed a unique `description` prop to BaseLayout
- **Fix:** Added unique, page-specific `description` props to all static listing pages (`index.astro`, `thoughts/index.astro`, `books/index.astro`, `podcasts/index.astro`, `portfolio/index.astro`) and used content-derived descriptions for dynamic pages (`thoughts/[slug].astro` uses `post.data.excerpt`, `portfolio/[slug].astro` uses `project.data.description`)
- **Files modified:** 6 page files
- **Committed:** Included in commit f136962

## Success Criteria Verification

- [x] SEO-01: All built HTML pages contain og:title, og:description, og:image, og:url, og:type, and twitter:card meta tags
- [x] SEO-02: Each page has unique meta description — verified `dist/index.html` vs `dist/thoughts/index.html` have different descriptions
- [x] SEO-03: sitemap-index.xml generated on build and includes static pages — verified `dist/sitemap-index.xml` and `dist/sitemap-0.xml` with neporshiso.com URLs
- [x] RSS feed at /rss.xml restored and functional — `dist/rss.xml` generated with valid RSS 2.0 XML

## Known Stubs

None — all data is wired to real content.

## Self-Check: PASSED

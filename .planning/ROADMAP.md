# Roadmap: Nep Personal Website

## Overview

Rebuild a personal developer site from a static HTML/CSS/JS codebase into a modern Astro site where all content is managed through a CMS. The work proceeds in four phases driven by hard dependencies: the CMS and content schemas must exist before any content page can be built; core pages ship before the blog adds net-new capability; SEO completeness and production deployment are most efficiently done last when all templates are stable.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Astro scaffold, Tailwind v4, CMS setup, content schemas, BaseLayout with dark mode
- [ ] **Phase 2: Core Pages** - About/bio, portfolio, podcasts, books, contact links, analytics — UI design step precedes implementation
- [ ] **Phase 3: Blog** - Blog listing, post pages, MDX rendering, syntax highlighting, RSS feed
- [ ] **Phase 4: Polish and Launch** - SEO completeness, performance audit, production CMS workflow, deployment verified

## Phase Details

### Phase 1: Foundation
**Goal**: A working local dev environment exists with the full stack configured, content schemas defined, and the admin UI functional — so every subsequent phase can write content and build pages without revisiting infrastructure decisions.
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` starts a local site with no errors and the BaseLayout renders correctly
  2. The dark/light mode toggle works and the correct theme loads on first visit without a flash of wrong theme
  3. Color contrast is acceptable in both light and dark modes (verified by eye and contrast checker before any content is entered)
  4. The CMS admin UI is accessible at `/keystatic` locally and at least one sample content entry is readable by an Astro page via `getCollection()`
  5. All content type schemas (Project, Post, Bio, Podcast, Book) are defined with Zod validation and reject malformed entries at build time
**Plans**: TBD

### Phase 2: Core Pages
**Goal**: The site has all core content pages — About/bio, portfolio, podcasts, books, and contact links — all CMS-managed, visually designed and approved before implementation, so the old site can be replaced at the end of this phase.

> **UI Design step:** Before implementation plans begin, run `/gsd:ui-phase` to produce a visual design for the site. Implementation plans in this phase execute after design is approved.

**Depends on**: Phase 1
**Requirements**: CONT-01, CONT-02, CONT-04, CONT-05, CONT-06, ANLY-01
**Success Criteria** (what must be TRUE):
  1. Editing the bio in the CMS and triggering a build updates the About section on the live site with no code changes
  2. Adding a portfolio project through the CMS produces a project detail page with full write-up and any embedded S3 video loads correctly
  3. Podcasts and Books pages display CMS-managed entries with names, descriptions, images, and links
  4. Social and contact links are editable in the CMS and render correctly on the site
  5. Analytics events appear in the analytics dashboard when pages are visited (UA property is replaced and collecting data)
  6. The site renders correctly on a 375px-wide mobile screen with a working responsive nav
**Plans**: TBD

### Phase 3: Blog
**Goal**: A fully functional blog exists where posts are written and published through the CMS, render with proper MDX formatting and syntax highlighting, and are discoverable via an RSS feed — completing the primary net-new capability vs. the current site.
**Depends on**: Phase 2
**Requirements**: BLOG-01, BLOG-02, BLOG-03, BLOG-04, BLOG-05
**Success Criteria** (what must be TRUE):
  1. The blog listing page shows all published posts with title, date, and estimated reading time
  2. A blog post page renders MDX content including headings, inline code, and fenced code blocks with syntax highlighting
  3. Code blocks display token-level syntax highlighting (Shiki) for at least JavaScript, TypeScript, and shell
  4. Visiting `/rss.xml` returns a valid Atom/RSS feed containing all published posts
**Plans**: TBD

### Phase 4: Polish and Launch
**Goal**: All pages have complete SEO metadata and meet the LCP performance target, the production CMS workflow is verified (GitHub OAuth triggers a Vercel redeploy on content save), and the new site is live on the real domain replacing the old one.
**Depends on**: Phase 3
**Requirements**: FOUN-04, SEO-01, SEO-02, SEO-03, DEPL-01, DEPL-02
**Success Criteria** (what must be TRUE):
  1. Sharing any page URL on LinkedIn or Slack produces a rich link preview with the correct title, description, and image (Open Graph tags verified)
  2. `sitemap.xml` is accessible at `/sitemap-index.xml` and includes all pages and blog post URLs
  3. All pages score LCP under 2.5 seconds on a simulated mobile connection (measured in Chrome DevTools or Lighthouse)
  4. Saving a content change in the production CMS admin triggers a new Vercel deployment and the change appears on the live site within a few minutes
  5. The live site is accessible at the production domain with no broken links or missing assets from the old site's anchor-based URL structure
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/TBD | Not started | - |
| 2. Core Pages | 0/TBD | Not started | - |
| 3. Blog | 0/TBD | Not started | - |
| 4. Polish and Launch | 0/TBD | Not started | - |

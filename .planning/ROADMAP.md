# Roadmap: Nep Personal Website

## Overview

Rebuild a personal developer site from a static HTML/CSS/JS codebase into a modern Astro site where all content is managed through a CMS. The work proceeds in four phases driven by hard dependencies: the CMS and content schemas must exist before any content page can be built; core pages ship before the blog adds net-new capability; SEO completeness and production deployment are most efficiently done last when all templates are stable.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Astro scaffold, Tailwind v4, CMS setup, content schemas, BaseLayout with dark mode (completed 2026-03-21)
- [ ] **Phase 2: Core Pages** - Homepage blog listing (3 migrated posts), about/bio, portfolio with detail pages, podcasts, books, contact, analytics — UI-SPEC approved
- [x] **Phase 3: Blog** - Syntax highlighting (Shiki/Gruvbox), reading time, RSS feed — completing the blog experience (completed 2026-03-23)
- [x] **Phase 3.1: Real Content Population** (INSERTED) - Replace fake blog posts, enrich podcasts with cover art, populate books (completed 2026-03-23)
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
**Plans**: 2 plans
Plans:
- [x] 01-01-PLAN.md — Scaffold Astro + Tailwind v4 + Keystatic, BaseLayout with dark mode toggle, Nav, Footer
- [x] 01-02-PLAN.md — Content schemas (all 5 types), sample entries, about page, end-to-end CMS verification

### Phase 2: Core Pages
**Goal**: The site has all core content pages — homepage blog listing, about/bio, portfolio (with detail pages), podcasts, books, and contact — all CMS-managed, with 3 blog posts migrated from blog.neporshiso.com, so the old site can be replaced at the end of this phase.

> **UI-SPEC approved** (2026-03-22). Design decisions: contextual site name nav (no page h1s), homepage = bio, blog listing at /thoughts, project detail = full page route, single "Get in touch" CTA. Restructured during smoke test: blog→thoughts, about→homepage.

**Depends on**: Phase 1
**Requirements**: CONT-01, CONT-02, CONT-04, CONT-05, CONT-06, ANLY-01
**Success Criteria** (what must be TRUE):
  1. The `/thoughts` page shows all published blog posts (title, date, excerpt) sorted newest-first, including 3 posts migrated from blog.neporshiso.com, with individual posts at `/thoughts/[slug]`
  2. Editing the bio in the CMS and triggering a build updates the homepage bio section with no code changes
  3. Adding a portfolio project through the CMS produces a project detail page (`/portfolio/[slug]`) with full write-up and embedded local video loads correctly
  4. Podcasts and Books pages display CMS-managed entries with names, descriptions, and links (cover images added when real assets are available)
  5. The nav site name updates contextually per page ("nep's home on the web", "nep's thoughts", "nep's portfolio", etc.)
  6. Analytics events appear in the analytics dashboard when pages are visited (UA property is replaced and collecting data)
  7. The site renders correctly on a 375px-wide mobile screen with a working responsive nav
**Plans**: 6 plans
Plans:
- [x] 02-01-PLAN.md — Infrastructure: packages, config, siteTitle prop, Analytics, social singleton
- [x] 02-02-PLAN.md — Homepage (blog listing + contact) and about page update
- [x] 02-03-PLAN.md — Portfolio listing and project detail pages
- [x] 02-04-PLAN.md — Podcasts and books listing pages
- [x] 02-05-PLAN.md — Real content population (blog posts, bio, books, podcasts, social)
- [x] 02-06-PLAN.md — Visual and functional smoke test (checkpoint) — approved with restructuring

### Phase 3: Blog
**Goal**: Blog posts have syntax-highlighted code blocks (Shiki with Gruvbox dual themes), estimated reading time, and an RSS feed — completing the blog experience started in Phase 2 (which added the listing and detail pages).
**Depends on**: Phase 2
**Requirements**: BLOG-01, BLOG-02, BLOG-03, BLOG-04, BLOG-05
**Success Criteria** (what must be TRUE):
  1. Clicking a blog entry on `/thoughts` navigates to `/thoughts/[slug]` with full rendered content
  2. A blog post page renders Markdoc content including headings, inline code, and fenced code blocks with syntax highlighting
  3. Code blocks display token-level syntax highlighting (Shiki) with Gruvbox light/dark-hard themes matching the site's dark mode toggle
  4. Each blog post page displays estimated reading time (e.g. "4 min read") next to the publication date
  5. Visiting `/rss.xml` returns a valid RSS feed containing all published (non-draft) posts with links to `/thoughts/[slug]`
**Plans**: 2 plans
Plans:
- [x] 03-01-PLAN.md — Shiki syntax highlighting (Gruvbox dual themes) + reading time on detail pages
- [x] 03-02-PLAN.md — RSS feed at /rss.xml

### Phase 03.1: Real Content Population (INSERTED)

**Goal:** Replace fabricated blog posts with real content from blog.neporshiso.com, enrich podcasts with real entries and cover art (downloaded locally via iTunes Search API lookup), and populate books with real entries and cover images.
**Depends on:** Phase 3
**Success Criteria** (what must be TRUE):
  1. The 3 fabricated blog posts are replaced with the 3 real posts from blog.neporshiso.com (Data Structures & Algorithms, Small Group Projects, Welcome to the Blog)
  2. Podcasts page shows real podcast entries (<10) with cover art images loaded from `/public/assets/podcasts/`
  3. Books page shows real book entries with cover images loaded from `/public/assets/books/`
  4. All content renders correctly and builds pass
**Plans:** 2/2 plans complete
Plans:
- [x] 03.1-01-PLAN.md — Replace 3 fabricated blog posts with real posts from blog.neporshiso.com
- [x] 03.1-02-PLAN.md — Populate podcasts and books with real entries and cover images

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
**Plans**: 3 plans
Plans:
- [x] 04-01-PLAN.md — SEO meta tags (OG, Twitter card, canonical), sitemap integration, RSS feed restore
- [x] 04-02-PLAN.md — Image CLS prevention (BookCard/PodcastCard Astro Image conversion)
- [ ] 04-03-PLAN.md — Vercel adapter, Keystatic GitHub mode, deployment verification checkpoint

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 3.1 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete   | 2026-03-21 |
| 2. Core Pages | 5/6 | In Progress|  |
| 3. Blog | 2/2 | Complete   | 2026-03-23 |
| 3.1. Real Content Population | 2/2 | Complete | 2026-03-23 |
| 4. Polish and Launch | 0/3 | Not started | - |

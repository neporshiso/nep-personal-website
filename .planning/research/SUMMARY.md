# Project Research Summary

**Project:** Nep Personal Website
**Domain:** Personal developer portfolio with CMS and blog
**Researched:** 2026-03-20
**Confidence:** HIGH (stack and architecture), MEDIUM (CMS selection has one active-maintenance caveat)

## Executive Summary

This is a content-first static site rebuild — a personal developer portfolio with a blog and a CMS so content can be updated without touching code. The expert consensus for this problem space is unambiguous: Astro with static output, a git-based CMS (Keystatic or Decap), Tailwind CSS v4, and deployment to Vercel. This combination ships zero-JS-by-default HTML to a CDN, requires no server, no database, no runtime dependencies, and produces consistently fast Core Web Vitals without special optimization effort. The current site uses outdated patterns (Bootstrap from CDN, broken Google Universal Analytics) and has no blog; the rebuild corrects all of this.

The primary risk is not technical — it is execution. "The rebuild that never ships" is the most commonly documented pitfall for this type of project, and the current site's existence removes any forcing function. The mitigation is a hard MVP boundary: reach feature parity with the current site, replace the live site, and only then add new capabilities. The blog is the main net-new capability and should be built in a dedicated phase after feature parity is achieved. Scope creep — especially via the CMS making it easy to add content types — is the second-biggest risk and must be actively resisted.

The recommended architecture requires one deliberate decision up front: content modeling. Content types must be modeled as entities (Project, WorkExperience, Post) rather than as page sections (HeroBlock, AboutContent). Getting this right before entering content eliminates the most painful kind of rework. Everything else in this build follows well-documented patterns with high-quality official documentation.

---

## Key Findings

### Recommended Stack

Astro 6 (static output mode) is the clear framework choice for a content-first personal site. It ships zero JavaScript by default and produces pure HTML/CSS, which means fast Core Web Vitals with no special optimization work. The comparison to Next.js 15 is not close for this use case: Next.js adds ~85KB of JS overhead and is optimized for application patterns (auth, real-time data, complex APIs) that don't exist here. Tailwind CSS v4 handles styling — the new v4 setup uses `@tailwindcss/vite` (not the deprecated `@astrojs/tailwind` integration) and configures via CSS rather than a JS config file.

For the CMS, Keystatic is recommended: it is git-based, free, open-source, and has first-class Astro documentation. Content lives as Markdown/YAML in the repo, versioned alongside code, with no external SaaS dependency. The fallback if Keystatic proves poorly maintained is Sanity, which has an excellent official Astro integration and a permanent free tier. Vercel is the deployment target as the official Astro hosting partner with free analytics included.

**Core technologies:**
- **Astro 6** (static output): site framework — ships zero JS by default, built for content sites, official Vercel partner
- **TypeScript 5** (bundled): type safety — zero-config with Astro; Content Collections enforce schemas via Zod at build time
- **Tailwind CSS v4** (via `@tailwindcss/vite`): styling — v4 is CSS-configured, 100x faster incremental builds, ships exactly what is used
- **Keystatic 0.5.x**: CMS — git-based, free, no external database, browser admin UI, commits back to repo on save
- **MDX** (via `@astrojs/mdx`): blog content format — allows component embeds in Markdown for code demos and callouts
- **Astro `<Image />`**: image optimization — zero-config WebP conversion, prevents CLS, works with existing S3 URLs
- **Vercel Analytics or Plausible**: analytics — replaces dead UA property; lightweight, GDPR-safe

### Expected Features

The research identifies a clear three-phase feature sequence based on dependency chains. The CMS is the prerequisite for everything.

**Must have (table stakes):**
- About / bio section (CMS-managed) — first thing every visitor looks for
- Portfolio / project showcase with write-ups — primary signal of capability; bare project names answer nothing
- Skills display (CMS-managed) — hiring managers scan for tech stack fit
- Resume / CV page (CMS-managed) — standard expectation
- Dark / light mode toggle — now expected on developer sites; technically-minded audiences notice its absence
- Responsive / mobile-first design — 57-59% of web traffic is mobile
- Open Graph meta tags — controls link unfurls on LinkedIn, Twitter/X, Slack
- Page titles and meta descriptions — basic SEO; minimal effort
- Accessible color contrast (WCAG, both modes) — WCAG compliance legally required in EU since June 2025
- Working analytics — existing UA property is dead and collects no data

**Should have (differentiators):**
- Blog with developer-focused writing — signals thought leadership; builds long-term SEO equity
- Syntax highlighting in blog posts — expected by technical readers; embarrassing to omit on a developer's blog
- Estimated reading time on blog posts — small quality signal; signals professionalism
- RSS / Atom feed — signals blog permanence; ~30% of tech audiences use feed readers
- Sitemap.xml — helps Google index blog posts; minimal effort
- Rich project case studies — problem, decisions, trade-offs, outcomes; 78% of decision-makers trust specifics over general claims

**Defer to v2+:**
- Technology tag / filtering (add when portfolio reaches 6+ projects)
- Site search (add when blog reaches 20+ posts)
- Newsletter integration (add when blog has established readership)
- Comments system (out of scope per PROJECT.md; link to Twitter/LinkedIn instead)
- Contact form (spam risk; email link is sufficient)

### Architecture Approach

The architecture is a static-first JAMstack pattern: the CMS commits Markdown/YAML files to git, Astro reads those files at build time via Content Collections, generates fully static HTML, and deploys to Vercel's CDN. No server runs in production. Build times for this content volume are under 5 seconds. The entire pattern has official documentation from both Astro and the CMS tooling.

**Major components:**
1. **Content Layer** (`src/content.config.ts`) — defines Zod schemas for all content types; validates at build time; provides type-safe `getCollection()` API to pages
2. **BaseLayout** (`src/layouts/BaseLayout.astro`) — single injection point for analytics script, inline theme-init script (prevents flash of wrong theme), shared head metadata, nav, footer
3. **CMS Admin UI** — Keystatic (or Decap) admin at `/keystatic` (local) and via GitHub OAuth (production); commits content changes back to repo, triggering a Vercel redeploy
4. **Pages** (`src/pages/`) — route definitions; call `getCollection()`, assemble components, render static HTML
5. **Components** (`src/components/`) — `ProjectCard`, `BlogPostCard`, `ResumeEntry`, `SkillList`, `ThemeToggle`, `Nav` — receive content as props from pages

Key patterns to follow:
- Content Collections with Zod schemas for every content type — enforces schema at build time
- `getStaticPaths()` generates all blog and portfolio routes from CMS content
- `BaseLayout` as the single analytics and theme init point — nothing duplicated across pages
- Keep `content.config.ts` and the CMS config in sync — they are a dual source of truth and must change together

### Critical Pitfalls

1. **The rebuild that never ships** — Define a strict MVP scope (parity with current site) before writing code. Set a hard deadline to replace the live site. Do not add features that aren't on the current site until after launch. This is the most commonly documented failure mode for this project type.

2. **CMS overkill / wrong CMS selection** — Avoid API-driven SaaS CMS (Contentful, Sanity as first choice) for a solo site with no team. Prefer git-based: content stays in repo, no external billing dependency, easy migration. Verify Keystatic is actively maintained before committing; Sanity is the documented fallback.

3. **Layout-driven content modeling** — Model entities (Project, Post, WorkExperience), not page sections (HeroBlock, AboutPageContent). Locking content types to a specific layout means changing the layout requires a schema migration. Fix this before entering any content.

4. **Flash of wrong theme on page load** — In Astro (SSG), inject an inline `<script is:inline>` in `<head>` before any content that reads `localStorage` and sets the theme class synchronously. This must happen before the browser paints. Retrofitting after the fact touches every layout component.

5. **S3 asset dependency breaks on new domain** — The current site hosts videos and images on AWS S3. The new domain will have different CORS origins. Audit all S3 assets before starting the rebuild. Configure `remotePatterns` in Astro for S3 URLs. Test video embeds against real S3 URLs during the portfolio phase, not at deploy time.

---

## Implications for Roadmap

Based on the combined research, four phases are recommended. The ordering is driven by hard dependencies: the CMS and content model must exist before any content page can be built; static pages (parity) must ship before the blog adds new capabilities; polish and SEO are most efficiently done last when all page templates are stable.

### Phase 1: Foundation — Project Setup and CMS Infrastructure

**Rationale:** Everything depends on this. Content Collections schemas, the design token system, and the BaseLayout are prerequisites for every other component. Wrong decisions here (CMS choice, content model, design tokens) are the most expensive to reverse. This phase also freezes the content type list, which directly prevents scope creep pitfalls.

**Delivers:** Working local dev environment, Astro scaffold, Tailwind v4 configured, content schemas defined and validated, Keystatic admin functional in local dev, BaseLayout with theme init script (no flash of wrong theme), seed content files for all collections, design token system (type scale, spacing, color tokens for both light/dark)

**Addresses:** Dark mode infrastructure, design token system (prevents "minimal drifting into visual debt"), content modeling decisions

**Avoids:** Flash of wrong theme, layout-driven content model, scope creep via premature CMS expansion, CDN dependency for core styles

**Research flag:** No additional research needed — official Astro + Tailwind v4 docs cover this completely. Verify Keystatic npm publish recency before committing; Sanity is the swap-in fallback.

---

### Phase 2: Feature Parity — Rebuild All Current Site Sections

**Rationale:** The current site has About, Skills, Portfolio, and Resume sections. This phase rebuilds all of them as CMS-managed pages, reaching the point where the new site can replace the live site. Nothing net-new until this is done. Hard rule: the current site should be replaceable at the end of this phase.

**Delivers:** Home page (About + Skills + Portfolio summary), standalone Portfolio page with rich project write-ups, Resume / CV page, mobile-responsive nav, dark/light mode toggle wired to ThemeToggle component, Open Graph meta and page titles on all pages, analytics (Vercel Analytics or Plausible, replacing dead UA), CORS-verified S3 video/image embeds

**Addresses:** All table-stakes features; mobile responsiveness; SEO basics; working analytics from day one; S3 asset compatibility

**Avoids:** "Rebuild that never ships" — this phase ends with a deployable site. UA analytics dead-copy bug. S3 CORS failures at launch.

**Research flag:** No additional research needed — all patterns are standard Astro Content Collections usage.

---

### Phase 3: Blog — Primary Net-New Capability

**Rationale:** The blog is the only substantive new feature vs. the current site. It depends on the CMS infrastructure from Phase 1 and the live deployment from Phase 2. Building blog after parity prevents the blog from blocking launch.

**Delivers:** Blog post listing page, individual blog post pages with MDX rendering, syntax highlighting (Shiki, included in Astro), estimated reading time, per-post Open Graph meta tags, RSS / Atom feed auto-generated from collection

**Addresses:** Differentiator features — thought leadership signal, long-term SEO equity, technical audience expectations (syntax highlighting, RSS)

**Avoids:** Building blog content types before portfolio parity is reached (scope creep warning from PITFALLS.md)

**Research flag:** No additional research needed — Astro has first-class MDX support and Shiki is bundled. RSS generation from Content Collections is well-documented.

---

### Phase 4: Polish, SEO, and Production CMS

**Rationale:** Final quality pass when all page templates are stable — most efficient moment to add sitemap, tune meta descriptions, and configure the production CMS workflow. Retrofitting these across changing templates wastes effort.

**Delivers:** `sitemap.xml` auto-generated, meta descriptions on all pages and posts, production Keystatic config (GitHub OAuth mode), Vercel deploy verified with real webhook-triggered rebuild, URL redirect config for any changed anchor structure, analytics verification against production GA4/Vercel real-time view before cutover, accessibility color contrast audit (both modes)

**Addresses:** SEO completeness; production CMS workflow; launch checklist items; WCAG compliance

**Avoids:** Analytics not verified before launch (Pitfall 10); broken internal links from URL structure change (Pitfall 9); "minimal aesthetic drifting into visual debt"

**Research flag:** No additional research needed — sitemap and redirects are standard framework config.

---

### Phase Ordering Rationale

- Phase 1 before everything: content schemas and design tokens are global dependencies; wrong choices here cost the most to reverse
- Phase 2 before Phase 3: the blog must not block the live deployment; the "rebuild that never ships" pitfall is most likely to manifest if net-new features are built before parity
- Phase 4 last: sitemap and meta descriptions are most efficiently authored once all templates are stable; production CMS config is only needed at deploy time
- No phase for "extras": tag filtering, search, newsletter, and comments are explicitly deferred — they belong in a post-launch backlog, not the roadmap

### Research Flags

Phases with standard, well-documented patterns (no need for `/gsd:research-phase`):
- **Phase 1:** Official Astro + Tailwind v4 docs are authoritative and current
- **Phase 2:** Standard Astro Content Collections patterns; no novel integrations
- **Phase 3:** Astro MDX, Shiki (bundled), RSS — all first-party or first-class integrations
- **Phase 4:** Sitemap (`@astrojs/sitemap`), Vercel redirects — documented config

One caveat requiring verification before Phase 1 begins:
- **Keystatic maintenance status:** Last npm publish was ~6 months ago as of research date. Confirm activity at [github.com/Thinkmill/keystatic](https://github.com/Thinkmill/keystatic) before scaffolding. If maintenance has stalled, substitute Sanity (Astro official integration, permanent free tier confirmed). This is a 30-second check, not a research phase.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Astro, Tailwind v4, Vercel all verified via official docs and official partnership announcements. Keystatic is MEDIUM — git-based approach is sound, but maintenance status needs spot-check before commit. Sanity fallback is HIGH confidence. |
| Features | HIGH | Multiple independent sources converge on the same table stakes. Priority ordering is internally consistent and cross-validated against ARCHITECTURE.md dependency chain. |
| Architecture | HIGH | Based entirely on official Astro documentation (Content Collections, project structure, CMS guides). Patterns are current as of Astro 5/6. Note: ARCHITECTURE.md references "Decap CMS" as the CMS name in flow diagrams, but the STACK.md recommendation is Keystatic — the architecture pattern is identical for any git-based CMS; the component structure and data flow are the same regardless of which git-based CMS is chosen. |
| Pitfalls | HIGH | Multiple independent sources converge on the same failure modes. "Rebuild that never ships" is documented in developer community writing as a well-established pattern, not a speculative risk. |

**Overall confidence: HIGH**

### Gaps to Address

- **Keystatic maintenance status:** Verify before committing to it in Phase 1. The architecture supports a direct swap to Sanity if needed. Decision should be made before CMS schema work begins, not after.

- **Existing content inventory:** The current site's portfolio projects and S3 assets should be audited before Phase 2 begins. The number of projects affects whether tag filtering belongs in the launch scope (it does if 6+ projects exist today). S3 asset URLs need to be catalogued to configure `remotePatterns` correctly.

- **URL structure change impact:** The current site uses in-page anchor links (`#portfolio`, `#about`). The new site introduces actual routes (`/blog`, `/portfolio`). Before launch, determine if any external sites (LinkedIn profile, resume links) point to specific anchors, and configure redirects accordingly. Low urgency but must not be forgotten.

---

## Sources

### Primary (HIGH confidence)
- [Astro 5.0 Release](https://astro.build/blog/astro-5/) — framework capabilities and Content Layer API
- [Astro Upgrade to v6 Docs](https://docs.astro.build/en/guides/upgrade-to/v6/) — current stable version
- [Astro Content Collections docs](https://docs.astro.build/en/guides/content-collections/) — collection definitions, Zod schemas, getStaticPaths
- [Astro CMS guide](https://docs.astro.build/en/guides/cms/) — CMS integration patterns
- [Astro + Keystatic Official Docs](https://docs.astro.build/en/guides/cms/keystatic/) — CMS setup
- [Astro project structure docs](https://docs.astro.build/en/basics/project-structure/) — directory layout
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4) — v4 setup and `@tailwindcss/vite`
- [Vercel: Official Astro Hosting Partner](https://astro.build/blog/vercel-official-hosting-partner/) — deployment
- [Core Web Vitals 2025 — Google Search Central](https://developers.google.com/search/docs/appearance/core-web-vitals) — performance thresholds
- [How to handle dark mode — Astro Tips](https://astro-tips.dev/recipes/dark-mode/) — inline script pattern
- [How to Migrate a Basic Website to Google Analytics 4 — Analytics Mania](https://www.analyticsmania.com/post/migrate-a-basic-website-to-google-analytics-4/) — UA sunset confirmation

### Secondary (MEDIUM confidence)
- [Astro + Tailwind v4 Setup Guide — tailkits.com](https://tailkits.com/blog/astro-tailwind-setup/) — setup steps
- [Astro 2025 Year in Review](https://astro.build/blog/year-in-review-2025/) — framework trajectory
- [Astro vs Next.js 2026 Comparison — pagepro.co](https://pagepro.co/blog/astro-nextjs/) — framework selection rationale
- [Best Personal Website Examples for Developers (2026) — curious.page](https://curious.page/blog/best-personal-website-examples-developers) — feature expectations
- [Don't waste your time on a portfolio website — jkettmann.com](https://jkettmann.com/dont-waste-your-time-on-a-portfolio-website/) — scope and pitfall validation
- [Color Contrast Accessibility: Complete WCAG 2025 Guide — allaccessible.org](https://www.allaccessible.org/blog/color-contrast-accessibility-wcag-guide-2025) — WCAG compliance timing
- [Why RSS Feeds Are Still a Power Move for Blogs in 2025 — kenmorico.com](https://kenmorico.com/blog/rss-feeds-for-blogs) — RSS audience size
- [Astro + Decap in 2026 (community) — dev.to](https://dev.to/migsarnavarro/astro-decap-in-2026-3mj3) — git-based CMS pattern validation

### Tertiary (LOW confidence — needs validation)
- Keystatic npm publish recency — verify at [github.com/Thinkmill/keystatic](https://github.com/Thinkmill/keystatic) before Phase 1

---
*Research completed: 2026-03-20*
*Ready for roadmap: yes*

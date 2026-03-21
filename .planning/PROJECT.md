# Nep Personal Website

## What This Is

A personal developer website rebuilt from scratch with a modern stack, replacing the current static HTML/CSS/JS site. Clean, minimal, developer-aesthetic design with all content managed through a CMS — no code changes needed to update portfolio, blog, resume, or bio.

## Core Value

All site content is editable through a CMS so the site stays current without touching code.

## Requirements

### Validated

- ✓ About/bio section — existing
- ✓ Skills display — existing
- ✓ Resume/CV section — existing
- ✓ Portfolio project showcases — existing
- ✓ Responsive mobile navigation — existing
- ✓ Analytics tracking — existing

### Active

- [ ] CMS-managed portfolio projects
- [ ] CMS-managed resume/work experience
- [ ] CMS-managed skills
- [ ] Blog with CMS-managed posts
- [ ] Deploy to Vercel or Netlify
- [ ] Feature parity with current site before going live

### Validated in Phase 1: Foundation

- ✓ Rebuild with modern framework — Astro 6 + Tailwind v4 + Keystatic CMS
- ✓ CMS-managed about/bio content — Bio singleton with getCollection pipeline verified
- ✓ Minimal developer aesthetic — Gruvbox warm neutral palette, system fonts, balanced density
- ✓ Dark/light mode toggle — System preference detection, localStorage persistence, no FOUC
- ✓ Responsive design (mobile-first) — Hamburger nav at 375px, max-w-3xl content

### Out of Scope

- Real-time features or interactive apps — this is a content site
- User authentication or accounts — public-facing only
- Comments system — keep it simple for v1
- E-commerce or payments — not relevant
- Custom animations/transitions — minimal aesthetic, not flashy

## Context

- Current site is static HTML/CSS/JS with Bulma, jQuery, and CDN dependencies
- Assets (images, videos, resume PDF) currently hosted on AWS S3
- Google Analytics (UA-146861978-1) currently in use
- Site has 4 portfolio project cards with embedded video
- User is familiar with both Vercel and Netlify for hosting
- This is a full replacement — old site goes away when new one is ready

## Constraints

- **Design**: Minimal developer aesthetic — clean, content-first, no visual clutter
- **Complexity**: Lean codebase with minimal dependencies — simpler is better
- **CMS**: Must support editing all content types (bio, portfolio, resume, blog) without code changes
- **Parity**: New site must cover all current site sections before replacing old one

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full rebuild vs incremental | User wants modern stack + simpler codebase; incremental would carry legacy debt | Full rebuild — Astro 6 |
| CMS approach | File-based CMS with git storage, local admin UI | Keystatic (verified active, last published 2026-02-25) |
| Framework choice | Astro 6 — lightweight, content-focused, excellent Keystatic integration | Astro 6.0.8 + Tailwind v4 |
| Hosting platform | Vercel or Netlify — user familiar with both, no strong preference | Vercel (decided during project setup) |

---
*Last updated: 2026-03-21 after Phase 1 completion*

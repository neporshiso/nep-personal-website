# Requirements: Nep Personal Website

**Defined:** 2026-03-20
**Core Value:** All site content is editable through a CMS so the site stays current without touching code

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUN-01**: Site uses responsive mobile-first layout
- [x] **FOUN-02**: User can toggle between dark and light mode; system preference detected on first visit
- [x] **FOUN-03**: Color contrast meets WCAG AA in both light and dark modes
- [x] **FOUN-04**: All pages achieve LCP < 2.5s

### Content

- [x] **CONT-01**: User can edit about/bio content through CMS without code changes
- [x] **CONT-02**: User can add/edit portfolio projects through CMS with rich write-ups
- [x] **CONT-04**: Social and contact links are CMS-managed
- [x] **CONT-05**: User can add/edit favorite podcasts through CMS (name, description, link, image)
- [x] **CONT-06**: User can add/edit books through CMS with reading status (reading, read, want to read)

### Blog

- [x] **BLOG-01**: Blog listing page shows all published posts
- [x] **BLOG-02**: Blog detail page renders MDX content with full formatting
- [x] **BLOG-03**: Code blocks have syntax highlighting (Shiki)
- [x] **BLOG-04**: Each post displays estimated reading time
- [x] **BLOG-05**: RSS/Atom feed auto-generated from blog posts

### SEO

- [x] **SEO-01**: All pages have Open Graph meta tags for rich link previews
- [x] **SEO-02**: All pages and posts have unique meta descriptions
- [x] **SEO-03**: Sitemap.xml auto-generated and updated on build

### Analytics

- [x] **ANLY-01**: Working analytics replaces dead UA property (Vercel Analytics or Plausible)

### Deployment

- [ ] **DEPL-01**: Site deploys to Vercel with automatic rebuilds on content changes
- [ ] **DEPL-02**: CMS works in production mode (GitHub OAuth, commits trigger redeploy)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Content Enhancements

- **ENH-01**: Skills display section (CMS-managed)
- **ENH-02**: Technology tag filtering on portfolio projects (useful at 6+ projects)
- **ENH-03**: Site-wide search (useful at 20+ blog posts)
- **CONT-03**: Resume / work experience section (CMS-managed) — deferred from v1

### Engagement

- **ENG-01**: Newsletter / email capture integration
- **ENG-02**: Comments system on blog posts

## Out of Scope

| Feature | Reason |
|---------|--------|
| Custom animations / 3D effects | Minimal aesthetic; signals over-engineering to hiring managers |
| User accounts / authentication | No use case on a public content site; CMS handles auth internally |
| Contact form | Spam risk without CAPTCHA; email link is simpler and sufficient |
| Multiple language / i18n | No indication of need; significant complexity multiplier |
| Social share buttons | Visual noise; Open Graph tags handle sharing without buttons |
| Real-time features | This is a content site, not an application |
| Mobile app | Web-first; no mobile app use case |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Complete |
| FOUN-02 | Phase 1 | Complete |
| FOUN-03 | Phase 1 | Complete |
| FOUN-04 | Phase 4 | Complete |
| CONT-01 | Phase 2 | Complete |
| CONT-02 | Phase 2 | Complete |
| CONT-04 | Phase 2 | Complete |
| CONT-05 | Phase 2 | Complete |
| CONT-06 | Phase 2 | Complete |
| BLOG-01 | Phase 3 | Complete |
| BLOG-02 | Phase 3 | Complete |
| BLOG-03 | Phase 3 | Complete |
| BLOG-04 | Phase 3 | Complete |
| BLOG-05 | Phase 3 | Complete |
| SEO-01 | Phase 4 | Complete |
| SEO-02 | Phase 4 | Complete |
| SEO-03 | Phase 4 | Complete |
| ANLY-01 | Phase 2 | Complete |
| DEPL-01 | Phase 4 | Pending |
| DEPL-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-20*
*Last updated: 2026-03-20 after roadmap revision*

# Phase 4: Polish and Launch - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

SEO completeness (OG tags, sitemap), performance optimization (Astro Image component for cover art), production CMS workflow (Keystatic GitHub mode), and deployment to Vercel — making the site live on neporshiso.com.

</domain>

<decisions>
## Implementation Decisions

### SEO & Open Graph
- **D-01:** Add a single generic OG image (`/public/assets/og-default.png`) used site-wide. No per-page OG images.
- **D-02:** Each page gets `og:title` and `og:description` sourced from existing BaseLayout `title` and `description` props. Add `og:image`, `og:type`, `og:url`, and Twitter card meta tags to BaseLayout `<head>`.
- **D-03:** Install `@astrojs/sitemap` integration for automatic `sitemap.xml` generation. `site` is already set to `https://neporshiso.com` in `astro.config.mjs`.
- **D-04:** No JSON-LD structured data — unnecessary for a personal site.

### Production CMS — Keystatic GitHub Mode
- **D-05:** Configure Keystatic in GitHub mode so the CMS is accessible at `neporshiso.com/keystatic` in production. This requires: a GitHub OAuth app, the `@keystatic/core/api` route handler, and updating `keystatic.config.ts` with `storage: { kind: 'github', repo: '<owner>/<repo>' }`.
- **D-06:** Keystatic must remain functional in local mode for development (current behavior). GitHub mode is for production only.

### Old Site Transition
- **D-07:** Clean cutover — no redirects needed. The old site uses hash-based routes (`#portfolio`, `#about`) which don't generate server requests. Just deploy the new site.
- **D-08:** No external URLs need preserving beyond the blog, which now lives at new paths (`/thoughts/...`). The old blog was on a separate subdomain (`blog.neporshiso.com`) so no collision.

### Performance & Image Optimization
- **D-09:** Convert BookCard and PodcastCard cover images to use Astro's `<Image>` component for automatic WebP/AVIF generation and responsive `srcset`.
- **D-10:** Add explicit `width` and `height` attributes to cover images to prevent Cumulative Layout Shift (CLS).
- **D-11:** Keep existing `loading="lazy"` behavior — Astro `<Image>` supports this natively.
- **D-12:** Target Lighthouse score 90+ on all pages.

### Deployment
- **D-13:** Deploy to Vercel. Install `@astrojs/vercel` adapter. Vercel Analytics is already integrated (`@vercel/analytics`).
- **D-14:** The `site` field in `astro.config.mjs` is already set to `https://neporshiso.com`.

### Claude's Discretion
- OG image design (dimensions, colors, typography — should match site brand)
- Exact Vercel project configuration
- Whether to use `output: 'hybrid'` or `output: 'server'` for Keystatic API routes (hybrid preferred — static by default, server only for CMS API)
- Image dimension values for BookCard/PodcastCard covers
- Any additional `<head>` meta tags (canonical URL, theme-color, etc.)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project requirements
- `.planning/REQUIREMENTS.md` — Phase 4 covers SEO-01 (OG tags), SEO-02 (sitemap), PERF-01 (LCP < 2.5s), DEPLOY-01 (Vercel deployment), CMS-01 (Keystatic in production)
- `.planning/ROADMAP.md` — Phase 4 goal, success criteria, dependency chain
- `.planning/PROJECT.md` — Core value (CMS-managed content), constraints, key decisions

### Prior phase decisions (carried forward)
- `.planning/phases/01-foundation/01-CONTEXT.md` — Color palette, dark mode, content schemas, base layout. All active.
- `.planning/phases/02-core-pages/02-CONTEXT.md` — Media asset decisions (D-08 through D-11): all assets local in `/public/assets/`, Astro `<Image>` approved for optimization, native HTML5 `<video>`. UI-SPEC contract for component styles.

### Existing codebase (built in Phases 1-3.1)
- `src/layouts/BaseLayout.astro` — Base layout with `<title>`, `<meta description>`, Vercel Analytics. OG tags go here.
- `src/components/BookCard.astro` — Currently uses plain `<img>`, needs `<Image>` conversion
- `src/components/PodcastCard.astro` — Currently uses plain `<img>`, needs `<Image>` conversion
- `astro.config.mjs` — Current integrations: react, markdoc, icon, keystatic (dev only). Needs: sitemap, vercel adapter.
- `keystatic.config.ts` — Current config uses local storage mode. Needs GitHub mode for production.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BaseLayout.astro` already accepts `title` and `description` props — OG tags can be derived from these with zero API changes
- `@vercel/analytics` already installed and integrated — no new analytics work needed
- `astro.config.mjs` already has `site: 'https://neporshiso.com'` — sitemap will auto-generate correct URLs

### Established Patterns
- Keystatic conditionally loaded: `...(isProduction ? [] : [keystatic()])` — this pattern needs updating for GitHub mode (Keystatic must load in production too, but with different storage config)
- Cover images stored at `/public/assets/books/*.jpg` and `/public/assets/podcasts/*.jpg` — known paths for `<Image>` conversion
- Components use plain `<img>` with `loading="lazy"` — straightforward swap to Astro `<Image>`

### Integration Points
- `BaseLayout.astro` `<head>` — where OG meta tags and any new `<link>` tags go
- `astro.config.mjs` integrations array — where sitemap and Vercel adapter are added
- `keystatic.config.ts` — storage mode switch based on environment

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-polish-and-launch*
*Context gathered: 2026-03-24*

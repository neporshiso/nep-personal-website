# Technology Stack

**Project:** Nep Personal Website
**Researched:** 2026-03-20
**Mode:** Ecosystem — "What's the standard 2025/2026 stack for a modern personal developer website with CMS?"

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro | 6.x (stable, ~6.0.6 as of research) | Site framework | Ships zero JS by default, built for content sites, 40% faster load + 90% less JS vs Next.js for static pages. Content Layer API gives type-safe access to any CMS source. First-class Vercel/Netlify deploy support. |
| TypeScript | 5.x (bundled with Astro) | Type safety | Astro ships TypeScript out of the box with zero config. Content collections enforce frontmatter schemas via Zod at build time. |

**Why not Next.js:** Next.js is a full-stack app framework optimized for SaaS/e-commerce/dashboards. A personal website has no auth, no real-time data, no complex APIs. Next.js adds ~85KB of JS overhead and requires server compute. Astro outputs static HTML; the whole site deploys as files on a CDN edge.

**Why not SvelteKit or Remix:** Both are valid frameworks but are optimized for interactivity, not content-first static sites. Astro's Island Architecture means you can still add interactive components (dark mode toggle, contact form) without shipping a full client-side framework.

---

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.x (stable since Jan 2025) | Utility-first CSS | v4 dropped the JS config file — pure CSS configuration with `@import "tailwindcss"`. Incremental builds are 100x faster. Dark mode via `dark:` variant. Ships exactly what you use — zero dead CSS in production. |

**Important:** Do NOT use `@astrojs/tailwind` integration — it is deprecated for Tailwind v4. The correct setup is the official `@tailwindcss/vite` Vite plugin, installed via `npx astro add tailwind` in Astro 5.2+. This is the officially documented path from both Tailwind and Astro.

**Dark mode implementation:** Add `darkMode: 'selector'` (or use CSS-based dark class). Store preference in `localStorage`, apply on `<html>` element. Must re-apply on Astro view transitions via the `astro:after-swap` event listener.

**Why not vanilla CSS or CSS Modules:** Tailwind gives design constraint tokens (spacing, type scale, colors) without a design system build. For a minimal aesthetic the constraint is an advantage — it prevents one-off sizes and color drift.

---

### CMS

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Keystatic | 0.5.x (latest ~0.5.48) | All content editing | Git-based CMS: content lives as Markdown/YAML/JSON files in the repo. No external database, no monthly SaaS cost, no vendor lock-in. Provides a browser-based admin UI at `/keystatic` (local dev) or via GitHub OAuth (production). Free and open source (Thinkmill). |

**CMS decision rationale — why Keystatic over alternatives:**

| Option | Verdict | Reason |
|--------|---------|--------|
| Keystatic | **Recommended** | Files in git, zero cost, first-class Astro support, local + GitHub modes |
| Sanity | Skip for now | Excellent CMS, but external Content Lake (their servers). Free tier is generous but introduces a cloud dependency. Overkill for a solo personal site. Better choice if you later need real-time preview or team editing. |
| Decap CMS (formerly Netlify CMS) | Do not use | Officially abandoned by Netlify. No active maintainer adding features. UI feels dated. |
| Contentful / Prismic / Hygraph | Do not use | Paid SaaS for a personal site is unnecessary overhead. Pricing changes can break the budget. |
| Payload CMS | Do not use | Requires a Node.js server and database. Too heavy for a content site. |

**How Keystatic works with this project:**

- Content (posts, portfolio items, resume entries, bio) stored as `.md` / `.yaml` files in `src/content/`
- Keystatic provides a schema-defined admin UI to edit those files
- In local dev: edit via UI at `http://localhost:4321/keystatic`
- In production: Keystatic reads from GitHub via OAuth, commits changes back to the repo, which triggers a Vercel/Netlify deploy
- Astro's Content Collections reads the same files — no API calls, no runtime database queries

**Caveat (LOW confidence):** Keystatic's latest version on npm was last published ~6 months ago as of research date. Verify active maintenance at [github.com/Thinkmill/keystatic](https://github.com/Thinkmill/keystatic) before committing. If maintenance has stalled, Sanity is the fallback — it has an excellent Astro integration and a permanent free tier for personal projects.

---

### Content Format

| Technology | Purpose | Why |
|------------|---------|-----|
| MDX (via `@astrojs/mdx`) | Blog posts | Allows embedding Astro/React components in Markdown. Useful for code demos, callouts. Astro's Content Collections support `.mdx` natively. |
| YAML / JSON (via Keystatic) | Structured data (portfolio, resume, skills, bio) | Non-prose content (arrays of projects, skill lists, timeline entries) fits structured data better than Markdown prose. Keystatic handles editing UI for both. |

---

### Image Handling

| Technology | Purpose | Why |
|------------|---------|-----|
| Astro built-in `<Image />` | Image optimization | Zero-config. Converts to WebP, infers dimensions (prevents CLS), lazy loads. Ships Sharp in the build. On Vercel, can delegate to Vercel's Image Optimization service instead, reducing deploy size. |

Current images/videos on AWS S3 can remain there — Astro's `<Image />` component works with external URLs. No migration required in v1.

---

### Analytics

| Technology | Purpose | Why |
|------------|---------|-----|
| Plausible (self-hosted) OR Vercel Analytics | Page views / traffic | Current site uses Google Analytics UA (Universal Analytics) — this property type was sunset by Google in 2023. It no longer collects data. Must replace. Plausible is privacy-first, lightweight script (~1KB), and GDPR compliant by default. Vercel Analytics is free on the Hobby tier and built into the platform dashboard if deploying to Vercel. |

**Google Analytics 4 is an option** if the user wants to keep the GA ecosystem (dashboards, goals). GA4 is still the industry standard. However, for a personal site with minimal traffic measurement needs, Plausible or Vercel Analytics are simpler.

---

### Deployment

| Platform | Recommendation | Notes |
|----------|---------------|-------|
| Vercel | **Preferred** | Official Astro hosting partner. Vercel's image optimization pairs with Astro. Zero-config Astro deploy — connect repo, done. Free Hobby tier covers personal sites. Analytics dashboard included free. |
| Netlify | Valid alternative | Netlify also deploys Astro well. Slightly more setup. Netlify Analytics requires $9/month paid add-on. More flexible free tier for commercial use (though irrelevant for personal sites). |

**Deploy strategy:** Static output (`output: 'static'` in `astro.config.mjs`). No server-side rendering needed — all content is known at build time. Keystatic production mode triggers a rebuild on content save via GitHub webhook → Vercel/Netlify picks up the commit and redeploys. Build time for a personal site is seconds.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Astro 6 | Next.js 15 | 90% more JS shipped, requires server compute, optimized for apps not content sites |
| Framework | Astro 6 | SvelteKit | Great framework, but less first-class CMS integration tooling; content sites aren't its strength |
| CSS | Tailwind v4 | Vanilla CSS | Tailwind's design tokens prevent drift; zero dead CSS in production |
| CSS | Tailwind v4 | CSS Modules | More boilerplate for a site this size; no design system guardrails |
| CMS | Keystatic | Sanity | Sanity is excellent but adds external cloud dependency and complexity for a solo site |
| CMS | Keystatic | Decap CMS | Abandoned by its creator (Netlify), not actively maintained |
| CMS | Keystatic | Contentful | Paid SaaS; unnecessary for a personal site |
| Deployment | Vercel | Netlify | Both valid; Vercel has better Astro native integration and free analytics |
| Analytics | Vercel Analytics / Plausible | Google Analytics 4 | GA4 is heavier, more complex, and requires cookie consent banners in many regions |

---

## Installation

```bash
# Scaffold new Astro project (latest)
npm create astro@latest

# Add Tailwind v4 (via Vite plugin, NOT @astrojs/tailwind)
npx astro add tailwind

# Add MDX support
npx astro add mdx

# Add Keystatic
npm install @keystatic/core @keystatic/astro

# Keystatic also requires React (for admin UI)
npx astro add react

# For Vercel deployment
npm install @astrojs/vercel

# (Optional) Plausible analytics — add script tag in layout, no npm package needed
```

---

## Configuration Notes

**Astro config for this project:**
- `output: 'static'` — fully static, no SSR needed
- Use Content Layer with local file loaders for blog and portfolio
- Keystatic uses `storage: { kind: 'github' }` in production, `{ kind: 'local' }` in dev

**Tailwind v4 dark mode:**
```css
/* src/styles/global.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

Then toggle `class="dark"` on `<html>` element via a small inline script (prevents flash of wrong theme on page load).

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Astro as framework choice | HIGH | Multiple official sources, Astro 6 confirmed stable, documented Vercel partnership |
| Tailwind v4 setup path | HIGH | Official Tailwind + Astro docs both show `@tailwindcss/vite` as the correct v4 path; `@astrojs/tailwind` confirmed deprecated |
| Keystatic as CMS | MEDIUM | Official Astro docs include Keystatic guide; free and git-based fits requirements; HOWEVER last npm publish was ~6 months ago — verify active maintenance |
| Sanity as CMS fallback | HIGH | Official Astro integration, permanent free tier confirmed, large community |
| Vercel as deployment target | HIGH | Official Astro hosting partner, documented integration |
| Google Analytics UA replacement needed | HIGH | UA sunset is confirmed; property no longer collects data |

---

## Sources

- [Astro 5.0 Release](https://astro.build/blog/astro-5/)
- [Astro 2025 Year in Review](https://astro.build/blog/year-in-review-2025/)
- [Astro Upgrade to v6 Docs](https://docs.astro.build/en/guides/upgrade-to/v6/)
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4)
- [Astro + Tailwind v4 Setup Guide](https://tailkits.com/blog/astro-tailwind-setup/)
- [Keystatic CMS Docs](https://keystatic.com/)
- [Keystatic + Astro Official Docs](https://docs.astro.build/en/guides/cms/keystatic/)
- [Sanity + Astro Official Docs](https://docs.astro.build/en/guides/cms/sanity/)
- [Sanity Astro Integration](https://www.sanity.io/plugins/sanity-astro)
- [Sanity Pricing (free tier)](https://www.sanity.io/pricing)
- [Astro vs Next.js 2026 Comparison](https://pagepro.co/blog/astro-nextjs/)
- [Vercel: Official Astro Hosting Partner](https://astro.build/blog/vercel-official-hosting-partner/)
- [Netlify vs Vercel 2025 Comparison](https://www.netlify.com/guides/netlify-vs-vercel/)
- [Decap CMS Alternatives 2026](https://sitepins.com/blog/decapcms-alternatives)
- [Which Git-Based CMS in 2025](https://staticmania.com/blog/top-git-based-cms)

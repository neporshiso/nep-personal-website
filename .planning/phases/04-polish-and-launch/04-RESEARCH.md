# Phase 4: Polish and Launch - Research

**Researched:** 2026-03-24
**Domain:** Astro SEO integrations, Keystatic GitHub mode, Vercel deployment, Astro Image optimization
**Confidence:** HIGH (core stack verified against official docs; Keystatic API route pattern MEDIUM — no single authoritative code example found)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Add a single generic OG image (`/public/assets/og-default.png`) used site-wide. No per-page OG images.
- **D-02:** Each page gets `og:title` and `og:description` sourced from existing BaseLayout `title` and `description` props. Add `og:image`, `og:type`, `og:url`, and Twitter card meta tags to BaseLayout `<head>`.
- **D-03:** Install `@astrojs/sitemap` integration for automatic `sitemap.xml` generation. `site` is already set to `https://neporshiso.com` in `astro.config.mjs`.
- **D-04:** No JSON-LD structured data — unnecessary for a personal site.
- **D-05:** Configure Keystatic in GitHub mode so the CMS is accessible at `neporshiso.com/keystatic` in production. This requires: a GitHub OAuth app, the `@keystatic/core/api` route handler, and updating `keystatic.config.ts` with `storage: { kind: 'github', repo: '<owner>/<repo>' }`.
- **D-06:** Keystatic must remain functional in local mode for development (current behavior). GitHub mode is for production only.
- **D-07:** Clean cutover — no redirects needed. The old site uses hash-based routes (`#portfolio`, `#about`) which don't generate server requests. Just deploy the new site.
- **D-08:** No external URLs need preserving beyond the blog, which now lives at new paths (`/thoughts/...`). The old blog was on a separate subdomain (`blog.neporshiso.com`) so no collision.
- **D-09:** Convert BookCard and PodcastCard cover images to use Astro's `<Image>` component for automatic WebP/AVIF generation and responsive `srcset`.
- **D-10:** Add explicit `width` and `height` attributes to cover images to prevent Cumulative Layout Shift (CLS).
- **D-11:** Keep existing `loading="lazy"` behavior — Astro `<Image>` supports this natively.
- **D-12:** Target Lighthouse score 90+ on all pages.
- **D-13:** Deploy to Vercel. Install `@astrojs/vercel` adapter. Vercel Analytics is already integrated (`@vercel/analytics`).
- **D-14:** The `site` field in `astro.config.mjs` is already set to `https://neporshiso.com`.

### Claude's Discretion

- OG image design (dimensions, colors, typography — should match site brand)
- Exact Vercel project configuration
- Whether to use `output: 'hybrid'` or `output: 'server'` for Keystatic API routes (hybrid preferred — static by default, server only for CMS API)
- Image dimension values for BookCard/PodcastCard covers
- Any additional `<head>` meta tags (canonical URL, theme-color, etc.)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUN-04 | All pages achieve LCP < 2.5s | Image optimization via Astro `<Image>` (CLS prevention); sitemap and OG tags add no runtime cost; Vercel edge CDN handles static asset delivery |
| SEO-01 | All pages have Open Graph meta tags for rich link previews | OG tag pattern for BaseLayout documented below; `og:image`, `og:title`, `og:description`, `og:url`, `og:type`, Twitter card tags |
| SEO-02 | All pages and posts have unique meta descriptions | BaseLayout already accepts `description` prop; each page passes its own; pattern is already in place |
| SEO-03 | Sitemap.xml auto-generated and updated on build | `@astrojs/sitemap` v3.7.1 handles this; generates `sitemap-index.xml` + `sitemap-0.xml` |
| DEPL-01 | Site deploys to Vercel with automatic rebuilds on content changes | Keystatic GitHub mode commits to the repo; Vercel auto-deploys on push; no Deploy Hook needed — git push IS the trigger |
| DEPL-02 | CMS works in production mode (GitHub OAuth, commits trigger redeploy) | Keystatic GitHub mode with `@keystatic/astro/api` route handler; 4 env vars in Vercel settings |
</phase_requirements>

---

## Summary

Phase 4 is the final polish and deployment phase. It has six distinct work areas: (1) Open Graph meta tags in BaseLayout, (2) sitemap integration, (3) Astro Image component conversion for BookCard/PodcastCard, (4) Keystatic GitHub mode setup for production CMS, (5) Vercel adapter installation and deployment, and (6) RSS feed restoration.

The most complex area is Keystatic GitHub mode. It requires an API route handler (`src/pages/api/keystatic/[...params].ts`), `keystatic.config.ts` updated with `storage: { kind: 'github', repo: '...' }` conditionally based on environment, the `@keystatic/astro` integration kept in `astro.config.mjs` for both environments, and four environment variables set in Vercel. Because Keystatic API routes need server-side execution, the `@astrojs/vercel` adapter is required even if the rest of the site is fully static.

A critical finding: cover images for books and podcasts are stored in `/public/assets/` (confirmed from content files). Astro's `<Image>` component does NOT optimize images from `/public/` — they pass through unmodified. D-09 in CONTEXT.md calls for `<Image>` conversion, but the optimization benefit (WebP, srcset) will not materialize unless images are moved to `src/assets/`. The planner must choose: either (a) move images to `src/assets/` and update content file paths and Keystatic schema directory fields, or (b) use `<Image>` with `/public/` paths for CLS/alt enforcement only, without optimization. Option (b) is simpler given the Keystatic schema already points to `public` paths.

**Primary recommendation:** Use `<Image>` from `/public/` paths (option b) — add explicit `width`/`height` for CLS prevention per D-10, accept that WebP conversion does not happen for these images. LCP target (2.5s) is still achievable through Vercel CDN, appropriately sized JPGs, and `loading="lazy"`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@astrojs/sitemap` | 3.7.1 | Auto-generates sitemap-index.xml on build | Official Astro integration; zero-config with `site` already set |
| `@astrojs/vercel` | 10.0.2 | Vercel deployment adapter; enables server routes for Keystatic API | Official Astro adapter for Vercel |

### Already Installed (No New Install Needed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `@keystatic/astro` | ^5.0.6 | Keystatic CMS integration | Installed — needs config update only |
| `@keystatic/core` | ^0.5.48 | Keystatic core types/API | Installed |
| `@astrojs/rss` | ^4.0.17 | RSS feed generation | Installed — file was deleted, needs restore |
| `astro` | ^6.0.8 | Framework | Installed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@astrojs/sitemap` | Hand-rolled sitemap | @astrojs/sitemap integrates with Astro's build pipeline; hand-rolled requires maintaining a page list |
| Keystatic GitHub mode | Keystatic Cloud | Cloud avoids GitHub OAuth setup but adds a third-party dependency; GitHub mode keeps everything in the repo |

**Installation:**
```bash
npm install @astrojs/sitemap @astrojs/vercel
```

**Version verification:** Confirmed against npm registry on 2026-03-24:
- `@astrojs/sitemap` → 3.7.1
- `@astrojs/vercel` → 10.0.2

## Architecture Patterns

### Recommended Project Structure (additions only)

```
src/
├── pages/
│   ├── api/
│   │   └── keystatic/
│   │       └── [...params].ts    # NEW — Keystatic API route handler
│   └── ...existing pages...
public/
└── assets/
    ├── og-default.png            # NEW — site-wide OG image (1200x630)
    ├── books/                    # existing
    └── podcasts/                 # existing
```

### Pattern 1: Astro 5 Hybrid Output (Static + Server Routes)

**What:** In Astro 5, `output: 'hybrid'` was removed and merged into the default `output: 'static'`. Any individual page or endpoint can opt into server-side rendering with `export const prerender = false`. This is the correct approach for Keystatic API routes.

**When to use:** Whenever one or more routes need server execution but the rest of the site is static.

**Key fact:** Even with `output: 'static'` (default), adding an adapter (e.g., `@astrojs/vercel`) is REQUIRED once any route opts into `prerender = false`. Without an adapter, the build will fail when a server route exists.

**Example — astro.config.mjs:**
```typescript
// Source: https://docs.astro.build/en/guides/on-demand-rendering/
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: 'https://neporshiso.com',
  adapter: vercel(),
  vite: { plugins: [tailwindcss()] },
  integrations: [
    react(),
    markdoc(),
    icon(),
    sitemap(),
    keystatic(),   // ALWAYS included — local mode dev, github mode prod (config switches)
  ],
});
```

Note: `keystatic()` must be included in both dev and production (unlike the current conditional pattern). The storage mode switch happens in `keystatic.config.ts`, not in `astro.config.mjs`.

### Pattern 2: Keystatic API Route Handler

**What:** A catch-all API endpoint that handles all Keystatic authentication and content API requests.

**File:** `src/pages/api/keystatic/[...params].ts`

**Example:**
```typescript
// Source: https://garden.mirahi.io/how-to-create-a-blog-using-astro-and-keystatic/
// and: https://github.com/Thinkmill/keystatic/discussions/826
import { makeHandler } from '@keystatic/astro/api';
import keystaticConfig from '../../../../keystatic.config';
import type { APIRoute } from 'astro';

export const prerender = false;

export const ALL: APIRoute = (context) => {
  return makeHandler({ config: keystaticConfig })(context);
};
```

**Why `export const prerender = false`:** This file handles OAuth callbacks and content API calls — must be server-rendered on every request.

**Why `export const ALL`:** Keystatic uses GET, POST, and other methods; `ALL` catches every HTTP method.

### Pattern 3: Keystatic Storage Config — Environment Switch

**What:** Switch `keystatic.config.ts` between local mode (dev) and GitHub mode (production) based on environment variable.

**Example:**
```typescript
// Source: https://keystatic.com/docs/github-mode
import { config, fields, collection, singleton } from '@keystatic/core';

const isProduction = process.env.NODE_ENV === 'production';

export default config({
  storage: isProduction
    ? {
        kind: 'github',
        repo: 'neporshiso/nep-personal-website',  // confirm owner/repo
      }
    : { kind: 'local' },
  // ...collections unchanged...
});
```

### Pattern 4: Open Graph Meta Tags in BaseLayout

**What:** Add OG/Twitter card tags to `BaseLayout.astro` `<head>`. All data comes from existing props — no new API surface.

**Example:**
```astro
---
// BaseLayout.astro — add canonicalURL derivation
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const ogImage = new URL('/assets/og-default.png', Astro.site);
---
<head>
  <!-- existing tags preserved above -->
  <link rel="canonical" href={canonicalURL} />

  <!-- Open Graph -->
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:url" content={canonicalURL} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="nep's home on the web" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />
</head>
```

`Astro.site` is already `https://neporshiso.com` in `astro.config.mjs`. `Astro.url` gives the current page URL including pathname.

### Pattern 5: Astro `<Image>` with `/public/` Assets

**What:** Convert `<img>` tags in BookCard and PodcastCard to Astro `<Image>`. Images remain in `/public/` — no optimization, but explicit dimensions prevent CLS.

**Limitation (HIGH confidence):** Images in `/public/` are NEVER optimized by Astro's image service. No WebP output, no srcset. The `<Image>` component adds `width`, `height`, and enforces `alt` — useful for CLS prevention per D-10, but D-09's "automatic WebP/AVIF generation" will NOT happen.

**Example — BookCard.astro:**
```astro
---
import { Image } from 'astro:assets';
// ...existing props...
---
{coverImage ? (
  <Image
    src={coverImage}
    alt={title}
    width={200}
    height={300}
    loading="lazy"
    class="w-full aspect-[2/3] object-cover rounded-t-md"
  />
) : (
  <!-- placeholder div unchanged -->
)}
```

**BookCard dimensions:** Book covers use `aspect-[2/3]` (portrait). With max-width ~150px in a 4-column grid on desktop — `width={200} height={300}` is appropriate.

**PodcastCard dimensions:** Fixed 64x64 (`w-16 h-16`) — use `width={64} height={64}`.

**Note on TypeScript:** When `coverImage` is typed as `string | undefined` (from Keystatic), it satisfies `<Image src={string}>` for public-path strings. No import wrapping needed.

### Pattern 6: RSS Feed Restoration

**What:** `src/pages/rss.xml.ts` was deleted (git status confirms `D src/pages/rss.xml.ts`). REQUIREMENTS.md BLOG-05 requires an RSS feed and it is marked complete. The file must be restored.

**Restore from git:**
```bash
git checkout HEAD -- src/pages/rss.xml.ts
```

The file already existed and worked. Its content (confirmed from git history):
```typescript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const allPosts = await getCollection('posts');
  const posts = allPosts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf());

  return rss({
    title: "nep's thoughts",
    description: "Blog posts by Nep — reflections on software development, learning, and building things on the web.",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedDate,
      description: post.data.excerpt || '',
      link: `/thoughts/${post.id}/`,
    })),
  });
}
```

This file is a static endpoint — no `export const prerender = false` needed (static output is default). `@astrojs/rss` is already installed.

### Pattern 7: Keystatic GitHub Mode — Environment Variables

**Required in Vercel project settings (Project → Settings → Environment Variables):**

| Variable | Source | Notes |
|----------|--------|-------|
| `KEYSTATIC_GITHUB_CLIENT_ID` | Generated by Keystatic setup wizard | From GitHub OAuth App |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | Generated by Keystatic setup wizard | From GitHub OAuth App |
| `KEYSTATIC_SECRET` | Generated by Keystatic setup wizard | Random secret for session signing |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Generated by Keystatic setup wizard | Astro prefix is `PUBLIC_` |

**Vercel → GitHub integration:** Keystatic GitHub mode writes content changes as commits to the GitHub repo. Vercel automatically deploys on every push to the connected branch. No separate Deploy Hook or webhook is needed — the content save → git commit → Vercel auto-redeploy chain happens automatically.

### Anti-Patterns to Avoid

- **Including `keystatic()` conditionally in astro.config.mjs based on NODE_ENV:** The current codebase does `...(isProduction ? [] : [keystatic()])`. For GitHub mode, Keystatic MUST be present in production. Move the environment switch to `keystatic.config.ts` (storage kind) instead.
- **Using `output: 'hybrid'` in Astro 5:** This option was removed in Astro 5 (merged into default static). Use `output: 'static'` (default) + `export const prerender = false` on server routes.
- **Expecting WebP output from `/public/` images:** Images in `/public/` bypass Astro's image pipeline entirely. Only images in `src/` are optimized.
- **Omitting the adapter when server routes exist:** Even with `output: 'static'`, any file with `export const prerender = false` requires an adapter or the build will fail.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sitemap generation | Custom sitemap.astro page | `@astrojs/sitemap` | Integration hooks into build pipeline, auto-discovers all static routes, generates proper sitemap-index.xml format |
| OAuth/session handling for CMS | Custom GitHub OAuth flow | Keystatic's built-in `makeHandler` | OAuth state generation, PKCE, cookie signing — all edge cases covered |
| Image dimension inference | Manual width/height calculation | Astro `<Image>` for `src/` images | Astro reads image dimensions at build time for `src/` files; manual only needed for `/public/` |
| RSS feed XML | Custom XML template | `@astrojs/rss` | Handles RSS 2.0 spec, proper date formatting, XML escaping |

**Key insight:** The CMS auth flow has significant edge cases (OAuth state, cookie security, CSRF). Using Keystatic's provided handler avoids reimplementing these.

## Common Pitfalls

### Pitfall 1: Keystatic Excluded from Production Build
**What goes wrong:** The current `astro.config.mjs` uses `...(isProduction ? [] : [keystatic()])`. If this pattern is kept, Keystatic's admin routes and API routes won't exist in the production build — the GitHub mode CMS will be completely inaccessible.
**Why it happens:** The pattern was added during development to avoid errors when deploying a static site without an adapter.
**How to avoid:** Change the integration to always include `keystatic()`. Move environment differentiation to `keystatic.config.ts` via the `storage` field.
**Warning signs:** Navigating to `https://neporshiso.com/keystatic` returns 404 after deploy.

### Pitfall 2: No Vercel Adapter — Build Failure with Server Routes
**What goes wrong:** Adding `src/pages/api/keystatic/[...params].ts` with `export const prerender = false` causes `astro build` to fail with an error like "Cannot use server-side rendering without an adapter."
**Why it happens:** Astro requires an adapter any time at least one route opts out of prerendering.
**How to avoid:** Install and configure `@astrojs/vercel` before adding any server routes.
**Warning signs:** `astro build` error mentioning "adapter" after adding the Keystatic API route.

### Pitfall 3: Sitemap Missing Blog Post Routes (SSR Mode)
**What goes wrong:** `@astrojs/sitemap` cannot enumerate dynamic routes in SSR (server-rendered) output mode. Blog post pages at `/thoughts/[slug]` could be missing from the sitemap.
**Why it happens:** The integration walks Astro's static route manifest at build time. Dynamic routes that use `getStaticPaths()` are included; fully server-rendered dynamic routes are not.
**How to avoid:** Since only the Keystatic API endpoint uses `prerender = false`, all content pages (including `/thoughts/[slug].astro`) remain statically prerendered via `getStaticPaths()`. Sitemap will include them. Verify `[slug].astro` does NOT have `export const prerender = false`.
**Warning signs:** `sitemap-0.xml` missing `/thoughts/` URLs after build.

### Pitfall 4: OG Image URL is Relative, Not Absolute
**What goes wrong:** `og:image` meta tag uses `/assets/og-default.png` (relative path). Social platforms require absolute URLs for `og:image` — they do not resolve relative paths.
**Why it happens:** Easy to forget the URL needs to be fully qualified.
**How to avoid:** Always construct `og:image` as `new URL('/assets/og-default.png', Astro.site)` to get `https://neporshiso.com/assets/og-default.png`.
**Warning signs:** LinkedIn/Slack preview shows no image despite the tag being present.

### Pitfall 5: Keystatic Environment Variables Not Set in Vercel
**What goes wrong:** GitHub OAuth flow fails with cryptic errors or silent 401s because the four Keystatic env vars are missing from Vercel's environment.
**Why it happens:** These variables are generated locally by the Keystatic setup wizard (written to `.env`), but `.env` is gitignored and does not deploy.
**How to avoid:** After running the Keystatic GitHub setup wizard locally, copy all four generated variables to Vercel → Project Settings → Environment Variables (set for Production environment).
**Warning signs:** Clicking "Login with GitHub" on `neporshiso.com/keystatic` returns an error or infinite redirect.

### Pitfall 6: Image `<Image>` with TypeScript — src Type Mismatch
**What goes wrong:** When `coverImage` is typed as `string | undefined` in component props, Astro's `<Image src={coverImage}>` may produce a TypeScript error because `undefined` is not a valid `src` value.
**Why it happens:** Astro's `<Image>` expects `string | ImageMetadata | Promise<{default: ImageMetadata}>` — not `undefined`.
**How to avoid:** Guard with the existing conditional pattern: `{coverImage ? <Image src={coverImage} ... /> : <placeholder />}`. The conditional branch handles the `undefined` case.

## Code Examples

### OG Image — Correct Absolute URL Construction
```astro
---
// Source: https://docs.astro.build/en/reference/api-reference/#astrosite
const ogImage = new URL('/assets/og-default.png', Astro.site);
// Result: https://neporshiso.com/assets/og-default.png
---
<meta property="og:image" content={ogImage} />
```

### Canonical URL — Current Page
```astro
---
// Source: https://docs.astro.build/en/reference/api-reference/#astrourl
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---
<link rel="canonical" href={canonicalURL} />
<meta property="og:url" content={canonicalURL} />
```

### @astrojs/sitemap — Minimal Config (enough for this project)
```javascript
// Source: https://docs.astro.build/en/guides/integrations-guide/sitemap/
import sitemap from '@astrojs/sitemap';
// In defineConfig integrations array:
sitemap()
// Output: /sitemap-index.xml and /sitemap-0.xml
// The 'site' field already set to https://neporshiso.com handles URL prefix
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `output: 'hybrid'` | `output: 'static'` (default) + `prerender = false` per route | Astro 5.0 | Must NOT use `output: 'hybrid'` — build will warn/error |
| Separate hybrid/static config | Single static config with opt-in SSR per file | Astro 5.0 | Simpler — no global mode switch needed |
| `export const all` (lowercase) | `export const ALL` (uppercase) + `APIRoute` type | Astro 4+ | Both work but uppercase is conventional |

**Deprecated/outdated:**
- `output: 'hybrid'`: Removed in Astro 5 — merged into `output: 'static'`. Code that sets this will produce a warning or error.

## Open Questions

1. **Keystatic GitHub App Setup Wizard — Local vs. Production URL**
   - What we know: The Keystatic setup wizard prompts for the deployed project URL to configure the GitHub OAuth App callback URL
   - What's unclear: Must the production site be deployed on Vercel BEFORE running the setup wizard? Or can a placeholder URL be used and updated after?
   - Recommendation: Deploy the site to Vercel first (without GitHub mode), then run the Keystatic wizard. The wizard generates the OAuth App pointing to `neporshiso.com`.

2. **`makeHandler` — Does It Accept Env Vars Implicitly?**
   - What we know: `makeHandler({ config: keystaticConfig })` is the documented pattern. Some examples show explicit `clientId`, `clientSecret`, `secret` parameters.
   - What's unclear: Whether the handler reads `KEYSTATIC_GITHUB_CLIENT_ID` etc. from `process.env` automatically, or if they must be passed explicitly.
   - Recommendation: Try the implicit form first (`makeHandler({ config: keystaticConfig })`). If the GitHub OAuth fails to initialize, switch to explicit: `makeHandler({ config: keystaticConfig, clientId: import.meta.env.KEYSTATIC_GITHUB_CLIENT_ID, ... })`.

3. **Cover Image Optimization — D-09 Intent vs. Reality**
   - What we know: D-09 says "automatic WebP/AVIF generation" via `<Image>`. Images are in `/public/` and will NOT be optimized.
   - What's unclear: Whether the planner should move images to `src/assets/` (enabling optimization) or accept `/public/` with `<Image>` for CLS only.
   - Recommendation: Keep images in `/public/` for simplicity. The Keystatic schema (`directory` fields) and all content YAML files point to `/public/assets/...` paths. Moving to `src/assets/` would require schema changes, content file updates, and Keystatic UI reconfiguration. LCP target is achievable without WebP via Vercel CDN and appropriately sized source JPGs.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build + Keystatic API | ✓ | >=22.12.0 (required) | — |
| Vercel CLI (optional) | Local preview | Not checked | — | `astro preview` |
| GitHub account | Keystatic GitHub mode OAuth App | Human-operated | — | Must be done manually |
| Vercel project | DEPL-01 deployment | Human-operated | — | Must be created manually |

**Missing dependencies with no fallback:**
- GitHub OAuth App creation — requires manual browser-based setup via Keystatic wizard or GitHub settings
- Vercel project connection to GitHub repo — requires manual Vercel dashboard action

**Missing dependencies with fallback:**
- None

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — this is an Astro static site project |
| Config file | None |
| Quick run command | `npm run build` (build smoke test) |
| Full suite command | `npm run build && npm run preview` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEO-01 | OG tags present in page HTML | manual | Build + inspect `dist/index.html` for og: meta tags | N/A — manual |
| SEO-02 | Unique meta descriptions | manual | Inspect `dist/*.html` files for description tags | N/A — manual |
| SEO-03 | sitemap-index.xml accessible at /sitemap-index.xml | smoke | `npm run build` then verify `dist/sitemap-index.xml` exists | ❌ Wave 0 |
| FOUN-04 | LCP < 2.5s on mobile | manual | Lighthouse in Chrome DevTools | N/A — manual |
| DEPL-01 | Auto-redeploy on content change | manual | Push content change, verify Vercel dashboard | N/A — manual |
| DEPL-02 | CMS works in production GitHub mode | manual | Login at neporshiso.com/keystatic, save change | N/A — manual |

### Sampling Rate
- **Per task commit:** `npm run build` (verifies no build errors)
- **Per wave merge:** `npm run build` + manual spot-check of OG tags in dist HTML
- **Phase gate:** All manual checks pass before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `scripts/verify-sitemap.sh` or inline `ls dist/sitemap-index.xml` check — covers SEO-03

*(Note: Most phase requirements are deployment/runtime checks that cannot be fully automated pre-deploy. The build smoke test (`npm run build`) is the primary automated gate.)*

## Sources

### Primary (HIGH confidence)
- https://docs.astro.build/en/guides/integrations-guide/sitemap/ — sitemap integration setup, output files, hybrid mode limitation
- https://docs.astro.build/en/guides/on-demand-rendering/ — `export const prerender = false`, adapter requirement, Astro 5 static+server pattern
- https://docs.astro.build/en/guides/images/ — `<Image>` component, `/public/` limitation (no optimization), width/height requirements
- https://keystatic.com/docs/github-mode — storage config, env vars, GitHub App setup
- https://github.com/withastro/astro/pull/11824 — confirms `output: 'hybrid'` removed in Astro 5

### Secondary (MEDIUM confidence)
- https://garden.mirahi.io/how-to-create-a-blog-using-astro-and-keystatic/ — `makeHandler` API route code pattern (`src/pages/api/keystatic/[...params].ts`)
- Multiple web search results confirming `export const ALL: APIRoute` + `makeHandler` pattern
- https://keystatic.com/docs/recipes/astro-disable-admin-ui-in-production — confirms conditional keystatic() pattern; informs the INVERSE needed here

### Tertiary (LOW confidence)
- Community discussions on Keystatic GitHub (issues #1379, #1497, discussion #826) — context on Vercel env var setup, server-side requirements
- https://github.com/moonbe77/astro-keystatic — referenced but content not fully accessible

## Metadata

**Confidence breakdown:**
- Standard stack (sitemap, vercel adapter): HIGH — official docs, version confirmed from npm registry
- Architecture (OG tags, sitemap config, Astro 5 output mode): HIGH — official Astro docs
- Keystatic API route handler: MEDIUM — pattern found in multiple community sources and one official Keystatic doc, but no single canonical Keystatic official code example for the `[...params].ts` file
- `/public/` image limitation: HIGH — stated explicitly in official Astro image docs
- Pitfalls: HIGH for Astro-side; MEDIUM for Keystatic GitHub mode (based on issue reports)

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable libraries; Keystatic GitHub mode documentation may improve)

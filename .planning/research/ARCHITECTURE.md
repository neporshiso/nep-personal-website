# Architecture Patterns

**Domain:** Personal developer website with CMS
**Researched:** 2026-03-20

---

## Recommended Architecture

**Pattern:** Static-first JAMstack — Astro (SSG) + Git-based CMS (Decap CMS)

All content is managed through a CMS that commits Markdown/YAML files back to the Git repository. Astro reads those files at build time via Content Collections, generates fully static HTML, and deploys to a CDN. No server, no database, no runtime dependencies.

```
[CMS Admin UI] ──commits──> [Git Repository]
                                    │
                             build triggered
                                    │
                             [Astro Build]
                            /        |        \
                     [Pages]  [Content Layer]  [Assets]
                                    │
                          fully static HTML/CSS/JS
                                    │
                            [CDN: Vercel/Netlify]
                                    │
                               [Browser]
```

---

## Component Boundaries

| Component | Responsibility | Communicates With | Location |
|-----------|---------------|-------------------|----------|
| CMS Admin UI | Content editing interface for non-code updates | Git repo (via OAuth) | `public/admin/` |
| Content Layer | Reads, validates, and types all content from files | Astro pages (query API) | `src/content.config.ts` |
| Layouts | Shared page shell: nav, head metadata, footer | All pages | `src/layouts/` |
| Pages | Route definitions, data fetching, page assembly | Content Layer, Components | `src/pages/` |
| Components | Reusable UI units (ProjectCard, BlogPost, SkillTag) | Layouts, Pages | `src/components/` |
| Styles | Global CSS / design tokens | Layouts | `src/styles/` |
| Static Assets | Images, resume PDF, favicon | Pages, Components | `public/` |
| Analytics Script | Visitor tracking injection | Root Layout | `src/layouts/BaseLayout.astro` |

---

## Data Flow

### Build-Time Content Flow (primary path)

```
src/content/
  blog/         ← Markdown files (CMS writes here)
  portfolio/    ← JSON or Markdown (CMS writes here)
  resume/       ← YAML or JSON (CMS writes here)
  about/        ← Markdown (CMS writes here)
        │
        ▼
src/content.config.ts    ← defines collections + Zod schemas
        │
        ▼
getCollection('blog')    ← called inside src/pages/blog/[slug].astro
getEntry('about', ...)   ← called inside src/pages/index.astro
        │
        ▼
Astro renders .astro templates → static HTML files
        │
        ▼
dist/ (static output) → deployed to Vercel/Netlify CDN
```

### CMS Edit Flow

```
Author visits /admin (Decap CMS SPA)
        │
        ▼
Decap authenticates via OAuth (GitHub)
        │
        ▼
Author edits content in Decap UI
        │
        ▼
Decap commits Markdown/YAML to src/content/ in GitHub repo
        │
        ▼
Vercel/Netlify detects push → triggers Astro build
        │
        ▼
New static site deployed to CDN (typically < 60 seconds)
```

### Dark Mode Flow

```
User toggles theme
        │
        ▼
JS writes 'theme' to localStorage + sets data-theme on <html>
        │
        ▼
CSS custom properties under [data-theme="dark"] apply
        │
        ▼
Preference persisted across page loads (inline script in <head>)
```

---

## Directory Structure

```
nep-personal-website/
├── public/
│   ├── admin/              ← Decap CMS (index.html + config.yml)
│   ├── assets/             ← resume PDF, static images
│   └── favicon.ico
├── src/
│   ├── content/            ← CMS-managed content files
│   │   ├── blog/           ← .md files per post
│   │   ├── portfolio/      ← .json or .md per project
│   │   ├── resume/         ← work.json, skills.json, education.json
│   │   └── about/          ← about.md (bio)
│   ├── content.config.ts   ← collection definitions + schemas (Astro 5)
│   ├── components/
│   │   ├── ProjectCard.astro
│   │   ├── BlogPostCard.astro
│   │   ├── SkillList.astro
│   │   ├── ResumeEntry.astro
│   │   ├── Nav.astro
│   │   └── ThemeToggle.astro
│   ├── layouts/
│   │   └── BaseLayout.astro ← head, nav, analytics script, footer
│   ├── pages/
│   │   ├── index.astro     ← about + skills + portfolio summary
│   │   ├── blog/
│   │   │   ├── index.astro ← blog listing
│   │   │   └── [slug].astro ← individual posts
│   │   ├── portfolio.astro ← full portfolio page
│   │   └── resume.astro    ← resume/CV page
│   └── styles/
│       └── global.css      ← CSS custom properties, typography, reset
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## Patterns to Follow

### Pattern 1: Content Collections with Zod Schemas

**What:** Define a typed schema for each content type. Astro validates at build time.

**When:** Every content type managed by the CMS — blog, portfolio, resume entries, about.

**Example:**
```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/portfolio' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    url: z.string().url().optional(),
    tags: z.array(z.string()),
    videoUrl: z.string().optional(),
  }),
});

export const collections = { blog, portfolio };
```

### Pattern 2: BaseLayout as Single Analytics/Theme Injection Point

**What:** All analytics, theme init script, and shared metadata live in one layout component.

**When:** Every page imports `BaseLayout.astro`. Nothing is duplicated across pages.

**Example:**
```astro
<!-- src/layouts/BaseLayout.astro -->
---
const { title, description } = Astro.props;
---
<html>
  <head>
    <!-- Inline theme script prevents flash of wrong theme -->
    <script is:inline>
      const t = localStorage.getItem('theme') ?? 'dark';
      document.documentElement.setAttribute('data-theme', t);
    </script>
    <!-- Analytics: swap for Plausible/GA4 as needed -->
    <script defer src="https://plausible.io/js/script.js" data-domain="neporshiso.com"></script>
  </head>
  <body>
    <Nav />
    <slot />
  </body>
</html>
```

### Pattern 3: Static Paths from Collections

**What:** `getStaticPaths()` generates all blog/portfolio routes at build time.

**When:** Any dynamic route (`[slug].astro`) driven by CMS content.

```astro
---
// src/pages/blog/[slug].astro
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map(post => ({
    params: { slug: post.id },
    props: { post },
  }));
}
const { post } = Astro.props;
const { Content } = await render(post);
---
```

### Pattern 4: Decap Admin as Static SPA in /public

**What:** Decap CMS admin UI lives at `public/admin/` — just two files.

**When:** Deploy to Vercel or Netlify; CMS is accessible at `yoursite.com/admin`.

```
public/admin/
  index.html   ← loads Decap CMS from CDN
  config.yml   ← defines collections matching src/content/ structure
```

The `config.yml` mirrors the same content model defined in `content.config.ts` — these two files must stay in sync when content types change.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: SSR for a Content Site

**What:** Enabling Astro's server-side rendering mode for a site that has no dynamic per-request content.

**Why bad:** Adds infrastructure complexity (serverless functions), increases costs, adds cold start latency. A personal portfolio has no personalized or real-time content.

**Instead:** Keep `output: 'static'` in `astro.config.mjs`. Deploy as plain HTML to CDN.

### Anti-Pattern 2: Storing Content in Component Files

**What:** Hard-coding portfolio projects or resume entries as arrays in `.astro` components.

**Why bad:** Breaks the CMS requirement. Updating content requires code changes and redeployment workflow outside the CMS.

**Instead:** All content lives in `src/content/`. Components receive content as props from pages that query collections.

### Anti-Pattern 3: Dual Source of Truth for Content Schemas

**What:** Keeping `content.config.ts` schema and Decap's `config.yml` fields independently without treating them as a pair.

**Why bad:** Schema drift causes build failures when the CMS produces a field the Zod schema doesn't expect, or omits a required field.

**Instead:** When adding a content field, update both files in the same commit. Comment both files to indicate they must stay in sync.

### Anti-Pattern 4: Client-Side JavaScript for Content Rendering

**What:** Fetching and rendering portfolio items or blog posts in browser JS.

**Why bad:** Hurts SEO, causes layout shift, and is unnecessary for static content.

**Instead:** All content renders server-side at build time. Use Astro Islands only for genuinely interactive UI (theme toggle).

### Anti-Pattern 5: CDN Dependencies for Core Styles

**What:** Loading CSS frameworks (Bulma, Bootstrap) from a CDN at runtime (current site pattern).

**Why bad:** Network dependency at page load, no tree-shaking, larger payload.

**Instead:** Bundle only what is used. For minimal aesthetic, plain CSS custom properties and a small utility layer (or Tailwind with PurgeCSS) are sufficient and eliminate the CDN dependency.

---

## Component Build Order (Dependency Chain)

Build in this order — each layer depends on the one before it:

```
1. src/styles/global.css
   └── CSS tokens, reset, typography — everything else depends on this

2. src/content.config.ts
   └── Must exist before any page queries collections

3. src/content/ (seed files)
   └── At least one entry per collection so pages render during dev

4. src/layouts/BaseLayout.astro
   └── Required by all pages — build before any page

5. src/components/ (atomic)
   └── ProjectCard, BlogPostCard, ResumeEntry, SkillList, ThemeToggle
   └── Build before pages that use them

6. src/components/Nav.astro
   └── Depends on routes being known; build alongside pages

7. src/pages/index.astro
   └── Homepage — first visible milestone

8. src/pages/resume.astro
   └── Depends on resume collection

9. src/pages/portfolio.astro
   └── Depends on portfolio collection

10. src/pages/blog/index.astro + [slug].astro
    └── Depends on blog collection

11. public/admin/ (Decap config)
    └── Last — configure after all collections are final
```

---

## Scalability Considerations

| Concern | At current scale (personal site) | At larger scale (if ever) |
|---------|-----------------------------------|---------------------------|
| Build time | < 5 seconds for ~50 content entries | Astro Content Layer caches between builds — handles thousands of entries |
| CMS collaboration | Single author — no conflict risk | Decap's editorial workflow adds draft/review states |
| Images | Static assets in `public/` or S3 | Astro's `<Image />` component handles optimization at build time |
| Analytics | Plausible (privacy-first, no GDPR overhead) or GA4 | No change — script tag swap |
| Hosting cost | Free tier on Vercel/Netlify | Still free for personal traffic levels |

---

## Sources

- Astro Content Collections docs: https://docs.astro.build/en/guides/content-collections/ (HIGH confidence — official)
- Astro CMS guide: https://docs.astro.build/en/guides/cms/ (HIGH confidence — official)
- Astro + Decap CMS official guide: https://docs.astro.build/en/guides/cms/decap-cms/ (HIGH confidence — official)
- Astro project structure docs: https://docs.astro.build/en/basics/project-structure/ (HIGH confidence — official)
- Astro + Decap in 2026 (community): https://dev.to/migsarnavarro/astro-decap-in-2026-3mj3 (MEDIUM confidence — community, recent)
- Decap CMS docs: https://decapcms.org/docs/intro/ (HIGH confidence — official)
- 7 Best Git-Based CMS for Static Sites 2026: https://statichunt.com/blog/git-based-headless-cms (MEDIUM confidence — survey article)

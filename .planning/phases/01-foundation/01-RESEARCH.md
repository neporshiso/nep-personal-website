# Phase 1: Foundation - Research

**Researched:** 2026-03-20
**Domain:** Astro 6 + Tailwind v4 + Keystatic CMS + Content Collections + Dark Mode
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Stack**: Astro 6 + Tailwind v4 + Keystatic CMS (verify before using — Sanity is fallback)
- **Color palette**: Warm neutral (Solarized/Gruvbox family): cream/warm whites for light, dark warm tones for dark
  - Light: `#fdf6e3` background, `#3c3836` text
  - Dark: `#1d2021` background, `#ebdbb2` text
- **Typography**: System fonts only — `system-ui/-apple-system` body, `ui-monospace/Cascadia Code/Fira Code` code
- **Dark mode**: Detect OS preference; toggle with sun/moon icon in header; localStorage persistence; no animation
- **No flash of wrong theme**: Inline script in `<head>` applies theme before render
- **Content max-width**: ~768px; moderate padding (balanced density)
- **Content schemas** (see CONTEXT.md for field-level details):
  - Project (collection): title, description, techStack, media, links, year, slug
  - Post (collection): title, body (MDX), tags, coverImage, draft, excerpt, publishedDate, slug
  - Bio (singleton): body (single MDX field)
  - Podcast (collection): name, link, coverImage, category, slug
  - Book (collection): title, author, coverImage, status (enum), note, slug
- **Routing**: Multi-page — /, /about, /portfolio, /portfolio/[slug], /blog, /blog/[slug], /podcasts, /books
- **S3 assets**: Current site assets on AWS S3; need `remotePatterns` in Astro config
- **Indentation**: 2-space throughout (matches existing site convention)
- **Semantic HTML5**: Use semantic sections in Astro components

### Claude's Discretion
- Accent color selection (must complement warm neutrals, pass WCAG AA contrast)
- Navigation visual structure (top horizontal nav is likely)
- Footer content and layout
- Loading skeleton design
- Exact spacing scale and typography sizing
- Keystatic admin configuration details
- Tailwind v4 theme token structure

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUN-01 | Site uses responsive mobile-first layout | Astro generates semantic HTML; Tailwind v4 mobile-first utilities (`sm:`, `md:`, `lg:`) with CSS custom properties for theme tokens |
| FOUN-02 | User can toggle between dark and light mode; system preference detected on first visit | Tailwind v4 `@custom-variant dark` selector strategy + inline `<head>` script pattern prevents FOUC; localStorage + `prefers-color-scheme` |
| FOUN-03 | Color contrast meets WCAG AA in both light and dark modes | Solarized/Gruvbox base colors are known to fail stock WCAG AA — deliberate palette verification required; contrast ratio must be ≥4.5:1 for normal text |
</phase_requirements>

---

## Summary

This phase scaffolds an Astro 6 project with Tailwind v4, integrates Keystatic as the local CMS, defines all five content type schemas, and delivers a BaseLayout with working dark/light mode toggle. The output is infrastructure only — no public-facing page content.

The most critical research finding is the **Keystatic adapter requirement**: Keystatic needs server-side Node.js APIs at runtime, which means Astro's `output: 'static'` alone triggers a build error. The correct pattern for local-only admin use is to conditionally exclude the `keystatic()` integration during production builds via an environment variable check. This avoids adding a server adapter to what is otherwise a fully static site.

The second critical finding is the **Tailwind v4 dark mode architecture**. The old `darkMode: 'class'` config key is gone. The v4 approach uses `@custom-variant dark` in CSS, paired with CSS custom properties defined under `:root` (light) and `.dark` (dark) selectors in `@layer base`, then referenced in `@theme` for utility generation. This must be wired to a `<head>` inline script that reads `localStorage` before first paint to prevent flash.

The third critical finding is that **stock Solarized/Gruvbox colors do not reliably pass WCAG AA**. The exact hex values from the user (#fdf6e3 / #3c3836 light, #1d2021 / #ebdbb2 dark) must be verified against a contrast checker before committing. Adjustments are likely needed.

**Primary recommendation:** Scaffold with `npm create astro@latest`, add Tailwind v4 via `@tailwindcss/vite` (NOT the deprecated `@astrojs/tailwind`), configure Keystatic with conditional integration for production builds, and define all content schemas in `src/content.config.ts` before any page work begins.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | 6.0.8 | Framework — static site generation with islands | Official Astro release; Vercel is official hosting partner |
| tailwindcss | 4.2.2 | Utility CSS — replaces old config with CSS-first @theme | v4 is current; v3 is in maintenance mode |
| @tailwindcss/vite | 4.2.2 | Vite plugin for Tailwind v4 in Astro | Required; replaces deprecated @astrojs/tailwind for v4 |
| @keystatic/core | 0.5.48 | CMS schema, field types, admin UI logic | Last published 2026-02-25 — actively maintained |
| @keystatic/astro | 5.0.6 | Astro integration that mounts /keystatic route | Last published 2026-02-25 — actively maintained |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @astrojs/react | 5.0.1 | React integration (required by Keystatic admin UI) | Required by @keystatic/astro |
| @astrojs/markdoc | 1.0.2 | Markdoc integration for Keystatic content fields | Required by @keystatic/astro; default content format |
| @astrojs/mdx | 5.0.2 | MDX integration for Post body field | Needed if Post.body uses fields.mdx() instead of fields.markdoc() |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Keystatic | Sanity | Sanity is a hosted DB-backed CMS — more features, more complexity, costs money at scale; Keystatic is file-based/GitHub-native and free |
| @tailwindcss/vite | @astrojs/tailwind | @astrojs/tailwind is deprecated for Tailwind v4; do NOT use it |
| fields.markdoc() for Post body | fields.mdx() | MDX is supported but requires manual rendering; Markdoc has a richer editor in Keystatic admin |

**Installation:**
```bash
npm create astro@latest -- --template minimal
npm install tailwindcss @tailwindcss/vite
npx astro add react markdoc
npm install @keystatic/core @keystatic/astro
```

**Version verification (confirmed 2026-03-20):**
- astro: 6.0.8
- tailwindcss: 4.2.2
- @keystatic/core: 0.5.48 (published 2026-02-25 — not stale)
- @keystatic/astro: 5.0.6 (published 2026-02-25 — not stale)

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/          # Reusable Astro components (BaseLayout, Nav, Footer, ThemeToggle)
├── content/             # Keystatic-managed content files (.mdoc, .yaml)
│   ├── posts/           # Blog posts (Keystatic writes here)
│   ├── projects/        # Portfolio projects
│   ├── podcasts/        # Podcast entries
│   ├── books/           # Book entries
│   └── bio/             # Singleton bio content
├── layouts/             # Page layouts (BaseLayout.astro)
├── pages/               # File-based routing
│   ├── index.astro
│   ├── about.astro
│   ├── portfolio/
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── blog/
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── podcasts.astro
│   ├── books.astro
│   └── keystatic/       # Auto-generated by @keystatic/astro integration
├── styles/
│   └── global.css       # @import "tailwindcss"; @theme {...}; @layer base {...}
└── content.config.ts    # Astro content collection schemas (Zod)
keystatic.config.ts      # Keystatic CMS schemas and storage config
astro.config.mjs         # Astro + Vite config
```

### Pattern 1: Tailwind v4 CSS-First Theme with Dark Mode

**What:** Define semantic color tokens in CSS custom properties; map to Tailwind utilities via `@theme`; switch light/dark via `.dark` class on `<html>`

**When to use:** Always — this is the only dark-mode approach in Tailwind v4

```css
/* src/styles/global.css */
/* Source: https://tailwindcss.com/docs/dark-mode + https://tailwindcss.com/docs/theme */

@import "tailwindcss";

/* Use class-based dark mode variant */
@custom-variant dark (&:where(.dark, .dark *));

/* Define semantic tokens that map to Tailwind utilities */
@theme {
  --color-bg: #fdf6e3;
  --color-text: #3c3836;
  --color-bg-dark: #1d2021;
  --color-text-dark: #ebdbb2;
}

/* Override token values per mode */
@layer base {
  :root {
    --bg: #fdf6e3;
    --text: #3c3836;
  }
  .dark {
    --bg: #1d2021;
    --text: #ebdbb2;
  }
  body {
    background-color: var(--bg);
    color: var(--text);
    font-family: system-ui, -apple-system, sans-serif;
  }
  code, pre {
    font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
  }
}
```

### Pattern 2: Anti-Flash Inline Script

**What:** Synchronous inline script in `<head>` reads localStorage and applies `.dark` class before any paint

**When to use:** Required in BaseLayout — prevents flash of wrong theme

```astro
<!-- src/layouts/BaseLayout.astro -->
<!-- Source: https://tailwindcss.com/docs/dark-mode + community Astro patterns -->
<head>
  <script is:inline>
    (function () {
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (stored === 'dark' || (!stored && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    })();
  </script>
</head>
```

**Critical note:** Must be `is:inline` (not a regular Astro `<script>`) so it executes synchronously before render. Async scripts or deferred scripts will cause the flash.

### Pattern 3: Conditional Keystatic Integration for Production

**What:** Include the `keystatic()` integration only in dev/non-production builds; skip it for production static deploys

**When to use:** Required — prevents Keystatic admin routes from deploying to production and avoids the server adapter requirement for an otherwise static site

```javascript
// astro.config.mjs
// Source: https://keystatic.com/docs/recipes/astro-disable-admin-ui-in-production
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    markdoc(),
    ...(isProduction ? [] : [keystatic()]),
  ],
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },
});
```

### Pattern 4: Dual Schema — Keystatic Config + Astro Content Config

**What:** Keystatic and Astro content collections each have their own schema definition. They must be kept in sync.

**When to use:** Always — Keystatic writes files; Astro reads them. If schemas diverge, getCollection() returns untyped or broken data.

Keystatic schema (in `keystatic.config.ts`) defines what the admin UI shows.
Astro schema (in `src/content.config.ts`) defines Zod validation for build-time safety.

```typescript
// src/content.config.ts
// Source: https://docs.astro.build/en/guides/content-collections/
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    publishedDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    draft: z.boolean().default(false),
    excerpt: z.string().optional(),
  }),
});

export const collections = { posts };
```

### Anti-Patterns to Avoid
- **Using `@astrojs/tailwind` with Tailwind v4:** It is deprecated for v4. Use `@tailwindcss/vite` directly.
- **Using `darkMode: 'class'` in tailwind.config.js:** That config file does not exist in v4. Use `@custom-variant dark` in CSS.
- **Placing theme script in `<body>` or as a deferred script:** Only synchronous `is:inline` scripts in `<head>` prevent the flash.
- **Deploying Keystatic integration to production without disabling it:** Without the conditional, Astro will error at build time requiring a server adapter that makes the site non-static.
- **Defining schema only in Keystatic, skipping `src/content.config.ts`:** Without the Astro schema, `getCollection()` returns untyped entries and Zod validation does not run at build time.
- **Using `tailwindcss` as a PostCSS plugin (v3 method):** v4 uses the Vite plugin API, not PostCSS.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme detection and persistence | Custom localStorage/matchMedia logic | Tailwind v4 `@custom-variant dark` + standard inline script pattern | The pattern is 10 lines, well-documented, handles system preference, stored preference, and no-JS graceful degradation |
| Content schema validation | Custom validation functions | Zod via `astro:content` + `src/content.config.ts` | Build-time type checking, descriptive error messages, TypeScript autocomplete — free with Astro |
| CMS admin interface | Custom admin form pages | Keystatic `/keystatic` route | Keystatic's admin UI handles image upload, rich text, validation, GitHub sync — building a custom CMS is weeks of work |
| Slug generation | `title.toLowerCase().replace(/\s+/g, '-')` | `fields.slug()` in Keystatic + Astro's built-in slug from file path | Keystatic's slug field handles unicode, conflicts, and persistence |
| Image optimization | Manual `<img>` with width/height | Astro's `<Image />` component | Astro handles format conversion, responsive srcset, lazy loading, and CLS prevention |
| S3 image proxying | Custom image proxy server | `remotePatterns` in `astro.config.mjs` | Astro optimizes remote images without a proxy when `remotePatterns` is configured |

**Key insight:** Astro + Keystatic together cover content management, routing, image optimization, and type-safe schema validation. The only custom code needed is the theme toggle script and the color token definitions.

---

## Common Pitfalls

### Pitfall 1: The Keystatic Server Adapter Build Error
**What goes wrong:** Running `astro build` with `keystatic()` in integrations without an adapter fails with: "Cannot use server-only features without an adapter."
**Why it happens:** Keystatic admin routes (POST handlers for file writes) require server-side execution. Astro's build process requires an adapter for any SSR routes.
**How to avoid:** Use the conditional pattern — `...(process.env.NODE_ENV === 'production' ? [] : [keystatic()])`. Set `SKIP_KEYSTATIC=true` in Vercel environment variables.
**Warning signs:** Build fails locally or in CI with an adapter error message.

### Pitfall 2: Flash of Wrong Theme (FOUC)
**What goes wrong:** On first page load, the page renders in light mode for ~100ms then switches to dark, or vice versa.
**Why it happens:** JavaScript-driven class toggling runs after the browser has already painted the page.
**How to avoid:** The anti-flash script must be the first child of `<head>` and use `is:inline` so Astro does not bundle or defer it.
**Warning signs:** Visible flash when refreshing the page with dark mode active in system preferences.

### Pitfall 3: Solarized/Gruvbox Colors Failing WCAG AA
**What goes wrong:** The cream/brown palette (#fdf6e3 / #3c3836) and dark palette (#1d2021 / #ebdbb2) may not achieve 4.5:1 contrast ratio for normal text.
**Why it happens:** Stock Solarized was not designed for WCAG compliance. Gruvbox has the same issue. The user-specified hex values are approximations.
**How to avoid:** Before writing any page content, verify every text/background pairing at https://webaim.org/resources/contrastchecker/. Adjust lightness of text or background colors as needed while preserving the warm palette character.
**Warning signs:** Contrast ratio below 4.5:1 for normal text. FOUN-03 is a phase success criterion.

### Pitfall 4: Schema Drift Between Keystatic and Astro Configs
**What goes wrong:** Keystatic config defines a field (e.g., `techStack: fields.array(...)`) but the Astro content schema has `techStack: z.string()` — or is missing the field entirely. Build succeeds but `getCollection()` returns data that doesn't match TypeScript types.
**Why it happens:** Two separate schema files must be kept in sync manually. Easy to forget one when adding fields.
**How to avoid:** Define both schemas in the same work session. Write Keystatic schema first (drives the admin UI), then write the matching Zod schema in `src/content.config.ts` immediately after. Add a comment in each file referencing the other.
**Warning signs:** TypeScript errors on collection entry properties, or `undefined` values for fields that should have data.

### Pitfall 5: @astrojs/tailwind vs @tailwindcss/vite Confusion
**What goes wrong:** Installing `@astrojs/tailwind` and adding it to `integrations[]` — works for Tailwind v3, breaks silently or does nothing useful for v4.
**Why it happens:** Many tutorials and blog posts still reference the old integration. It is listed as deprecated but still installable.
**How to avoid:** Use `@tailwindcss/vite` as a Vite plugin — no Astro integration entry needed. Only add to `vite.plugins[]`.
**Warning signs:** Tailwind utilities not applying; `tailwind.config.js` file being generated.

### Pitfall 6: Missing `remotePatterns` for S3 Assets
**What goes wrong:** Astro's `<Image />` component throws an error or refuses to process images from `*.amazonaws.com` domains.
**Why it happens:** Astro requires explicit allowlist for remote image domains as a security measure.
**How to avoid:** Add `remotePatterns: [{ protocol: 'https', hostname: '**.amazonaws.com' }]` to the `image` config in `astro.config.mjs` from the start.
**Warning signs:** Image component errors referencing unauthorized remote domains.

---

## Code Examples

Verified patterns from official sources and verified community implementations:

### Keystatic Config: All Five Content Types

```typescript
// keystatic.config.ts
// Source: https://keystatic.com/docs/installation-astro + https://keystatic.com/docs/collections
import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },

  collections: {
    projects: collection({
      label: 'Projects',
      slugField: 'title',
      path: 'src/content/projects/*',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.markdoc({ label: 'Description' }),
        techStack: fields.array(
          fields.text({ label: 'Technology' }),
          { label: 'Tech Stack', itemLabel: (props) => props.fields.value.value }
        ),
        media: fields.url({ label: 'Media URL (S3)', validation: { isRequired: false } }),
        links: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            url: fields.url({ label: 'URL' }),
          }),
          { label: 'Links', itemLabel: (props) => props.fields.label.value }
        ),
        year: fields.integer({ label: 'Year' }),
      },
    }),

    posts: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'body' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        body: fields.markdoc({ label: 'Body' }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { label: 'Tags', itemLabel: (props) => props.fields.value.value }
        ),
        coverImage: fields.image({ label: 'Cover Image', directory: 'src/assets/images/posts', publicPath: '@assets/images/posts/' }),
        draft: fields.checkbox({ label: 'Draft', defaultValue: true }),
        excerpt: fields.text({ label: 'Excerpt', multiline: true }),
        publishedDate: fields.date({ label: 'Published Date' }),
      },
    }),

    podcasts: collection({
      label: 'Podcasts',
      slugField: 'name',
      path: 'src/content/podcasts/*',
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        link: fields.url({ label: 'Link' }),
        coverImage: fields.image({ label: 'Cover Image', directory: 'src/assets/images/podcasts', publicPath: '@assets/images/podcasts/' }),
        category: fields.text({ label: 'Category' }),
      },
    }),

    books: collection({
      label: 'Books',
      slugField: 'title',
      path: 'src/content/books/*',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        author: fields.text({ label: 'Author' }),
        coverImage: fields.image({ label: 'Cover Image', directory: 'src/assets/images/books', publicPath: '@assets/images/books/' }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Reading', value: 'reading' },
            { label: 'Read', value: 'read' },
            { label: 'Want to Read', value: 'want-to-read' },
          ],
          defaultValue: 'want-to-read',
        }),
        note: fields.text({ label: 'Note', multiline: true }),
      },
    }),
  },

  singletons: {
    bio: singleton({
      label: 'Bio',
      path: 'src/content/bio',
      format: { contentField: 'body' },
      schema: {
        body: fields.markdoc({ label: 'Bio Content' }),
      },
    }),
  },
});
```

### Astro Content Config: Matching Zod Schemas

```typescript
// src/content.config.ts
// Source: https://docs.astro.build/en/guides/content-collections/
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{mdoc,yaml}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    techStack: z.array(z.string()).default([]),
    media: z.string().url().optional(),
    links: z.array(z.object({
      label: z.string(),
      url: z.string().url(),
    })).default([]),
    year: z.number().int(),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    draft: z.boolean().default(false),
    excerpt: z.string().optional(),
    publishedDate: z.coerce.date(),
  }),
});

const podcasts = defineCollection({
  loader: glob({ pattern: '**/*.{mdoc,yaml}', base: './src/content/podcasts' }),
  schema: z.object({
    name: z.string(),
    link: z.string().url(),
    coverImage: z.string().optional(),
    category: z.string().optional(),
  }),
});

const books = defineCollection({
  loader: glob({ pattern: '**/*.{mdoc,yaml}', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    coverImage: z.string().optional(),
    status: z.enum(['reading', 'read', 'want-to-read']).default('want-to-read'),
    note: z.string().optional(),
  }),
});

export const collections = { projects, posts, podcasts, books };
```

### Using getCollection() in an Astro Page

```astro
---
// src/pages/portfolio/index.astro
// Source: https://docs.astro.build/en/guides/content-collections/
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

const projects = await getCollection('projects');
---
<BaseLayout title="Portfolio">
  {projects.map((project) => (
    <article>
      <h2>{project.data.title}</h2>
      <p>{project.data.year}</p>
    </article>
  ))}
</BaseLayout>
```

### Theme Toggle Component

```astro
---
// src/components/ThemeToggle.astro
// Pattern source: https://tailwindcss.com/docs/dark-mode (three-way toggle)
---
<button id="theme-toggle" aria-label="Toggle dark mode">
  <span class="sun-icon dark:hidden">☀</span>
  <span class="moon-icon hidden dark:inline">☽</span>
</button>

<script>
  const button = document.getElementById('theme-toggle');
  button?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
</script>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@astrojs/tailwind` integration | `@tailwindcss/vite` Vite plugin | Tailwind v4 (2025) | Do not install the old integration — it is explicitly deprecated for v4 |
| `tailwind.config.js` for theming | `@theme` directive in CSS | Tailwind v4 (2025) | No JavaScript config file needed; all configuration lives in CSS |
| `darkMode: 'class'` in tailwind config | `@custom-variant dark (&:where(.dark, .dark *))` in CSS | Tailwind v4 (2025) | Class-based dark mode still works but configured in CSS |
| `output: 'hybrid'` in Astro | Deprecated; default behavior is now `output: 'static'` with per-route prerendering | Astro v5 (Dec 2024) | Simpler config; hybrid is now just the default |
| Astro content config at `src/content/config.ts` | Now at `src/content.config.ts` (one level up) | Astro v5 (Dec 2024) | File location changed; old location may still work but is not documented |

**Deprecated/outdated:**
- `@astrojs/tailwind`: Do not use with Tailwind v4. Deprecated. Use `@tailwindcss/vite`.
- `tailwind.config.js`: Not created or needed in Tailwind v4 unless overriding specific behaviors.
- `src/content/config.ts`: The content config file is now `src/content.config.ts` (root of src/).
- `output: 'hybrid'` in astro.config.mjs: No longer a valid value as of Astro v5.

---

## Open Questions

1. **Keystatic image fields vs. direct S3 URL fields**
   - What we know: Keystatic `fields.image()` stores images locally in `src/assets/` (processed by Astro Image). S3 URLs from the existing site are external URLs.
   - What's unclear: Should the `media` field in Projects and `coverImage` fields use `fields.image()` (uploads to src/assets, loses S3 hosting benefit) or `fields.url()` (keeps S3 URLs, loses Astro image optimization)?
   - Recommendation: Use `fields.url()` for the S3-hosted `media` field on Projects (video/hero assets), use `fields.image()` for `coverImage` on Posts/Podcasts/Books (images benefit from Astro optimization). This is a design decision for the planner to make explicit.

2. **Bio singleton — getCollection() vs. direct file read**
   - What we know: Keystatic singletons write to a single file, not a collection directory. Astro's `getCollection()` works with collections, not singletons.
   - What's unclear: The most ergonomic way to read singleton data in an Astro page. Options are: Keystatic Reader API, or treating bio as a single-entry collection.
   - Recommendation: Use Keystatic's Reader API for the bio singleton in dev; for build output, treat bio as a one-entry collection with `getCollection('bio')` returning a single item. Needs verification against the Keystatic Reader docs.

3. **Contrast ratio validation for exact hex values**
   - What we know: #fdf6e3 / #3c3836 and #1d2021 / #ebdbb2 are user-specified approximations of Gruvbox colors.
   - What's unclear: Exact contrast ratios for these pairs. Historical Gruvbox does not meet WCAG AA.
   - Recommendation: Verify at https://webaim.org/resources/contrastchecker/ as the first task in the phase. Adjust if ratios are below 4.5:1. The success criteria (FOUN-03) requires this before any content is entered.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected in current project |
| Config file | None — to be created in Wave 0 |
| Quick run command | TBD — depends on selected framework |
| Full suite command | TBD — depends on selected framework |

**Note:** This is a frontend/Astro project with no existing test infrastructure. The most appropriate validation for this phase is build-time verification (does `astro build` succeed?) and browser-based manual verification of dark mode behavior and contrast ratios. Formal unit testing is not standard practice for Astro layout/theming tasks. The Keystatic schema validation is handled by Zod at build time — this is the automated gate.

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUN-01 | Mobile-first responsive layout renders correctly | Manual + `astro build` | `npm run build && npm run preview` | N/A — verified by build success |
| FOUN-02 | Dark/light toggle works; system preference detected; no FOUC | Manual browser test | N/A — requires browser interaction | N/A |
| FOUN-03 | Color contrast ≥4.5:1 in both modes | Manual contrast checker | N/A — use https://webaim.org/resources/contrastchecker/ | N/A |
| (Schema) | Malformed content entries rejected at build | Automated — Zod at build time | `npm run build` (fails with descriptive error on invalid content) | ❌ Wave 0: create sample content entries |
| (CMS) | Keystatic admin accessible at /keystatic locally | Manual browser test | `npm run dev` then visit http://localhost:4321/keystatic | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` — confirms Astro compiles without errors and Zod schemas validate
- **Per wave merge:** Full manual browser test of dark mode, contrast, and /keystatic admin
- **Phase gate:** All success criteria manually verified before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Create at least one sample content entry per collection (required for `getCollection()` to return data in the success criteria test)
- [ ] Verify contrast ratios for the selected color palette before implementation proceeds
- [ ] No test framework setup needed — Zod at build time + manual browser verification is the appropriate strategy for this phase

---

## Sources

### Primary (HIGH confidence)
- https://tailwindcss.com/docs/dark-mode — Tailwind v4 @custom-variant dark mode syntax
- https://tailwindcss.com/docs/theme — @theme directive, CSS custom properties
- https://tailwindcss.com/docs/installation/framework-guides/astro — Tailwind v4 Astro setup (official)
- https://keystatic.com/docs/installation-astro — Keystatic Astro installation (official)
- https://keystatic.com/docs/collections — Keystatic field types (official)
- https://keystatic.com/docs/singletons — Keystatic singleton definition (official)
- https://keystatic.com/docs/recipes/astro-disable-admin-ui-in-production — Conditional integration pattern (official)
- https://keystatic.com/docs/recipes/astro-images — Keystatic image field + Astro Image component (official)
- https://docs.astro.build/en/guides/content-collections/ — Astro content collections, Zod schema, getCollection() (official)
- https://docs.astro.build/en/guides/cms/keystatic/ — Astro's official Keystatic integration guide
- npm registry — version dates confirmed 2026-03-20: astro@6.0.8, tailwindcss@4.2.2, @keystatic/core@0.5.48 (published 2026-02-25), @keystatic/astro@5.0.6 (published 2026-02-25)

### Secondary (MEDIUM confidence)
- https://jankraus.net/2025/02/25/a-simple-guide-to-using-astro-with-keystatic/ — Confirmed conditional integration pattern and local storage behavior (Feb 2025, verified against official docs)
- https://webaim.org/resources/contrastchecker/ — WCAG AA contrast requirements (4.5:1 for normal text)

### Tertiary (LOW confidence)
- Multiple community sources on Solarized/Gruvbox WCAG compliance — consistent finding that stock palettes do not pass AA without adjustment; exact ratios for the user-specified hex values unverified

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry on 2026-03-20; Keystatic last publish date confirmed active (2026-02-25)
- Architecture: HIGH — patterns drawn from official Astro and Tailwind v4 docs; Keystatic conditional integration from official recipe
- Pitfalls: HIGH for stack configuration pitfalls (verified against official docs); MEDIUM for color contrast (specific hex values not tested against checker)
- Keystatic field API: MEDIUM — field types confirmed from official docs but some specific field configurations (array item labels) drawn from community examples

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (30 days — stack is relatively stable; Keystatic has regular but not daily releases)

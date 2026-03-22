# Phase 02: Core Pages - Research

**Researched:** 2026-03-22
**Domain:** Astro 6 content pages, Keystatic CMS, Vercel Analytics, Astro Icon + Iconify
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Blog migration**
- D-01: Manually create 3 `.mdoc` files in `src/content/posts/` with real content from blog.neporshiso.com (Gatsby). Copy content, convert to Markdoc format, fill all schema fields (title, publishedDate, excerpt, tags). No automated migration tooling.

**Content population**
- D-02: Use real content for all collections, not placeholder data.
- D-03: Blog: 3 real migrated posts from the Gatsby blog.
- D-04: Bio: keep/update existing content in `src/content/bio/index.mdoc`.
- D-05: Books and Podcasts: seed with 2-3 real entries each.
- D-06: Portfolio: starts empty — 4 projects on old site NOT carried over. Empty state copy from UI-SPEC applies.

**Social/contact links data source**
- D-07: Create a Keystatic singleton called `social` with structured fields: `email` (string), `github` (URL), `linkedin` (URL), and a flexible `links` array (label + URL). Both ContactSection and about page social row read from the same source. Satisfies CONT-04.

**Media assets**
- D-08: All media assets stored locally in `/public/assets/` with subfolder structure. S3 bucket deprecated — no remote image/video URLs.
- D-09: Images can use Astro's `<Image>` component for optimization since files are local.
- D-10: Video: native HTML5 `<video>` with `controls`, `preload="metadata"`, `playsinline`. Referenced by relative path in CMS entries (e.g. `/assets/projects/my-project-hero.mp4`).
- D-11: Migrate any existing S3-hosted assets needed (e.g. resume PDF, bio photo) to `/public/assets/` during this phase.

### Claude's Discretion
- `/public/assets/` subfolder naming convention
- Exact Keystatic `social` singleton field configuration details
- How to structure the Markdoc content for migrated blog posts (heading levels, formatting)
- Whether to use Astro `<Image>` vs plain `<img>` for specific contexts (cards vs detail pages)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONT-01 | User can edit about/bio content through CMS without code changes | Bio singleton already in Keystatic + content.config.ts; about.astro reads it. Update page layout + font fix. |
| CONT-02 | User can add/edit portfolio projects through CMS with rich write-ups | Projects collection defined; need `/portfolio` listing page + `/portfolio/[slug]` dynamic route. |
| CONT-04 | Social and contact links are CMS-managed | Requires new `social` Keystatic singleton + matching collection in content.config.ts. |
| CONT-05 | User can add/edit favorite podcasts through CMS (name, description, link, image) | Podcasts collection defined; need `/podcasts` page + PodcastCard component. |
| CONT-06 | User can add/edit books through CMS with reading status | Books collection defined; need `/books` page + BookCard component. |
| ANLY-01 | Working analytics replaces dead UA property | Install @vercel/analytics@2.0.1; add `<Analytics />` to BaseLayout head. |
</phase_requirements>

---

## Summary

Phase 2 builds on a fully operational Phase 1 foundation (Astro 6, Tailwind v4, Keystatic, dark mode, responsive nav). All 5 content collection schemas are already defined in `content.config.ts` and `keystatic.config.ts`. What's missing is: (1) the page files themselves (`/portfolio`, `/portfolio/[slug]`, `/podcasts`, `/books`, rewritten `index.astro`), (2) the UI components (BlogEntry, ProjectCard, PodcastCard, BookCard, ContactSection), (3) the `social` singleton in Keystatic + content config, (4) Vercel Analytics installation, (5) Nav contextual site name prop wiring, and (6) real content in every collection.

The UI-SPEC is fully approved and prescribes exact component specs, copy, spacing, color, and layout for every page. No design decisions remain — implementation follows the spec directly. The most structurally significant change is that Nav needs a `siteTitle` prop and BaseLayout needs to pass it through; every page then passes its own contextual title string.

Two new npm packages are needed: `astro-icon@1.1.5` + `@iconify-json/ph@1.2.2` (Phosphor icons for social links in ContactSection/about), and `@vercel/analytics@2.0.1` (analytics). The Keystatic `media` field in the projects collection currently references a `.url()` field with S3 in mind — it needs updating to a `fields.text()` referencing a relative local path since S3 is deprecated.

**Primary recommendation:** Work in 5 waves: (1) infrastructure changes (nav prop, BaseLayout, Analytics install, Keystatic social singleton, projects media field fix), (2) components (BlogEntry, ProjectCard, PodcastCard, BookCard, ContactSection), (3) page files (homepage, about update, portfolio listing + detail, podcasts, books), (4) real content population, (5) smoke test on mobile 375px.

---

## Standard Stack

### Core (already installed — no action)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | 6.0.8 | Static site framework | Phase 1 foundation |
| @astrojs/markdoc | 1.0.2 | Markdoc rendering via `render()` | Phase 1 foundation |
| @keystatic/astro | 5.0.6 | CMS integration | Phase 1 foundation |
| @keystatic/core | 0.5.48 | CMS schema + UI | Phase 1 foundation |
| tailwindcss | 4.2.2 | Utility CSS | Phase 1 foundation |

### New installs required
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| @vercel/analytics | 2.0.1 | Page view analytics (ANLY-01) | Official Vercel package; Astro-specific component `@vercel/analytics/astro` available since 1.4.0 |
| astro-icon | 1.1.5 | Icon component for Iconify sets | Astro-native SVG icon integration; no runtime JS |
| @iconify-json/ph | 1.2.2 | Phosphor Icons icon set (devDependency) | UI-SPEC specifies Phosphor Icons; ph: prefix |

**Installation:**
```bash
npm install @vercel/analytics
npm install astro-icon
npm install -D @iconify-json/ph
```

**Note:** `@iconify-json/ph` should be a devDependency — it's bundled at build time into inline SVGs by `astro-icon`, not shipped as a runtime package.

**astro-icon requires adding the integration to `astro.config.mjs`:**
```typescript
import icon from 'astro-icon';
// add to integrations array: icon()
```

**Version verification (checked 2026-03-22 against npm registry):**
- `@vercel/analytics`: 2.0.1 (latest)
- `astro-icon`: 1.1.5 (latest)
- `@iconify-json/ph`: 1.2.2 (latest)

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @vercel/analytics | Plausible | Plausible requires separate hosting/account; Vercel Analytics is zero-config on Vercel — UI-SPEC designates Vercel as preferred |
| astro-icon | Inline SVG manually | Hand-rolling 6+ SVGs in components; astro-icon eliminates maintenance burden and keeps icons as Tailwind-styleable SVGs |

---

## Architecture Patterns

### Project Structure After Phase 2

```
src/
├── components/
│   ├── Nav.astro            # MODIFY: accept siteTitle prop, pass to site name link
│   ├── Footer.astro         # no changes
│   ├── ThemeToggle.astro    # no changes
│   ├── BlogEntry.astro      # NEW: post list item
│   ├── ProjectCard.astro    # NEW: portfolio card
│   ├── PodcastCard.astro    # NEW: podcast card
│   ├── BookCard.astro       # NEW: book card
│   └── ContactSection.astro # NEW: CTA + social links
├── layouts/
│   └── BaseLayout.astro     # MODIFY: accept + pass siteTitle prop, add <Analytics />
├── pages/
│   ├── index.astro          # REWRITE: blog listing
│   ├── about.astro          # MODIFY: layout, social links, font-bold fix
│   ├── portfolio/
│   │   ├── index.astro      # NEW: portfolio listing
│   │   └── [slug].astro     # NEW: project detail dynamic route
│   ├── podcasts/
│   │   └── index.astro      # NEW: podcasts listing
│   └── books/
│       └── index.astro      # NEW: books listing
├── content/
│   ├── posts/               # ADD: 3 real .mdoc files (delete sample-post.mdoc)
│   ├── social/              # NEW: social singleton data file
│   ├── projects/            # ADD: keep empty (no portfolio seeding per D-06)
│   ├── podcasts/            # ADD: 2-3 real .mdoc entries (replace sample)
│   └── books/               # ADD: 2-3 real .mdoc entries (replace sample)
├── content.config.ts        # ADD: social singleton collection
└── keystatic.config.ts      # ADD: social singleton; FIX: projects media field
public/
└── assets/
    ├── projects/            # video files if/when added later
    ├── books/               # book cover images
    └── podcasts/            # podcast cover images
```

### Pattern 1: Contextual Site Name via Props

**What:** Nav receives `siteTitle` from BaseLayout which receives it from each page. Current Nav has hardcoded "Nep".

**When to use:** Every page must pass its specific site name string per UI-SPEC Navigation Contract.

**Implementation:**

```astro
// BaseLayout.astro — add siteTitle to Props interface
interface Props {
  title: string;
  description?: string;
  siteTitle?: string;
}
const { title, description = "Nep's personal website", siteTitle = "nep's home on the web" } = Astro.props;
// Pass to Nav:
<Nav siteTitle={siteTitle} />
```

```astro
// Nav.astro — accept and render siteTitle
interface Props {
  siteTitle?: string;
}
const { siteTitle = "nep's home on the web" } = Astro.props;
// Replace hardcoded "Nep" with {siteTitle}
```

```astro
// Each page passes its own title:
<BaseLayout title="Portfolio — Nep" siteTitle="nep's portfolio">
```

### Pattern 2: Astro Dynamic Route for Project Detail

**What:** `/portfolio/[slug].astro` uses `getStaticPaths()` to generate one page per project.

**When to use:** Any collection that needs per-item detail pages.

```astro
// src/pages/portfolio/[slug].astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { slug: project.id },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await render(project);
---
<BaseLayout title={`${project.data.title} — nep's portfolio`} siteTitle="nep's portfolio">
  <!-- project detail layout per UI-SPEC -->
</BaseLayout>
```

**Note:** Use `project.id` not `project.slug` — in Astro v5 Content Layer API the stable identifier is `id`. The glob loader sets `id` to the file path relative to base (e.g. `my-project.mdoc` → `id = "my-project"`). This matches what the URL slug should be.

### Pattern 3: Filtering Draft Posts

**What:** Blog listing must only show published posts (draft: false).

```astro
const allPosts = await getCollection('posts');
const published = allPosts.filter((post) => !post.data.draft);
const sorted = published.sort(
  (a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf()
);
```

### Pattern 4: Social Singleton Loading

**What:** `social` singleton is a Keystatic singleton (single file, not a collection). Loaded via `getCollection` using glob loader (same pattern as bio — confirmed working in Phase 1).

```astro
// Reading social singleton (same glob-as-collection pattern used for bio)
const socialEntries = await getCollection('social');
const social = socialEntries[0];
// social.data.email, social.data.github, social.data.linkedin, social.data.links
```

### Pattern 5: Astro `<Image>` for Local Assets

**What:** Local images in `/public/assets/` can be referenced with a plain `<img>` tag using the public path directly. However, images that are in `src/` can use Astro's `<Image>` component for optimization. Since D-08 places assets in `/public/assets/`, they are NOT processed by Astro's image optimizer — they're served statically.

**Decision (Claude's discretion):** Use plain `<img>` with `loading="lazy"` for card images sourced from `/public/assets/`. Use `<Image>` only if images are placed in `src/assets/` (which requires a schema change). Given D-08 locks assets to `/public/assets/`, use plain `<img>` throughout.

**Rationale:** `/public/` files bypass Astro's build pipeline. `<Image>` only optimizes images it can process at build time (files in `src/` or remote URLs with configured `remotePatterns`). Forcing `/public/` images through `<Image>` will error.

```astro
// For card images from /public/assets/:
<img
  src={entry.data.coverImage}
  alt={entry.data.name}
  loading="lazy"
  class="w-16 h-16 rounded-md object-cover"
/>
```

### Pattern 6: Vercel Analytics in Astro

**What:** `@vercel/analytics` v2.0.1 provides a framework-specific Astro component. Place in `<head>` of BaseLayout.

```astro
---
// BaseLayout.astro
import Analytics from '@vercel/analytics/astro';
---
<html lang="en">
  <head>
    <!-- Anti-flash script FIRST -->
    <script is:inline>...</script>
    <Analytics />
    <!-- other head content -->
  </head>
```

**Source:** Official Vercel Analytics documentation, verified 2026-03-22.

### Pattern 7: Astro Icon Usage

```astro
---
import { Icon } from 'astro-icon/components';
---
<Icon name="ph:github-logo" class="w-5 h-5" aria-hidden="true" />
```

Integration must be added to `astro.config.mjs`:
```typescript
import icon from 'astro-icon';
// integrations: [react(), markdoc(), icon(), ...(isProduction ? [] : [keystatic()])]
```

### Anti-Patterns to Avoid

- **Using `entry.render()` instance method:** Astro v5 uses standalone `render(entry)` import from `astro:content`, not `entry.render()`. Already confirmed in Phase 1 (key decision in STATE.md).
- **Using `entry.slug` for route params:** Astro v5 Content Layer API uses `entry.id`. The `slug` property no longer exists on collection entries.
- **Overriding `max-w-3xl mx-auto px-4` per page:** BaseLayout owns the content column constraint. Pages must not add their own wrapper with different max-width.
- **Using `font-bold` (700) in new components:** Only Regular (400) and Semibold (600) are used. The existing `about.astro` must be patched from `font-bold` → `font-semibold`.
- **Using accent color `#b57614` for normal-size text:** Only use `#d79921` for interactive inline text in light mode. `#b57614` is large-text only (contrast 3.5:1 fails AA for normal text).
- **Putting `<Analytics />` after the anti-flash script but before `<meta charset>`:** The anti-flash script must remain the absolute first child of `<head>`. `<Analytics />` goes after it but it does not need to precede `<meta charset>`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Analytics tracking | Custom GA snippet / UA tag | `@vercel/analytics` | UA property is dead; Vercel Analytics is free on Vercel, zero-config, no cookie consent required |
| SVG icons | Inline SVG strings in components | `astro-icon` + `@iconify-json/ph` | Icon version mismatches, maintenance, accessibility attributes — handled by astro-icon |
| Image optimization | Manual resizing / srcset | Astro `<Image>` (for src/ assets) or plain `<img loading="lazy">` (for public/ assets) | Astro handles optimization automatically for src/ images; public/ images are served as-is |
| Markdoc rendering | Custom parser | `@astrojs/markdoc` + `render()` | Already installed; handles headings, paragraphs, code blocks, links automatically |

**Key insight:** The stack (Astro + Keystatic + Markdoc) handles all content rendering, CMS editing, and build-time data fetching. Phase 2 is connecting existing plumbing to new page templates — not building infrastructure.

---

## Common Pitfalls

### Pitfall 1: `entry.id` vs `entry.slug` in Dynamic Routes

**What goes wrong:** Using `entry.slug` in `getStaticPaths()` returns `undefined` in Astro v5 Content Layer API, producing routes like `/portfolio/undefined`.

**Why it happens:** Astro v4 used `.slug`. Astro v5 switched to `.id`. The content layer no longer auto-generates a `slug` property.

**How to avoid:** Always use `entry.id` for route params:
```astro
return projects.map((project) => ({
  params: { slug: project.id },
  props: { project },
}));
```

**Warning signs:** 404 on all detail pages, or all detail pages resolve to the same content.

### Pitfall 2: Keystatic `fields.url()` Rejecting Relative Paths

**What goes wrong:** The projects collection currently uses `fields.url()` for the `media` field. Since D-08 deprecates S3, project media will now be relative paths like `/assets/projects/hero.mp4`. A `fields.url()` Keystatic field validates that the value is a fully-qualified URL — it will reject relative paths.

**Why it happens:** The Phase 1 schema assumed S3 URLs. Decision D-08 changes this.

**How to avoid:** Change the `media` field in `keystatic.config.ts` from `fields.url()` to `fields.text()` with a validation hint. Also update `content.config.ts` to change `z.string().url()` to `z.string()` for `media`.

```typescript
// keystatic.config.ts — projects schema
media: fields.text({ label: 'Media path (e.g. /assets/projects/hero.mp4)', validation: { isRequired: false } }),

// content.config.ts — projects schema
media: z.string().optional().nullable(),
```

**Warning signs:** Keystatic CMS UI rejects media path input; build error on schema validation.

### Pitfall 3: `getCollection('social')` Returns Empty Array Until File Exists

**What goes wrong:** `const social = socialEntries[0]` is `undefined` if no `social` singleton file exists yet. ContactSection and about page will throw on `social.data.email`.

**Why it happens:** The glob loader returns an empty array when no matching files exist. If the singleton file hasn't been created, the collection is empty.

**How to avoid:** Guard all social data reads:
```astro
const social = socialEntries[0];
const email = social?.data.email ?? '';
const github = social?.data.github ?? '';
```

Alternatively, create the `src/content/social/index.mdoc` file as part of Wave 1 so it always exists.

**Warning signs:** `Cannot read properties of undefined (reading 'data')` at build time.

### Pitfall 4: `astro.config.mjs` Integration Order with Keystatic

**What goes wrong:** Adding `icon()` integration without respecting the existing conditional `keystatic()` pattern causes Keystatic to load in production (breaking the build) or breaks dev mode.

**Why it happens:** The existing config has `...(isProduction ? [] : [keystatic()])`. New integrations added naively after `markdoc()` and before the spread operator may work but are easy to get wrong.

**How to avoid:** Place `icon()` before the conditional Keystatic spread:
```typescript
integrations: [
  react(),
  markdoc(),
  icon(),
  ...(isProduction ? [] : [keystatic()]),
],
```

### Pitfall 5: `--legacy-peer-deps` Required for Package Installs

**What goes wrong:** `npm install @vercel/analytics astro-icon` fails with peer dependency conflicts because `@keystatic/astro` hasn't updated its peer range to include Astro 6.

**Why it happens:** Documented in STATE.md from Phase 1.

**How to avoid:** Always use `--legacy-peer-deps` flag for installs in this project:
```bash
npm install @vercel/analytics astro-icon --legacy-peer-deps
npm install -D @iconify-json/ph --legacy-peer-deps
```

**Warning signs:** `npm error ERESOLVE` during install.

### Pitfall 6: astro.config.mjs `image.remotePatterns` Still References AWS

**What goes wrong:** The existing `astro.config.mjs` configures `remotePatterns` for `**.amazonaws.com`. Since D-08 removes all S3 usage, this config is now stale. It won't cause errors but is misleading, and could be flagged in a review.

**How to avoid:** Remove the `image.remotePatterns` block from `astro.config.mjs` during the infrastructure wave:
```typescript
// Remove this entire block:
image: {
  remotePatterns: [
    { protocol: 'https', hostname: '**.amazonaws.com' },
  ],
},
```

### Pitfall 7: Markdoc Blog Post Schema Requires `publishedDate`

**What goes wrong:** Creating `.mdoc` blog post files without a `publishedDate` field will fail Zod validation in `content.config.ts` because `publishedDate: z.coerce.date()` is required (no `.optional()`).

**Why it happens:** The schema was designed to always have a publish date for sorting.

**How to avoid:** Every migrated post `.mdoc` frontmatter must include `publishedDate: 'YYYY-MM-DD'`. Use the actual publish date from the original Gatsby post (or an approximation if unknown).

---

## Code Examples

Verified patterns from existing codebase and official sources:

### getCollection with filtering and sorting (blog listing)
```astro
---
// src/pages/index.astro
import { getCollection } from 'astro:content';
const allPosts = await getCollection('posts');
const posts = allPosts
  .filter((p) => !p.data.draft)
  .sort((a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf());
---
```

### Dynamic route with render() (project detail)
```astro
---
// src/pages/portfolio/[slug].astro
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { slug: project.id },
    props: { project },
  }));
}
const { project } = Astro.props;
const { Content } = await render(project);
---
<Content />
```
Source: Confirmed working pattern — Phase 1 uses `render(bio)` identically in `about.astro`.

### Vercel Analytics in BaseLayout (Astro)
```astro
---
import Analytics from '@vercel/analytics/astro';
---
<html lang="en">
  <head>
    <script is:inline>/* anti-flash */</script>
    <Analytics />
    <meta charset="utf-8" />
    ...
  </head>
```
Source: Official Vercel Analytics documentation, verified 2026-03-22.

### Astro Icon usage
```astro
---
import { Icon } from 'astro-icon/components';
---
<a href={github} target="_blank" rel="noopener noreferrer">
  <Icon name="ph:github-logo" class="w-5 h-5" aria-hidden="true" />
  <span class="sr-only">GitHub</span>
</a>
```
Source: astro-icon README, verified 2026-03-22.

### Keystatic social singleton schema
```typescript
// keystatic.config.ts — add to singletons
social: singleton({
  label: 'Social & Contact',
  path: 'src/content/social',
  format: { data: 'yaml' },
  schema: {
    email: fields.text({ label: 'Email address' }),
    github: fields.url({ label: 'GitHub URL', validation: { isRequired: false } }),
    linkedin: fields.url({ label: 'LinkedIn URL', validation: { isRequired: false } }),
    links: fields.array(
      fields.object({
        label: fields.text({ label: 'Label' }),
        url: fields.url({ label: 'URL' }),
      }),
      { label: 'Additional links', itemLabel: (props) => props.fields.label.value }
    ),
  },
}),
```

### content.config.ts social collection entry
```typescript
// content.config.ts — add to collections
const social = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/social' }),
  schema: z.object({
    email: z.string().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    links: z.array(z.object({
      label: z.string(),
      url: z.string().url(),
    })).default([]),
  }),
});
// add 'social' to export const collections = { ... }
```

### Visually hidden h1 (accessibility)
```astro
<h1 class="sr-only">nep's home on the web</h1>
```
Note: Tailwind `sr-only` class is available in Tailwind v4 and equals `position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0`.

### Active nav link detection (aria-current)
```astro
// Nav.astro — detect current page
const currentPath = Astro.url.pathname;
// In link map:
<a
  href={link.href}
  aria-current={currentPath === link.href ? 'page' : undefined}
  class:list={[
    'text-sm no-underline hover:opacity-70',
    currentPath === link.href
      ? 'text-[#d79921] dark:text-[var(--accent)]'
      : 'text-[var(--text)]'
  ]}
>
```
Note: Nav needs `Astro.url` access — it's available in Astro components via the global `Astro` object.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `entry.render()` instance method | `render(entry)` standalone import from `astro:content` | Astro v5 Content Layer API | Phase 1 confirmed — must use standalone import |
| `entry.slug` for route params | `entry.id` | Astro v5 Content Layer API | Already noted in STATE.md |
| `@astrojs/vercel` webAnalytics config | `@vercel/analytics` package with Astro component | @vercel/analytics 1.4.0+ | Direct package is cleaner, no adapter dependency |
| Google Analytics UA | Vercel Analytics | UA deprecated by Google 2023 | Vercel Analytics free on Vercel, no cookie consent |
| `fields.url()` for local paths | `fields.text()` | Decision D-08 this phase | Media field must change from url() to text() |

**Deprecated/outdated in this project:**
- `image.remotePatterns` for S3: Remove from `astro.config.mjs` (D-08 deprecates all S3 use)
- `sample-post.mdoc`, `sample-podcast.mdoc`, `sample-book.mdoc`: Delete; replace with real content (D-02)

---

## Open Questions

1. **Astro `Astro.url` availability inside Nav.astro**
   - What we know: `Astro.url` is the standard way to get the current request URL in Astro components. Nav is a component, not a layout — it should have access to `Astro.url` since it's rendered as part of a page request.
   - What's unclear: Whether `Astro.url.pathname` is correct for all routes including dynamic `/portfolio/[slug]` — the pathname will be `/portfolio/my-project`, not `/portfolio`, so the nav active state logic needs `startsWith` for portfolio sub-routes.
   - Recommendation: Use `currentPath === link.href` for exact matches, and `currentPath.startsWith('/portfolio')` for the portfolio link to highlight it on both `/portfolio` and `/portfolio/[slug]`.

2. **Social singleton: YAML vs Markdoc format**
   - What we know: Bio singleton uses `format: { contentField: 'body' }` (Markdoc with a body). Social has no body text — it's pure structured data.
   - Recommendation: Use `format: { data: 'yaml' }` for the social singleton. This produces a clean `src/content/social/index.yaml` file with no frontmatter/body split.

3. **`src/content/social/` path for singleton**
   - What we know: The bio singleton uses `path: 'src/content/bio'` (directory, not file) with format `contentField`. The Keystatic glob loader pattern `**/*.{yaml,yml}` handles YAML files.
   - Recommendation: Follow the same directory convention: `path: 'src/content/social'` in Keystatic; glob pattern `**/*.{yaml,yml}` in content.config.ts for the social collection loader.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build, dev server | Yes | v22.15.0 | — |
| npm | Package installs | Yes | (bundled with Node) | — |
| @vercel/analytics | ANLY-01 | Not installed | — | Plausible (requires account) |
| astro-icon | ContactSection, About social icons | Not installed | — | Inline SVG (more maintenance) |
| @iconify-json/ph | Phosphor Icons (astro-icon) | Not installed | — | Different icon pack |
| astro dev server | Dev/test | Yes (via `npm run dev`) | Astro 6.0.8 | — |

**Missing dependencies with no fallback:**
- `@vercel/analytics` — must be installed for ANLY-01. Plausible is the fallback per UI-SPEC but requires a separate hosted account. Vercel Analytics is preferred and available at zero cost on Vercel.

**Missing dependencies with fallback:**
- `astro-icon` + `@iconify-json/ph` — if for any reason astro-icon integration fails, inline SVG strings can substitute (ContactSection and about page social row). This is a last resort; astro-icon is standard.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test runner installed |
| Config file | None |
| Quick run command | `npm run build` (Astro build catches schema/type errors) |
| Full suite command | `npm run build && npm run preview` (visual smoke test) |

**Note:** This project has no automated test framework (no jest, vitest, playwright in package.json). Validation is build-time type checking (Zod schema validation in content collections) + visual smoke testing.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONT-01 | Bio editable via CMS, renders on /about | Build + smoke | `npm run build` (Zod validates bio schema) | ✅ src/content/bio/index.mdoc |
| CONT-02 | Portfolio project CMS → /portfolio/[slug] | Build + smoke | `npm run build` (getStaticPaths validates) | ❌ Wave 0: need /portfolio/[slug].astro |
| CONT-04 | Social links in CMS → ContactSection + about | Build + smoke | `npm run build` (Zod validates social schema) | ❌ Wave 0: need social singleton files |
| CONT-05 | Podcast CMS entries → /podcasts | Build + smoke | `npm run build` | ❌ Wave 0: need /podcasts/index.astro |
| CONT-06 | Books CMS entries → /books | Build + smoke | `npm run build` | ❌ Wave 0: need /books/index.astro |
| ANLY-01 | Analytics events on page visit | Manual smoke | Visual: browser Network tab shows `/_vercel/insights/` request | ❌ Wave 0: need @vercel/analytics installed |

### Sampling Rate
- **Per task commit:** `npm run build` — catches Zod validation errors and TypeScript errors at content boundary
- **Per wave merge:** `npm run build` + manual browser check of affected pages
- **Phase gate:** Full `npm run build` passes, all 6 pages render correctly at 375px mobile width before `/gsd:verify-work`

### Wave 0 Gaps (must exist before implementation waves)
- [ ] `src/pages/portfolio/index.astro` — covers CONT-02 listing
- [ ] `src/pages/portfolio/[slug].astro` — covers CONT-02 detail
- [ ] `src/pages/podcasts/index.astro` — covers CONT-05
- [ ] `src/pages/books/index.astro` — covers CONT-06
- [ ] `src/content/social/index.yaml` — covers CONT-04 (seed file prevents undefined errors)
- [ ] `@vercel/analytics` installed — covers ANLY-01

*(All new page files and the social seed file must be created as part of Wave 1 infrastructure)*

---

## Project Constraints (from CLAUDE.md)

No `CLAUDE.md` found in project root. No additional project-specific constraints to enforce beyond those in CONTEXT.md.

---

## Sources

### Primary (HIGH confidence)
- Astro v5 Content Layer API (confirmed via existing `content.config.ts` using glob loaders, and `about.astro` using standalone `render()`) — getCollection patterns, dynamic routes, render()
- Keystatic docs (confirmed via existing `keystatic.config.ts`) — singleton schema, fields.text vs fields.url, collection patterns
- Official Vercel Analytics docs (https://vercel.com/docs/analytics/quickstart) — Astro integration pattern, `@vercel/analytics/astro` import, `<Analytics />` in head, verified 2026-03-22
- astro-icon GitHub README (https://github.com/natemoo-re/astro-icon) — integration setup, `Icon` component import from `'astro-icon/components'`, Iconify ph: prefix, verified 2026-03-22
- npm registry — verified package versions: @vercel/analytics@2.0.1, astro-icon@1.1.5, @iconify-json/ph@1.2.2, checked 2026-03-22

### Secondary (MEDIUM confidence)
- STATE.md project history — `--legacy-peer-deps` requirement, `entry.id` vs `entry.slug` decision, `render()` standalone import
- Existing `about.astro` + `content.config.ts` — pattern confirmation for bio singleton as getCollection, render() usage

### Tertiary (LOW confidence)
- None — all critical claims verified via primary or secondary sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all package versions verified against npm registry 2026-03-22
- Architecture patterns: HIGH — most patterns confirmed from Phase 1 working code; new patterns (siteTitle prop, social singleton) follow established Astro/Keystatic conventions
- Pitfalls: HIGH — entry.id and --legacy-peer-deps confirmed from STATE.md; media field url() issue confirmed by reading existing keystatic.config.ts; remaining pitfalls follow directly from decisions

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable ecosystem — Astro, Keystatic, Vercel Analytics are not fast-moving for this use case)

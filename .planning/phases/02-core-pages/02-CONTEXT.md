# Phase 2: Core Pages - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Build all core content pages — homepage blog listing, about/bio, portfolio (listing + detail), podcasts, books, and contact — all CMS-managed via Keystatic. Migrate 3 blog posts from blog.neporshiso.com (Gatsby). Replace dead Google Analytics UA property with Vercel Analytics. Site must render correctly on 375px mobile. At the end of this phase the old site can be replaced.

</domain>

<decisions>
## Implementation Decisions

### Blog migration
- **D-01:** Manually create 3 `.mdoc` files in `src/content/posts/` with real content from blog.neporshiso.com (Gatsby). Copy content, convert to Markdoc format, fill all schema fields (title, publishedDate, excerpt, tags). No automated migration tooling — 3 posts doesn't justify it.

### Content population
- **D-02:** Use real content for all collections, not placeholder data. The site should look presentable at phase end.
- **D-03:** Blog: 3 real migrated posts from the Gatsby blog.
- **D-04:** Bio: keep/update existing content in `src/content/bio/index.mdoc`.
- **D-05:** Books and Podcasts: seed with 2-3 real entries each (actual books read, podcasts listened to).
- **D-06:** Portfolio: starts empty — the 4 projects on the old site are NOT being carried over. New projects will be added through the CMS later. The empty state copy from the UI-SPEC applies.

### Social/contact links data source
- **D-07:** Create a Keystatic singleton called `social` with structured fields: `email` (string), `github` (URL), `linkedin` (URL), and a flexible `links` array (label + URL) for any additional social links. One singleton, one place to edit — both ContactSection and about page social row read from the same source. Satisfies CONT-04 (social/contact links CMS-managed).

### Media assets
- **D-08:** All media assets stored locally in `/public/assets/` with subfolder structure (e.g. `/public/assets/projects/`, `/public/assets/books/`). S3 bucket usage is deprecated — no remote image/video URLs.
- **D-09:** Images can use Astro's `<Image>` component for optimization since files are local.
- **D-10:** Video: native HTML5 `<video>` with `controls`, `preload="metadata"`, `playsinline`. Referenced by relative path in CMS entries (e.g. `/assets/projects/my-project-hero.mp4`).
- **D-11:** Migrate any existing S3-hosted assets needed (e.g. resume PDF, bio photo) to `/public/assets/` during this phase.

### Claude's Discretion
- `/public/assets/` subfolder naming convention
- Exact Keystatic `social` singleton field configuration details
- How to structure the Markdoc content for migrated blog posts (heading levels, formatting)
- Whether to use Astro `<Image>` vs plain `<img>` for specific contexts (cards vs detail pages)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI design contract
- `.planning/phases/02-core-pages/02-UI-SPEC.md` — Complete visual and interaction contract: component inventory (BlogEntry, ProjectCard, PodcastCard, BookCard, ContactSection, SectionHeading), typography, spacing, color, navigation contract with per-page site names, copywriting (empty states, CTAs), analytics contract, icon contract

### Project requirements
- `.planning/REQUIREMENTS.md` — Phase 2 covers CONT-01, CONT-02, CONT-04, CONT-05, CONT-06, ANLY-01
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, dependency chain
- `.planning/PROJECT.md` — Core value (CMS-managed content), constraints, key decisions

### Phase 1 foundation
- `.planning/phases/01-foundation/01-CONTEXT.md` — Phase 1 decisions: color palette, dark mode, content schemas, base layout. All carried forward.

### Existing codebase (built in Phase 1)
- `src/layouts/BaseLayout.astro` — Base page layout with anti-flash script, Nav, Footer, `max-w-3xl mx-auto px-4 py-8` main content area
- `src/components/Nav.astro` — Top nav with responsive mobile menu. Needs contextual site name update per UI-SPEC Navigation Contract
- `src/components/Footer.astro` — Footer component
- `src/components/ThemeToggle.astro` — Dark/light mode toggle
- `src/content.config.ts` — All content collection schemas (projects, posts, podcasts, books, bio) with Zod validation
- `src/pages/index.astro` — Current homepage (needs replacement with blog listing)
- `src/pages/about.astro` — Current about page (needs update to match UI-SPEC, fix font-bold → font-semibold)
- `src/styles/global.css` — Global styles, CSS custom properties for theming

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BaseLayout.astro`: Base page layout — all new pages use this. Already has Nav + Footer + dark mode
- `Nav.astro`: Responsive nav with mobile hamburger menu — needs site name prop for contextual text
- `ThemeToggle.astro`: Working dark/light toggle — no changes needed
- `Footer.astro`: Footer component — may need ContactSection integration
- `content.config.ts`: All 5 collection schemas defined with Zod — ready for `getCollection()` calls

### Established Patterns
- Content loading: `getCollection('collectionName')` with glob loader (verified with bio singleton in Phase 1)
- Styling: Tailwind v4 utility classes with CSS custom properties (`var(--text)`, `var(--bg)`, `var(--border)`, etc.)
- Dark mode: `.dark` class on `<html>`, toggled by ThemeToggle, persisted in localStorage
- Layout: `max-w-3xl mx-auto px-4` content column — must not be overridden per page

### Integration Points
- `BaseLayout.astro` needs a `siteTitle` prop passed down to Nav for contextual site name
- New pages: `/portfolio`, `/portfolio/[slug]`, `/podcasts`, `/books` — all need creating as Astro page files
- Homepage (`index.astro`) needs rewrite from current state to blog listing
- `about.astro` needs update (font-bold → font-semibold per UI-SPEC)
- Keystatic config (`keystatic.config.ts`) needs `social` singleton added
- `content.config.ts` needs `social` singleton collection added
- Vercel Analytics package install + `<Analytics />` component in BaseLayout

</code_context>

<specifics>
## Specific Ideas

- S3 bucket is deprecated — all assets move to local `/public/assets/`. No remote image URLs.
- Old portfolio projects (4 on current site) are NOT being migrated. Portfolio starts fresh with CMS-added content.
- Blog posts are real content from blog.neporshiso.com — not lorem ipsum.
- Books and podcasts should be real recommendations, not samples.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-core-pages*
*Context gathered: 2026-03-22*

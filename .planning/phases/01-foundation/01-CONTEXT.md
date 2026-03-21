# Phase 1: Foundation - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Astro scaffold with Tailwind v4, Keystatic CMS setup, all content type schemas defined with Zod validation, and a BaseLayout with dark/light mode toggle. This phase delivers the infrastructure so every subsequent phase can write content and build pages without revisiting stack decisions.

</domain>

<decisions>
## Implementation Decisions

### Color palette & theming
- Warm neutral palette (Solarized/Gruvbox family): cream/warm whites for light mode, dark warm tones for dark mode
- Light mode: warm white background (~#fdf6e3), dark brown text (~#3c3836)
- Dark mode: dark warm background (~#1d2021), warm light text (~#ebdbb2)
- Accent color: Claude's discretion — pick something that complements the warm neutral palette
- System fonts only: system-ui/-apple-system stack for body, ui-monospace/Cascadia Code/Fira Code for code blocks
- Zero custom font downloads — fast LCP
- Balanced density: moderate padding, ~768px content max-width

### Dark mode behavior
- Default: detect OS preference via prefers-color-scheme
- Toggle: sun/moon icon in the header/nav bar, always visible
- Persistence: localStorage saves user's manual choice; falls back to system preference if no saved choice
- Transition: instant swap, no animation — matches minimal aesthetic
- No flash of wrong theme on first visit (inline script in <head> to apply theme before render)

### Content schema fields

**Project** (collection):
- title (required)
- description (required, rich text)
- techStack (list of strings — technology tags)
- media (image or video URL — hero asset, S3-hosted)
- links (list: label + URL — live demo, GitHub, etc.)
- year (number — when built)
- slug (auto from title)

**Post** (collection):
- title (required)
- body (MDX content)
- tags (list of strings — topic tags)
- coverImage (image — for listing cards and OG previews)
- draft (boolean — hides from published listing)
- excerpt (text — short summary for listing and meta)
- publishedDate (date, required)
- slug (auto from title)

**Bio** (singleton):
- body (single rich text / MDX field — maximum flexibility, write like a document)

**Podcast** (collection):
- name (required)
- link (URL, required)
- coverImage (image — podcast artwork)
- category (string — genre/topic tag)
- slug (auto from name)

**Book** (collection):
- title (required)
- author (required)
- coverImage (image — book cover)
- status (enum: reading | read | want-to-read)
- note (text, optional — personal review/takeaway)
- slug (auto from title)

### Base layout structure
- Multi-page routing: /, /about, /portfolio, /portfolio/[slug], /blog, /blog/[slug], /podcasts, /books
- Navigation and footer structure: Claude's discretion — pick something that fits the minimal developer aesthetic, revisited in Phase 2 UI design step
- Footer: Claude's discretion

### Claude's Discretion
- Accent color selection (must complement warm neutrals, pass WCAG AA contrast)
- Navigation visual structure (top horizontal nav is likely, but exact layout is flexible)
- Footer content and layout
- Loading skeleton design
- Exact spacing scale and typography sizing
- Keystatic admin configuration details
- Tailwind v4 theme token structure

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project requirements
- `.planning/REQUIREMENTS.md` — Full v1 requirements with traceability; Phase 1 covers FOUN-01, FOUN-02, FOUN-03
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, and dependency chain
- `.planning/PROJECT.md` — Core value statement, constraints, key decisions, out-of-scope items

### Existing codebase
- `.planning/codebase/STACK.md` — Current static HTML/CSS/JS stack being replaced
- `.planning/codebase/ARCHITECTURE.md` — Current single-page architecture for reference
- `.planning/codebase/STRUCTURE.md` — Current file layout and asset organization (S3 URLs, CDN deps)

### Stack decisions
- `.planning/STATE.md` — Stack decision: Astro 6 + Tailwind v4 + Keystatic (verify maintenance status; Sanity fallback). Blocker: check Keystatic npm publish recency before scaffolding.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No reusable code from the current static site — this is a full rebuild from scratch
- AWS S3 asset URLs (images, videos, resume PDF) referenced in current `index.html` will need to be carried over to CMS entries

### Established Patterns
- Current site uses 2-space indentation consistently — maintain this convention
- Current site uses semantic HTML5 sections — continue this in Astro components

### Integration Points
- Google Analytics UA-146861978-1 is currently active — will be replaced (Phase 2, ANLY-01)
- S3 asset URLs need `remotePatterns` config in Astro for image optimization
- Keystatic admin mounts at `/keystatic` route in Astro

</code_context>

<specifics>
## Specific Ideas

- Warm neutral palette inspired by Solarized/Gruvbox — user explicitly chose this over monochrome or cool tones
- System fonts only — user values zero font download and fast LCP over custom typography
- Design iteration happens in Phase 2 with `/gsd:ui-phase` — Phase 1 visual decisions are structural, not aesthetic

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-20*

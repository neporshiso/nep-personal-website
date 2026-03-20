# Domain Pitfalls

**Domain:** Personal developer website rebuild with CMS
**Researched:** 2026-03-20
**Confidence:** HIGH (multiple independent sources converge on the same failure modes)

---

## Critical Pitfalls

Mistakes that cause rewrites, launch failure, or permanent damage.

---

### Pitfall 1: The Rebuild That Never Ships

**What goes wrong:** The rebuild becomes a perfectionism project. New tech decisions, new design directions, new feature ideas pile up. The old site stays live because "it's not ready yet." Months pass. Sometimes years.

**Why it happens:** You have a working site, so there's no forcing function. Every new idea feels like a "quick addition." The bar for "good enough" keeps rising because you're a developer — you can always see what could be better.

**Consequences:** The existing static site continues to age while the rebuild sits in a permanent in-progress state. The CMS never gets real content. The purpose of the rebuild (keeping the site current without touching code) is never realized.

**Prevention:**
- Define a strict MVP scope before writing any code: parity with the existing site, nothing more
- Set a hard deadline to replace the live site — treat it like a real deployment
- Do not add features that aren't on the current site until after the new site is live
- "Better" ships; "perfect" doesn't

**Warning signs:**
- Adding features not on the current site before parity is reached
- Redesigning the design system mid-build
- Exploring CMS alternatives after already choosing one
- "Just one more thing" in the backlog before launch

**Phase:** Address in the very first phase — define the MVP boundary before any code is written.

---

### Pitfall 2: CMS Overkill for a Solo Content Creator

**What goes wrong:** A full API-driven headless CMS (Contentful, Sanity, Strapi) is chosen for a site with one editor (you) and a handful of content types. The architecture now requires: a separate CMS tenant, API keys in environment variables, webhook-triggered deploys, and preview mode configuration. None of this is hard, but all of it is overhead that doesn't exist on the current static site.

**Why it happens:** Headless CMS is the default recommendation in 2025 content. It's genuinely good technology — for teams, for multi-channel distribution, for complex content models. But the recommendation rarely distinguishes between a fintech startup's marketing site and a solo developer's portfolio.

**Consequences:** You maintain an external SaaS dependency indefinitely. Free tiers have limits; pricing changes over time. Migrating away from the CMS later requires rebuilding the content layer. The "no code changes needed to update content" goal is achieved, but at the cost of an always-on third-party service.

**Prevention:**
- For this project, prefer a git-based CMS (TinaCMS, Decap CMS) — content lives in the repo as Markdown/MDX, versioned alongside code, no external SaaS dependency
- If an API-driven CMS is chosen, verify the free tier is genuinely free for indefinite low-traffic use before committing
- Ask: "If this CMS shuts down or changes pricing, how hard is it to migrate?" — the answer should be "easy"

**Warning signs:**
- CMS requires a separate account/tenant with its own billing
- Content is stored in an external database you don't control
- Deployments require a webhook call from the external service

**Phase:** CMS selection decision must happen before framework scaffolding. Wrong CMS choice means refactoring data fetching patterns across every content type.

---

### Pitfall 3: Rebuilding the Content Model to Mirror the Old Site's Layout

**What goes wrong:** The current site has an "About" section, a "Skills" section, a "Portfolio" section. You model the CMS to match these visual sections exactly. Six months later, you want to reorganize the page layout — now the content model is wrong and needs a migration.

**Why it happens:** It feels natural to map CMS content types to what you see on the page. But a page layout is a presentation concern; a content model is a data concern.

**Consequences:** Content types are locked to a specific layout. Changing how portfolio items display requires changing the schema. Blog posts can't reuse project data even when they overlap.

**Prevention:**
- Model content as entities (Project, WorkExperience, Skill, Post), not as page sections (HeroSection, AboutBlock)
- Pages assemble components from content entities; content entities don't know which page they live on
- Keep content fields generic enough to be used in multiple contexts

**Warning signs:**
- A content type named "HeroSection" or "AboutPageContent"
- Fields like `homepage_order` or `show_on_resume` baked into the content model
- No way to reuse a portfolio project entry on both the portfolio page and a blog post

**Phase:** Content modeling in the CMS setup phase. Fix this before entering content — migrating a schema after content exists is painful.

---

### Pitfall 4: Flash of Wrong Theme (Dark Mode)

**What goes wrong:** You implement a dark/light mode toggle. On page load, the site flashes the wrong theme for a visible fraction of a second before JavaScript runs and applies the correct preference.

**Why it happens:** In SSR and SSG frameworks (Next.js, Astro), the server renders HTML without knowing the user's stored theme preference. The client reads `localStorage` and applies the theme class, but only after the initial paint — causing a visible flicker.

**Consequences:** The flash is jarring and makes the site feel broken. It's a detail that technically-minded visitors notice immediately and judge against the site's overall polish.

**Prevention:**
- For Next.js: use `next-themes` (under 1KB, zero dependencies) with the provider at the root layout level; render theme toggle only after `mounted` is true to prevent hydration mismatch
- For Astro: inject an inline script in `<head>` before any content renders that reads `localStorage` and sets the theme class synchronously — this runs before the browser paints
- Test by hard-refreshing with each theme set and inspecting the initial paint

**Warning signs:**
- Dark mode implemented as a CSS class toggled by a React `useState` without SSR consideration
- Theme toggle visible on initial load with the "wrong" icon before hydration

**Phase:** Dark mode implementation. Build it correctly from the start — retrofitting SSR-safe theme switching after the fact touches every layout component.

---

## Moderate Pitfalls

---

### Pitfall 5: Forgetting UA is Dead — Starting with Broken Analytics

**What goes wrong:** The current site uses Google Universal Analytics (UA-146861978-1). UA has been shut down. Historical data is gone. A rebuild that simply copies the UA tracking code will have no analytics from day one.

**Why it happens:** Tracking code gets copy-pasted from the old site without checking whether it still works.

**Consequences:** No analytics data from launch. You notice weeks later when you check the dashboard.

**Prevention:**
- Create a new GA4 property before or during the rebuild — not after launch
- Set up the GA4 measurement ID in your framework's standard place (environment variable)
- Verify events are firing against the GA4 real-time view before declaring the site live
- Consider: GA4 is significantly more complex than UA. For a personal site, simpler alternatives (Fathom, Plausible, or even Vercel Analytics) provide enough signal with zero configuration

**Warning signs:**
- Copying the old `UA-XXXXXX` tracking ID into the new codebase
- Deploying without verifying analytics is receiving hits

**Phase:** Analytics setup. Should be one task in the deployment/infrastructure phase, not an afterthought.

---

### Pitfall 6: S3 Assets Become a Broken Dependency

**What goes wrong:** The current site embeds videos and references images from AWS S3. The new site's image component needs remote pattern allowlisting for S3 URLs. Videos embedded with `<video>` tags may not translate cleanly to a component-based architecture. CORS settings on the S3 bucket may block requests from the new domain.

**Why it happens:** Asset hosting is treated as "already solved" because it worked on the old static site. The new site has different origin rules, image optimization pipelines, and component abstractions.

**Consequences:** Broken video embeds or images on launch. CORS errors only visible in production (different domain than localhost).

**Prevention:**
- Audit every S3-hosted asset used on the current site before starting the rebuild
- Decide early: keep assets on S3, move to Cloudinary/framework-native CDN, or move to the deployment platform's asset hosting
- If keeping S3: configure `remotePatterns` in Next.js image config (or equivalent) to allow your S3 bucket URL; verify CORS allows your production domain
- For videos: test the video embed component with actual S3 URLs before finishing the portfolio section

**Warning signs:**
- S3 bucket CORS config only lists `localhost` or the old domain
- Video portfolio section deferred to "do later" during the build

**Phase:** Asset strategy must be decided at project setup. Video portfolio section should be tested against real assets during that feature's phase, not at deploy time.

---

### Pitfall 7: Choosing the Framework for Its Complexity Budget, Not Your Content Budget

**What goes wrong:** Next.js App Router is selected because it's the most popular modern framework. The project ends up with Server Components, Client Components, server actions, and route handlers — all for a site that is fundamentally static content fetched at build time.

**Why it happens:** Popularity bias. Next.js occupies the most search results, tutorials, and community discussion. The app router's complexity only becomes apparent once you're deep into the build.

**Consequences:** Unnecessary architectural complexity. Debugging "why is this a server component?" instead of writing content. A heavier deployment footprint than a fully-static site requires.

**Prevention:**
- Match framework complexity to actual requirements: this site is content-first, infrequently updated, no authenticated routes, no real-time data
- Astro is the correct match for this use case: outputs pure HTML/CSS by default, JavaScript only where needed, first-class Markdown/MDX support, framework-agnostic component islands
- If Next.js is chosen anyway, use the Pages Router with `getStaticProps` for simplicity — avoid App Router unless you have a concrete reason

**Warning signs:**
- More than two `"use client"` directives in the initial scaffold
- Server actions being considered for a contact form on a static site
- Build times growing significantly as content is added

**Phase:** Framework decision. This is a setup-phase choice that is expensive to reverse.

---

### Pitfall 8: Scope Creep Under the Cover of "CMS Integration"

**What goes wrong:** Once the CMS is connected, it feels easy to add one more content type. A newsletter subscription. A speaking engagements section. A reading list. A now page. Each one is small individually, but collectively they expand the scope of the rebuild and delay feature parity with the existing site.

**Why it happens:** A working CMS integration feels productive. New content types are satisfying to build. The original site is stable so there's no urgency to ship.

**Consequences:** The rebuild never reaches parity. The original site stays up indefinitely. The CMS accumulates half-built content types that never get populated.

**Prevention:**
- Define the complete list of content types up front (bio, skills, portfolio projects, work experience, blog posts) and treat that list as frozen until the site is live
- Tag every CMS content type as either "launch blocker" or "post-launch"
- New content type ideas get added to a backlog, not the active sprint

**Warning signs:**
- Content types being added that have no equivalent on the current site
- The backlog growing faster than the "done" column
- Any work on the blog before the portfolio section is complete

**Phase:** Planning/scoping phase. The content type list must be defined and frozen before CMS setup.

---

## Minor Pitfalls

---

### Pitfall 9: Broken Internal Links After URL Structure Change

**What goes wrong:** The current site uses anchor links (`#portfolio`, `#about`) for in-page navigation. The new site may introduce actual routes (`/blog/post-slug`, `/projects/project-name`). If any external source links to the old anchor structure, those links silently break.

**Prevention:**
- Document the current site's URL structure before rebuilding
- If routes change, set up redirects in `vercel.json` or `netlify.toml`
- Keep the home page anchor IDs stable if the new site uses them for navigation

**Phase:** Deployment phase. Redirects are a deploy config concern.

---

### Pitfall 10: Forgetting to Disable the Old UA Tag Is Not Enough — Missing GA4 Data from Day One

**What goes wrong:** GA4 is created but not added to the new site's deployment. The launch happens. A week later you notice GA4 has no data.

**Prevention:** Verify GA4 is receiving hits in the Real Time view 24 hours before declaring the site live. Treat analytics verification as a launch checklist item, not an assumption.

**Phase:** Deployment/launch checklist.

---

### Pitfall 11: Minimal Aesthetic Drifting Into Visual Debt

**What goes wrong:** "Minimal" is interpreted as "no design decisions." No type scale. No spacing system. No color tokens. The site looks unfinished rather than intentionally clean. Dark mode inconsistencies accumulate because colors aren't defined as tokens.

**Prevention:**
- Define a small, complete design token set before writing the first component: font families, type scale (5-6 sizes), spacing scale, and semantic color tokens (background, text, muted, accent) in both light and dark values
- Tailwind's default scale works well for this — use it consistently rather than inventing custom values
- "Minimal" means deliberate restraint, not absence of a system

**Phase:** Initial setup/design system phase. Retrofitting tokens across components is tedious.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Project scoping | Undefined MVP boundary leads to endless rebuild | Freeze content types and feature list before writing code |
| CMS selection | API-driven CMS overkill for solo creator | Prefer git-based CMS; evaluate free tier durability |
| Content modeling | Layout-driven model instead of entity-driven model | Model entities (Project, Post), not sections (HeroBlock) |
| Framework selection | Next.js App Router complexity mismatch | Match framework to content-first, static requirements |
| Dark mode | Flash of wrong theme on SSR/SSG | Use `next-themes` or inline script in `<head>` before paint |
| Asset migration | S3 videos/images break due to CORS or missing config | Audit assets early; configure remote patterns; test CORS |
| Analytics setup | UA is dead; GA4 not configured | Create GA4 property and verify hits before launch |
| Launch | "One more thing" delays feature parity | Hard launch deadline; ship at parity, iterate after |
| Post-launch | CMS content types added but never populated | Only build content types you will actually fill |

---

## Sources

- [Headless CMS in 2025: Balancing Flexibility, SEO, and Developer Experience](https://dev.to/arkhan/headless-cms-in-2025-balancing-flexibility-seo-and-developer-experience-25lo) — MEDIUM confidence (DEV Community, independently verified against other sources)
- [The Headless CMS Trap: Architecture Wins, Operations Lose](https://www.cmswire.com/digital-experience/the-headless-cms-trap-architecture-wins-operations-lose/) — MEDIUM confidence
- [Migrating to a Headless CMS in 2026 (Complete Guide)](https://focusreactive.com/blog/cms-migration/) — MEDIUM confidence
- [Git-Backed CMS — TinaCMS with Version Control](https://tina.io/git-cms) — HIGH confidence (official TinaCMS documentation)
- [Top 12 CMS for Static Sites: An In-Depth 2025 Guide](https://www.contenttoolkit.co/blog/cms-for-static-sites) — MEDIUM confidence
- [Next.js Dark Mode Implementation: Complete next-themes Guide](https://eastondev.com/blog/en/posts/dev/20251220-nextjs-dark-mode-guide/) — MEDIUM confidence
- [How to handle dark mode — Astro Tips](https://astro-tips.dev/recipes/dark-mode/) — HIGH confidence (Astro community reference)
- [Solving Image Loading Challenges with Next.js and S3](https://medium.com/@nomanmonis8/solving-image-loading-challenges-with-next-js-and-s3-ba88d2cd32c7) — MEDIUM confidence
- [How to Migrate a Basic Website to Google Analytics 4](https://www.analyticsmania.com/post/migrate-a-basic-website-to-google-analytics-4/) — HIGH confidence (Analytics Mania is authoritative on GA)
- [Don't waste your time on a portfolio website](https://jkettmann.com/dont-waste-your-time-on-a-portfolio-website/) — MEDIUM confidence
- [Avoid CMS Migration Failure: 5 Critical Mistakes](https://www.unimity.com/insights/cms-migration-mistakes) — MEDIUM confidence

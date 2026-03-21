---
phase: 01-foundation
plan: 01
subsystem: ui
tags: [astro, tailwindcss, keystatic, dark-mode, wcag, responsive]

# Dependency graph
requires: []
provides:
  - Astro 6.0.8 project scaffold with Tailwind v4 via @tailwindcss/vite
  - Keystatic CMS integrated conditionally (dev only, excluded in production build)
  - BaseLayout with anti-flash dark mode script, Nav, Footer, and slot
  - ThemeToggle component with localStorage persistence and system preference detection
  - Warm neutral color palette (Gruvbox-inspired) with WCAG AA verified contrast ratios
  - Responsive mobile-first navigation with hamburger menu
  - npm run build exits 0; dev server runs at localhost:4321
affects:
  - 01-02 (Keystatic schema and content collections built on top of this foundation)
  - All phases (depend on BaseLayout, CSS tokens, build pipeline)

# Tech tracking
tech-stack:
  added:
    - astro@6.0.8
    - tailwindcss@4.2.2 (via @tailwindcss/vite — NOT deprecated @astrojs/tailwind)
    - "@keystatic/core@0.5.48"
    - "@keystatic/astro@5.0.6"
    - "@astrojs/react@5.0.1"
    - "@astrojs/markdoc@1.0.2"
    - react@19 + react-dom@19 (peer deps for @astrojs/react)
  patterns:
    - Tailwind v4 @custom-variant dark mode (class-based, no tailwind.config.js)
    - CSS custom properties for theme tokens (--bg, --text, etc.) switching under .dark
    - Anti-flash inline script as first head child (is:inline, synchronous)
    - Conditional Keystatic integration via NODE_ENV === 'production' check

key-files:
  created:
    - astro.config.mjs
    - src/styles/global.css
    - src/layouts/BaseLayout.astro
    - src/components/ThemeToggle.astro
    - src/components/Nav.astro
    - src/components/Footer.astro
    - src/pages/index.astro
    - package.json
    - tsconfig.json
  modified: []

key-decisions:
  - "Used --legacy-peer-deps to install @keystatic/astro which declares peer astro@2||3||4||5 but works with Astro 6"
  - "Accent color #b57614 only for large text/decorative in light mode (3.50:1); use #d79921 for normal-text links (5.13:1 on dark bg)"
  - "react + react-dom installed as explicit deps (required by @astrojs/react, not auto-installed)"
  - "Anti-flash script placed as literal first child of <head> using is:inline for synchronous execution"

patterns-established:
  - "Pattern 1: Tailwind v4 dark mode via @custom-variant dark in CSS, toggled by .dark class on <html>"
  - "Pattern 2: Anti-flash script — first child of <head>, is:inline, reads localStorage + prefers-color-scheme"
  - "Pattern 3: BaseLayout as single source of truth for page structure (Nav, main, Footer, CSS import)"

requirements-completed: [FOUN-01, FOUN-02, FOUN-03]

# Metrics
duration: 7min
completed: 2026-03-21
---

# Phase 1 Plan 01: Foundation Summary

**Astro 6 + Tailwind v4 scaffold with Keystatic CMS (dev-only), BaseLayout with anti-flash dark mode toggle, and WCAG AA-verified warm neutral palette**

## Performance

- **Duration:** ~7 minutes
- **Started:** 2026-03-21T02:42:58Z
- **Completed:** 2026-03-21T02:50:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Astro 6.0.8 project with Tailwind v4 (CSS-first @theme, no tailwind.config.js) building and serving correctly
- BaseLayout with synchronous anti-flash script preventing wrong-theme flash on page load, plus responsive Nav and Footer
- Keystatic CMS conditionally integrated: active in dev (admin at /keystatic), excluded from production static build
- WCAG AA contrast ratios verified programmatically: light mode 10.75:1, dark mode 11.95:1 — both exceed 4.5:1 requirement

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Astro project with Tailwind v4 and Keystatic** - `0e8980f` (feat)
2. **Task 2: Create BaseLayout, ThemeToggle, Nav, Footer, and index page** - `17e4ac6` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `astro.config.mjs` - Astro + Tailwind v4 vite plugin + conditional Keystatic + S3 remotePatterns
- `package.json` - All dependencies including react/react-dom peer deps
- `tsconfig.json` - Extends astro/tsconfigs/strict (unchanged from scaffold)
- `src/styles/global.css` - Tailwind v4 @theme tokens, @custom-variant dark, WCAG contrast comment
- `src/layouts/BaseLayout.astro` - Anti-flash script, Nav, main slot, Footer; imports global.css
- `src/components/ThemeToggle.astro` - Sun/moon button with localStorage persistence, 44px tap target
- `src/components/Nav.astro` - Horizontal nav with all routes, mobile hamburger menu
- `src/components/Footer.astro` - Centered copyright footer with muted text
- `src/pages/index.astro` - Placeholder index using BaseLayout

## Decisions Made

- **--legacy-peer-deps for Keystatic:** @keystatic/astro@5.0.6 declares peer `astro@"2 || 3 || 4 || 5"` but works with Astro 6 in practice. Used --legacy-peer-deps to resolve. Monitor for a future Keystatic release that explicitly supports Astro 6.
- **Accent color split:** #b57614 (3.50:1 on light bg) only for large text; #d79921 for any normal-text links in light mode needing full AA. Both documented in global.css header comment.
- **react + react-dom explicit install:** @astrojs/react requires them as peer deps but npm didn't auto-install with --legacy-peer-deps; added explicitly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed react and react-dom missing peer dependencies**
- **Found during:** Task 1 (first build attempt)
- **Issue:** `npm run build` failed with "Cannot find package 'react-dom'" — @astrojs/react requires react+react-dom as peers but they were not auto-installed
- **Fix:** Ran `npm install react react-dom --legacy-peer-deps`
- **Files modified:** package.json, package-lock.json
- **Verification:** Build succeeds with exit code 0
- **Committed in:** 0e8980f (Task 1 commit)

**2. [Rule 3 - Blocking] Used --legacy-peer-deps for Keystatic peer dependency conflict**
- **Found during:** Task 1 (initial npm install)
- **Issue:** @keystatic/astro@5.0.6 declares peer `astro@"2 || 3 || 4 || 5"`, blocking install with Astro 6
- **Fix:** Used `npm install ... --legacy-peer-deps` — the package is functionally compatible (published 2026-02-25, just missing the version range update)
- **Files modified:** package.json, package-lock.json
- **Verification:** All integrations load correctly; build exits 0
- **Committed in:** 0e8980f (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 3 - blocking dependency issues)
**Impact on plan:** Both fixes were required to unblock installation and build. No scope creep.

## Issues Encountered

- Astro scaffold into non-empty directory redirected to a temp directory name; manually moved files from /tmp/astro-scaffold/ to project root while preserving .planning/ and .claude/
- @keystatic/astro peer dependency range hasn't been updated to include Astro 6 yet — documented for monitoring

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Build pipeline ready: `npm run build` exits 0, dev server starts at localhost:4321
- BaseLayout ready for all subsequent page content
- Global CSS tokens established — all future components use `var(--bg)`, `var(--text)`, `text-[var(--text)]`, etc.
- Keystatic admin accessible at http://localhost:4321/keystatic in dev mode
- Content collection schemas (Keystatic + Astro) are next in plan 01-02

## Self-Check: PASSED

All created files verified on disk. Both task commits (0e8980f, 17e4ac6) confirmed in git log.

---
*Phase: 01-foundation*
*Completed: 2026-03-21*

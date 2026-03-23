---
phase: 03-blog
plan: "01"
subsystem: blog
tags: [shiki, syntax-highlighting, gruvbox, reading-time, markdoc]
dependency_graph:
  requires: []
  provides: [shiki-dual-theme, reading-time-display]
  affects: [src/pages/thoughts/[slug].astro, markdoc.config.mjs, src/styles/global.css]
tech_stack:
  added: []
  patterns:
    - Shiki dual-theme via @astrojs/markdoc/shiki extension with gruvbox-light-hard/gruvbox-dark-hard
    - CSS custom property overrides (.dark .astro-code) for class-based dark mode theme switching
    - Reading time calculated at build time from post.body word count (200 wpm, min 1 min)
key_files:
  created:
    - markdoc.config.mjs
  modified:
    - src/styles/global.css
    - src/pages/thoughts/[slug].astro
decisions:
  - Corrected gruvbox-light to gruvbox-light-hard (gruvbox-light is not a valid Shiki v4 theme ID)
metrics:
  duration: 5 minutes
  completed: 2026-03-23
  tasks: 2
  files: 3
---

# Phase 03 Plan 01: Blog Syntax Highlighting and Reading Time Summary

**One-liner:** Shiki dual-theme code blocks (gruvbox-light-hard/gruvbox-dark-hard) with CSS class-based dark mode switching and build-time reading time on detail pages.

## What Was Built

### Task 1: Shiki dual-theme syntax highlighting for Markdoc
Created `markdoc.config.mjs` in the project root with `@astrojs/markdoc/shiki` extension configured for Gruvbox dual themes. Added `.astro-code` base styles and `.dark .astro-code` CSS variable overrides to `src/styles/global.css` for class-based dark mode switching.

### Task 2: Reading time on blog detail page
Added build-time reading time calculation to `src/pages/thoughts/[slug].astro` using `post.body` word count split at 200 wpm. Displays as "X min read" next to the published date in the muted label style. Blog listing page remains unchanged.

## Commits

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Shiki dual-theme config + global.css dark mode CSS | 0373024 |
| 2 | Reading time on blog detail page | 4c98a49 |

## Verification Results

- Build: 8 pages built, no errors
- Syntax highlighting: `astro-code` class present in Gatsby post HTML (has code blocks)
- Reading time: "min read" text present in all 3 blog post pages
- `markdoc.config.mjs`: gruvbox-light-hard + gruvbox-dark-hard themes configured
- `global.css`: `shiki-dark` CSS vars applied under `.dark .astro-code` selector

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected invalid Shiki theme name**
- **Found during:** Task 1 (first build attempt)
- **Issue:** Plan specified `gruvbox-light` as the light theme, but this is not a valid Shiki v4 theme ID. Valid names are `gruvbox-light-hard`, `gruvbox-light-medium`, `gruvbox-light-soft`.
- **Fix:** Changed to `gruvbox-light-hard` (hardest contrast variant, best for readability against the warm Gruvbox palette)
- **Files modified:** `markdoc.config.mjs`
- **Commit:** 0373024

Note: This was auto-corrected by the linter after the initial file creation.

## Known Stubs

None — all functionality is fully wired. Code blocks render with real Shiki syntax highlighting from the Markdoc content. Reading time is calculated from actual post body content.

## Self-Check: PASSED

---
phase: 02-core-pages
plan: "03"
subsystem: portfolio
tags: [portfolio, components, dynamic-routes, astro-content]
dependency_graph:
  requires: [02-01]
  provides: [portfolio-listing, project-detail-route, ProjectCard-component]
  affects: [02-06]
tech_stack:
  added: []
  patterns: [getStaticPaths, standalone-render, project.id, grid-layout, empty-state]
key_files:
  created:
    - src/components/ProjectCard.astro
    - src/pages/portfolio/index.astro
    - src/pages/portfolio/[slug].astro
  modified: []
decisions:
  - "Use project.id (not project.slug) in getStaticPaths params — Astro v5 Content Layer API requirement"
  - "Standalone render(project) import from astro:content — not project.render() instance method"
  - "font-semibold only (600 weight) for all headings — no font-bold per UI-SPEC typography contract"
  - "Project detail h1 is visible (text-3xl font-semibold) — only page with visible h1 per Navigation Contract"
  - "Media detection via file extension (.mp4/.webm for video, fallback to image)"
metrics:
  duration_minutes: 2
  completed_date: "2026-03-22"
  tasks_completed: 2
  files_created: 3
  files_modified: 0
requirements_satisfied: [CONT-02]
---

# Phase 02 Plan 03: Portfolio Pages Summary

Portfolio vertical slice implemented — ProjectCard component, portfolio listing at `/portfolio`, and project detail dynamic route at `/portfolio/[slug]`. All CMS-managed via the existing projects collection with no code changes required when adding projects.

---

## What Was Built

**ProjectCard component** (`src/components/ProjectCard.astro`) — Reusable card with border, title link to detail page, year metadata, 2-line clamped description, tech stack pill tags, and external links row. Follows UI-SPEC exactly: `text-xl font-semibold` title, `line-clamp-2` description, `rounded-full` tech pills, accent color links.

**Portfolio listing page** (`src/pages/portfolio/index.astro`) — Responsive 2-column grid at `sm:grid-cols-2`, sorted newest-first by year. Empty state renders "No projects yet." per Copywriting Contract (D-06: portfolio starts empty). Visually hidden `<h1>` for accessibility.

**Project detail route** (`src/pages/portfolio/[slug].astro`) — Dynamic route with `getStaticPaths` using `project.id`. Full layout: top + bottom back links, visible `<h1>` at `text-3xl font-semibold`, year, conditional hero media (video with controls/preload/playsinline or eager-loaded image), tech stack pills, Markdoc prose body, and project links row.

---

## Verification

- `npm run build` exits 0 from worktree
- `dist/portfolio/index.html` generated (empty state rendered correctly)
- `dist/portfolio/sample-project/index.html` generated (detail page from seeded data)
- No `font-bold` in any created file
- All files use `project.id` not `project.slug`

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1: ProjectCard + portfolio listing | `3f63edc` | feat(02-03): create ProjectCard component and portfolio listing page |
| Task 2: Project detail dynamic route | `ddc8b06` | feat(02-03): create project detail dynamic route page |

---

## Known Stubs

None. All data flows from the Keystatic CMS projects collection via `getCollection('projects')`. The empty state is intentional (D-06: portfolio starts empty).

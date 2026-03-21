---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (installed in Wave 0 with Astro scaffold) |
| **Config file** | vitest.config.ts (created in Wave 0) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FOUN-01 | build | `npm run build && npm run dev` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | FOUN-02 | unit+manual | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 1 | FOUN-03 | manual | contrast checker | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` and `@testing-library/dom` — install test framework with Astro scaffold
- [ ] `vitest.config.ts` — basic vitest config for Astro project
- [ ] Verify `npm run dev` starts without errors after scaffold

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark/light mode no flash | FOUN-02 | Requires browser rendering to observe FOUC | Load page in browser with each system preference, verify no flash |
| Color contrast WCAG AA | FOUN-03 | Requires visual inspection + contrast checker tool | Run all color pairs through WebAIM contrast checker, verify 4.5:1 ratio |
| Keystatic admin UI functional | N/A | Requires browser interaction with CMS UI | Navigate to /keystatic, create sample entry, verify getCollection() reads it |
| Responsive layout mobile-first | FOUN-01 | Requires viewport testing | Resize browser to 375px, verify layout renders correctly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

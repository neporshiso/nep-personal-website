---
phase: 1
slug: foundation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-20
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Zod (build-time schema validation via Astro content collections) |
| **Config file** | src/content.config.ts (Zod schemas) |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~10 seconds |

**Rationale:** This is a frontend/Astro project with no existing test infrastructure. The appropriate validation for this phase is build-time verification: `astro build` compiles all pages and runs Zod schema validation against content entries. Malformed content is rejected at build time with descriptive errors. No unit test framework (vitest, etc.) is needed for Phase 1 — the content schema validation IS the automated test gate. Manual browser verification covers dark mode, contrast, and responsive behavior.

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + manual browser check
- **Before `/gsd:verify-work`:** Full suite must be green + human checkpoint approved
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-T1 | 01 | 1 | FOUN-01, FOUN-03 | build + contrast check | `npm run build` | N/A — created by task | pending |
| 01-01-T2 | 01 | 1 | FOUN-01, FOUN-02 | build | `npm run build` | N/A — created by task | pending |
| 01-02-T1 | 02 | 2 | FOUN-01 | build (Zod validates schemas) | `npm run build` | N/A — created by task | pending |
| 01-02-T2 | 02 | 2 | FOUN-01 | build (Zod validates samples) | `npm run build` | N/A — created by task | pending |
| 01-02-T3 | 02 | 2 | FOUN-01, FOUN-02, FOUN-03 | manual (human checkpoint) | N/A — user verifies | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements:
- `npm run build` serves as the automated gate (Zod schema validation at build time)
- No test framework installation needed — Zod is built into Astro content collections
- Contrast verification is performed programmatically or manually during Plan 01-01 Task 1

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark/light mode no flash | FOUN-02 | Requires browser rendering to observe FOUC | Load page in browser with each system preference, verify no flash |
| Color contrast WCAG AA | FOUN-03 | Requires visual confirmation + documented ratios | Verify ratios documented in global.css comment; visually confirm readability in both modes |
| Keystatic admin UI functional | N/A | Requires browser interaction with CMS UI | Navigate to /keystatic, verify all 5 content types listed, sample entries visible |
| Responsive layout mobile-first | FOUN-01 | Requires viewport testing | Resize browser to 375px, verify layout renders correctly |
| Bio renders via getCollection | N/A | Requires rendered page inspection | Navigate to /about, verify bio text appears |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify (`npm run build`)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (no gaps — Zod at build time is sufficient)
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready

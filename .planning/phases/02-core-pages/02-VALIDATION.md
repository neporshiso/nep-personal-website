---
phase: 2
slug: core-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Astro build check + Playwright (if installed) or manual browser verification |
| **Config file** | none — Wave 0 installs if needed |
| **Quick run command** | `npx astro check && npx astro build` |
| **Full suite command** | `npx astro check && npx astro build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx astro check && npx astro build`
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | CONT-01 | build | `npx astro build` | ✅ | ⬜ pending |
| TBD | TBD | TBD | CONT-02 | build | `npx astro build` | ✅ | ⬜ pending |
| TBD | TBD | TBD | CONT-04 | build | `npx astro build` | ✅ | ⬜ pending |
| TBD | TBD | TBD | CONT-05 | build | `npx astro build` | ✅ | ⬜ pending |
| TBD | TBD | TBD | CONT-06 | build | `npx astro build` | ✅ | ⬜ pending |
| TBD | TBD | TBD | ANLY-01 | build | `npx astro build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Astro build check validates TypeScript, template syntax, and content collection integrity.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Nav site name updates per page | SC-5 | Visual verification of contextual text | Navigate to each page, confirm nav text matches Navigation Contract |
| Analytics events fire | ANLY-01 | Requires Vercel deployment to verify | Deploy preview, visit pages, check Vercel Analytics dashboard |
| 375px mobile renders correctly | SC-7 | Visual layout verification | Open Chrome DevTools, set viewport to 375px, check all pages |
| CMS edit → build cycle works | CONT-01 | End-to-end CMS workflow | Edit bio in Keystatic admin, rebuild, verify content updated |
| Empty states display correctly | UI-SPEC | Visual copy verification | Verify portfolio/podcasts/books show empty state when no content |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

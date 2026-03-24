---
phase: 04
slug: polish-and-launch
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — Astro static site, build is primary gate |
| **Config file** | astro.config.mjs |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && test -f dist/sitemap-index.xml` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + inspect dist HTML for OG tags
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | SEO-01 | smoke | `npm run build && grep 'og:title' dist/index.html` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | SEO-02 | smoke | `npm run build && grep 'meta.*description' dist/index.html` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | SEO-03 | smoke | `npm run build && test -f dist/sitemap-index.xml` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | FOUN-04 | manual | Lighthouse in Chrome DevTools | N/A | ⬜ pending |
| 04-03-01 | 03 | 2 | DEPL-01 | manual | Push content change, verify Vercel redeploy | N/A | ⬜ pending |
| 04-03-02 | 03 | 2 | DEPL-02 | manual | Login at neporshiso.com/keystatic | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Build smoke test covers SEO tag presence in dist HTML
- [ ] `dist/sitemap-index.xml` existence check after build

*Existing `npm run build` infrastructure covers all automated requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| OG preview in social media | SEO-01 | Requires real URL shared on LinkedIn/Slack | Share deployed URL, verify rich preview |
| LCP < 2.5s on mobile | FOUN-04 | Requires Lighthouse or real device | Run Lighthouse audit in Chrome DevTools |
| CMS triggers redeploy | DEPL-01 | Requires live Vercel deployment | Edit content in /keystatic, verify new deploy |
| CMS GitHub mode works | DEPL-02 | Requires GitHub OAuth + live site | Login at neporshiso.com/keystatic, save edit |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

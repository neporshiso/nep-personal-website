# Phase 2: Core Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-22
**Phase:** 02-core-pages
**Areas discussed:** Blog migration strategy, Content population, Social/contact links data source, S3 media integration

---

## Blog Migration Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Manual .mdoc creation | Copy content from Gatsby blog, convert to Markdoc, fill schema fields | ✓ |
| Automated migration tooling | Script to pull and convert Gatsby MDX to Markdoc | |

**User's choice:** Manual creation (bulk discussion — user accepted recommended default)
**Notes:** Only 3 posts — automation not justified.

---

## Content Population

| Option | Description | Selected |
|--------|-------------|----------|
| Real content | Migrate real data from existing site and personal collections | ✓ |
| Placeholder content | Use lorem ipsum / sample data | |

**User's choice:** Real content across all collections
**Notes:** User clarified that the 4 existing portfolio projects are NOT being migrated to the new site. Portfolio starts empty with CMS-added content later.

---

## Social/Contact Links Data Source

| Option | Description | Selected |
|--------|-------------|----------|
| Keystatic singleton | Single `social` entry with structured fields (email, github, linkedin, flexible links array) | ✓ |
| Keystatic collection | Separate collection of social link entries | |
| Static data file | Hardcoded JSON/TS data file | |

**User's choice:** Keystatic singleton (bulk discussion — user accepted recommended default)
**Notes:** One place to edit all social links. ContactSection and about page both read from same source.

---

## S3 Media Integration → Local Media

| Option | Description | Selected |
|--------|-------------|----------|
| Local /public/ directory | All assets committed to repo in /public/assets/ | ✓ |
| Keep S3 | Continue using S3 bucket for media | |
| Cloudinary CDN | Upload to Cloudinary for optimized delivery | |
| Vercel Blob | Use Vercel's blob storage | |

**User's choice:** Local `/public/` directory
**Notes:** User stated "I am deprecating S3 bucket usage." All media moves to local repo. For a portfolio site, repo size is negligible.

---

## Claude's Discretion

- `/public/assets/` subfolder naming convention
- Exact Keystatic `social` singleton field configuration
- Markdoc formatting for migrated blog posts
- Astro `<Image>` vs `<img>` per context

## Deferred Ideas

None — discussion stayed within phase scope

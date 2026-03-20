# Codebase Concerns

**Analysis Date:** 2026-03-20

## Deprecated External Dependencies

**Google Analytics UA Property:**
- Issue: `index.html` uses legacy Google Analytics (Universal Analytics with UA-146861978-1 property)
- Files: `index.html` (lines 5-15)
- Impact: Google deprecated UA properties on July 1, 2023. Analytics will stop collecting data. Current implementation sends events to a non-functional tracking system
- Fix approach: Migrate to Google Analytics 4 (GA4) by updating tracking ID and gtag.js configuration, or remove analytics if no longer needed

**jQuery 3.4.1 CDN dependency:**
- Issue: Outdated jQuery version loaded from googleapis (released 2019)
- Files: `index.html` (line 266)
- Impact: Security vulnerabilities in old jQuery version. Minimal functionality usage makes this dependency unnecessary
- Fix approach: Replace jQuery burger menu toggle with vanilla JavaScript since only one event handler is used (see `scripts/index.js`)

**Bulma CSS Framework 0.8.0:**
- Issue: Outdated CSS framework version from 2019
- Files: `index.html` (line 27)
- Impact: Missing bug fixes, security patches, and modern CSS features. Framework is EOL
- Fix approach: Update to Bulma 1.0+ or migrate to modern CSS (CSS Grid/Flexbox already used in `styles/style.css`)

**Raw CDN for DevIcon (rawgit.com):**
- Issue: DevIcon CSS loaded from cdn.rawgit.com with pinned commit hash
- Files: `index.html` (line 25)
- Impact: CDN service is archived and unreliable. Icon font won't load consistently
- Fix approach: Migrate to modern icon font (Font Awesome already loaded on line 31) or use SVG icons instead

**Iconify Script (v1.0.3):**
- Issue: Old version of Iconify script loaded
- Files: `index.html` (line 30)
- Impact: Outdated version may have performance issues or missing icon sets
- Fix approach: Update to latest Iconify or remove if not actively used for icons

## Malformed HTML

**Duplicate Quotation Marks:**
- Issue: Multiple anchor tags have double closing quotes in href attribute
- Files: `index.html` (lines 210, 235)
- Pattern: `href="https://github.com/neporshiso/etf-rebalancer""` and `href="https://github.com/neporshiso/codetrain""`
- Impact: Invalid HTML syntax. Some browsers may ignore or misparse these links
- Fix approach: Remove duplicate closing quotes from both GitHub source code links

**Incorrect target Attribute Spacing:**
- Issue: Some target attributes have space before underscore: `target=" _blank"` instead of `target="_blank"`
- Files: `index.html` (lines 185, 210, 235)
- Impact: Invalid target value. Links will not open in new tab/window as intended
- Fix approach: Remove spaces before underscore in all target attributes to match correct syntax

## Security Considerations

**AWS S3 Asset Hosting:**
- Risk: Portfolio assets, images, and resume PDF hosted on public S3 bucket
- Files: `index.html` (multiple references to nep-portfolio-assets.s3.us-east-2.amazonaws.com)
- Current mitigation: Bucket appears to allow public read access (required for website to display)
- Recommendations:
  - Verify S3 bucket has appropriate CORS and access control settings
  - Consider CloudFront CDN distribution for better performance and control
  - Ensure bucket blocks public ACLs even if objects are public via policy

**External Analytics Tracking:**
- Risk: User data sent to Google Analytics (though deprecated property)
- Files: `index.html` (lines 5-15)
- Current mitigation: None documented
- Recommendations: Add privacy policy document explaining analytics usage, or disable tracking completely

## Performance Bottlenecks

**Multiple External CDN Requests:**
- Problem: 5+ external CDN dependencies slow page load
- Files: `index.html` (lines 6, 25, 27, 30, 31, 266)
- Cause: Unnecessary framework overhead, outdated jQuery for simple functionality
- Improvement path:
  1. Remove jQuery, implement burger menu toggle in vanilla JS (15 lines of code)
  2. Replace Bulma with custom CSS (mostly already done in `styles/style.css`)
  3. Use local icon fonts or SVG sprites instead of Iconify
  4. Implement CSS and JavaScript minification and bundling

**Large Page HTML Size:**
- Problem: 269 lines of inline HTML for a simple portfolio
- Files: `index.html`
- Cause: All content inline, no component extraction or templating
- Improvement path: Consider static site generator (11ty, Hugo, Jekyll) for maintainability and optimization

**Responsive Design Media Queries:**
- Problem: Multiple breakpoint-specific card height values (550px, 600px, 650px, 710px)
- Files: `styles/style.css` (lines 159-181)
- Cause: Inflexible fixed heights instead of flexible layouts
- Improvement path: Replace fixed card heights with min-height, allow flex-wrap, use CSS Grid for portfolio cards

## Fragile Areas

**Portfolio Card Layout:**
- Files: `styles/style.css` (lines 120-153) and `index.html` (lines 160-263)
- Why fragile:
  - Fixed card width (500px) doesn't scale well on different screen sizes
  - Fixed card height (550px base) requires manual breakpoint adjustments for responsive design
  - Absolute positioned card footer can overflow or misalign
  - Video element hardcoded height (250px) doesn't maintain aspect ratio on resize
- Safe modification: Use CSS Grid or CSS aspect-ratio property, remove fixed heights, test on multiple viewport sizes

**Navigation Burger Menu:**
- Files: `scripts/index.js`, `index.html` (lines 36-50), `styles/style.css` (lines 43-46, 159-161)
- Why fragile:
  - Depends on jQuery for simple toggle functionality
  - Mobile menu styling only in one media query
  - No focus trap or keyboard navigation for accessibility
- Safe modification: Replace jQuery with vanilla JS, add keyboard support (Escape to close, Tab navigation), test with screen readers

**External Link Management:**
- Files: `index.html` (multiple lines)
- Why fragile:
  - Hardcoded links to external sites (blog, GitHub, S3 assets, bit.ly redirects)
  - Short URLs (git.io) can break if not maintained
  - Resume PDF on S3 can become stale
- Safe modification: Centralize links in data structure or config, use long-form URLs, consider versioning resume

## Missing Critical Features

**Missing Semantic HTML:**
- Problem: Uses generic `<div>` instead of semantic tags
- Files: `index.html` (throughout)
- Blocks: Poor accessibility for screen readers, worse SEO potential
- Recommendation: Replace with `<main>`, `<article>`, `<aside>` tags where appropriate

**No Metadata for Social Sharing:**
- Problem: No Open Graph or Twitter Card meta tags
- Files: `index.html` (section 4-23)
- Blocks: Portfolio doesn't display properly when shared on social media
- Recommendation: Add og:title, og:description, og:image, og:url and Twitter card meta tags

**Accessibility Issues:**
- Problem:
  - No ARIA labels on interactive elements beyond navbar burger
  - Image missing title/caption context
  - No color contrast verification
- Files: `index.html` (entire page), `styles/style.css` (color definitions)
- Blocks: Screen reader users cannot understand portfolio context
- Recommendation: Run accessibility audit with WAVE or Lighthouse, add ARIA landmarks and labels

**No Mobile-First Design:**
- Problem: CSS written with desktop-first approach, media queries only for downsizing
- Files: `styles/style.css` (lines 159-181)
- Blocks: Mobile experience suboptimal, harder to maintain responsive breakpoints
- Recommendation: Refactor CSS to mobile-first approach

## Test Coverage Gaps

**No Automated Testing:**
- What's not tested: HTML validity, link integrity, responsive layouts, JavaScript functionality
- Files: All files lack corresponding test files
- Risk:
  - Broken links discovered only by manual browsing (example: old Google Analytics property)
  - HTML syntax errors not caught in CI
  - Responsive design regressions on new screen sizes
- Recommendation: Add HTML validation in build process, implement link checker, visual regression testing

**No Link Validation:**
- What's not tested: External links (GitHub, LinkedIn, resume PDF, portfolio assets)
- Files: `index.html` (all external hrefs)
- Risk: Dead links, broken redirects (git.io), S3 asset availability not verified
- Recommendation: Add link checking tool to CI pipeline

## Scaling Limits

**Single HTML File Architecture:**
- Current capacity: One monolithic index.html file, suitable for portfolio with 4 projects
- Limit: Adding more projects requires manual HTML editing, no templating
- Scaling path:
  1. Migrate to static site generator (11ty, Astro) for template reuse
  2. Implement portfolio data as JSON/YAML with templated rendering
  3. Automate asset optimization and linking

**Hard-Coded Asset URLs:**
- Current capacity: Links managed inline in HTML
- Limit: Changing S3 bucket, asset paths, or CDN requires manual HTML updates
- Scaling path: Implement environment-based asset path configuration, asset manifest system

---

*Concerns audit: 2026-03-20*

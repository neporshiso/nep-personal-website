# Testing Patterns

**Analysis Date:** 2026-03-20

## Overview

This is a static portfolio website with no testing framework configured. No test files, test runners, or testing dependencies are present in the codebase. Testing would be manual or through a browser.

## Test Framework

**Runner:** Not configured
- No Jest, Vitest, Mocha, or other test runners detected
- No test configuration files present

**Assertion Library:** None

**Run Commands:** Not applicable
```bash
# No test command configured
# Manual testing required via browser
```

## Test File Organization

**Location:** Not applicable
- No `.test.js`, `.spec.js`, or test directories present

**Naming:** N/A - no test files exist

**Structure:** N/A

## Testing Setup

The codebase consists of:
- Static HTML: `index.html`
- CSS styling: `styles/style.css`
- Minimal JavaScript: `scripts/index.js`

No automated testing is implemented.

## Manual Testing Approach

**JavaScript Testing (Current Practice):**

The only interactive code is in `scripts/index.js` (8 lines):
```javascript
$(document).ready(function () {
  // Check for click events on the navbar burger icon
  $(".navbar-burger").click(function () {
    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
  });
});
```

**Manual Verification Would Test:**
1. Click navbar burger icon on mobile/small screens
2. Verify `is-active` class toggles on `.navbar-burger`
3. Verify `is-active` class toggles on `.navbar-menu`
4. Verify navbar menu appears/disappears

**HTML Structure Testing:**
- Semantic element usage (nav, section, header, footer)
- Link integrity (`href` attributes, external links)
- Image loading (favicon, S3 assets)
- Meta tags (charset, viewport, description)

**CSS/Layout Testing:**
- Responsive design at breakpoints: 1023px, 550px, 420px, 360px (line 159-181 in `style.css`)
- Card sizing and spacing
- Navbar responsive behavior
- Skills grid layout

## Mocking

**Framework:** None - no testing framework to require mocks

**What Would Need Mocking (if tests were added):**
- jQuery DOM selections
- External CDN resources (Bulma, Iconify, Font Awesome)
- Google Analytics `gtag()` function
- External image URLs (S3 assets)

## Fixtures and Test Data

**Not applicable** - no test infrastructure exists

**Portfolio Content:** Uses external assets from S3
- Image: `https://nep-portfolio-assets.s3.us-east-2.amazonaws.com/main_picture.jpeg`
- Videos: Multiple hosted in same S3 bucket
- Resume PDF: `https://nep-portfolio-assets.s3.us-east-2.amazonaws.com/Nep_Orshiso_Resume.pdf`

## Testing Tools Not Configured

The following are **not** present:
- ESLint or code linting
- Prettier or code formatting
- Vitest, Jest, or Mocha test runners
- Testing library (React Testing Library, Enzyme, etc.)
- Code coverage tools
- Pre-commit hooks or Git hooks

## Coverage

**Requirements:** None enforced

**Current State:** No coverage tracking

## Browser Testing Considerations

**Manual Testing:**
1. Open `index.html` in browser
2. Verify navigation menu functionality at various screen sizes
3. Check responsive design at configured breakpoints
4. Verify external links work correctly
5. Check image and video loading from S3
6. Verify Google Analytics tracking fires

**Tools (if added):**
- Selenium for automated browser testing
- Cypress or Playwright for end-to-end testing
- Axe accessibility testing for a11y validation

## Where Testing Should Be Added

**Priority Areas (if testing implementation begins):**

**High Priority:**
- Navbar burger toggle functionality (most interactive code)
- Responsive design at media query breakpoints
- External link functionality (`_blank` and `rel="noopener"` validation)

**Medium Priority:**
- Image and video loading from external sources
- Google Analytics integration
- Meta tag presence and correctness

**Low Priority:**
- CSS rendering (typically manual verification is acceptable)
- Static HTML structure validation

---

*Testing analysis: 2026-03-20*

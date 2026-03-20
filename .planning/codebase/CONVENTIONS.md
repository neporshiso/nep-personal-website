# Coding Conventions

**Analysis Date:** 2026-03-20

## Overview

This is a static portfolio website with minimal JavaScript. No build tools, linters, or formatters are configured. Code organization is straightforward with HTML structure, CSS styling, and basic DOM manipulation.

## Naming Patterns

**Files:**
- HTML: `index.html` (main entry point)
- CSS: kebab-case with descriptive names - `style.css`
- JavaScript: kebab-case - `index.js`
- Directory names: lowercase - `styles/`, `scripts/`, `.planning/`

**CSS Classes:**
- BEM-like semantic naming when not using Bulma framework classes
- `.navbar-item`, `.card-header`, `.section-heading`, `.portfolio-container`
- Bulma utility classes combined with custom classes: `.section .container.about`

**JavaScript Variables and Functions:**
- camelCase for jQuery selector variables (inferred from context)
- Comment blocks describe function purpose
- Example: `$(".navbar-burger")` for DOM selections

## Code Style

**Formatting:**
- No automated formatter configured
- HTML: 2-space indentation
- CSS: 2-space indentation
- JavaScript: 2-space indentation
- Line length: appears to follow conventional limits (under 100 chars in most cases)

**CSS Organization:**
- Comment sections with visual separators (`/* ****** */`) group related styles
- Sections: navbar styling, about me, skills, resume, portfolio, media queries
- Location: `styles/style.css`

**HTML Organization:**
- Semantic HTML5 elements used (nav, section, header, footer)
- Comments label major page sections (`<!-- Nav Bar -->`, `<!-- About Me -->`, etc.)
- External CDN resources loaded in `<head>` with `defer` attributes for scripts

## Import Organization

**External Libraries:**
- HTML: CDN links in `<head>` - CSS first (Bulma), then deferred scripts
- jQuery loaded from CDN in `index.html` line 266
- Iconify and Font Awesome loaded with defer
- Google Analytics loaded first with async behavior

**Custom Resources:**
```html
<link rel="stylesheet" href="./styles/style.css" />
<script src="scripts/index.js"></script>
```

**Order convention:**
1. External CSS frameworks (Bulma)
2. External icon/font libraries
3. Custom CSS
4. Deferred external scripts
5. Custom JavaScript

## Error Handling

**Patterns:**
- No explicit error handling in current codebase
- Defensive coding: uses `target="_blank" rel="noopener"` to prevent security issues with external links
- No try-catch blocks or error callbacks

## Logging

**Framework:** None - `console` not used in current code

**Patterns:**
- No logging implementation present
- HTML includes Google Analytics for tracking: `gtag()` function at lines 8-15 in `index.html`

## Comments

**When to Comment:**
- Section headers with visual separators in CSS
- HTML comments for major page sections
- JavaScript: minimal commenting, code is self-documenting

**Examples:**
- CSS: `/* ****************************** */` and `/* navbar styling */`
- HTML: `<!-- Nav Bar -->`, `<!-- About Me -->`, `<!-- Portfolio -->`
- JavaScript: `// Check for click events on the navbar burger icon`

**No JSDoc/TSDoc used** - codebase doesn't use TypeScript or advanced documentation.

## Function Design

**Size:** Functions are small and focused
- Example in `scripts/index.js` (lines 1-8): Single responsibility (toggle navbar on click)

**Parameters:** Minimal parameters
- jQuery selectors passed implicitly through `.click()` handler
- No complex parameter lists

**Return Values:**
- jQuery methods used for method chaining
- No explicit returns in custom code shown

## Module Design

**Organization:**
- No module system (ES6 modules, CommonJS) used
- Global script loading with inline scripts and separate script file
- Files are independent: `index.js` manipulates DOM without dependencies

**Separation of Concerns:**
- HTML structure: `index.html`
- Styling: `styles/style.css`
- Interactivity: `scripts/index.js`
- Assets: External URLs or favicon at root

**DOM Manipulation:**
- jQuery used for DOM selection and manipulation
- Event binding via jQuery: `$(selector).click(function() { ... })`
- CSS class toggling via jQuery: `.toggleClass()`

---

*Convention analysis: 2026-03-20*

# Architecture

**Analysis Date:** 2026-03-20

## Pattern Overview

**Overall:** Static Single-Page Application (SPA)

**Key Characteristics:**
- Single HTML entry point with no build process or bundler
- Client-side progressive enhancement with vanilla JavaScript
- CSS-first styling with Bulma framework
- No server-side rendering or backend API integration
- Responsive design with mobile-first media queries
- Third-party CDN dependencies for UI framework and icon libraries

## Layers

**Presentation Layer:**
- Purpose: HTML markup, styling, and interactive UI elements
- Location: `index.html`, `styles/style.css`
- Contains: DOM structure, semantic HTML sections, CSS rule definitions
- Depends on: External CSS framework (Bulma), icon libraries (DevIcon, Iconify, FontAwesome), jQuery
- Used by: Browser rendering engine

**Interactivity Layer:**
- Purpose: Client-side DOM manipulation and event handling
- Location: `scripts/index.js`
- Contains: jQuery event handlers for mobile navigation
- Depends on: jQuery library, DOM elements from HTML
- Used by: User interactions (clicks, navigation)

**Styling Layer:**
- Purpose: Visual presentation and responsive layout
- Location: `styles/style.css`
- Contains: Custom CSS overrides, flexbox layouts, media queries, typography
- Depends on: Bulma CSS framework classes
- Used by: Browser rendering engine

## Data Flow

**Page Load Sequence:**

1. Browser fetches `index.html` from server
2. HTML parser loads external stylesheets (Bulma framework, custom styles)
3. HTML parser loads external JavaScript (jQuery, Iconify, FontAwesome)
4. DOM is fully constructed with portfolio content sections
5. jQuery document.ready handler executes
6. Navbar burger toggle event listener is attached
7. Google Analytics script initializes and tracks page view
8. Page is fully interactive

**User Interaction Flow:**

1. User clicks navbar burger button (mobile)
2. jQuery click handler triggers
3. `is-active` class toggled on `.navbar-burger` and `.navbar-menu`
4. CSS classes control display/visibility of mobile menu
5. Page reflects navigation state

**State Management:**
- No centralized state management (no Redux, context, etc.)
- DOM state managed through CSS classes (`is-active`)
- No persistent client-side state or local storage
- All content is static and loaded from HTML

## Key Abstractions

**Portfolio Card Component:**
- Purpose: Display individual project showcase with video, description, and links
- Examples: `index.html` lines 167-262 (four `.card` elements)
- Pattern: HTML structure with semantic classes (`.card`, `.card-header`, `.card-content`, `.card-footer`)
- Styling: `styles/style.css` lines 119-154
- Composition: Video player, text description, footer link (no reusable component framework)

**Navigation Component:**
- Purpose: Main site navigation with responsive mobile burger menu
- Examples: `index.html` lines 35-51
- Pattern: Bulma navbar with burger toggle mechanism
- Interaction: `scripts/index.js` lines 1-8
- Responsive: Mobile menu hidden by default, shown via CSS class toggle

**Content Sections:**
- Purpose: Organize information into semantic regions
- Pattern: Each section uses `<section class="section">` with `<div class="container">`
- Examples: About Me (lines 54-86), Skills (lines 88-144), Resume (lines 147-157), Portfolio (lines 160-264)

## Entry Points

**HTML Document:**
- Location: `index.html`
- Triggers: Browser requests website URL
- Responsibilities: Render all page content, load CSS/JS dependencies, establish DOM structure

**JavaScript Initialization:**
- Location: `scripts/index.js` (lines 1-2)
- Triggers: Document ready event
- Responsibilities: Attach event listeners, initialize interactive features (mobile nav toggle)

**Stylesheet:**
- Location: `styles/style.css`
- Triggers: HTML stylesheet link tag
- Responsibilities: Apply visual styling, handle responsive layout via media queries

## Error Handling

**Strategy:** Minimal error handling - no error boundaries or try/catch blocks

**Patterns:**
- Browser console silent failure for missing external CDN resources
- No validation of user input (no forms)
- No HTTP error handling (static file serving)
- Graceful degradation if JavaScript disabled (navbar burger non-functional, otherwise page readable)

## Cross-Cutting Concerns

**Logging:** Google Analytics (UA-146861978-1) via gtag.js for page views and user tracking

**Validation:** Not applicable - no user input or data submission

**Authentication:** Not applicable - no protected resources or user accounts

**Analytics:** Google Analytics configured on page load to track user engagement and traffic patterns

**External Resources:** Heavy reliance on CDN-hosted resources:
- Bulma CSS framework
- DevIcon iconography library
- Iconify icon library
- FontAwesome icons
- jQuery library
- Google Analytics
- AWS S3 assets (images, videos, resume PDF)

---

*Architecture analysis: 2026-03-20*

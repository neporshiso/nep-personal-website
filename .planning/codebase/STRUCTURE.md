# Codebase Structure

**Analysis Date:** 2026-03-20

## Directory Layout

```
nep-personal-website/
├── index.html           # Main entry point with all content
├── favicon.ico          # Website icon
├── README.md            # Project documentation
├── scripts/             # Client-side JavaScript
│   └── index.js         # Mobile navigation toggle logic
├── styles/              # Stylesheets
│   └── style.css        # Custom CSS and responsive design
├── .planning/           # GSD planning artifacts
│   └── codebase/        # Codebase analysis documents
└── .claude/             # Claude-related configuration (ignored)
```

## Directory Purposes

**Project Root:**
- Purpose: Contains main entry point and configuration files
- Contains: HTML entry point, favicon, README
- Key files: `index.html` (main site), `favicon.ico` (branding)

**scripts/**
- Purpose: Store JavaScript files for client-side functionality
- Contains: jQuery-based interactivity code
- Key files: `index.js` - Mobile navigation burger menu toggle

**styles/**
- Purpose: Store CSS stylesheets and design system
- Contains: Custom CSS overrides and responsive design rules
- Key files: `style.css` - All visual styling for portfolio sections

**.planning/codebase/**
- Purpose: Store GSD codebase analysis documents
- Contains: Architecture and structure documentation
- Generated: Yes (by GSD analysis tools)
- Committed: Yes

## Key File Locations

**Entry Points:**
- `index.html`: Main HTML document served to browsers, contains complete page structure and all content

**Configuration:**
- No build configuration files (no bundler, webpack, Next.js, etc.)
- No package managers (no package.json, requirements.txt, etc.)
- No environment variables or .env files
- No TypeScript configuration (vanilla JavaScript)

**Core Logic:**
- `scripts/index.js`: Mobile navigation toggle using jQuery and DOM manipulation (8 lines total)
- `styles/style.css`: Complete visual styling and responsive layout rules (182 lines)

**Testing:**
- Not applicable - no test framework or test files

## Naming Conventions

**Files:**
- HTML: Lowercase with `.html` extension (`index.html`)
- CSS: Lowercase with `.css` extension (`style.css`)
- JavaScript: Lowercase with `.js` extension (`index.js`)
- Directories: Lowercase plural nouns (`scripts/`, `styles/`)

**Directories:**
- Semantic purpose names: `scripts`, `styles` (clear intent)
- Hidden directories prefixed with dot: `.planning`, `.claude`, `.git`

**CSS Classes:**
- Semantic naming from Bulma framework: `.navbar`, `.navbar-item`, `.card`, `.section`, `.container`
- Utility naming: `.is-active`, `.is-link`, `.is-medium`
- Custom descriptive names: `.portfolio-container`, `.skills`, `.skill`, `.about`, `.social`, `.section-heading`
- State classes: `.is-active` (mobile menu visibility)

**HTML Elements:**
- Semantic sections: `<nav>`, `<section>`, `<header>`, `<footer>`
- Clear IDs for anchor links: `id="resume"`, `id="portfolio"`
- No component framework conventions (no React/Vue naming patterns)

## Where to Add New Code

**New Feature/Content Section:**
- Add HTML markup to `index.html` as new `<section class="section">` block
- Add corresponding CSS rules to `styles/style.css` (follow media query pattern at end of file)
- If interactivity needed: Add jQuery event handlers to `scripts/index.js`
- Follow existing section structure: Container → heading → content → styling

**New Interactive Component:**
- JavaScript: Add to `scripts/index.js` within document.ready() block
- CSS: Add class-based styling to `styles/style.css`
- Pattern: Use jQuery for DOM selection and event binding, Bulma classes for styling

**New Stylesheet Rules:**
- Add to `styles/style.css` organized by section (see file comments)
- Group related rules (navbar, skills, portfolio, etc.)
- Place media queries at bottom of file (lines 157-181)
- Use flexbox for layout (established pattern in file)

**Static Assets:**
- Images/videos: Reference via absolute URLs to AWS S3 (`https://nep-portfolio-assets.s3.us-east-2.amazonaws.com/`)
- Icons: Use existing icon libraries (DevIcon, Iconify, FontAwesome) via CDN
- No local asset directory - all media hosted externally

## Special Directories

**.planning/codebase/:**
- Purpose: Store GSD codebase analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Generated: Yes (by GSD map-codebase command)
- Committed: Yes

**.claude/:**
- Purpose: Claude Code workspace configuration
- Generated: Yes (by Claude Code IDE)
- Committed: No (git-ignored)

**.git/:**
- Purpose: Git version control metadata
- Generated: Yes (by git init)
- Committed: No (git system directory)

## Asset Organization

**No build output directory:** This is a pure static site with no build process. No `dist/`, `build/`, or `.next/` directories.

**No dependencies directory:** No `node_modules/` or similar because all dependencies are loaded from CDN:
- Bulma CSS framework
- jQuery library
- Icon libraries (DevIcon, Iconify, FontAwesome)
- Google Analytics
- AWS S3 for media hosting

**No source subdirectories:** Simple flat structure with minimal nesting. All JavaScript in `scripts/`, all CSS in `styles/`, HTML at root.

---

*Structure analysis: 2026-03-20*

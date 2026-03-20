# External Integrations

**Analysis Date:** 2026-03-20

## APIs & External Services

**Analytics:**
- Google Analytics - Tracks site visitor metrics and user behavior
  - Service: Google Analytics
  - Implementation: gtag.js (Global Site Tag)
  - ID: UA-146861978-1
  - Location: `index.html` lines 5-16

## Data Storage

**File Storage:**
- AWS S3 - Hosts all portfolio assets (images, videos, PDF resume)
  - Bucket: `nep-portfolio-assets`
  - Region: `us-east-2`
  - Content: Portfolio demo videos, resume PDF, profile image
  - Access: Public read access via HTTPS URLs
  - Image location: Line 83 (`index.html`)
  - Resume PDF location: Line 150 (`index.html`)
  - Video locations: Lines 175, 198, 223, 248 (`index.html`)

**Caching:**
- None - Relies on browser and CDN caching

**Databases:**
- Not applicable - Static site with no dynamic data

## Authentication & Identity

**Auth Provider:**
- Not applicable - Public portfolio site with no authentication

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Browser console only (via jQuery and vanilla JavaScript)

## CDN & Asset Delivery

**Frontend Libraries (CDN-hosted):**
- jsDelivr - Serves Bulma CSS framework
  - URL: `https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.min.css`
  - Location: `index.html` line 27

- Google Fonts/CDN - Serves Font Awesome icon library
  - URL: `https://use.fontawesome.com/releases/v5.3.1/js/all.js`
  - Location: `index.html` line 31

- RawGit - Serves DevIcon CSS
  - URL: `https://cdn.rawgit.com/konpa/devicon/df6431e323547add1b4cf45992913f15286456d3/devicon.min.css`
  - Location: `index.html` line 25

- Iconify Design - Serves icon rendering library
  - URL: `https://code.iconify.design/1/1.0.3/iconify.min.js`
  - Location: `index.html` line 30

- jQuery via Google Hosted Libraries
  - URL: `https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js`
  - Location: `index.html` line 266

**Google Services:**
- Google Tag Manager (gtag.js) - Analytics event tracking
  - URL: `https://www.googletagmanager.com/gtag/js?id=UA-146861978-1`
  - Location: `index.html` line 6

## Static Asset Hosting

**AWS S3 Bucket Assets:**
- Resume PDF: `https://nep-portfolio-assets.s3.us-east-2.amazonaws.com/Nep_Orshiso_Resume.pdf`
- Profile Image: `https://nep-portfolio-assets.s3.us-east-2.amazonaws.com/main_picture.jpeg`
- Video - Initial Calculus Essentials: `https://nep-portfolio-assets.s3.us-east-2.amazonaws.com/Ice+(1).mp4`
- Video - Portfolio Rebalancer: `https://nep-portfolio-assets.s3.us-east-2.amazonaws.com/rebalancer.mp4`
- Video - CodeTrain Demo: `https://nep-portfolio-assets.s3.us-east-2.amazonaws.com/codetrain_demo.mp4`
- Video - MoonSet Demo: `https://nep-portfolio-assets.s3.us-east-2.amazonaws.com/pygame+(1).mp4`

## External Links

**Social & Professional:**
- GitHub: `https://github.com/neporshiso`
- LinkedIn: `https://www.linkedin.com/in/neporshiso/`
- Twitter: `https://twitter.com/NepOrshiso`
- External Blog: `https://blog.neporshiso.com`

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Environment Configuration

**Required Secrets:**
- None - No backend services requiring authentication

**Configuration:**
- All configuration is hardcoded in `index.html`
- No environment variables or external configuration files

---

*Integration audit: 2026-03-20*

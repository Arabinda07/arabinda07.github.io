# Arabinda Saha Portfolio

Personal portfolio for Arabinda Saha, a Business Intelligence and Interface Architect in India.

Live site: [arabinda07.github.io](https://arabinda07.github.io)

## Overview

This is a static, single-page portfolio built with plain HTML, CSS, and small local JavaScript. Vite is used only for local serving, and Playwright covers the smoke-test contract.

The site positions Arabinda around business intelligence consulting, dashboard workflows, education analytics, program operations, and selected web products. Verified BI and education/program proof stays primary. Web/product showcases are included separately with clear live or prototype status.

## Current Site Architecture

```text
/
├── index.html          # Main single-page portfolio
├── styles.css          # Design tokens, layout, responsive states, motion
├── sitemap.xml         # Canonical public URLs for crawlers
├── robots.txt          # Allows crawling and references sitemap.xml
├── llms.txt            # AI-readable positioning and proof summary
├── profile.md          # Machine-readable profile
├── PRODUCT.md          # Product, audience, positioning, SEO policy
├── DESIGN.md           # Decision Studio design system
├── site.webmanifest    # App metadata and icons
├── tests/
│   └── smoke.spec.js   # Playwright smoke and contract tests
├── scripts/
│   └── generate_web_assets.py
└── assets/
    ├── profile-540.webp
    ├── profile-1080.webp
    ├── Profile picture.png       # Source / fallback profile image
    ├── og-image.jpg / .png
    ├── twitter-image.jpg / .png
    ├── work photos/optimized/    # Published WebP work evidence
    └── photos/                   # Source web asset imagery
```

## Sections

| # | Section | Purpose |
|---|---------|---------|
| 01 | About | Career narrative, portrait, philosophy, BI/interface positioning |
| 02 | Experience | Tabbed work history for LKS and Edudigm roles |
| 03 | Work | BI and analytics proof first, then selected web/product showcases |
| 04 | Capabilities | BI, data analysis, workflows, databases, web/product build, certifications, speaking |
| 05 | Contact | Conversation router, EmailJS form, direct contact links |

## Design System

The current visual system is documented in `DESIGN.md`.

Core direction:

- Warm "Decision Studio" atmosphere
- OKLCH color tokens
- Cabinet Grotesk display type
- Supreme body type
- JetBrains Mono for short labels and metadata
- Warm canvas, paper surfaces, amber-brown field accent, muted green support color
- Restrained motion with `prefers-reduced-motion` support

Avoid reintroducing older navy/teal, Inter/Fira Code, glassy SaaS, fake metrics, or decorative dashboard motifs.

## SEO And AI-Readable Files

The SEO and machine-readable content contract is spread across:

- `index.html` head metadata and JSON-LD
- `sitemap.xml`
- `robots.txt`
- `llms.txt`
- `profile.md`
- `site.webmanifest`
- smoke tests in `tests/smoke.spec.js`

When updating public positioning, update these together. Keep verified BI/dashboard/education analytics proof primary, and keep selected web products clearly status-labeled.

## Assets

Profile display images use production WebP variants:

- `assets/profile-540.webp`
- `assets/profile-1080.webp`

Social cards use smaller JPG files in metadata:

- `assets/og-image.jpg`
- `assets/twitter-image.jpg`

PNG source/output files remain in the repo for compatibility and regeneration. Published work evidence images live under `assets/work photos/optimized/` and should stay WebP-only.

To regenerate the web assets after replacing source imagery:

```bash
python scripts/generate_web_assets.py
```

## Local Development

Install dependencies once:

```bash
npm install
```

Start the local Vite server:

```bash
npm run dev
```

Vite serves the site at `http://127.0.0.1:5173/`.

Run the smoke suite:

```bash
npm run test:smoke
```

## EmailJS

The contact form loads EmailJS from its CDN and uses client-side validation. If EmailJS is unavailable, the form shows a direct email fallback.

Credentials are currently configured in `index.html`:

```js
emailjs.init('D3gJkKMx_DbElRpth');
emailjs.sendForm('service_2q1jfj9', 'template_j5q4hjj', contactForm);
```

## Updating Content

Most visible content lives in `index.html`.

| Content | Location |
|---|---|
| Hero and left-panel copy | `.left-panel` and `.hero-section` |
| Experience bullets | `#tab-lks`, `#tab-edudigm-ph`, `#tab-edudigm-sme` |
| Work proof and showcases | `#work` |
| Capability groups | `#skills` |
| Certifications and speaking | `.certs-section`, `.seminars-section` |
| Contact copy and form routing | `#contact` |
| SEO and structured data | `<head>` JSON-LD and metadata |

After any content, SEO, asset, or layout change, run:

```bash
npm run test:smoke
```

## Deployment

Hosted on GitHub Pages from the `master` branch.

```bash
git add .
git commit -m "update portfolio"
git push origin master
```

GitHub Pages usually publishes within a minute or two.

## Contact

Arabinda Saha

- Website: [arabinda07.github.io](https://arabinda07.github.io)
- LinkedIn: [linkedin.com/in/robin0607saha](https://www.linkedin.com/in/robin0607saha)
- GitHub: [github.com/Arabinda07](https://github.com/Arabinda07)

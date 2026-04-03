# Arabinda Saha — Personal Portfolio

Personal portfolio site for Arabinda Saha, Built with plain HTML and CSS — no frameworks, no build step.

**Live site → [arabinda07.github.io](https://arabinda07.github.io)**

---

## Overview

A single-page portfolio inspired by [Brittany Chiang's v4](https://brittanychiang.com), adapted for a background spanning mathematics, education systems, and governance-oriented data work. Designed to communicate depth and range without a traditional tech-only portfolio format.

---

## Structure

```
/
├── index.html          # Single-page application — all content
├── styles.css          # All styles — no preprocessor
└── assets/
    ├── photo.png       # Profile photo
    └── resume.pdf      # Downloadable résumé
```

Two files. No dependencies to install, no build command to run.

---

## Sections

| # | Section | Notes |
|---|---------|-------|
| 01 | **About** | Bio, photo with teal overlay, career narrative |
| 02 | **Experience** | Tabbed: LKS · Edudigm (PH) · Edudigm (SME) |
| 03 | **Projects** | 3 featured (Problem / Execution / Outcome) + 3 cards |
| 04 | **Capabilities** | Skill groups, certifications, selected speaking |
| 05 | **Contact** | EmailJS-powered form |

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--navy` | `#0a192f` | Page background |
| `--teal` | `#64ffda` | Accent — links, highlights, active states |
| `--slate-light` | `#ccd6f6` | Headings, section intros, emphasis |
| `--slate` | `#8892b0` | Body text |
| `--slate-dark` | `#495670` | Dividers, decorative elements |
| `--white` | `#e6f1ff` | Brightest text — name, role emphasis |
| `--navy-light` | `#112240` | Cards, tab panels |

**Fonts:** Inter (body + display) · Fira Code (mono) — loaded from Google Fonts.

---

## Features

- Fixed left panel (desktop) with name, tagline, nav, and socials
- Scroll-driven active navigation highlighting
- Tabbed experience section with animated indicator
- Alternating featured project layout with dot-grid image placeholders
- Page loader with animated hex logo
- Cursor radial spotlight (desktop only)
- Scroll progress bar
- Teal callout treatment on experience and project notes
- Film-grain texture overlay (CSS-only SVG)
- EmailJS contact form with client-side validation
- Right-side email rail (desktop, `>1080px`)
- Fully responsive — mobile nav drawer with hamburger
- `prefers-reduced-motion` support throughout
- Keyboard accessible — focus-visible states on all interactive elements
- `aria-label`, `role`, and `aria-selected` on tab components

---

## Deployment

Hosted on **GitHub Pages** from the `master` branch. Push to `master` → live within ~1 minute.

```bash
git add .
git commit -m "your message"
git push origin master
```

No build step. No CI needed.

---

## EmailJS Configuration

The contact form uses [EmailJS](https://www.emailjs.com/) for serverless email delivery. Credentials are set directly in `index.html`:

```js
emailjs.init('D3gJkKMx_DbElRpth');                          // Public key
emailjs.sendForm('service_2q1jfj9', 'template_j5q4hjj', …)  // Service + template
```

To use your own EmailJS account, replace those three values with your own from the EmailJS dashboard. The template expects three variables: `from_name`, `reply_to`, `message`.

---

## Local Development

No install required. Open directly in a browser:

```bash
# Option 1 — open the file directly
open index.html

# Option 2 — serve locally (avoids any asset path quirks)
npx serve .
# or
python3 -m http.server 8000
```

Note: EmailJS requires an active internet connection to send messages. Form validation runs entirely client-side.

---

## Updating Content

All content lives in `index.html`. Key locations:

| Content | Where to find it |
|---------|-----------------|
| Name, tagline, bio | `.lp-top` in the left panel (`<aside class="left-panel">`) |
| Experience bullets | `#tab-lks`, `#tab-edudigm-ph`, `#tab-edudigm-sme` |
| Featured projects | `.featured-projects` — each `.featured-project` block |
| Small project cards | `.projects-grid` |
| Skill tags | `.skills-section` — four `.skill-group` blocks |
| Certifications | `.certs-section` |
| Speaking | `.seminars-section` |
| Contact copy | `.contact-body` in `#contact` |
| Resume file | Replace `assets/resume.pdf` — filename referenced in 3 places |
| Profile photo | Replace `assets/photo.png` — referenced in 2 `<img>` tags |

---

## Credits & Inspiration

Design language inspired by [Brittany Chiang's v4 portfolio](https://github.com/bchiang7/v4) — colour palette, fixed left-panel layout, and nav interaction pattern.

All code written from scratch. No templates, libraries, or CSS frameworks used.

---

## Contact

**Arabinda Saha**
[linkedin.com/in/robin0607saha](https://www.linkedin.com/in/robin0607saha) · [github.com/Arabinda07](https://github.com/Arabinda07)

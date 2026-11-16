---
name: Arabinda Saha Portfolio
description: A warm decision-studio portfolio for BI consulting, dashboards, analytics workflows, and selected web/product showcases.
colors:
  canvas: "oklch(0.986 0.008 175.0)"
  canvas-soft: "oklch(0.955 0.010 175.0)"
  surface: "oklch(0.994 0.005 175.0)"
  surface-raised: "oklch(0.955 0.010 175.0)"
  surface-media: "oklch(0.920 0.012 175.0)"
  text-primary: "oklch(0.185 0.014 180.0)"
  text-secondary: "oklch(0.415 0.012 180.0)"
  text-muted: "oklch(0.485 0.010 180.0)"
  border: "oklch(0.855 0.012 178.0)"
  border-strong: "oklch(0.695 0.014 178.0)"
  accent: "oklch(0.585 0.105 196.0)"
  accent-strong: "oklch(0.465 0.092 196.0)"
  accent-tint: "oklch(0.905 0.038 192.0 / 0.55)"
  secondary: "oklch(0.690 0.085 81.0)"
  secondary-tint: "oklch(0.915 0.042 84.0 / 0.55)"
  success: "oklch(0.480 0.110 160.0)"
  error: "oklch(0.505 0.165 25.0)"
colors-dark:
  canvas: "oklch(0.220 0.024 176.0)"
  canvas-soft: "oklch(0.265 0.028 176.0)"
  surface: "oklch(0.265 0.028 176.0)"
  surface-raised: "oklch(0.312 0.030 176.0)"
  surface-media: "oklch(0.352 0.030 176.0)"
  text-primary: "oklch(0.950 0.010 175.0)"
  text-secondary: "oklch(0.840 0.012 175.0)"
  text-muted: "oklch(0.680 0.014 176.0)"
  border: "oklch(0.365 0.026 176.0)"
  border-strong: "oklch(0.465 0.026 176.0)"
  accent: "oklch(0.685 0.110 194.0)"
  accent-strong: "oklch(0.755 0.105 192.0)"
  accent-tint: "oklch(0.380 0.070 194.0 / 0.5)"
  secondary: "oklch(0.745 0.085 82.0)"
  secondary-tint: "oklch(0.390 0.055 82.0 / 0.5)"
  success: "oklch(0.720 0.115 160.0)"
  error: "oklch(0.650 0.165 25.0)"
typography:
  display:
    fontFamily: "Cabinet Grotesk, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(3rem, 12.8vw, 4.1rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "0"
  headline:
    fontFamily: "Cabinet Grotesk, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(1.45rem, 3vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "0"
  body:
    fontFamily: "Supreme, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0"
  label:
    fontFamily: "Supreme, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  portrait: "22px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "2rem"
  section-y: "clamp(5rem, 10vw, 8.25rem)"
components:
  button-primary:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0.82rem 1.2rem"
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "0.82rem 1.2rem"
    typography: "{typography.label}"
  chip:
    backgroundColor: "{colors.secondary-tint}"
    textColor: "{colors.text-secondary}"
    rounded: "999px"
    padding: "0.34rem 0.65rem"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "1rem"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "0.85rem 0.95rem"
---

# Design System: Arabinda Saha Portfolio

## Overview

**Creative North Star: "Decision Studio"**

This portfolio should feel like a calm room where messy work becomes legible. The visitor should understand that Arabinda works with dashboards, assessment data, program evidence, institutional operations, and selected web/product showcases, but the experience should not feel clerical or like a generic analyst-course portfolio.

The visual system is warm, analytical, structured, and human. It uses a restrained canvas, precise type, quiet borders, small data-like labels, and enough asymmetry to feel designed. It should become more distinctive over time through proof-led visuals, stronger work artifacts, and project-specific evidence, not by adding decorative spectacle.

**Key Characteristics:**
- Balanced density: about 5/10. Enough information for recruiters and founders, never cramped.
- Controlled variance: about 6/10. Left-aligned structure, alternating work layouts, and visible numbering.
- Restrained motion: about 4/10. Hover feedback and entrance reveals, no choreography for its own sake.
- Human clarity: plain language, verified numbers, careful employer-work boundaries, and concrete outcomes.

## Colors

The palette is a mineral-botanical analytical system inspired by Sanzo Wada's Combination #12 (Green Blue and Isabella Color) alongside Deep Slate Green, paired with a Cloud Dancer-inspired airy off-white canvas in light mode and hue-tinted neutrals (`Hue ~176`). A faint seigaiha (wave arc) pattern sits behind the page at low opacity.

### Primary

- **Mineral Canvas**: The main page background (`canvas` / `canvas-soft`). Airy off-white in light mode, deep slate-green (`#0e1e1a`) in dark mode.
- **Paper / Slate Surface**: The raised content surface (`surface` / `surface-raised`). Use it for cards, inputs, buttons, and panels that need quiet separation.
- **Green Blue Accent**: The primary action and focus color (`accent` for borders, focus rings, and non-text markers; `accent-strong` mandatory for all text, links, and mono labels to maintain WCAG AA >= 4.5:1 contrast).

### Secondary

- **Isabella Gold**: A muted ochre-gold supporting color (`secondary`) for subtle diagram accents and chips. It should never compete with the Green Blue Accent.

### Neutral

- **Charcoal Text**: Primary text, major headings, strong labels, and decisive CTAs.
- **Working Text**: Body copy, descriptions, project summaries, and form text.
- **Muted Evidence**: Metadata, dates, captions, and secondary labels.
- **Quiet Border**: Structural lines, card outlines, tab dividers, and input borders.

**The One Accent Rule.** The Field Accent carries the brand. Do not add a new accent color for each section.

**The Proof-Led Color Rule.** Color should clarify hierarchy, state, or evidence. Do not use neon glows, purple-blue gradients, or decorative color noise.

## Typography

**Display Font:** Cabinet Grotesk, with system sans fallback.

**Body & Label Font:** Supreme, with system sans fallback.

The type system uses a clean two-font editorial hierarchy. Display type gives confidence. Body type keeps the page conversational, while labels, dates, and tags rely on weight, size, and spacing in Supreme rather than monospace or numeric prefixes.

### Hierarchy

- **Display**: Heavy, compact, and plain. Use for the main role label and major visual anchors.
- **Headline**: Strong but controlled. Use for section headings, project titles, and philosophy titles.
- **Title**: Medium-to-bold sans. Use for cards, tabs, capability groups, and form headings.
- **Body**: Relaxed line-height with a maximum readable measure around 65 to 75 characters.
- **Label**: Small mono, used for navigation numbers, tags, dates, and metadata. Keep it short.

**The No-Costume Mono Rule.** Mono type should support evidence and navigation. Do not use it as a lazy way to make the site feel technical.

**The Plain Sentence Rule.** Avoid over-polished marketing language. Use concrete nouns: dashboards, trackers, assessment analytics, reports, program health, evidence, pages, and tools.

## Elevation

The system uses flat OKLCH tonal surface stepping (`canvas`, `surface`, `surface-raised`, `surface-media`) and vertical spacing rather than decorative borders, hairline dividers, surface gradients, or resting shadows. Shadows are reserved strictly for floating overlays such as mobile navigation drawers.

### Shadow Vocabulary

- **Soft Portrait Shadow**: A wider warm shadow for the About photo and any future high-touch personal asset.
- **Tight Panel Shadow**: A smaller warm shadow for cards, mobile navigation, button hover states, and elevated surfaces.

**The Quiet Lift Rule.** Hover lift should be small, usually 2 to 4 pixels. If the motion draws more attention than the work, it is too much.

### Motion Tokens

- **Fast:** `--duration-fast: 140ms` for quick press and icon feedback.
- **Base:** `--duration-base: 240ms` for buttons, nav, tabs, form focus, and card hover.
- **Slow:** `--duration-slow: 420ms` for project media shifts and page-level texture.
- **Curves:** Use `--ease` for the main studio feel and `--ease-out-quart` for soft proof-surface motion.
- **Reduced Motion:** Respect `prefers-reduced-motion`; new motion must collapse to near-zero duration and never carry meaning on its own.

## Components

### Buttons

- **Shape:** Tightly rounded rectangles, usually 8px.
- **Primary:** Charcoal fill with light text. Use for the main invitation and form submit.
- **Secondary:** Surface fill or outline treatment with charcoal text. Use for resume, LinkedIn, and supporting links.
- **Hover and Focus:** Darken or shift border color, apply a small transform, and always keep a visible focus outline.
- **Rule:** Do not use needy CTA language. The primary action should feel like an invitation to discuss a real problem.

### Cards and Containers

- **Shape:** 8px radius for work cards and capability groups. 22px radius is reserved for the personal portrait.
- **Background:** Slightly raised surface with quiet border.
- **Shadow:** Tight panel shadow only when elevation helps separation.
- **Usage:** Cards are acceptable for repeated work and capability items, but avoid endless identical grids. Break patterns with featured layouts, asymmetric media, or stronger proof artifacts.

### Chips and Tags

- **Style:** Rounded metadata pills with muted green tint, mono text, and compact padding.
- **Usage:** Tools, metrics, project labels, and proof markers.
- **Rule:** Keep project tags factual. Capability tags may include market-relevant tools when they are presented as skills, not proof of employer usage.

### Inputs and Forms

- **Shape:** 8px radius, full-width fields, 44px minimum height.
- **Focus:** Accent border plus soft tint ring.
- **Error:** Direct, plain language below or near the field. No theatrical error copy.
- **Usage:** The contact form is an invitation to explain a dashboard, data, program, or page-clarity problem.

### Navigation

- **Desktop:** Fixed left panel with numbered sections, line indicators, social links, and the main invitation.
- **Mobile:** Fixed top header, 44px icon controls, collapsible menu, and staggered nav reveal.
- **Rule:** Numbering is part of the identity. Keep it restrained, aligned, and useful.

### Project Media

- **Current Pattern:** Optimized real/photo evidence galleries for education analytics and program work, restrained text-only cards for selected web/product showcases, and anonymized text structure where employer confidentiality blocks screenshots.
- **Future Direction:** Add real or anonymized artifacts where possible: dashboard crops, assessment diagrams, sample trackers, event evidence, or page compositions. Keep galleries proof-led and compact.
- **Rule:** When confidentiality blocks real screenshots, use anonymized structure. Do not invent fake metrics or client proof.

### Web Assets

- **Favicons and App Icons:** Use the clean AS monogram with one amber-brown border, warm surface fill, and generous padding. Avoid nested frames, corner nodes, tiny dots, and diagram details that collapse at small sizes.
- **Social Cards:** Lead with "Portfolio of Arabinda Saha", then the Business Intelligence & Interface Architect role and concrete work nouns. Use one subtle dashboard/proof motif only.
- **Rule:** Social cards can carry positioning, but avoid metric clutter and old systems-consultant wording.

## Do's and Don'ts

### Do:

- **Do** keep the first screen immediately clear: Business Intelligence & Interface Architect, dashboards, analytics workflows, program work, tools, and selected web/product showcases.
- **Do** use the warm OKLCH palette from the current CSS tokens as the source of truth.
- **Do** keep Competitive Edge and LKS dashboard work visually strong in the Work section.
- **Do** preserve employer-work boundaries for LKS and avoid invented performance metrics.
- **Do** use numbers by context: ~1,000 students only for Competitive Edge, 1,500+ students only for broader school-program operations, 500+ students only for career assessment, and 600+ schools across 6 states only for Stellar Space Quiz.
- **Do** keep mobile layouts single-column, readable, and free of horizontal overflow.
- **Do** use focus states, keyboard-friendly controls, and plain form validation language.
- **Do** make future visuals more proof-led and less template-like.

### Don't:

- **Don't** use "Hire me", "Book now", "Looking for work", or "Available for freelance" as primary CTA language.
- **Don't** make analytics copy feel clerical. Use dashboards, trackers, program health, metric logic, or evidence when those are more accurate.
- **Don't** present School Program Command Centre as deployed, tested, or proven. It is an active prototype using synthetic/sample data.
- **Don't** present market-positioning tools as verified employer-project tools, and don't imply confidential employer metrics or internal details.
- **Don't** use purple-blue neon gradients, glassmorphism as decoration, gradient text, oversized hero metrics, or generic SaaS-card layouts.
- **Don't** turn the portfolio into a pure product management, product design, teaching, or freelance website.
- **Don't** use decorative side-stripe borders, fake screenshots, fake metrics, stock team imagery, or placeholder names.
- **Don't** let abstract media blocks become the long-term proof system. Replace them with real or anonymized evidence when available.

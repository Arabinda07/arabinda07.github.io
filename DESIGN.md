---
name: Arabinda Saha Portfolio
description: A warm decision-studio portfolio for BI, data, dashboard, and selected page work.
colors:
  canvas: "oklch(0.965 0.018 82)"
  canvas-soft: "oklch(0.935 0.021 78)"
  surface: "oklch(0.992 0.009 82)"
  surface-raised: "oklch(0.982 0.012 78)"
  text-primary: "oklch(0.205 0.024 68)"
  text-secondary: "oklch(0.43 0.028 66)"
  text-muted: "oklch(0.535 0.026 70)"
  border: "oklch(0.82 0.028 76)"
  border-strong: "oklch(0.66 0.046 70)"
  accent: "oklch(0.54 0.105 62)"
  accent-strong: "oklch(0.42 0.105 56)"
  accent-tint: "oklch(0.86 0.065 66 / 0.42)"
  secondary: "oklch(0.47 0.045 118)"
  secondary-tint: "oklch(0.88 0.035 118 / 0.42)"
  success: "oklch(0.48 0.1 155)"
  error: "oklch(0.52 0.16 27)"
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
    fontFamily: "JetBrains Mono, SFMono-Regular, Consolas, monospace"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.12em"
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

This portfolio should feel like a calm room where messy work becomes legible. The visitor should understand that Arabinda works with dashboards, assessment data, program evidence, institutional operations, and selected pages, but the experience should not feel clerical or like a generic analyst-course portfolio.

The visual system is warm, analytical, structured, and human. It uses a restrained canvas, precise type, quiet borders, small data-like labels, and enough asymmetry to feel designed. It should become more distinctive over time through proof-led visuals, stronger work artifacts, and project-specific evidence, not by adding decorative spectacle.

**Key Characteristics:**
- Balanced density: about 5/10. Enough information for recruiters and founders, never cramped.
- Controlled variance: about 6/10. Left-aligned structure, alternating work layouts, and visible numbering.
- Restrained motion: about 4/10. Hover feedback and entrance reveals, no choreography for its own sake.
- Human clarity: plain language, verified numbers, confidentiality notes, and concrete outcomes.

## Colors

The palette is a warm analytical system: softened institutional neutrals, one amber-brown accent, and a muted green secondary used sparingly for tags and diagram-like surfaces.

### Primary

- **Warm Canvas**: The main page background. Use it to keep the site softer than a white dashboard and more personal than a corporate deck.
- **Paper Surface**: The raised content surface. Use it for cards, inputs, buttons, and panels that need quiet separation.
- **Field Accent**: The primary action and focus color. Use it for CTAs, section numbers, focus rings, active states, and small proof markers.

### Secondary

- **Institutional Green**: A supporting system color for chips, visual placeholders, and diagram accents. It should never compete with the Field Accent.

### Neutral

- **Charcoal Text**: Primary text, major headings, strong labels, and decisive CTAs.
- **Working Text**: Body copy, descriptions, project summaries, and form text.
- **Muted Evidence**: Metadata, dates, captions, and secondary labels.
- **Quiet Border**: Structural lines, card outlines, tab dividers, and input borders.

**The One Accent Rule.** The Field Accent carries the brand. Do not add a new accent color for each section.

**The Proof-Led Color Rule.** Color should clarify hierarchy, state, or evidence. Do not use neon glows, purple-blue gradients, or decorative color noise.

## Typography

**Display Font:** Cabinet Grotesk, with system sans fallback.

**Body Font:** Supreme, with system sans fallback.

**Label and Metadata Font:** JetBrains Mono, with SFMono and Consolas fallback.

The type system should feel precise without becoming mechanical. Display type gives confidence. Body type keeps the page conversational. Mono labels are reserved for numbers, navigation indices, dates, tags, and small system cues.

### Hierarchy

- **Display**: Heavy, compact, and plain. Use for the main role label and major visual anchors.
- **Headline**: Strong but controlled. Use for section headings, project titles, and philosophy titles.
- **Title**: Medium-to-bold sans. Use for cards, tabs, capability groups, and form headings.
- **Body**: Relaxed line-height with a maximum readable measure around 65 to 75 characters.
- **Label**: Small mono, used for navigation numbers, tags, dates, and metadata. Keep it short.

**The No-Costume Mono Rule.** Mono type should support evidence and navigation. Do not use it as a lazy way to make the site feel technical.

**The Plain Sentence Rule.** Avoid over-polished marketing language. Use concrete nouns: dashboards, trackers, assessment analytics, decision views, program health, evidence, pages.

## Elevation

The system uses a hybrid of tonal layering, borders, and soft shadows. Surfaces are mostly flat at rest. Shadows should be ambient and restrained, never glossy. Depth should help users distinguish panels, project cards, portraits, mobile navigation, and hovered states.

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
- **Rule:** Keep tags factual. Do not add unconfirmed tools or inflated capability labels.

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

- **Current Pattern:** Proof-led CSS placeholders built from assessment grids, anonymized dashboard structures, program maps, and synthetic prototype diagrams.
- **Future Direction:** Replace CSS placeholders with real or anonymized artifacts where possible: dashboard crops, assessment diagrams, sample trackers, event evidence, or page compositions.
- **Rule:** When confidentiality blocks real screenshots, use anonymized structure. Do not invent fake metrics or client proof.

### Web Assets

- **Favicons and App Icons:** Use the clean AS monogram with one amber-brown border, warm surface fill, and generous padding. Avoid nested frames, corner nodes, tiny dots, and diagram details that collapse at small sizes.
- **Social Cards:** Lead with "Portfolio of Arabinda Saha", then the BI & Data Analyst role and concrete work nouns. Use one subtle dashboard/proof motif only.
- **Rule:** Social cards can carry positioning, but avoid metric clutter and old "data systems" wording.

## Do's and Don'ts

### Do:

- **Do** keep the first screen immediately clear: BI & Data Analyst, dashboards, decision systems, program work, and evidence.
- **Do** use the warm OKLCH palette from the current CSS tokens as the source of truth.
- **Do** keep Competitive Edge and LKS dashboard work visually strong in the Work section.
- **Do** preserve confidentiality language for LKS and avoid invented performance metrics.
- **Do** use verified numbers and organic scale: 600+ schools, 1,500+ students, 60+ teachers, ~1,000 assessment analytics students.
- **Do** keep mobile layouts single-column, readable, and free of horizontal overflow.
- **Do** use focus states, keyboard-friendly controls, and plain form validation language.
- **Do** make future visuals more proof-led and less template-like.

### Don't:

- **Don't** use "Hire me", "Book now", "Looking for work", or "Available for freelance" as primary CTA language.
- **Don't** overuse "reporting" in visible copy. Use decision views, dashboards, trackers, program health, or evidence when those are more accurate.
- **Don't** present School Program Command Centre as deployed, tested, or proven. It is an active prototype using synthetic/sample data.
- **Don't** add unconfirmed tools such as Tableau, Looker Studio, DAX, Power Query, cloud tools, or databases.
- **Don't** use purple-blue neon gradients, glassmorphism as decoration, gradient text, oversized hero metrics, or generic SaaS-card layouts.
- **Don't** turn the portfolio into a pure product management, product design, teaching, or freelance website.
- **Don't** use decorative side-stripe borders, fake screenshots, fake metrics, stock team imagery, or placeholder names.
- **Don't** let abstract media blocks become the long-term proof system. Replace them with real or anonymized evidence when available.

# Portfolio UX/UI Audit — March 31, 2026

Scope: `index.html` + `styles.css` for this repository.

## Overall score

- **Pass:** 24
- **Partial:** 10
- **Needs work:** 5
- **Estimated readiness:** **B+ (strong foundation, improve hiring-conversion clarity)**

---

## 1) First Impression (0–5 seconds)

- ✅ **Clarity of role:** Role/value prop is visible immediately in hero (`Data Consultant`, "I build and scale systems using data").
- ✅ **Vibe-code test:** Visual direction is coherent and restrained (single palette family, dark professional tone).
- ✅ **Actionable hero:** Hero has heading + short summary + primary CTA (resume button).
- ✅ **Professional aesthetics:** Iconography is consistent SVG line icon style (not emoji-driven UI).

## 2) Information hierarchy

- ✅ **One row, one idea:** Distinct sections are clearly separated by purpose (`about`, `experience`, `work`, `skills`, `contact`).
- ⚠️ **Visual distinction between rows:** Sections are separated mostly by spacing; background shifts between rows are limited.
- ✅ **Lead metric emphasis:** Impact metrics are visually prominent in hero and project blocks.
- ⚠️ **Outcome over identity:** Project cards include outcomes, but some labels still emphasize names/org before measurable result.

## 3) Scannability

- ✅ **Squint test:** Largest type in hero and section headings drives eye flow correctly.
- ⚠️ **Grid consistency:** Spacing system is mostly consistent, but there are many one-off values beyond a strict 4/8 scale.
- ✅ **Clear but short copy:** Copy is mostly concise and avoids obvious redundancy.
- ✅ **Semantic color use:** Teal is used mainly for links/accents/interactive elements and status emphasis.

## 4) Navigation & flow

- ✅ **Logical progression:** Hero → journey → experience → work → capabilities → contact is correct.
- ✅ **Navigational signifiers:** Active left-nav state updates on scroll and mobile nav uses explicit section labels.
- ⚠️ **No dead ends:** Primary sections are connected, but there are few explicit “next” prompts between sections.
- ✅ **Signaling action:** Buttons/links include hover/focus states; interactive controls provide visible response.

## 5) Visual design principles

- ❌ **Typography limits (<=4 sizes / <=2 weights):** Current CSS uses many font-size tokens and several weights.
- ✅ **Pro header treatment:** Large headings use tightened letter spacing around -0.02em to -0.03em.
- ✅ **Vertical breathing room:** Section padding generally lands in the recommended range (desktop + mobile variants).
- ✅ **Subtle depth:** Shadows and overlays are soft/subtle, not harsh defaults.

## 6) Trust signals

- ❌ **Professional presence (custom domain):** Site appears hosted on `arabinda07.github.io` (subdomain), not custom domain.
- ✅ **Case study depth:** Featured projects include concrete outcomes (schools/states/students/finals/recognition).
- ✅ **Consistent components:** Buttons, corner radii, card treatments are largely consistent.
- ❌ **Functional graphics:** No micro-charts/maps yet; impact is text-based.

## 7) Portfolio-specific best practices (Data/Product/AI)

- ✅ **Pixels with purpose:** Work examples communicate systems thinking for scale and governance.
- ⚠️ **Technical workflow:** GitHub hosting is implied; deployment/toolchain workflow is not explicitly showcased in-site.
- ✅ **System-driven design:** Content consistently frames problems as systems + operations + measurable outcomes.

## 8) Common mistakes

- ✅ **Redundant elements removed:** Mobile and desktop structures are fairly clean; no severe decorative clutter.
- ✅ **Vague labels avoided:** Most labels are specific and contextual.
- ⚠️ **AI over-reliance risk:** Not obvious visually, but some sections are wordy and could be tightened to sound more human/decisive.

## 9) Modern trends (optional/relevant)

- ⚠️ **Design spells:** You have tasteful motion (loader, tab transition, spotlight), but limited “delight moments” in content states.
- ✅ **Human-in-the-loop AI:** Current structure feels directed and intentional, not purely auto-generated.

---

## Top 10 high-impact improvements (priority order)

1. **Add a custom domain** (`arabindasaha.com`) for stronger trust + recruiter recall.
2. **Make one hero sentence outcome-first**, e.g., “Scaled national education programs to 600+ schools across 6 states.”
3. **Reduce typography tokens** to a formal scale (e.g., 12/14/16/20 + two weights).
4. **Introduce alternating section backgrounds** (very subtle tints) to improve row transition clarity.
5. **Add a “Selected Impact” row** with 3 KPI cards (problem → intervention → quantified outcome).
6. **Add 1 visual data artifact per featured project** (mini timeline, process flow, or micro-chart).
7. **Add explicit section bridge CTAs** (“Next: Systems I’ve Built”).
8. **Publish a short workflow note** (“Built with HTML/CSS/JS, tested with Playwright, deployed via GitHub Pages”).
9. **Trim verbose paragraphs in About** by ~20–30% for faster scanning.
10. **Add measurable “consulting outcomes” in LKS work** when available (time saved, errors reduced, cycle-time change).

---

## Suggested 30-minute implementation plan

- **10 min:** Tighten hero copy + add “Selected Impact” KPI strip.
- **10 min:** Add subtle alternating section backgrounds + row bridge links.
- **10 min:** Add deployment/testing workflow line in footer or about section.


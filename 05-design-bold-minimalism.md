# Design PRD — Bold Minimalism Visual System

**Project:** SIH 2026 Internal Hackathon Platform — Osmania University
**Scope:** Visual design only — colors, typography, imagery, poster/graphic language, layout composition rules. This is the counterpart to the four function/logic docs (`01`–`04`); those own features, architecture, flow, and security. This doc owns what everything **looks like**.

**Design philosophy:** Bold. Minimal. Impactful. One idea. Maximum impact. *"We say less. What we say, we make bold."*

---

## 1. Core Principles

| Principle | Rule |
|---|---|
| Bold Typography | Make it big. Make it clear. |
| Minimal Elements | Less clutter. More focus. |
| Strong Contrast | High contrast. High impact. |
| Purposeful Space | Every space has a purpose. |
| Consistent Identity | One system, everywhere — website, images, posters. |

**Golden rule:** Don't add more. Make what's already there bigger, stronger, and more interesting.

---

## 2. Color Palette

Inspired by the Smart India Hackathon (SIH) brand.

| Name | Hex | Role |
|---|---|---|
| SIH Blue | `#0072BC` | Primary |
| Deep Blue | `#005A9C` | Secondary |
| SIH Orange | `#F58220` | Accent |
| Light Orange | `#F9A65A` | Accent (light) |
| White | `#FFFFFF` | Background |
| Light Gray | `#F3F5F7` | Surface / neutral |
| Dark Text | `#1F2937` | Text / headings |

**Usage guide:**
- **Primary (SIH Blue)** — headers, key sections, buttons, important highlights.
- **Accent (SIH Orange / Light Orange)** — CTAs, icons, highlights, emphasis. Use sparingly, as the "pop" against blue and neutrals.
- **Neutral (White / Light Gray)** — backgrounds, cards, containers, subtle sections.
- **Text (Dark Text)** — all text and headings, for readability.
- **Design tip:** combine SIH Blue with SIH Orange for a vibrant, innovative, trustworthy look — this pairing is the signature combination for the whole platform.

**Light mode only, everywhere.** No dark mode variant — this applies to the student-facing site, the PS Explorer, and the admin panel.

---

## 3. Typography

| Use | Typeface |
|---|---|
| Headlines (H1, hero text, oversized display type) | Anton / Bebas Neue |
| Subheadings & body copy | Raleway / Inter |

**Hierarchy:**
- **H1** — Extra Bold / Black, huge.
- **H2** — Semi Bold, medium.
- **Body** — Regular, small.
- **Caption** — Medium/small.

Tagline for the type system: *"Think Big. Build Bold."*

---

## 4. Website Design Rules

The website is the most restrained expression of the system — usable first, bold second. It should feel like the same brand as the posters (Section 6), not an identical layout — posters can be more experimental/editorial; the website needs navigation, forms, filters, and content hierarchy to actually function.

- **Hero First** — make the first screen bold and impactful with huge typography (e.g. a giant three-word stack like "BUILD / SOLVE / INNOVATE").
- **Simple Navigation** — keep it clean, simple, and always visible.
- **Strong Visual Hierarchy** — use scale, color, and spacing to guide attention, not decoration.
- **Large Sections** — use large, full-width sections instead of small cards for primary content blocks.
- **Asymmetrical Layouts** — break the grid intentionally; make it dynamic rather than a rigid symmetric grid.
- **Bold CTAs** — make calls-to-action big, clear, and impossible to miss.

**Where oversized typography belongs (use selectively, not everywhere — this would get gimmicky fast):**
- Hero sections → big typography is the dominant visual element.
- Section transitions → an occasional oversized word or number (e.g. a giant "01 / 02 / 03" step marker, or a single huge word like "IDEATE" as a background graphic layer).
- Feature sections → strong editorial-weight type, but not necessarily giant.
- Cards / content / body copy → normal, readable typography. Don't blow this up.
- Navigation → stays clean and restrained, never oversized.

**Implementation note for the coding agent:** write concrete, buildable rules rather than vague direction. Example of the right level of specificity: *"Hero headline uses 72–120px display typography on desktop, scales responsively, may overlap imagery, and must remain the dominant visual element on that screen."*

---

## 5. Image Design Rules

- **One Main Subject** — keep one main subject in focus per image; don't clutter a single frame with multiple competing subjects.
- **Oversized Typography** — use big type as a graphic element layered over or beside imagery (e.g. a huge word like "FOCUS" or "CREATE" behind/alongside a photo).
- **Duotone / High Contrast** — use duotone, monochrome, or high-contrast image treatment rather than full-color photography.
- **Color Blocks** — use solid color backgrounds or shapes behind/around imagery.
- **Negative Space** — give elements room to breathe; don't fill every inch of the frame.
- **Crop Boldly** — use tight crops and unique, non-standard compositions rather than safe centered shots.

---

## 6. Poster Design Rules

Posters are the most experimental/editorial expression of the system — more license to be bold than the website, while staying on-brand.

- **One Strong Statement** — every poster should communicate one idea, not several.
- **Huge Typography** — make the typography the hero of the poster.
- **Limited Information** — include only essential details (event name, dates, one CTA — not a wall of text).
- **Strong Contrast** — high contrast for maximum visual impact.
- **Visual Overlap** — let images and text overlap intentionally (e.g. a headline word overlapping a photo of a person).
- **Balanced Negative Space** — treat empty space as a design element, not wasted space.

---

## 7. Layout & Composition Patterns

Four core composition patterns to draw from across website sections, images, and posters:
- **Asymmetrical** — off-balance, intentional-grid-break layouts.
- **Split Sections** — content divided into two clear halves (e.g. text block + image block).
- **Overlap** — text or shapes deliberately overlapping imagery.
- **Full-Width Impact** — a single large element (color block, image, or type) spanning the full width for maximum visual weight.

---

## 8. Do's and Don'ts

**Do:**
- Use bold typography.
- Use a limited color set (the 7-color palette above — don't introduce new colors).
- Keep it minimal.
- Use strong contrast.
- Break the grid intentionally.
- Focus on hierarchy.
- Be consistent across every surface (website, images, posters, admin panel).

**Don't:**
- Overcrowd a screen or poster.
- Use too many colors beyond the defined palette.
- Use small typography where the system calls for boldness.
- Follow the grid religiously — some intentional asymmetry is part of the system.
- Add unnecessary decorative elements.
- Lose hierarchy — every screen needs one clear focal point.

---

## 9. Reference Artifacts on File

- Color palette reference sheet (7-color SIH-inspired palette with usage guide).
- "Bold Minimalism Design Rules" master reference sheet (design philosophy, palette, typography rules, website/image/poster rules side-by-side, do's/don'ts, layout composition examples).
- A worked website mockup example applying these rules to a hero section ("BUILD / SOLVE / INNOVATE" headline with oversized type, asymmetrical image placement, numbered 01/02/03 step section, bold CTA).

These are the design system's source-of-truth visuals — when implementing, match them directly rather than reinterpreting the rules from scratch.

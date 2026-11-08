---
name: Serene Clinical & Publishing System
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e4e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#404847'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f0ed'
  outline: '#717977'
  outline-variant: '#c0c8c6'
  surface-tint: '#3d6562'
  primary: '#3d6562'
  on-primary: '#ffffff'
  primary-container: '#7ea8a4'
  on-primary-container: '#113d3a'
  inverse-primary: '#a4cfca'
  secondary: '#845050'
  on-secondary: '#ffffff'
  secondary-container: '#ffbbbb'
  on-secondary-container: '#7b4848'
  tertiary: '#575f66'
  on-tertiary: '#ffffff'
  tertiary-container: '#99a1a8'
  on-tertiary-container: '#30383e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bfebe6'
  primary-fixed-dim: '#a4cfca'
  on-primary-fixed: '#00201e'
  on-primary-fixed-variant: '#244d4a'
  secondary-fixed: '#ffdad9'
  secondary-fixed-dim: '#f9b5b5'
  on-secondary-fixed: '#350f11'
  on-secondary-fixed-variant: '#69393a'
  tertiary-fixed: '#dbe3eb'
  tertiary-fixed-dim: '#bfc7cf'
  on-tertiary-fixed: '#151d22'
  on-tertiary-fixed-variant: '#40484e'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2df'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 36px
    fontWeight: '500'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 26px
    fontWeight: '500'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
  headline-sm:
    fontFamily: Source Serif 4
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
  title-md:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-md:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  quote-lg:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2.5rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-xxl: 4rem
---

## Brand & Style

This design system establishes a clinical-meets-wellness editorial visual tone. It bridges board-certified medical expertise with empathetic, approachable maternal and feminine health guidance. The aesthetic pairs medical authority with compassionate wellness, designed to dissolve clinical anxiety and replace it with calm clarity, warmth, and dignity.

The design movement is **Editorial Minimalism infused with Organic Warmth**. Rather than sterile hospital blues and cold greys, the interface draws upon warm alabaster canvases, botanical soft teal accents, and nurturing rose quartz tones. Typography leads the experience: authoritative serif headlines evoke medical literature and curated publishing, while clean geometric-humanist body text guarantees clarity across educational resources, chapter guides, and digital reading interfaces.

## Colors

The palette balances clinical precision with physiological warmth and organic reassurance:

- **Primary (`#7EA8A4` - Soft Teal):** Communicates restorative calm, clarity, and biological wellness. Used for primary interactive actions, featured tags, and reassuring highlight surfaces.
- **Secondary (`#C98B8B` - Rose Quartz):** Provides warmth, empathy, and bodily tenderness. Used for secondary CTAs, health topic badges, chapter tags, and gentle emphasis.
- **Tertiary (`#3B4349` - Slate Charcoal):** Provides deep, high-legibility contrast for all structural typography, clinical citations, and fine line-art iconography without the harshness of pure black.
- **Neutral (`#FAF8F5` - Warm Alabaster):** Replaces clinical stark white with a breathable, book-paper surface tone that reduces eye strain during prolonged reading.
- **Surface Elevation (`#F5F1EA` - Soft Sand):** Used for cards, callout boxes, and secondary content blocks to create subtle separation against the canvas.

## Typography

The type scale establishes a distinct hierarchy between literary authority and functional interface elements:

- **Headlines & Editorial Callouts (`Source Serif 4`):** Delivers scholarly credibility and timeless warmth. Used for book titles, section headers, author quotes, and chapter designations. It evokes high-end medical monographs and literary publications.
- **Body & Functional UI (`Manrope`):** Delivers optical clarity, legibility, and geometric precision. Used for informative body paragraphs, medical breakdowns, navigation, metadata, and form interactions.
- **Mobile Considerations:** High-level display sizes step down cleanly at mobile viewports to prevent awkward line wrapping while retaining editorial distinction.

## Layout & Spacing

The layout embraces generous breathing room to foster a relaxed, unhurried reading environment.

- **Grid Architecture:** Desktop views utilize a 12-column layout with a maximum container width of `1240px` and `1.5rem` gutters. Tablet devices transition to an 8-column layout, and mobile viewports collapse into a single-column or 4-column structure with `1rem` gutters.
- **Longform Editorial Layout:** Educational ebook previews and longform chapters utilize an offset 8-column layout (max-width `740px`) centered on desktop to preserve optimal line lengths (55–75 characters per line).
- **Rhythm & Padding:** Sections rely on vertical space (`space-xl` and `space-xxl`) rather than heavy rule dividers, reinforcing an open and calming environment.

## Elevation & Depth

Visual hierarchy is maintained through soft tonal layering, subtle borders, and delicate ambient shadows rather than harsh drop shadows.

- **Tonal Layering:** The primary canvas rests on `#FAF8F5`. Elevated containers, such as chapter overview cards or medical disclosure callouts, use `#F5F1EA` or translucent white `#FFFFFF` layered on top.
- **Soft Ambient Shadows:** Elevated components (such as modal sheets, floating ebook reader bars, and purchase cards) use low-contrast, warm-tinted shadows:
  - `elevation-low`: `0 2px 8px -2px rgba(59, 67, 73, 0.05)`
  - `elevation-medium`: `0 8px 24px -4px rgba(59, 67, 73, 0.08)`
  - `elevation-high`: `0 16px 36px -6px rgba(59, 67, 73, 0.12)`
- **Low-Contrast Hairlines:** Where separation is needed without shadow, hairlines use `#7EA8A4` at `15%` opacity or `#3B4349` at `10%` opacity to maintain a gentle, tailored print finish.

## Shapes

With `roundedness: 2`, the system adopts an organic, balanced curvature that softens the user experience while maintaining structured authority:

- **Base Radius (0.5rem / 8px):** Applied to input fields, buttons, metadata badges, and small controls.
- **Large Radius (1rem / 16px):** Applied to ebook cover previews, interactive cards, module blocks, and dialog boxes.
- **Extra Large Radius (1.5rem / 24px):** Applied to featured hero banners, author spotlight panels, and floating navigation bars.
- **Pill Exceptions:** Tags, category chips, and read-time indicators use fully rounded caps (`9999px`) to echo soft botanical contours.

## Components

### Buttons
- **Primary:** Filled `#7EA8A4` with white text (`#FAF8F5`). Border-radius `0.5rem`, padding `0.75rem 1.75rem`, font weight `600`. Hover state gently darkens to `#6D9793`.
- **Secondary:** Filled `#FAF8F5` with a 1px border of `#C98B8B` and text in `#C98B8B`. Hover state applies a subtle tint of `#C98B8B` at 10% opacity.
- **Ghost / Text:** Transparent background with `#3B4349` text and a subtle bottom underline on hover, used for secondary ebook previews or "Read Sample" interactions.

### Cards
- **Ebook & Resource Cards:** Built on a pure white or warm alabaster background with a 1px border in `#EBE6DE` and a 1rem radius. Displays book cover art, category pills, title in `Source Serif 4`, author credentials, and an inline action button.
- **Medical Note / Insight Callouts:** Background tinted with `#7EA8A4` at 8% opacity, accompanied by an icon and an inset border of `#7EA8A4` at 30% opacity to highlight verified medical information.

### Chips & Badges
- **Category Chips:** Light rose quartz (`#C98B8B` at 12% opacity) background with `#8A4A4A` text, or soft teal (`#7EA8A4` at 14% opacity) with `#436663` text. Pill-shaped (`9999px`), padding `0.35rem 0.85rem`, tracking `0.04em`.

### Form Controls & Inputs
- **Text Inputs:** Background `#FAF8F5`, border 1px solid `#DDD7CD`, text `#3B4349`, radius `0.5rem`. On focus, transitions to a 1.5px border of `#7EA8A4` with a subtle focus ring.
- **Checkboxes & Radios:** Colored `#7EA8A4` when selected, with a 2px stroke and soft rounded corners.

### Reading Progress & Chapter Navigators
- **Progress Trackers:** Minimal horizontal bar using `#E5E0D8` as the track and `#7EA8A4` as the active indicator.
- **Author Citation Block:** Profile avatar framed by a delicate double-ring border in `#C98B8B` alongside Dr. Ilupeju's medical credentials set in `Manrope` 600 weight.
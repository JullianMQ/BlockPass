# Design System Specification: The Ethereal Ledger

## 1. Overview & Creative North Star

The Creative North Star for this design system is **"The Ethereal Ledger."**

In the world of blockchain, security often feels rigid and cold. This system pivots away from "Industrial Tech" toward a "High-End Editorial" experience. We treat digital assets not as data points, but as luxury artifacts. By utilizing intentional asymmetry, expansive negative space, and a sophisticated low-contrast palette, we create an environment that feels weightless yet structurally sound. This is achieved by breaking the "template" look—moving away from boxed-in grids and toward a fluid, layered composition where light and depth define the architecture rather than lines and borders.

## 2. Colors & Surface Logic

The palette is rooted in a deep, atmospheric navy (`background: #0b1326`), punctuated by a singular, high-energy electric violet (`primary: #c0c1ff`).

### The "No-Line" Rule

To maintain a premium, seamless aesthetic, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined through tonal shifts. A section is never "outlined"; it is simply "emergent." Use `surface_container_low` for secondary areas sitting atop the main `surface`.

### Surface Hierarchy & Nesting

Treat the UI as a physical stack of semi-translucent materials.

- **Base:** `surface` (#0b1326)
- **Secondary Content:** `surface_container_low` (#131b2e)
- **Interactive Cards:** `surface_container` (#171f33)
- **Elevated Overlays:** `surface_container_highest` (#2d3449)

Nesting should follow a logical "climb." An inner component (like an input field) should typically use a higher-tier surface (e.g., `surface_container_highest`) than its parent container to create a sense of recessed depth.

### The "Glass & Gradient" Rule

To achieve a "futuristic" polish, floating elements (modals, navigation bars) must utilize **Glassmorphism**. Apply `surface_variant` at 40-60% opacity with a `backdrop-filter: blur(20px)`.

Main CTAs must use a **Signature Gradient**:

- **Direction:** 135° Linear
- **From:** `primary` (#c0c1ff)
- **To:** `primary_container` (#8083ff)
  This provides a "visual soul" that flat colors cannot replicate.

## 3. Typography

This design system uses a high-contrast typographic pairing to balance "Futuristic" with "Professional."

- **Display & Headlines (Space Grotesk):** This typeface provides a technical, geometric edge. Use `display-lg` through `headline-sm` with a slightly tighter letter-spacing (-0.02em) to create an authoritative, editorial feel. Use these for NFT titles and event names.
- **Body & Labels (Manrope):** A highly legible, modern sans-serif. Manrope handles the "Security" aspect of the brand. Use `body-md` for all ticket details and transactional data.

**Hierarchy Strategy:** Always lead with a `display-sm` headline in `on_surface`, followed immediately by a `label-md` in `on_secondary_container` (caps) to create a clear, premium information architecture.

## 4. Elevation & Depth

In this design system, depth is a gradient of light, not a shadow.

### The Layering Principle

Avoid the "Shadow-Heavy" look of 2010s design. Instead, stack the `surface-container` tiers. A `surface_container_lowest` card placed on a `surface_container_high` section creates a natural "sunken" effect that feels tactile and secure.

### Ambient Shadows

When an element must float (e.g., a ticket being scanned), use an **Ambient Shadow**:

- **Blur:** 40px - 60px
- **Color:** `on_surface` at 6% opacity.
- **Spread:** -5px
  This mimics natural light dispersion in a dark environment rather than a harsh, artificial drop shadow.

### The "Ghost Border" Fallback

If accessibility requirements demand a container boundary, use a **Ghost Border**.

- **Token:** `outline_variant`
- **Opacity:** 15%
- **Stroke:** 1px
  This ensures the "No-Line" philosophy is respected while providing necessary contrast.

## 5. Components

### Buttons

- **Primary:** Signature Gradient (Primary to Primary-Container), `on_primary` text, `full` roundedness. Use `12` (3rem) height for high-impact actions.
- **Secondary:** Ghost Border (`outline_variant` @ 20%) with `on_surface` text. No fill.
- **Tertiary:** Plain `on_surface` text with a subtle `primary` underline on hover.

### NFT Ticket Cards

Forbid the use of dividers. Use a `surface_container` background with `xl` (0.75rem) roundedness. Separate the "stub" of the ticket using a `surface_container_highest` vertical strip or a simple 2rem gap in the layout.

### Input Fields

Inputs should feel like "wells" in the surface.

- **Background:** `surface_container_highest`
- **Shape:** `md` (0.375rem)
- **Focus State:** A 1px Ghost Border using the `primary` color at 40% opacity.

### Selection Chips

- **State - Default:** `surface_container_low` background, `on_surface_variant` text.
- **State - Selected:** `primary_container` background, `on_primary_container` text.

### Tooltips & Toasts

Use the Glassmorphism rule. `surface_variant` at 80% opacity, `backdrop-filter: blur(12px)`, and a subtle `primary` glow on the bottom edge (1px height).

## 6. Do's and Don'ts

### Do

- **Do** use `20` (5rem) and `24` (6rem) spacing for section breathing room to maintain the editorial feel.
- **Do** use `primary_fixed_dim` for icons to ensure they feel "lit from within" against the dark backgrounds.
- **Do** lean into asymmetry. For example, left-align headlines while right-aligning secondary metadata to create a dynamic visual path.

### Don't

- **Don't** use 100% opaque white (#FFFFFF). Use `on_surface` (#dae2fd) to keep the low-contrast, premium vibe.
- **Don't** use dividers or horizontal rules. Let whitespace and background shifts handle the separation.
- **Don't** use standard `0.25rem` rounding for everything. Use `xl` (0.75rem) for large containers and `full` for interactive buttons to create a "liquid" feel.


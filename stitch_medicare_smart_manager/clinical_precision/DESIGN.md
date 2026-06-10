---
name: Clinical Precision
colors:
  surface: '#f9f9ff'
  surface-dim: '#d0daf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e8eeff'
  surface-container-high: '#dfe8ff'
  surface-container-highest: '#d9e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#434654'
  inverse-surface: '#273143'
  inverse-on-surface: '#ecf0ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#006e28'
  on-secondary: '#ffffff'
  secondary-container: '#6ffb85'
  on-secondary-container: '#00732a'
  tertiary: '#404446'
  on-tertiary: '#ffffff'
  tertiary-container: '#585b5e'
  on-tertiary-container: '#d1d3d6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#72fe88'
  secondary-fixed-dim: '#53e16f'
  on-secondary-fixed: '#002107'
  on-secondary-fixed-variant: '#00531c'
  tertiary-fixed: '#e0e3e6'
  tertiary-fixed-dim: '#c4c7ca'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#44474a'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d9e3fb'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is anchored in the principles of **Modern Medical Professionalism**. It prioritizes clarity, hygiene, and trust to reduce cognitive load for both healthcare providers and patients. The aesthetic is a refined **Minimalism** with a **Corporate Modern** foundation, utilizing generous whitespace to evoke a sense of calm and clinical order.

The target audience includes medical professionals requiring high-density data visualization and patients seeking a frictionless, reassuring experience. Every interaction is designed to feel intentional and precise, avoiding unnecessary ornamentation in favor of functional elegance and accessibility.

## Colors
The palette is rooted in medical semiotics. **Azul Médico** serves as the primary brand color, signaling authority and stability. **Verde Salud** is utilized strategically for positive status indicators, success states, and wellness-related actions.

- **Primary (Azul):** Used for primary actions, active navigation states, and brand-critical elements.
- **Secondary (Verde):** Reserved for "Confirmed" status badges, health metrics, and "Save/Complete" actions.
- **Neutral (Gris):** A sophisticated range of grays manages borders, secondary text, and subtle background partitions to maintain hierarchy without adding visual noise.
- **Surface:** A pure white background is mandatory to maintain a "clean room" feel.
- **Alert (Rojo):** Strictly limited to critical errors, cancellations, and emergency notifications.

## Typography
The design system utilizes **Inter** for its exceptional legibility and neutral, systematic character. The typographic scale is optimized for information density and readability in high-stakes environments.

- **Headlines:** Use Semi-Bold (600) weights with slight negative letter-spacing to maintain a compact, professional appearance.
- **Body:** Standardized at 16px for optimal reading on desktop, with an 18px variant for patient-facing content.
- **Labels:** Small labels utilize a slightly heavier weight (500-600) to ensure they remain legible when used in badges or as metadata under icons.

## Layout & Spacing
This design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The spacing philosophy is based on an **8px linear scale**, ensuring consistent vertical rhythm and alignment across all components.

- **Desktop:** 40px outer margins with 24px gutters. Content should be grouped in logical "modules" or cards to maintain organization.
- **Mobile:** 16px outer margins. Complex data tables should transition to card-based layouts or horizontal-scroll views to maintain usability.
- **Grouping:** Use `lg` (24px) spacing between distinct sections and `md` (16px) for elements within a component (e.g., header to body of a card).

## Elevation & Depth
To maintain the clean, clinical aesthetic, depth is conveyed through **Tonal Layers** and **Ambient Shadows**. This design system avoids heavy shadows in favor of subtle definition.

- **Level 0 (Background):** #FFFFFF. The base canvas.
- **Level 1 (Cards/Surfaces):** White surface with a very soft, diffused shadow (0px 4px 12px rgba(0, 0, 0, 0.05)) and a subtle 1px border (#EAECF0).
- **Level 2 (Hover/Active):** Slightly increased shadow depth (0px 8px 20px rgba(0, 0, 0, 0.08)) to indicate interactivity.
- **Overlays (Modals):** High elevation with a backdrop blur (8px) to focus the user’s attention on critical tasks like prescription entry or appointment booking.

## Shapes
The shape language is **Rounded (Level 2)**. This specific radius (8px / 0.5rem) strikes the perfect balance between the rigid "sharp" corners of legacy medical software and the overly "bubbly" appearance of consumer social apps.

- **Standard Elements:** 8px radius for cards, input fields, and standard buttons.
- **Large Elements:** 16px radius for large modals or container sections.
- **Small Elements:** 4px radius for checkboxes and small utility tags.
- **Pills:** Full rounding is reserved exclusively for **Status Badges** (e.g., "Confirmed") to distinguish them from interactive buttons.

## Components
Consistent implementation of components is vital for the professional feel of the design system.

- **Buttons:** 
  - *Primary:* Azul Médico background, white text. 8px rounded corners.
  - *Secondary:* White background, Azul Médico border and text.
- **Input Fields:** Clean 1px gray borders (#D0D5DD). On focus, the border transitions to Azul Médico with a subtle outer glow.
- **Cards:** White background, 8px radius, and the Level 1 Ambient Shadow. Use cards to group patient information or appointment details.
- **Status Badges (Pills):**
  - *Confirmed:* Light green background with dark green text.
  - *Pending:* Light blue background with dark blue text.
  - *Canceled:* Light gray background with dark gray text.
- **Data Tables:** Minimalist style. No vertical lines; only subtle horizontal dividers (#F2F4F7). Use `label-sm` for headers with high contrast.
- **Lists:** High-density lists for patient records should use 12px padding between items to ensure touch targets are sufficient while maintaining data visibility.
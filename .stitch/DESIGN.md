---
name: NOX Design System
colors:
  surface: '#09090b'
  surface-dim: '#09090b'
  surface-bright: '#27272a'
  surface-container-lowest: '#000000'
  surface-container-low: '#18181b'
  surface-container: '#27272a'
  surface-container-high: '#3f3f46'
  surface-container-highest: '#52525b'
  on-surface: '#fafafa'
  on-surface-variant: '#a1a1aa'
  inverse-surface: '#fafafa'
  inverse-on-surface: '#18181b'
  outline: '#52525b'
  outline-variant: '#3f3f46'
  primary: '#06b6d4'
  on-primary: '#083344'
  primary-container: '#0891b2'
  on-primary-container: '#cffafe'
  secondary: '#a78bfa'
  on-secondary: '#2e1065'
  secondary-container: '#7c3aed'
  on-secondary-container: '#ede9fe'
  error: '#ef4444'
  on-error: '#450a0a'
  error-container: '#b91c1c'
  on-error-container: '#fecaca'
  background: '#09090b'
  on-background: '#fafafa'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
---

## Brand & Style

NOX is a modern, premium social media platform. The aesthetic is "Deep Night"—a dark-first, highly structured interface that relies on deep black backgrounds, stark white text, and singular electric accents (Cyan and Violet). The design must feel professional, cutting-edge, and devoid of clutter.

Strictly **NO EMOJIS** are allowed. All iconography must use thin-stroke (1.5px or 2px), professional SVG line icons (e.g., Lucide or Heroicons). 

## Colors

The core background is Obsidian (#09090b), establishing a void. Panels and cards use slightly elevated greys (#18181b, #27272a). 
**Cyan (#06b6d4)** is the primary active color, used for primary buttons, active links, and positive actions.
**Violet (#a78bfa)** is the secondary accent, used for subtle highlights, mentions, or secondary interactions.

## Typography

- **Headings:** Space Grotesk. Tight letter spacing (-0.02em) creates a technical, editorial feel. 
- **Body & UI Labels:** Inter. Clean, legible, neutral.

## Layout & Spacing

- Boundaries are created by negative space and subtle background color shifts (`surface` to `surface-container-low`), NOT by heavy 1px borders. If borders are necessary, they must be extremely faint (`outline-variant` at 20% opacity).
- Cards should have a generous internal padding (`24px`).
- Use Glassmorphism (blur) sparingly but effectively, specifically for sticky headers or floating navigation bars, over a 60% opaque `surface` background.

## Components

- **Buttons:** Primary buttons are solid Cyan with dark text and `rounded-full` (pill shape). Secondary buttons are outlined or ghost buttons.
- **Avatars:** Perfect circles (`rounded-full`), no borders unless indicating a story ring (which should use a gradient from Cyan to Violet).
- **Icons:** Must be minimal line-art. Absolutely no emojis in placeholders or UI elements.
- **Post Cards:** Clean layouts. User info at the top, content, then a subtle action bar at the bottom with line icons for like, comment, and bookmark.


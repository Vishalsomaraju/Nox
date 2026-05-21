---
name: NOX Design System (Modern Minimalist)
colors:
  surface: '#ffffff'
  surface-dim: '#f8fafc'
  surface-bright: '#ffffff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f5f9'
  surface-container: '#e2e8f0'
  surface-container-high: '#cbd5e1'
  surface-container-highest: '#94a3b8'
  on-surface: '#0f172a'
  on-surface-variant: '#475569'
  inverse-surface: '#0f172a'
  inverse-on-surface: '#f8fafc'
  outline: '#e2e8f0'
  outline-variant: '#f1f5f9'
  primary: '#4f46e5'
  on-primary: '#ffffff'
  primary-container: '#e0e7ff'
  on-primary-container: '#312e81'
  secondary: '#0f172a'
  on-secondary: '#ffffff'
  secondary-container: '#f1f5f9'
  on-secondary-container: '#0f172a'
  error: '#ef4444'
  on-error: '#ffffff'
  error-container: '#fee2e2'
  on-error-container: '#991b1b'
  background: '#f8fafc'
  on-background: '#0f172a'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
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
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
---

## Brand & Style

NOX has transitioned to a **Clean, Modern, and Minimalist** aesthetic. The design prioritizes readability, generous whitespace, and high usability. It feels native, professional, and trustworthy, heavily inspired by premium SaaS tools.

Strictly **NO EMOJIS** are allowed. All iconography must use thin-stroke (1.5px or 2px), professional SVG line icons (e.g., Lucide or Heroicons). 

## Colors

The core background relies on soft whites and extremely faint slates (`#f8fafc`, `#f1f5f9`).
**Indigo (#4f46e5)** is the primary active color, used for primary buttons, active links, and positive actions.
**Slate Dark (#0f172a)** is used for high-contrast primary text and secondary buttons.

*(Note: In Dark Mode, the background flips to `#09090b` and `#121212`, keeping the Indigo accent but softening text to `#f8fafc`)*

## Typography

- **All Text:** Inter. A single, highly readable font family creates a cohesive, utilitarian vibe. Headings use tight letter spacing (-0.02em) to appear crisp.

## Layout & Spacing

- Boundaries are created by soft padding and faint, single-pixel borders (`#e2e8f0` in light mode, `#27272a` in dark mode).
- Cards should have a generous internal padding (`24px`) and a subtle `12px` border radius (`rounded-md`).
- Shadows are soft and diffused, used only to elevate floating elements like dropdowns, modals, and the mobile bottom navigation bar.

## Components

- **Buttons:** Primary buttons are solid Indigo with white text and `rounded-md` (gentle rectangle). Secondary buttons are ghost or softly outlined.
- **Avatars:** Perfect circles (`rounded-full`). Story rings use a solid Indigo border rather than a loud gradient.
- **Icons:** Must be minimal line-art. Absolutely no emojis in placeholders or UI elements.
- **Post Cards:** Clean layouts. User info at the top, content, then a subtle action bar at the bottom with line icons for like, comment, and bookmark.

/**
 * IMGC PAS Design System — Elevation & Shadow Tokens
 *
 * Level 0: No shadow (flat elements)
 * Level 1: Cards, containers
 * Level 2: Dropdowns, popovers
 * Level 3: Modals, dialogs
 * Level 4: Overlays, command palette
 *
 * Dark mode uses lighter shadows with adjusted opacity.
 */

/** Light mode shadow definitions */
export const shadows = {
  /** Level 0 — Flat elements, no shadow */
  none: 'none',
  /** Level 1 — Cards, panels, containers */
  sm: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
  /** Level 2 — Dropdowns, popovers, tooltips */
  md: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
  /** Level 3 — Modals, dialogs, drawers */
  lg: '0 8px 24px rgba(0, 0, 0, 0.14), 0 4px 8px rgba(0, 0, 0, 0.08)',
  /** Level 4 — Overlays, command palette, full-screen modals */
  xl: '0 16px 48px rgba(0, 0, 0, 0.18), 0 8px 16px rgba(0, 0, 0, 0.1)',
  /** Inner shadow for pressed/active states */
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  /** Focus ring shadow (used for accessibility) */
  focus: '0 0 0 2px #1E3A5F, 0 0 0 4px rgba(30, 58, 95, 0.3)',
  /** Focus ring for dark mode */
  focusDark: '0 0 0 2px #5EEAD4, 0 0 0 4px rgba(94, 234, 212, 0.3)',
  /** Error focus ring */
  focusError: '0 0 0 2px #EF4444, 0 0 0 4px rgba(239, 68, 68, 0.3)',
  /** Success highlight glow */
  glow: '0 0 12px rgba(16, 185, 129, 0.4)',
  /** Warning attention glow */
  glowWarning: '0 0 12px rgba(245, 158, 11, 0.4)',
  /** Card hover elevation */
  cardHover: '0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
} as const;

/** Dark mode shadow definitions */
export const darkShadows = {
  none: 'none',
  sm: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
  md: '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.25)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.35)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  focus: '0 0 0 2px #5EEAD4, 0 0 0 4px rgba(94, 234, 212, 0.3)',
  focusError: '0 0 0 2px #EF4444, 0 0 0 4px rgba(239, 68, 68, 0.3)',
  glow: '0 0 12px rgba(16, 185, 129, 0.25)',
  glowWarning: '0 0 12px rgba(245, 158, 11, 0.25)',
  cardHover: '0 4px 16px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.3)',
} as const;

/** Elevation levels as semantic names */
export const elevation = {
  flat: shadows.none,
  card: shadows.sm,
  dropdown: shadows.md,
  modal: shadows.lg,
  overlay: shadows.xl,
} as const;

/** Tailwind-compatible shadow map */
export const tailwindShadows = {
  'elevation-0': shadows.none,
  'elevation-1': shadows.sm,
  'elevation-2': shadows.md,
  'elevation-3': shadows.lg,
  'elevation-4': shadows.xl,
  'elevation-inner': shadows.inner,
  'elevation-focus': shadows.focus,
  'elevation-focus-dark': shadows.focusDark,
  'elevation-focus-error': shadows.focusError,
  'elevation-glow': shadows.glow,
  'elevation-glow-warning': shadows.glowWarning,
  'elevation-card-hover': shadows.cardHover,
} as const;

export type ElevationToken = typeof elevation;
export type ShadowToken = typeof shadows;

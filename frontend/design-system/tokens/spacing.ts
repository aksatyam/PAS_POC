/**
 * IMGC PAS Design System — Spacing & Grid Tokens
 *
 * Base unit: 4px
 * Layout Grid: 12-column with 24px gutters
 * Content Max Width: 1440px
 * Sidebar: 260px expanded / 72px collapsed
 * Density Modes: Compact (32px), Default (40px), Comfortable (48px)
 */

/** 4px base unit spacing scale */
export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
} as const;

/** Layout dimensions */
export const layout = {
  /** Maximum content width */
  maxWidth: '1440px',
  /** Content area max width (within max) */
  contentMaxWidth: '1280px',
  /** Sidebar expanded width */
  sidebarExpanded: '260px',
  /** Sidebar collapsed width (icon-only) */
  sidebarCollapsed: '72px',
  /** Top bar height */
  topBarHeight: '56px',
  /** Context/Breadcrumb bar height */
  contextBarHeight: '40px',
  /** Status bar height */
  statusBarHeight: '32px',
  /** Grid columns */
  gridColumns: 12,
  /** Grid gutter */
  gridGutter: '24px',
  /** Page padding (horizontal) */
  pagePaddingX: '24px',
  /** Page padding (vertical) */
  pagePaddingY: '24px',
} as const;

/** Density modes for data-heavy views */
export const density = {
  compact: {
    rowHeight: '32px',
    cellPaddingY: '4px',
    cellPaddingX: '8px',
    fontSize: '13px',
    iconSize: 14,
  },
  default: {
    rowHeight: '40px',
    cellPaddingY: '8px',
    cellPaddingX: '12px',
    fontSize: '14px',
    iconSize: 16,
  },
  comfortable: {
    rowHeight: '48px',
    cellPaddingY: '12px',
    cellPaddingX: '16px',
    fontSize: '14px',
    iconSize: 18,
  },
} as const;

/** Breakpoints (matching Tailwind defaults) */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/** Border radius scale */
export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
} as const;

/** Container widths for different screen sizes */
export const containers = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
} as const;

/** Z-index scale */
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  header: 30,
  sidebar: 35,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
  commandPalette: 90,
} as const;

export type SpacingToken = typeof spacing;
export type LayoutToken = typeof layout;
export type DensityMode = keyof typeof density;

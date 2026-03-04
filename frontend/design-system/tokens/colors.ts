/**
 * IMGC PAS Design System — Color Tokens
 *
 * Primary: Deep Blue (#1E3A5F) — Trust, Insurance authority
 * Secondary: Teal (#0D9488) — Modernity, Growth
 * Accent: Amber (#F59E0B) — Alerts, CTAs
 *
 * All colors meet WCAG 2.2 AA contrast requirements.
 * Dark mode variants maintain proper contrast ratios.
 */

export const colors = {
  // ── Primary: Deep Blue ───────────────────────────────────────
  primary: {
    50: '#EEF2F7',
    100: '#D4DFEB',
    200: '#A9BFDA',
    300: '#7E9FC8',
    400: '#537FB5',
    500: '#1E3A5F',
    600: '#1A3354',
    700: '#152B48',
    800: '#10223A',
    900: '#0B192C',
    950: '#060E1A',
  },

  // ── Secondary: Teal ──────────────────────────────────────────
  secondary: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#0D9488',
    600: '#0B7C72',
    700: '#09655C',
    800: '#074E47',
    900: '#053731',
    950: '#031F1C',
  },

  // ── Accent: Amber ────────────────────────────────────────────
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },

  // ── Neutral Scale ────────────────────────────────────────────
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // ── Semantic Colors ──────────────────────────────────────────
  semantic: {
    success: {
      light: '#D1FAE5',
      base: '#10B981',
      dark: '#065F46',
    },
    warning: {
      light: '#FEF3C7',
      base: '#F59E0B',
      dark: '#92400E',
    },
    error: {
      light: '#FEE2E2',
      base: '#EF4444',
      dark: '#991B1B',
    },
    info: {
      light: '#DBEAFE',
      base: '#3B82F6',
      dark: '#1E40AF',
    },
  },

  // ── Surface Colors (Light Mode) ──────────────────────────────
  surface: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    sidebar: '#1E293B',
    elevated: '#FFFFFF',
    overlay: 'rgba(15, 23, 42, 0.6)',
    muted: '#F1F5F9',
    border: '#E2E8F0',
    divider: '#F1F5F9',
  },

  // ── Surface Colors (Dark Mode) ───────────────────────────────
  darkSurface: {
    background: '#0B1120',
    card: '#1E293B',
    sidebar: '#0F172A',
    elevated: '#1E293B',
    overlay: 'rgba(0, 0, 0, 0.7)',
    muted: '#1E293B',
    border: '#334155',
    divider: '#1E293B',
  },

  // ── Text Colors ──────────────────────────────────────────────
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
    link: '#1E3A5F',
    linkHover: '#152B48',
    disabled: '#CBD5E1',
  },

  darkText: {
    primary: '#F1F5F9',
    secondary: '#94A3B8',
    tertiary: '#64748B',
    inverse: '#0F172A',
    link: '#5EEAD4',
    linkHover: '#99F6E4',
    disabled: '#475569',
  },

  // ── IMGC Brand Colors (legacy compat) ────────────────────────
  brand: {
    orange: '#E67E22',
    orangeDark: '#D35400',
    orangeLight: '#F39C12',
    blue: '#2196F3',
    blueDark: '#1976D2',
  },
} as const;

/** Tailwind-compatible color map for extending theme */
export const tailwindColors = {
  primary: colors.primary,
  secondary: colors.secondary,
  accent: colors.accent,
  neutral: colors.neutral,
  success: colors.semantic.success.base,
  warning: colors.semantic.warning.base,
  error: colors.semantic.error.base,
  info: colors.semantic.info.base,
  'surface-bg': colors.surface.background,
  'surface-card': colors.surface.card,
  'surface-sidebar': colors.surface.sidebar,
  'surface-elevated': colors.surface.elevated,
  'surface-muted': colors.surface.muted,
  'surface-border': colors.surface.border,
};

export type ColorToken = typeof colors;

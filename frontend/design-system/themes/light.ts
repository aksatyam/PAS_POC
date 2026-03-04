/**
 * IMGC PAS — Light Theme Configuration
 * Default theme with high-contrast, accessible color assignments.
 */
import { colors } from '../tokens/colors';
import { shadows } from '../tokens/elevation';

export const lightTheme = {
  name: 'light' as const,

  // Background layers
  bg: {
    app: colors.surface.background,
    card: colors.surface.card,
    sidebar: colors.primary[500],
    sidebarHover: colors.primary[600],
    elevated: colors.surface.elevated,
    muted: colors.surface.muted,
    overlay: colors.surface.overlay,
    input: colors.neutral[0],
    inputHover: colors.neutral[50],
    inputFocus: colors.neutral[0],
    hover: colors.neutral[100],
    active: colors.neutral[200],
    selected: colors.primary[50],
    selectedHover: colors.primary[100],
  },

  // Text colors
  text: {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    tertiary: colors.text.tertiary,
    inverse: colors.text.inverse,
    link: colors.text.link,
    linkHover: colors.text.linkHover,
    disabled: colors.text.disabled,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onAccent: '#FFFFFF',
    sidebarText: '#FFFFFF',
    sidebarMuted: 'rgba(255, 255, 255, 0.65)',
  },

  // Border colors
  border: {
    default: colors.surface.border,
    hover: colors.neutral[300],
    focus: colors.primary[500],
    error: colors.semantic.error.base,
    divider: colors.surface.divider,
    input: colors.neutral[300],
  },

  // Shadow tokens
  shadow: {
    card: shadows.sm,
    cardHover: shadows.cardHover,
    dropdown: shadows.md,
    modal: shadows.lg,
    overlay: shadows.xl,
    focus: shadows.focus,
    focusError: shadows.focusError,
    inner: shadows.inner,
  },

  // Component-specific
  button: {
    primary: {
      bg: colors.primary[500],
      bgHover: colors.primary[600],
      bgActive: colors.primary[700],
      text: '#FFFFFF',
    },
    secondary: {
      bg: colors.secondary[500],
      bgHover: colors.secondary[600],
      bgActive: colors.secondary[700],
      text: '#FFFFFF',
    },
    ghost: {
      bg: 'transparent',
      bgHover: colors.neutral[100],
      bgActive: colors.neutral[200],
      text: colors.neutral[700],
    },
    destructive: {
      bg: colors.semantic.error.base,
      bgHover: '#DC2626',
      bgActive: '#B91C1C',
      text: '#FFFFFF',
    },
    outline: {
      bg: 'transparent',
      bgHover: colors.primary[50],
      bgActive: colors.primary[100],
      text: colors.primary[500],
      border: colors.primary[500],
    },
  },

  // Status colors
  status: {
    draft: colors.neutral[400],
    underReview: colors.semantic.info.base,
    approved: colors.semantic.success.base,
    active: '#059669',
    pendingClaim: colors.accent[500],
    claimActive: colors.semantic.error.base,
    expired: colors.neutral[500],
    cancelled: '#DC2626',
    renewed: colors.secondary[500],
    lapsed: '#92400E',
    bound: '#7C3AED',
    quoted: '#6366F1',
  },

  // Chart colors
  chart: {
    primary: colors.primary[500],
    secondary: colors.secondary[500],
    accent: colors.accent[500],
    success: colors.semantic.success.base,
    error: colors.semantic.error.base,
    series: [
      colors.primary[500],
      colors.secondary[500],
      colors.accent[500],
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
      '#84CC16',
      '#F97316',
    ],
  },
} as const;

export type LightTheme = typeof lightTheme;

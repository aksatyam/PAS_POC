/**
 * IMGC PAS — Dark Theme Configuration
 * Full dark palette with WCAG AAA contrast ratios.
 */
import { colors } from '../tokens/colors';
import { darkShadows } from '../tokens/elevation';

export const darkTheme = {
  name: 'dark' as const,

  // Background layers
  bg: {
    app: colors.darkSurface.background,
    card: colors.darkSurface.card,
    sidebar: '#0A0F1A',
    sidebarHover: colors.neutral[800],
    elevated: colors.darkSurface.elevated,
    muted: colors.darkSurface.muted,
    overlay: colors.darkSurface.overlay,
    input: colors.neutral[800],
    inputHover: colors.neutral[700],
    inputFocus: colors.neutral[800],
    hover: colors.neutral[700],
    active: colors.neutral[600],
    selected: 'rgba(30, 58, 95, 0.4)',
    selectedHover: 'rgba(30, 58, 95, 0.6)',
  },

  // Text colors
  text: {
    primary: colors.darkText.primary,
    secondary: colors.darkText.secondary,
    tertiary: colors.darkText.tertiary,
    inverse: colors.darkText.inverse,
    link: colors.darkText.link,
    linkHover: colors.darkText.linkHover,
    disabled: colors.darkText.disabled,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onAccent: '#0F172A',
    sidebarText: '#F1F5F9',
    sidebarMuted: 'rgba(241, 245, 249, 0.5)',
  },

  // Border colors
  border: {
    default: colors.darkSurface.border,
    hover: colors.neutral[500],
    focus: colors.secondary[400],
    error: colors.semantic.error.base,
    divider: colors.darkSurface.divider,
    input: colors.neutral[600],
  },

  // Shadow tokens
  shadow: {
    card: darkShadows.sm,
    cardHover: darkShadows.cardHover,
    dropdown: darkShadows.md,
    modal: darkShadows.lg,
    overlay: darkShadows.xl,
    focus: darkShadows.focus,
    focusError: darkShadows.focusError,
    inner: darkShadows.inner,
  },

  // Component-specific
  button: {
    primary: {
      bg: colors.primary[400],
      bgHover: colors.primary[300],
      bgActive: colors.primary[500],
      text: '#FFFFFF',
    },
    secondary: {
      bg: colors.secondary[500],
      bgHover: colors.secondary[400],
      bgActive: colors.secondary[600],
      text: '#FFFFFF',
    },
    ghost: {
      bg: 'transparent',
      bgHover: colors.neutral[700],
      bgActive: colors.neutral[600],
      text: colors.neutral[200],
    },
    destructive: {
      bg: '#DC2626',
      bgHover: '#EF4444',
      bgActive: '#B91C1C',
      text: '#FFFFFF',
    },
    outline: {
      bg: 'transparent',
      bgHover: 'rgba(30, 58, 95, 0.3)',
      bgActive: 'rgba(30, 58, 95, 0.5)',
      text: colors.primary[300],
      border: colors.primary[400],
    },
  },

  // Status colors (adjusted for dark backgrounds)
  status: {
    draft: colors.neutral[400],
    underReview: '#60A5FA',
    approved: '#34D399',
    active: '#10B981',
    pendingClaim: '#FBBF24',
    claimActive: '#F87171',
    expired: colors.neutral[400],
    cancelled: '#F87171',
    renewed: '#2DD4BF',
    lapsed: '#FBBF24',
    bound: '#A78BFA',
    quoted: '#818CF8',
  },

  // Chart colors (brighter for dark backgrounds)
  chart: {
    primary: colors.primary[300],
    secondary: colors.secondary[400],
    accent: colors.accent[400],
    success: '#34D399',
    error: '#F87171',
    series: [
      '#7E9FC8',
      '#2DD4BF',
      '#FBBF24',
      '#A78BFA',
      '#F472B6',
      '#22D3EE',
      '#A3E635',
      '#FB923C',
    ],
  },
} as const;

export type DarkTheme = typeof darkTheme;

/**
 * IMGC PAS Design System — Typography Tokens
 *
 * Font Family: Inter (primary), JetBrains Mono (monospace/data)
 * Adaptive Typography: Uses clamp() for responsive sizing
 * Body: 16px base, 1.6 line-height
 * Data/Table: 14px, tabular-nums for number alignment
 */

export const fontFamily = {
  sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Consolas', 'monospace'],
} as const;

export const fontSize = {
  /** Display — Hero headings, landing sections */
  display: {
    size: 'clamp(2rem, 2.5vw, 3rem)',       // 32px → 48px
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
    fontWeight: '800',
  },
  /** H1 — Page titles */
  h1: {
    size: 'clamp(1.75rem, 2vw, 2.25rem)',    // 28px → 36px
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
    fontWeight: '700',
  },
  /** H2 — Section headings */
  h2: {
    size: 'clamp(1.375rem, 1.6vw, 1.75rem)', // 22px → 28px
    lineHeight: '1.25',
    letterSpacing: '-0.01em',
    fontWeight: '700',
  },
  /** H3 — Card titles, subsections */
  h3: {
    size: 'clamp(1.125rem, 1.3vw, 1.375rem)',// 18px → 22px
    lineHeight: '1.3',
    letterSpacing: '-0.005em',
    fontWeight: '600',
  },
  /** H4 — Widget titles, inline headings */
  h4: {
    size: 'clamp(1rem, 1.1vw, 1.125rem)',    // 16px → 18px
    lineHeight: '1.35',
    letterSpacing: '0',
    fontWeight: '600',
  },
  /** H5 — Small section titles */
  h5: {
    size: '0.9375rem',                        // 15px fixed
    lineHeight: '1.4',
    letterSpacing: '0',
    fontWeight: '600',
  },
  /** H6 — Label headings, overline text */
  h6: {
    size: '0.8125rem',                        // 13px fixed
    lineHeight: '1.5',
    letterSpacing: '0.05em',
    fontWeight: '600',
  },
  /** Body Large — Prominent paragraphs */
  bodyLg: {
    size: '1.0625rem',                        // 17px
    lineHeight: '1.6',
    letterSpacing: '0',
    fontWeight: '400',
  },
  /** Body — Default paragraph text */
  body: {
    size: '1rem',                             // 16px
    lineHeight: '1.6',
    letterSpacing: '0',
    fontWeight: '400',
  },
  /** Body Small — Secondary content */
  bodySm: {
    size: '0.875rem',                         // 14px
    lineHeight: '1.5',
    letterSpacing: '0',
    fontWeight: '400',
  },
  /** Caption — Helper text, timestamps */
  caption: {
    size: '0.8125rem',                        // 13px
    lineHeight: '1.4',
    letterSpacing: '0.01em',
    fontWeight: '400',
  },
  /** Small — Fine print, disclaimers */
  small: {
    size: '0.75rem',                          // 12px
    lineHeight: '1.4',
    letterSpacing: '0.01em',
    fontWeight: '400',
  },
  /** Data — Table cells, numeric data */
  data: {
    size: '0.875rem',                         // 14px
    lineHeight: '1.4',
    letterSpacing: '0',
    fontWeight: '400',
    fontVariantNumeric: 'tabular-nums',
  },
  /** Data Large — KPI numbers, metrics */
  dataLg: {
    size: 'clamp(1.5rem, 2vw, 2rem)',         // 24px → 32px
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
    fontWeight: '700',
    fontVariantNumeric: 'tabular-nums',
  },
  /** Code — Inline code, IDs */
  code: {
    size: '0.8125rem',                        // 13px
    lineHeight: '1.5',
    letterSpacing: '0',
    fontWeight: '500',
  },
  /** Overline — Section labels, uppercase markers */
  overline: {
    size: '0.6875rem',                        // 11px
    lineHeight: '1.5',
    letterSpacing: '0.1em',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
  },
} as const;

/** Tailwind-compatible font size map */
export const tailwindFontSize = {
  display: [fontSize.display.size, { lineHeight: fontSize.display.lineHeight, letterSpacing: fontSize.display.letterSpacing }],
  h1: [fontSize.h1.size, { lineHeight: fontSize.h1.lineHeight, letterSpacing: fontSize.h1.letterSpacing }],
  h2: [fontSize.h2.size, { lineHeight: fontSize.h2.lineHeight, letterSpacing: fontSize.h2.letterSpacing }],
  h3: [fontSize.h3.size, { lineHeight: fontSize.h3.lineHeight, letterSpacing: fontSize.h3.letterSpacing }],
  h4: [fontSize.h4.size, { lineHeight: fontSize.h4.lineHeight, letterSpacing: fontSize.h4.letterSpacing }],
  h5: [fontSize.h5.size, { lineHeight: fontSize.h5.lineHeight }],
  h6: [fontSize.h6.size, { lineHeight: fontSize.h6.lineHeight, letterSpacing: fontSize.h6.letterSpacing }],
  'body-lg': [fontSize.bodyLg.size, { lineHeight: fontSize.bodyLg.lineHeight }],
  body: [fontSize.body.size, { lineHeight: fontSize.body.lineHeight }],
  'body-sm': [fontSize.bodySm.size, { lineHeight: fontSize.bodySm.lineHeight }],
  caption: [fontSize.caption.size, { lineHeight: fontSize.caption.lineHeight }],
  small: [fontSize.small.size, { lineHeight: fontSize.small.lineHeight }],
  data: [fontSize.data.size, { lineHeight: fontSize.data.lineHeight }],
  'data-lg': [fontSize.dataLg.size, { lineHeight: fontSize.dataLg.lineHeight, letterSpacing: fontSize.dataLg.letterSpacing }],
  code: [fontSize.code.size, { lineHeight: fontSize.code.lineHeight }],
  overline: [fontSize.overline.size, { lineHeight: fontSize.overline.lineHeight, letterSpacing: fontSize.overline.letterSpacing }],
} as const;

export type TypographyToken = typeof fontSize;

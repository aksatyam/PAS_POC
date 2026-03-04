/**
 * IMGC PAS Design System — Motion & Animation Tokens
 *
 * Micro: 150ms ease-out (button hover, toggle)
 * Standard: 250ms ease-in-out (panel expand, tab switch)
 * Emphasis: 350ms cubic-bezier (modal open, page transition)
 * Reduced Motion: prefers-reduced-motion media query fallback
 */

/** Duration values in milliseconds */
export const duration = {
  instant: 0,
  micro: 150,
  fast: 200,
  standard: 250,
  emphasis: 350,
  slow: 500,
  xslow: 700,
} as const;

/** Easing curves */
export const easing = {
  /** Default ease-out for entrances and interactions */
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  /** Ease-in for exits and dismissals */
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Standard ease-in-out for state changes */
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Emphasis curve for dramatic transitions */
  emphasis: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Spring-like bounce for playful interactions */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Linear for progress bars and loading */
  linear: 'linear',
  /** Sharp for quick snaps */
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

/** Pre-composed transition strings for CSS */
export const transition = {
  /** Button hover, toggle state */
  micro: `all ${duration.micro}ms ${easing.easeOut}`,
  /** Fast feedback */
  fast: `all ${duration.fast}ms ${easing.easeOut}`,
  /** Panel expand, tab switch, sidebar collapse */
  standard: `all ${duration.standard}ms ${easing.easeInOut}`,
  /** Modal open, page slide */
  emphasis: `all ${duration.emphasis}ms ${easing.emphasis}`,
  /** Slow reveals, background changes */
  slow: `all ${duration.slow}ms ${easing.easeInOut}`,
  /** Color transitions only */
  colors: `color ${duration.micro}ms ${easing.easeOut}, background-color ${duration.micro}ms ${easing.easeOut}, border-color ${duration.micro}ms ${easing.easeOut}`,
  /** Shadow transitions for card hover */
  shadow: `box-shadow ${duration.standard}ms ${easing.easeOut}`,
  /** Transform transitions for scale/translate */
  transform: `transform ${duration.standard}ms ${easing.easeOut}`,
  /** Opacity transitions for fade in/out */
  opacity: `opacity ${duration.fast}ms ${easing.easeOut}`,
  /** None — instant, no transition */
  none: 'none',
} as const;

/** Framer Motion animation presets */
export const framerPresets = {
  /** Fade in from transparent */
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: duration.fast / 1000, ease: [0.0, 0, 0.2, 1] },
  },
  /** Slide up and fade in (for modals, cards) */
  slideUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: { duration: duration.standard / 1000, ease: [0.4, 0, 0.2, 1] },
  },
  /** Slide in from right (for drawers, side panels) */
  slideInRight: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 24 },
    transition: { duration: duration.emphasis / 1000, ease: [0.4, 0, 0.2, 1] },
  },
  /** Slide in from left (for sidebar items) */
  slideInLeft: {
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -16 },
    transition: { duration: duration.standard / 1000, ease: [0.4, 0, 0.2, 1] },
  },
  /** Scale in (for tooltips, popovers) */
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: duration.fast / 1000, ease: [0.4, 0, 0.2, 1] },
  },
  /** Spring scale (for buttons, interactive elements) */
  springScale: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  },
  /** Staggered children (for lists, grids) */
  staggerContainer: {
    initial: {},
    animate: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
  },
  staggerItem: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: duration.standard / 1000, ease: [0.4, 0, 0.2, 1] },
  },
  /** Count up animation config for KPI numbers */
  countUp: {
    duration: duration.slow / 1000,
    ease: [0.4, 0, 0.2, 1],
  },
} as const;

/** Tailwind-compatible animation keyframes */
export const keyframes = {
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  fadeOut: {
    from: { opacity: '1' },
    to: { opacity: '0' },
  },
  slideUp: {
    from: { opacity: '0', transform: 'translateY(8px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
  slideDown: {
    from: { opacity: '0', transform: 'translateY(-8px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
  slideInRight: {
    from: { opacity: '0', transform: 'translateX(16px)' },
    to: { opacity: '1', transform: 'translateX(0)' },
  },
  slideOutRight: {
    from: { opacity: '1', transform: 'translateX(0)' },
    to: { opacity: '0', transform: 'translateX(16px)' },
  },
  scaleIn: {
    from: { opacity: '0', transform: 'scale(0.95)' },
    to: { opacity: '1', transform: 'scale(1)' },
  },
  shimmer: {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
  pulseSubtle: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.7' },
  },
  pulseDot: {
    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
    '50%': { opacity: '0.5', transform: 'scale(0.85)' },
  },
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '25%': { transform: 'translateX(-4px)' },
    '75%': { transform: 'translateX(4px)' },
  },
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  countUp: {
    from: { opacity: '0', transform: 'translateY(4px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
} as const;

/** Tailwind-compatible animation map */
export const tailwindAnimations = {
  'fade-in': `fadeIn ${duration.fast}ms ${easing.easeOut}`,
  'fade-out': `fadeOut ${duration.micro}ms ${easing.easeIn}`,
  'slide-up': `slideUp ${duration.standard}ms ${easing.easeOut}`,
  'slide-down': `slideDown ${duration.standard}ms ${easing.easeOut}`,
  'slide-in-right': `slideInRight ${duration.emphasis}ms ${easing.easeOut}`,
  'slide-out-right': `slideOutRight ${duration.fast}ms ${easing.easeIn} forwards`,
  'scale-in': `scaleIn ${duration.fast}ms ${easing.easeOut}`,
  shimmer: `shimmer 1.5s ${easing.linear} infinite`,
  'pulse-subtle': `pulseSubtle 2s ${easing.easeInOut} infinite`,
  'pulse-dot': `pulseDot 1.5s ${easing.easeInOut} infinite`,
  shake: `shake ${duration.emphasis}ms ${easing.easeOut}`,
  spin: `spin 1s ${easing.linear} infinite`,
  'count-up': `countUp ${duration.standard}ms ${easing.easeOut}`,
} as const;

/** CSS media query for reduced motion preference */
export const reducedMotionQuery = '@media (prefers-reduced-motion: reduce)';

/** Helper to get reduced motion-safe transition */
export function safeTransition(t: string): string {
  return t;
}

export type DurationToken = typeof duration;
export type EasingToken = typeof easing;

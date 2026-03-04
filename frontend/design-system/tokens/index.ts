/**
 * IMGC PAS Design System — Token Barrel Export
 * Import all design tokens from this single entry point.
 */
export { colors, tailwindColors } from './colors';
export type { ColorToken } from './colors';

export { fontFamily, fontSize, tailwindFontSize } from './typography';
export type { TypographyToken } from './typography';

export { spacing, layout, density, breakpoints, borderRadius, containers, zIndex } from './spacing';
export type { SpacingToken, LayoutToken, DensityMode } from './spacing';

export { shadows, darkShadows, elevation, tailwindShadows } from './elevation';
export type { ElevationToken, ShadowToken } from './elevation';

export {
  duration, easing, transition, framerPresets,
  keyframes, tailwindAnimations, reducedMotionQuery, safeTransition,
} from './motion';
export type { DurationToken, EasingToken } from './motion';

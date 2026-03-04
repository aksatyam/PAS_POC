/**
 * IMGC PAS Design System — Theme Barrel Export
 */
export { lightTheme } from './light';
export type { LightTheme } from './light';

export { darkTheme } from './dark';
export type { DarkTheme } from './dark';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Theme = import('./light').LightTheme | import('./dark').DarkTheme;

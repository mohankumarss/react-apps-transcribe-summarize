/**
 * Theme Service Exports
 * 
 * Centralized exports for theme-related functionality
 */

// Core theme types
export type {
  ThemeConfig,
  ThemeContextValue,
  ThemeProviderProps,
  ThemeManagerOptions,
  ThemeStylesheet,
  ThemeAssets,
  ThemeMetadata,
  ExtendedThemeConfig,
  ThemeEventData,
  CSSCustomProperties,
  ThemeUtils
} from './themeTypes';

export { ThemeMode, ThemeEvent } from './themeTypes';

// Theme manager
export { ThemeManager } from './themeManager';

// Theme context and hooks
export {
  ThemeProvider,
  useTheme,
  useCurrentTheme,
  useThemeConfig,
  useIsTheme,
  useThemeVariables,
  useThemeStyles,
  withTheme
} from './themeContext';

// Theme utilities
export {
  getCSSVariable,
  setCSSVariable,
  getCSSVariables,
  setCSSVariables,
  generateThemeCSS,
  validateThemeConfig,
  hexToRgb,
  rgbToHex,
  lightenColor,
  darkenColor,
  getContrastRatio,
  isAccessible,
  generateAccessibleColors,
  createThemeClass,
  getThemeStyle,
  mergeThemeConfigs,
  extractThemeColors,
  applyThemeToElement,
  removeThemeFromElement,
  createThemeMediaQuery,
  detectSystemTheme
} from './themeUtils';

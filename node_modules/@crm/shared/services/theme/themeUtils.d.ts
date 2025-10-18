/**
 * Theme Utilities
 *
 * Utility functions for theme management and CSS manipulation
 */
import { ThemeMode, ThemeConfig, CSSCustomProperties } from './themeTypes';
/**
 * Get CSS custom property value
 */
export declare function getCSSVariable(property: string): string;
/**
 * Set CSS custom property value
 */
export declare function setCSSVariable(property: string, value: string): void;
/**
 * Get all CSS custom properties
 */
export declare function getCSSVariables(): CSSCustomProperties;
/**
 * Set multiple CSS custom properties
 */
export declare function setCSSVariables(properties: CSSCustomProperties): void;
/**
 * Generate theme CSS from configuration
 */
export declare function generateThemeCSS(config: ThemeConfig): string;
/**
 * Validate theme configuration
 */
export declare function validateThemeConfig(config: Partial<ThemeConfig>): boolean;
/**
 * Convert hex color to RGB
 */
export declare function hexToRgb(hex: string): {
    r: number;
    g: number;
    b: number;
} | null;
/**
 * Convert RGB to hex color
 */
export declare function rgbToHex(r: number, g: number, b: number): string;
/**
 * Lighten a color by a percentage
 */
export declare function lightenColor(color: string, percent: number): string;
/**
 * Darken a color by a percentage
 */
export declare function darkenColor(color: string, percent: number): string;
/**
 * Get contrast ratio between two colors
 */
export declare function getContrastRatio(color1: string, color2: string): number;
/**
 * Check if a color combination meets WCAG accessibility standards
 */
export declare function isAccessible(foreground: string, background: string, level?: 'AA' | 'AAA'): boolean;
/**
 * Generate accessible color variants
 */
export declare function generateAccessibleColors(baseColor: string): {
    light: string;
    dark: string;
    accessible: string;
};
/**
 * Create theme-aware class name
 */
export declare function createThemeClass(baseClass: string, theme?: ThemeMode): string;
/**
 * Get theme-specific style object
 */
export declare function getThemeStyle(styles: Partial<Record<ThemeMode, React.CSSProperties>>, currentTheme: ThemeMode, fallback?: React.CSSProperties): React.CSSProperties;
/**
 * Merge theme configurations
 */
export declare function mergeThemeConfigs(base: ThemeConfig, override: Partial<ThemeConfig>): ThemeConfig;
/**
 * Extract theme colors from CSS
 */
export declare function extractThemeColors(): Record<string, string>;
/**
 * Apply theme to specific element
 */
export declare function applyThemeToElement(element: HTMLElement, config: ThemeConfig): void;
/**
 * Remove theme from specific element
 */
export declare function removeThemeFromElement(element: HTMLElement): void;
/**
 * Create CSS media query for theme preference
 */
export declare function createThemeMediaQuery(theme: ThemeMode): string;
/**
 * Detect system theme preference
 */
export declare function detectSystemTheme(): ThemeMode;
//# sourceMappingURL=themeUtils.d.ts.map
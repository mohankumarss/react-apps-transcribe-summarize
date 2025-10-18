/**
 * Theme Utilities
 * 
 * Utility functions for theme management and CSS manipulation
 */

import { ThemeMode, ThemeConfig, CSSCustomProperties } from './themeTypes';

/**
 * Get CSS custom property value
 */
export function getCSSVariable(property: string): string {
  if (typeof document === 'undefined') return '';
  
  return getComputedStyle(document.documentElement)
    .getPropertyValue(property)
    .trim();
}

/**
 * Set CSS custom property value
 */
export function setCSSVariable(property: string, value: string): void {
  if (typeof document === 'undefined') return;
  
  document.documentElement.style.setProperty(property, value);
}

/**
 * Get all CSS custom properties
 */
export function getCSSVariables(): CSSCustomProperties {
  if (typeof document === 'undefined') return {};
  
  const styles = getComputedStyle(document.documentElement);
  const properties: CSSCustomProperties = {};
  
  // Get all CSS custom properties (variables starting with --)
  for (let i = 0; i < styles.length; i++) {
    const property = styles[i];
    if (property.startsWith('--')) {
      properties[property] = styles.getPropertyValue(property).trim();
    }
  }
  
  return properties;
}

/**
 * Set multiple CSS custom properties
 */
export function setCSSVariables(properties: CSSCustomProperties): void {
  if (typeof document === 'undefined') return;
  
  Object.entries(properties).forEach(([property, value]) => {
    setCSSVariable(property, String(value));
  });
}

/**
 * Generate theme CSS from configuration
 */
export function generateThemeCSS(config: ThemeConfig): string {
  const cssRules: string[] = [];
  
  // Add root variables
  cssRules.push(`:root[data-theme="${config.mode}"] {`);
  cssRules.push(`  --theme-primary: ${config.primaryColor};`);
  cssRules.push(`  --theme-secondary: ${config.secondaryColor};`);
  cssRules.push(`  --theme-bg-primary: ${config.backgroundColor};`);
  cssRules.push(`  --theme-text-primary: ${config.textColor};`);
  cssRules.push(`  --theme-border-primary: ${config.borderColor};`);
  cssRules.push(`  --theme-font-family: ${config.fontFamily};`);
  
  // Add custom properties
  Object.entries(config.customProperties).forEach(([property, value]) => {
    cssRules.push(`  ${property}: ${value};`);
  });
  
  cssRules.push('}');
  
  return cssRules.join('\n');
}

/**
 * Validate theme configuration
 */
export function validateThemeConfig(config: Partial<ThemeConfig>): boolean {
  const requiredFields: (keyof ThemeConfig)[] = [
    'mode',
    'primaryColor',
    'secondaryColor',
    'backgroundColor',
    'textColor',
    'borderColor',
    'fontFamily',
    'customProperties'
  ];
  
  return requiredFields.every(field => field in config);
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Lighten a color by a percentage
 */
export function lightenColor(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const { r, g, b } = rgb;
  const amount = Math.round(2.55 * percent);
  
  return rgbToHex(
    Math.min(255, r + amount),
    Math.min(255, g + amount),
    Math.min(255, b + amount)
  );
}

/**
 * Darken a color by a percentage
 */
export function darkenColor(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const { r, g, b } = rgb;
  const amount = Math.round(2.55 * percent);
  
  return rgbToHex(
    Math.max(0, r - amount),
    Math.max(0, g - amount),
    Math.max(0, b - amount)
  );
}

/**
 * Get contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if a color combination meets WCAG accessibility standards
 */
export function isAccessible(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Generate accessible color variants
 */
export function generateAccessibleColors(baseColor: string): {
  light: string;
  dark: string;
  accessible: string;
} {
  const light = lightenColor(baseColor, 20);
  const dark = darkenColor(baseColor, 20);
  
  // Find an accessible variant
  let accessible = baseColor;
  const white = '#ffffff';
  const black = '#000000';
  
  if (!isAccessible(baseColor, white)) {
    // Try darkening until accessible
    for (let i = 10; i <= 80; i += 10) {
      const darkened = darkenColor(baseColor, i);
      if (isAccessible(darkened, white)) {
        accessible = darkened;
        break;
      }
    }
  }
  
  return { light, dark, accessible };
}

/**
 * Create theme-aware class name
 */
export function createThemeClass(baseClass: string, theme?: ThemeMode): string {
  if (!theme) return baseClass;
  return `${baseClass} ${baseClass}--${theme}`;
}

/**
 * Get theme-specific style object
 */
export function getThemeStyle(
  styles: Partial<Record<ThemeMode, React.CSSProperties>>,
  currentTheme: ThemeMode,
  fallback: React.CSSProperties = {}
): React.CSSProperties {
  return styles[currentTheme] || fallback;
}

/**
 * Merge theme configurations
 */
export function mergeThemeConfigs(base: ThemeConfig, override: Partial<ThemeConfig>): ThemeConfig {
  return {
    ...base,
    ...override,
    customProperties: {
      ...base.customProperties,
      ...override.customProperties
    }
  };
}

/**
 * Extract theme colors from CSS
 */
export function extractThemeColors(): Record<string, string> {
  const colors: Record<string, string> = {};
  
  const colorProperties = [
    '--theme-primary',
    '--theme-secondary',
    '--theme-bg-primary',
    '--theme-bg-secondary',
    '--theme-text-primary',
    '--theme-text-secondary',
    '--theme-border-primary',
    '--theme-success',
    '--theme-error',
    '--theme-warning',
    '--theme-info'
  ];
  
  colorProperties.forEach(property => {
    const value = getCSSVariable(property);
    if (value) {
      colors[property] = value;
    }
  });
  
  return colors;
}

/**
 * Apply theme to specific element
 */
export function applyThemeToElement(element: HTMLElement, config: ThemeConfig): void {
  element.setAttribute('data-theme', config.mode);
  
  // Apply CSS custom properties to the element
  element.style.setProperty('--theme-primary', config.primaryColor);
  element.style.setProperty('--theme-secondary', config.secondaryColor);
  element.style.setProperty('--theme-bg-primary', config.backgroundColor);
  element.style.setProperty('--theme-text-primary', config.textColor);
  element.style.setProperty('--theme-border-primary', config.borderColor);
  element.style.setProperty('--theme-font-family', config.fontFamily);
  
  Object.entries(config.customProperties).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

/**
 * Remove theme from specific element
 */
export function removeThemeFromElement(element: HTMLElement): void {
  element.removeAttribute('data-theme');
  
  // Remove theme-related CSS custom properties
  const themeProperties = [
    '--theme-primary',
    '--theme-secondary',
    '--theme-bg-primary',
    '--theme-text-primary',
    '--theme-border-primary',
    '--theme-font-family'
  ];
  
  themeProperties.forEach(property => {
    element.style.removeProperty(property);
  });
}

/**
 * Create CSS media query for theme preference
 */
export function createThemeMediaQuery(theme: ThemeMode): string {
  const prefersDark = theme === ThemeMode.MFE;
  return `(prefers-color-scheme: ${prefersDark ? 'dark' : 'light'})`;
}

/**
 * Detect system theme preference
 */
export function detectSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return ThemeMode.CRM;
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? ThemeMode.MFE : ThemeMode.CRM;
}

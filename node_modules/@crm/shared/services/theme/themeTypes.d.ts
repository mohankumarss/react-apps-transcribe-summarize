/**
 * Theme Types and Interfaces
 *
 * Defines the theme system types and interfaces
 */
import { ThemeMode, ThemeConfig } from '../../config/deploymentContext';
export { ThemeMode };
export type { ThemeConfig };
export interface ThemeContextValue {
    currentTheme: ThemeMode;
    themeConfig: ThemeConfig;
    isLoading: boolean;
    error: string | null;
    switchTheme: (theme: ThemeMode) => void;
    resetTheme: () => void;
    applyTheme: (theme: ThemeMode) => void;
}
export interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: ThemeMode;
    enableAutoDetection?: boolean;
    enablePersistence?: boolean;
    storageKey?: string;
}
export interface ThemeManagerOptions {
    enableAutoDetection: boolean;
    enablePersistence: boolean;
    storageKey: string;
    defaultTheme: ThemeMode;
}
export interface ThemeStylesheet {
    id: string;
    href: string;
    loaded: boolean;
    error?: string;
}
export interface ThemeAssets {
    stylesheets: ThemeStylesheet[];
    fonts?: string[];
    icons?: string[];
}
export interface ThemeMetadata {
    name: string;
    displayName: string;
    description: string;
    version: string;
    author: string;
    preview?: string;
    tags: string[];
}
export interface ExtendedThemeConfig extends ThemeConfig {
    metadata: ThemeMetadata;
    assets: ThemeAssets;
}
/**
 * Theme event types
 */
export declare enum ThemeEvent {
    THEME_CHANGED = "theme_changed",
    THEME_LOADING = "theme_loading",
    THEME_LOADED = "theme_loaded",
    THEME_ERROR = "theme_error",
    THEME_RESET = "theme_reset"
}
export interface ThemeEventData {
    event: ThemeEvent;
    theme: ThemeMode;
    previousTheme?: ThemeMode;
    error?: string;
    timestamp: Date;
}
/**
 * CSS custom property mapping
 */
export interface CSSCustomProperties {
    [key: string]: string | number;
}
/**
 * Theme utility functions interface
 */
export interface ThemeUtils {
    getCSSVariable: (property: string) => string;
    setCSSVariable: (property: string, value: string) => void;
    getCSSVariables: () => CSSCustomProperties;
    setCSSVariables: (properties: CSSCustomProperties) => void;
    generateThemeCSS: (config: ThemeConfig) => string;
    validateThemeConfig: (config: Partial<ThemeConfig>) => boolean;
}
//# sourceMappingURL=themeTypes.d.ts.map
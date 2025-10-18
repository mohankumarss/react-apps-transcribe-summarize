/**
 * Theme Manager
 *
 * Handles theme switching, CSS loading, and theme persistence
 */
import { ThemeMode, ThemeConfig, ThemeEventData, ThemeManagerOptions } from './themeTypes';
export declare class ThemeManager {
    private currentTheme;
    private themeConfig;
    private options;
    private listeners;
    private loadedStylesheets;
    constructor(options?: Partial<ThemeManagerOptions>);
    /**
     * Initialize the theme manager
     */
    initialize(): Promise<void>;
    /**
     * Switch to a different theme
     */
    switchTheme(theme: ThemeMode): Promise<void>;
    /**
     * Reset theme to deployment context default
     */
    resetTheme(): Promise<void>;
    /**
     * Get current theme
     */
    getCurrentTheme(): ThemeMode;
    /**
     * Get current theme configuration
     */
    getThemeConfig(): ThemeConfig;
    /**
     * Subscribe to theme events
     */
    onThemeChange(callback: (data: ThemeEventData) => void): () => void;
    /**
     * Apply theme to the DOM
     */
    private applyTheme;
    /**
     * Load theme-specific CSS stylesheet
     */
    private loadThemeStylesheet;
    /**
     * Remove existing theme stylesheets
     */
    private removeThemeStylesheets;
    /**
     * Apply theme-specific CSS classes for compatibility with legacy themes
     */
    private applyThemeClasses;
    /**
     * Get theme stylesheet path
     */
    private getThemeStylesheetPath;
    /**
     * Apply CSS custom properties to document root
     */
    private applyCSSCustomProperties;
    /**
     * Update meta theme-color for mobile browsers
     */
    private updateMetaThemeColor;
    /**
     * Detect initial theme based on options
     */
    private detectInitialTheme;
    /**
     * Detect theme from deployment context
     */
    private detectThemeFromDeploymentContext;
    /**
     * Get theme configuration for a specific mode
     */
    private getThemeConfigForMode;
    /**
     * Create theme configuration for a specific mode
     */
    private createThemeConfigForMode;
    /**
     * Persist theme to storage
     */
    private persistTheme;
    /**
     * Get persisted theme from storage
     */
    private getPersistedTheme;
    /**
     * Clear persisted theme from storage
     */
    private clearPersistedTheme;
    /**
     * Emit theme event
     */
    private emitEvent;
}
//# sourceMappingURL=themeManager.d.ts.map
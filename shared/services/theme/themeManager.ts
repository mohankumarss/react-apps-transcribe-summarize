/**
 * Theme Manager
 * 
 * Handles theme switching, CSS loading, and theme persistence
 */

import { 
  ThemeMode, 
  ThemeConfig, 
  ThemeEvent, 
  ThemeEventData, 
  ThemeManagerOptions,
  CSSCustomProperties 
} from './themeTypes';
import { getDeploymentConfig, getThemeConfig } from '../../config/deploymentContext';
import { logger } from '../../utils/logger';

export class ThemeManager {
  private currentTheme: ThemeMode;
  private themeConfig: ThemeConfig;
  private options: ThemeManagerOptions;
  private listeners: Array<(data: ThemeEventData) => void> = [];
  private loadedStylesheets: Set<string> = new Set();

  constructor(options: Partial<ThemeManagerOptions> = {}) {
    this.options = {
      enableAutoDetection: true,
      enablePersistence: true,
      storageKey: 'crm-app-theme',
      defaultTheme: ThemeMode.CRM,
      ...options
    };

    // Initialize theme from deployment context or storage
    this.currentTheme = this.detectInitialTheme();
    this.themeConfig = this.getThemeConfigForMode(this.currentTheme);
  }

  /**
   * Initialize the theme manager
   */
  public async initialize(): Promise<void> {
    try {
      this.emitEvent(ThemeEvent.THEME_LOADING, this.currentTheme);
      
      // Apply the initial theme
      await this.applyTheme(this.currentTheme);
      
      this.emitEvent(ThemeEvent.THEME_LOADED, this.currentTheme);
      logger.info('Theme manager initialized', { theme: this.currentTheme });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Theme initialization failed';
      this.emitEvent(ThemeEvent.THEME_ERROR, this.currentTheme, { error: errorMessage });
      logger.error('Theme manager initialization failed:', error);
      throw error;
    }
  }

  /**
   * Switch to a different theme
   */
  public async switchTheme(theme: ThemeMode): Promise<void> {
    if (theme === this.currentTheme) {
      return;
    }

    const previousTheme = this.currentTheme;
    
    try {
      this.emitEvent(ThemeEvent.THEME_LOADING, theme, { previousTheme });
      
      // Update theme configuration
      this.currentTheme = theme;
      this.themeConfig = this.getThemeConfigForMode(theme);
      
      // Apply the new theme
      await this.applyTheme(theme);
      
      // Persist theme preference
      if (this.options.enablePersistence) {
        this.persistTheme(theme);
      }
      
      this.emitEvent(ThemeEvent.THEME_CHANGED, theme, { previousTheme });
      logger.info('Theme switched', { from: previousTheme, to: theme });
    } catch (error) {
      // Revert on error
      this.currentTheme = previousTheme;
      this.themeConfig = this.getThemeConfigForMode(previousTheme);
      
      const errorMessage = error instanceof Error ? error.message : 'Theme switch failed';
      this.emitEvent(ThemeEvent.THEME_ERROR, theme, { error: errorMessage, previousTheme });
      logger.error('Theme switch failed:', error);
      throw error;
    }
  }

  /**
   * Reset theme to deployment context default
   */
  public async resetTheme(): Promise<void> {
    const defaultTheme = this.options.enableAutoDetection 
      ? this.detectThemeFromDeploymentContext()
      : this.options.defaultTheme;
    
    await this.switchTheme(defaultTheme);
    
    // Clear persisted theme
    if (this.options.enablePersistence) {
      this.clearPersistedTheme();
    }
    
    this.emitEvent(ThemeEvent.THEME_RESET, defaultTheme);
  }

  /**
   * Get current theme
   */
  public getCurrentTheme(): ThemeMode {
    return this.currentTheme;
  }

  /**
   * Get current theme configuration
   */
  public getThemeConfig(): ThemeConfig {
    return this.themeConfig;
  }

  /**
   * Subscribe to theme events
   */
  public onThemeChange(callback: (data: ThemeEventData) => void): () => void {
    this.listeners.push(callback);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Apply theme to the DOM
   */
  private async applyTheme(theme: ThemeMode): Promise<void> {
    // Set theme data attribute on document root
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    // Apply theme-specific CSS classes for compatibility
    this.applyThemeClasses(theme);

    // Load theme-specific CSS
    await this.loadThemeStylesheet(theme);

    // Apply CSS custom properties
    this.applyCSSCustomProperties(this.themeConfig);

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(this.themeConfig.primaryColor);
  }

  /**
   * Load theme-specific CSS stylesheet
   */
  private async loadThemeStylesheet(theme: ThemeMode): Promise<void> {
    const stylesheetId = `theme-${theme}`;

    // Remove existing theme stylesheets
    this.removeThemeStylesheets();

    // Don't reload if already loaded
    if (this.loadedStylesheets.has(stylesheetId)) {
      return;
    }

    const stylesheetPath = this.getThemeStylesheetPath(theme);

    // If no stylesheet path (e.g., in webpack environment), skip loading
    if (!stylesheetPath) {
      logger.info(`Skipping stylesheet loading for theme ${theme} - relying on CSS custom properties only`);
      this.loadedStylesheets.add(stylesheetId);
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.id = stylesheetId;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = stylesheetPath;

      link.onload = () => {
        this.loadedStylesheets.add(stylesheetId);
        logger.info(`Successfully loaded theme stylesheet: ${stylesheetPath}`);
        resolve();
      };

      link.onerror = () => {
        logger.error(`Failed to load theme stylesheet: ${stylesheetPath || 'unknown path'}`);
        // Don't reject - fall back to CSS custom properties only
        this.loadedStylesheets.add(stylesheetId);
        resolve();
      };

      document.head.appendChild(link);
    });
  }

  /**
   * Remove existing theme stylesheets
   */
  private removeThemeStylesheets(): void {
    const existingLinks = document.querySelectorAll('link[id^="theme-"]');
    existingLinks.forEach(link => {
      link.remove();
      this.loadedStylesheets.delete(link.id);
    });
  }

  /**
   * Apply theme-specific CSS classes for compatibility with legacy themes
   */
  private applyThemeClasses(theme: ThemeMode): void {
    // Remove existing theme classes
    document.body.classList.remove('zb-champion-standard-theme', 'dynamics-crm-theme');

    // Add theme-specific class
    switch (theme) {
      case ThemeMode.MFE:
        document.body.classList.add('zb-champion-standard-theme');
        logger.info('Applied ZB Champion theme class to body');
        break;
      case ThemeMode.CRM:
        document.body.classList.add('dynamics-crm-theme');
        logger.info('Applied Dynamics CRM theme class to body');
        break;
    }
  }

  /**
   * Get theme stylesheet path
   */
  private getThemeStylesheetPath(theme: ThemeMode): string {
    // Map theme modes to specific theme files
    const themeFileMap = {
      [ThemeMode.CRM]: 'dynamics-crm-theme.css',
      [ThemeMode.MFE]: 'zb-champion-mfe-theme.css'
    };

    const fileName = themeFileMap[theme];

    // Check if we're in a webpack environment
    const isWebpack = typeof (globalThis as any).__webpack_require__ !== 'undefined' ||
                      typeof (window as any).__webpack_require__ !== 'undefined';

    if (isWebpack) {
      // In webpack development, use a different approach
      // Skip CSS file loading and rely on CSS custom properties only
      logger.warn(`Skipping CSS file loading in webpack environment for theme: ${theme}`);
      return ''; // Return empty string to skip file loading
    }

    // In production or other environments, use the assets folder
    return `/assets/themes/${fileName}`;
  }

  /**
   * Apply CSS custom properties to document root
   */
  private applyCSSCustomProperties(config: ThemeConfig): void {
    const root = document.documentElement;
    
    // Apply theme config properties
    root.style.setProperty('--theme-primary', config.primaryColor);
    root.style.setProperty('--theme-secondary', config.secondaryColor);
    root.style.setProperty('--theme-bg-primary', config.backgroundColor);
    root.style.setProperty('--theme-text-primary', config.textColor);
    root.style.setProperty('--theme-border-primary', config.borderColor);
    root.style.setProperty('--theme-font-family', config.fontFamily);
    
    // Apply custom properties
    Object.entries(config.customProperties).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  /**
   * Update meta theme-color for mobile browsers
   */
  private updateMetaThemeColor(color: string): void {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.setAttribute('content', color);
  }

  /**
   * Detect initial theme based on options
   */
  private detectInitialTheme(): ThemeMode {
    // Check for persisted theme first
    if (this.options.enablePersistence) {
      const persistedTheme = this.getPersistedTheme();
      if (persistedTheme) {
        return persistedTheme;
      }
    }
    
    // Use deployment context detection
    if (this.options.enableAutoDetection) {
      return this.detectThemeFromDeploymentContext();
    }
    
    // Fall back to default
    return this.options.defaultTheme;
  }

  /**
   * Detect theme from deployment context
   */
  private detectThemeFromDeploymentContext(): ThemeMode {
    try {
      return getThemeConfig().mode;
    } catch (error) {
      logger.warn('Failed to detect theme from deployment context:', error);
      return this.options.defaultTheme;
    }
  }

  /**
   * Get theme configuration for a specific mode
   */
  private getThemeConfigForMode(mode: ThemeMode): ThemeConfig {
    try {
      const deploymentConfig = getDeploymentConfig();
      
      // If the requested mode matches the deployment context, use that config
      if (deploymentConfig.theme.mode === mode) {
        return deploymentConfig.theme;
      }
      
      // Otherwise, create a config for the requested mode
      return this.createThemeConfigForMode(mode);
    } catch (error) {
      logger.warn('Failed to get theme config from deployment context:', error);
      return this.createThemeConfigForMode(mode);
    }
  }

  /**
   * Create theme configuration for a specific mode
   */
  private createThemeConfigForMode(mode: ThemeMode): ThemeConfig {
    // This mirrors the logic from deploymentContext.ts
    switch (mode) {
      case ThemeMode.CRM:
        return {
          mode: ThemeMode.CRM,
          primaryColor: '#0078d4',
          secondaryColor: '#106ebe',
          backgroundColor: '#ffffff',
          textColor: '#323130',
          borderColor: '#8a8886',
          fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
          customProperties: {
            '--crm-header-bg': '#0078d4',
            '--crm-sidebar-bg': '#f3f2f1',
            '--crm-card-bg': '#ffffff',
            '--crm-border-radius': '2px',
            '--crm-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
          }
        };

      case ThemeMode.MFE:
        return {
          mode: ThemeMode.MFE,
          primaryColor: '#6366f1',
          secondaryColor: '#4f46e5',
          backgroundColor: '#f8fafc',
          textColor: '#1e293b',
          borderColor: '#e2e8f0',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
          customProperties: {
            '--mfe-header-bg': '#1e293b',
            '--mfe-sidebar-bg': '#f1f5f9',
            '--mfe-card-bg': '#ffffff',
            '--mfe-border-radius': '8px',
            '--mfe-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }
        };

      default:
        throw new Error(`Unsupported theme mode: ${mode}`);
    }
  }

  /**
   * Persist theme to storage
   */
  private persistTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(this.options.storageKey, theme);
    } catch (error) {
      logger.warn('Failed to persist theme:', error);
    }
  }

  /**
   * Get persisted theme from storage
   */
  private getPersistedTheme(): ThemeMode | null {
    try {
      const stored = localStorage.getItem(this.options.storageKey);
      if (stored && Object.values(ThemeMode).includes(stored as ThemeMode)) {
        return stored as ThemeMode;
      }
    } catch (error) {
      logger.warn('Failed to get persisted theme:', error);
    }
    return null;
  }

  /**
   * Clear persisted theme from storage
   */
  private clearPersistedTheme(): void {
    try {
      localStorage.removeItem(this.options.storageKey);
    } catch (error) {
      logger.warn('Failed to clear persisted theme:', error);
    }
  }

  /**
   * Emit theme event
   */
  private emitEvent(
    event: ThemeEvent, 
    theme: ThemeMode, 
    data?: { previousTheme?: ThemeMode; error?: string }
  ): void {
    const eventData: ThemeEventData = {
      event,
      theme,
      timestamp: new Date(),
      ...data
    };
    
    this.listeners.forEach(listener => {
      try {
        listener(eventData);
      } catch (error) {
        logger.error('Error in theme event listener:', error);
      }
    });
    
    logger.debug('Theme event emitted:', eventData);
  }
}

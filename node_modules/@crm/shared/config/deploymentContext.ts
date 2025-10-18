/**
 * Deployment Context Detection and Configuration Management
 * 
 * This module provides runtime detection of the deployment environment
 * and manages configuration switching between web resource and standalone deployments.
 */

export enum DeploymentMode {
  WEB_RESOURCE = 'web_resource',
  STANDALONE = 'standalone',
  MICROFRONTEND = 'microfrontend'
}

export interface DeploymentCapabilities {
  hasModuleFederation: boolean;
  hasShellOrchestrator: boolean;
  hasSharedDependencies: boolean;
  requiresStandaloneBundle: boolean;
  supportsThemeSwitching: boolean;
  hasNavigationIntegration: boolean;
}

export interface DeploymentContext {
  mode: DeploymentMode;
  capabilities: DeploymentCapabilities;
  optimization: BundleOptimization;
  theme: ThemeConfiguration;
}

export interface BundleOptimization {
  strategy: 'universal' | 'optimized-standalone' | 'mfe-optimized';
  enableCodeSplitting: boolean;
  enableSharedChunks: boolean;
  minifyAssets: boolean;
}

export interface ThemeConfiguration {
  mode: ThemeMode;
  switchingEnabled: boolean;
  runtimeDetection: boolean;
  preserveWebResourceTheme: boolean;
}

export enum ThemeMode {
  CRM = 'crm',
  MFE = 'mfe'
}

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  fontFamily: string;
  customProperties: Record<string, string>;
}

/**
 * Legacy compatibility - maps old deployment modes to consolidated modes
 */
function mapLegacyDeploymentMode(mode: string): DeploymentMode {
  switch (mode) {
    case 'standalone':
    case 'embedded_spa':
    case 'standalone_mfe':
      return DeploymentMode.STANDALONE;
    case 'web_resource':
      return DeploymentMode.WEB_RESOURCE;
    case 'microfrontend':
      return DeploymentMode.MICROFRONTEND;
    default:
      return DeploymentMode.WEB_RESOURCE;
  }
}

export interface DeploymentConfig {
  mode: DeploymentMode;
  theme: ThemeConfig;
  apiBaseUrl: string;
  authMethod: 'dynamics365' | 'msal';
  msalConfig?: {
    clientId: string;
    authority: string;
    redirectUri: string;
    scopes: string[];
  };
  dynamicsConfig?: {
    serverUrl: string;
    version: string;
  };
  features: {
    enableLogging: boolean;
    enableOfflineMode: boolean;
    enableTelemetry: boolean;
    enableThemeSwitching: boolean;
  };
}

/**
 * Universal deployment detector with enhanced capability detection
 */
export class UniversalDeploymentDetector {
  private static instance: UniversalDeploymentDetector;
  private _detectedContext: DeploymentContext | null = null;

  private constructor() {}

  public static getInstance(): UniversalDeploymentDetector {
    if (!UniversalDeploymentDetector.instance) {
      UniversalDeploymentDetector.instance = new UniversalDeploymentDetector();
    }
    return UniversalDeploymentDetector.instance;
  }

  /**
   * Detects complete deployment context with capabilities
   */
  public detectDeploymentContext(): DeploymentContext {
    if (this._detectedContext) {
      return this._detectedContext;
    }

    const mode = this.detectDeploymentMode();
    const capabilities = this.detectCapabilities(mode);
    const optimization = this.detectOptimizationStrategy(mode, capabilities);
    const theme = this.detectThemeConfiguration(mode);

    this._detectedContext = {
      mode,
      capabilities,
      optimization,
      theme
    };

    return this._detectedContext;
  }

  /**
   * Detects deployment capabilities based on runtime environment
   */
  private detectCapabilities(mode: DeploymentMode): DeploymentCapabilities {
    return {
      hasModuleFederation: this.hasModuleFederationSupport(),
      hasShellOrchestrator: this.hasShellContext(),
      hasSharedDependencies: this.hasSharedDependencyAccess(),
      requiresStandaloneBundle: mode === DeploymentMode.STANDALONE || mode === DeploymentMode.WEB_RESOURCE,
      supportsThemeSwitching: mode !== DeploymentMode.WEB_RESOURCE,
      hasNavigationIntegration: this.hasNavigationIntegration()
    };
  }

  /**
   * Detects bundle optimization strategy
   */
  private detectOptimizationStrategy(mode: DeploymentMode, capabilities: DeploymentCapabilities): BundleOptimization {
    if (mode === DeploymentMode.MICROFRONTEND && capabilities.hasModuleFederation) {
      return {
        strategy: 'mfe-optimized',
        enableCodeSplitting: true,
        enableSharedChunks: true,
        minifyAssets: true
      };
    }

    if (capabilities.requiresStandaloneBundle) {
      return {
        strategy: 'optimized-standalone',
        enableCodeSplitting: true,
        enableSharedChunks: false,
        minifyAssets: true
      };
    }

    return {
      strategy: 'universal',
      enableCodeSplitting: true,
      enableSharedChunks: true,
      minifyAssets: true
    };
  }

  /**
   * Detects theme configuration based on deployment mode
   */
  private detectThemeConfiguration(mode: DeploymentMode): ThemeConfiguration {
    const themeMode = this.detectThemeMode(mode);

    return {
      mode: themeMode,
      switchingEnabled: mode !== DeploymentMode.WEB_RESOURCE,
      runtimeDetection: true,
      preserveWebResourceTheme: mode === DeploymentMode.WEB_RESOURCE
    };
  }

  /**
   * Checks if Module Federation is supported in current environment
   */
  private hasModuleFederationSupport(): boolean {
    try {
      // Check for Module Federation runtime (webpack only)
      return typeof window !== 'undefined' &&
             (window as any).__webpack_require__ !== undefined ||
             this.isMicrofrontendEnvironment();
    } catch {
      return false;
    }
  }

  /**
   * Checks if running within a shell orchestrator context
   */
  private hasShellContext(): boolean {
    try {
      if (typeof window === 'undefined') return false;

      // Check for shell-specific markers
      return !!(
        window.parent !== window || // Running in iframe
        (window as any).__shell_context__ || // Shell context marker
        document.querySelector('[data-shell-app]') || // Shell DOM marker
        window.location.pathname.includes('/shell/') // Shell URL pattern
      );
    } catch {
      return false;
    }
  }

  /**
   * Checks if shared dependencies are accessible
   */
  private hasSharedDependencyAccess(): boolean {
    try {
      if (typeof window === 'undefined') return false;

      // Check for shared dependency markers
      return !!(
        (window as any).__shared_deps__ ||
        (window as any).React !== undefined ||
        this.hasModuleFederationSupport()
      );
    } catch {
      return false;
    }
  }

  /**
   * Checks if navigation integration is available
   */
  private hasNavigationIntegration(): boolean {
    try {
      if (typeof window === 'undefined') return false;

      // Check for navigation integration markers
      return !!(
        (window as any).__navigation_integration__ ||
        this.hasShellContext() ||
        document.querySelector('[data-navigation-integrated]')
      );
    } catch {
      return false;
    }
  }

  /**
   * Detects deployment mode using enhanced detection logic
   */
  private detectDeploymentMode(): DeploymentMode {
    // Check for explicit configuration override
    const configOverride = this.getConfigurationOverride();
    if (configOverride) {
      return configOverride;
    }

    // Check for microfrontend context (Module Federation)
    const isMicrofrontendContext = this.isMicrofrontendEnvironment();

    // Check for Dynamics 365 context indicators
    const isDynamics365Context = this.isDynamics365Environment();

    if (isMicrofrontendContext) {
      return DeploymentMode.MICROFRONTEND;
    } else if (isDynamics365Context) {
      return DeploymentMode.WEB_RESOURCE;
    } else {
      return DeploymentMode.STANDALONE;
    }
  }

  /**
   * Gets configuration override from environment or URL
   */
  private getConfigurationOverride(): DeploymentMode | null {
    // Check environment variable
    const envMode = this.getEnvironmentVariable('WEBPACK_DEPLOYMENT_MODE');
    if (envMode && Object.values(DeploymentMode).includes(envMode as DeploymentMode)) {
      return envMode as DeploymentMode;
    }

    // Check URL parameter
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlMode = urlParams.get('deployment_mode');
      if (urlMode && Object.values(DeploymentMode).includes(urlMode as DeploymentMode)) {
        return urlMode as DeploymentMode;
      }
    }

    return null;
  }

  /**
   * Detects theme mode based on deployment mode
   */
  private detectThemeMode(deploymentMode: DeploymentMode): ThemeMode {
    // Map deployment mode to theme mode
    switch (deploymentMode) {
      case DeploymentMode.WEB_RESOURCE:
        return ThemeMode.CRM;
      case DeploymentMode.STANDALONE:
      case DeploymentMode.MICROFRONTEND:
        return ThemeMode.MFE;
      default:
        return ThemeMode.CRM;
    }
  }

  // Delegate to existing methods for compatibility
  private isMicrofrontendEnvironment(): boolean {
    const detector = DeploymentContextDetector.getInstance();
    return (detector as any).isMicrofrontendEnvironment();
  }

  private isDynamics365Environment(): boolean {
    const detector = DeploymentContextDetector.getInstance();
    return (detector as any).isDynamics365Environment();
  }

  private getEnvironmentVariable(key: string): string | null {
    const detector = DeploymentContextDetector.getInstance();
    return (detector as any).getEnvironmentVariable(key);
  }
}

/**
 * Legacy deployment context detector (maintained for backward compatibility)
 */
export class DeploymentContextDetector {
  private static _instance: DeploymentContextDetector;
  private _detectedMode: DeploymentMode | null = null;
  private _config: DeploymentConfig | null = null;

  public static getInstance(): DeploymentContextDetector {
    if (!DeploymentContextDetector._instance) {
      DeploymentContextDetector._instance = new DeploymentContextDetector();
    }
    return DeploymentContextDetector._instance;
  }

  /**
   * Detects the deployment mode based on runtime environment
   */
  public detectDeploymentMode(): DeploymentMode {
    if (this._detectedMode) {
      return this._detectedMode;
    }

    // Check for explicit configuration override
    const configOverride = this.getConfigurationOverride();
    if (configOverride) {
      this._detectedMode = configOverride;
      return this._detectedMode;
    }

    // Check for microfrontend context (Module Federation)
    const isMicrofrontendContext = this.isMicrofrontendEnvironment();

    // Check for Dynamics 365 context indicators
    const isDynamics365Context = this.isDynamics365Environment();

    if (isMicrofrontendContext) {
      this._detectedMode = DeploymentMode.MICROFRONTEND;
    } else if (isDynamics365Context) {
      this._detectedMode = DeploymentMode.WEB_RESOURCE;
    } else {
      this._detectedMode = DeploymentMode.STANDALONE;
    }

    return this._detectedMode;
  }

  /**
   * Detects the appropriate theme mode based on deployment context
   */
  public detectThemeMode(): ThemeMode {
    const deploymentMode = this.detectDeploymentMode();

    // Check for explicit theme override
    const themeOverride = this.getThemeOverride();
    if (themeOverride) {
      return themeOverride;
    }

    // Map deployment mode to theme mode
    switch (deploymentMode) {
      case DeploymentMode.WEB_RESOURCE:
        return ThemeMode.CRM;
      case DeploymentMode.STANDALONE:
      case DeploymentMode.MICROFRONTEND:
        return ThemeMode.MFE;
      default:
        return ThemeMode.CRM;
    }
  }

  /**
   * Checks if running within Dynamics 365 context (web resource)
   */
  private isDynamics365Environment(): boolean {
    try {
      // Check for Dynamics 365 global objects
      if (typeof window !== 'undefined') {
        // Check for Xrm object (Dynamics 365 Client API)
        if ((window as any).Xrm && (window as any).Xrm.WebApi) {
          return true;
        }

        // Check for parent window with Dynamics context
        if (window.parent && window.parent !== window) {
          try {
            if ((window.parent as any).Xrm) {
              return true;
            }
          } catch (e) {
            // Cross-origin access might be blocked, but this could still be D365
          }
        }

        // Check URL patterns that indicate Dynamics 365 web resource
        const url = window.location.href;
        if (url.includes('/WebResources/') || url.includes('/_static/')) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.warn('Error detecting Dynamics 365 environment:', error);
      return false;
    }
  }

  /**
   * Checks if running as a microfrontend (Module Federation)
   */
  private isMicrofrontendEnvironment(): boolean {
    try {
      if (typeof window !== 'undefined') {
        // Check for Module Federation runtime
        if ((window as any).__webpack_require__ && (window as any).__webpack_require__.federation) {
          return true;
        }

        // Check for @module-federation/runtime
        if ((window as any).__FEDERATION__) {
          return true;
        }

        // Check for microfrontend-specific query parameters
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('mfe_mode') || urlParams.has('microfrontend')) {
          return true;
        }

        // Check if loaded as a remote module
        if (window.parent !== window) {
          try {
            // Check if parent has Module Federation runtime
            if ((window.parent as any).__FEDERATION__ || (window.parent as any).__webpack_require__?.federation) {
              return true;
            }
          } catch (e) {
            // Cross-origin access might be blocked
          }
        }
      }

      return false;
    } catch (error) {
      console.warn('Error detecting microfrontend environment:', error);
      return false;
    }
  }



  /**
   * Gets configuration override from environment variables or URL parameters
   */
  private getConfigurationOverride(): DeploymentMode | null {
    try {
      // Check webpack environment variable override first
      const webpackOverride = this.getEnvironmentVariable('WEBPACK_DEPLOYMENT_MODE');
      if (webpackOverride && Object.values(DeploymentMode).includes(webpackOverride as DeploymentMode)) {
        return webpackOverride as DeploymentMode;
      }

      // Check legacy environment variable for backward compatibility
      const envOverride = this.getEnvironmentVariable('DEPLOYMENT_MODE');
      if (envOverride) {
        return mapLegacyDeploymentMode(envOverride);
      }

      // Check URL parameter override (useful for testing)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlOverride = urlParams.get('deploymentMode');
        if (urlOverride) {
          return mapLegacyDeploymentMode(urlOverride);
        }
      }

      return null;
    } catch (error) {
      console.warn('Error getting configuration override:', error);
      return null;
    }
  }

  /**
   * Gets theme override from environment variables or URL parameters
   */
  private getThemeOverride(): ThemeMode | null {
    try {
      // Check environment variable override
      const envOverride = this.getEnvironmentVariable('WEBPACK_THEME_MODE') || this.getEnvironmentVariable('THEME_MODE');
      if (envOverride && Object.values(ThemeMode).includes(envOverride as ThemeMode)) {
        return envOverride as ThemeMode;
      }

      // Check URL parameter override (useful for testing)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlOverride = urlParams.get('themeMode');
        if (urlOverride && Object.values(ThemeMode).includes(urlOverride as ThemeMode)) {
          return urlOverride as ThemeMode;
        }
      }

      return null;
    } catch (error) {
      console.warn('Error getting theme override:', error);
      return null;
    }
  }

  /**
   * Gets environment variable with fallback
   */
  private getEnvironmentVariable(key: string): string | null {
    try {
      // Check if we're in a test environment
      if (typeof process !== 'undefined' && process.env) {
        return process.env[key] || null;
      }

      // Check for webpack environment variables
      if (typeof process !== 'undefined' && process.env) {
        return process.env[key] || null;
      }

      // Fallback for browser environment
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Gets the deployment configuration for the detected mode
   */
  public getDeploymentConfig(): DeploymentConfig {
    if (this._config) {
      return this._config;
    }

    const mode = this.detectDeploymentMode();
    this._config = this.createConfigForMode(mode);
    return this._config;
  }

  /**
   * Creates configuration object for the specified deployment mode
   */
  private createConfigForMode(mode: DeploymentMode): DeploymentConfig {
    const themeMode = this.detectThemeMode();
    const themeConfig = this.createThemeConfig(themeMode);

    const baseConfig = {
      mode,
      theme: themeConfig,
      features: {
        enableLogging: this.getEnvironmentVariable('ENABLE_LOGGING') === 'true' || mode !== DeploymentMode.WEB_RESOURCE,
        enableOfflineMode: this.getEnvironmentVariable('ENABLE_OFFLINE') === 'true' || false,
        enableTelemetry: this.getEnvironmentVariable('ENABLE_TELEMETRY') === 'true' || false,
        enableThemeSwitching: this.getEnvironmentVariable('ENABLE_THEME_SWITCHING') === 'true' || false,
      }
    };

    switch (mode) {
      case DeploymentMode.WEB_RESOURCE:
        return {
          ...baseConfig,
          apiBaseUrl: '', // Will use relative URLs within D365
          authMethod: 'dynamics365',
          dynamicsConfig: {
            serverUrl: this.getEnvironmentVariable('WEBPACK_DYNAMICS_SERVER_URL') || this.getEnvironmentVariable('DYNAMICS_SERVER_URL') || '',
            version: this.getEnvironmentVariable('WEBPACK_DYNAMICS_API_VERSION') || this.getEnvironmentVariable('DYNAMICS_API_VERSION') || '9.2',
          }
        };

      case DeploymentMode.STANDALONE:
        return {
          ...baseConfig,
          apiBaseUrl: this.getEnvironmentVariable('WEBPACK_API_BASE_URL') || this.getEnvironmentVariable('API_BASE_URL') || 'https://your-org.api.crm.dynamics.com/api/data/v9.2',
          authMethod: 'msal',
          msalConfig: {
            clientId: this.getEnvironmentVariable('WEBPACK_MSAL_CLIENT_ID') || this.getEnvironmentVariable('MSAL_CLIENT_ID') || '',
            authority: this.getEnvironmentVariable('WEBPACK_MSAL_AUTHORITY') || this.getEnvironmentVariable('MSAL_AUTHORITY') || 'https://login.microsoftonline.com/common',
            redirectUri: this.getEnvironmentVariable('WEBPACK_MSAL_REDIRECT_URI') || this.getEnvironmentVariable('MSAL_REDIRECT_URI') || window.location.origin,
            scopes: (this.getEnvironmentVariable('WEBPACK_MSAL_SCOPES') || this.getEnvironmentVariable('MSAL_SCOPES') || 'https://your-org.crm.dynamics.com/.default').split(','),
          }
        };

      case DeploymentMode.MICROFRONTEND:
        return {
          ...baseConfig,
          apiBaseUrl: this.getEnvironmentVariable('WEBPACK_API_BASE_URL') || this.getEnvironmentVariable('API_BASE_URL') || 'https://your-org.api.crm.dynamics.com/api/data/v9.2',
          authMethod: 'msal',
          msalConfig: {
            clientId: this.getEnvironmentVariable('WEBPACK_MSAL_CLIENT_ID') || this.getEnvironmentVariable('MSAL_CLIENT_ID') || '',
            authority: this.getEnvironmentVariable('WEBPACK_MSAL_AUTHORITY') || this.getEnvironmentVariable('MSAL_AUTHORITY') || 'https://login.microsoftonline.com/common',
            redirectUri: this.getEnvironmentVariable('WEBPACK_MSAL_REDIRECT_URI') || this.getEnvironmentVariable('MSAL_REDIRECT_URI') || window.location.origin,
            scopes: (this.getEnvironmentVariable('WEBPACK_MSAL_SCOPES') || this.getEnvironmentVariable('MSAL_SCOPES') || 'https://your-org.crm.dynamics.com/.default').split(','),
          },
          features: {
            ...baseConfig.features,
            enableThemeSwitching: true, // Enable theme switching in microfrontend mode
          }
        };

      default:
        throw new Error(`Unsupported deployment mode: ${mode}`);
    }
  }

  /**
   * Creates theme configuration for the specified theme mode
   */
  private createThemeConfig(themeMode: ThemeMode): ThemeConfig {
    switch (themeMode) {
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
            '--crm-spacing-xs': '4px',
            '--crm-spacing-sm': '8px',
            '--crm-spacing-md': '16px',
            '--crm-spacing-lg': '24px',
            '--crm-spacing-xl': '32px',
          }
        };

      case ThemeMode.MFE:
        return {
          mode: ThemeMode.MFE,
          primaryColor: '#5e10b1',
          secondaryColor: '#646068',
          backgroundColor: '#f2f2f8',
          textColor: '#333',
          borderColor: '#646068',
          fontFamily: '"RNHouseSans", Arial, sans-serif',
          customProperties: {
            '--mfe-header-bg': '#333',
            '--mfe-sidebar-bg': '#f9f9fc',
            '--mfe-card-bg': '#ffffff',
            '--mfe-border-radius': '16px',
            '--mfe-shadow': '0 2px 2px 0 rgba(0, 0, 0, 0.1)',
            '--mfe-spacing-xs': '4px',
            '--mfe-spacing-sm': '8px',
            '--mfe-spacing-md': '16px',
            '--mfe-spacing-lg': '24px',
            '--mfe-spacing-xl': '32px',
            '--theme-mobile-breakpoint': '840px',
          }
        };

      default:
        throw new Error(`Unsupported theme mode: ${themeMode}`);
    }
  }

  /**
   * Forces a specific deployment mode (useful for testing)
   */
  public forceDeploymentMode(mode: DeploymentMode): void {
    this._detectedMode = mode;
    this._config = null; // Reset config to regenerate
  }

  /**
   * Resets the detector state
   */
  public reset(): void {
    this._detectedMode = null;
    this._config = null;
  }
}

/**
 * Convenience function to get the current deployment configuration
 */
export function getDeploymentConfig(): DeploymentConfig {
  return DeploymentContextDetector.getInstance().getDeploymentConfig();
}

/**
 * Convenience function to check if running in web resource mode
 */
export function isWebResourceMode(): boolean {
  return getDeploymentConfig().mode === DeploymentMode.WEB_RESOURCE;
}

/**
 * Convenience function to check if running in standalone mode
 */
export function isStandaloneMode(): boolean {
  return getDeploymentConfig().mode === DeploymentMode.STANDALONE;
}

/**
 * Legacy compatibility functions - now map to consolidated modes
 */
export function isEmbeddedSPAMode(): boolean {
  return getDeploymentConfig().mode === DeploymentMode.STANDALONE;
}

export function isStandaloneMFEMode(): boolean {
  return getDeploymentConfig().mode === DeploymentMode.STANDALONE;
}

/**
 * Convenience function to check if running in microfrontend mode
 */
export function isMicrofrontendMode(): boolean {
  return getDeploymentConfig().mode === DeploymentMode.MICROFRONTEND;
}

/**
 * Convenience function to check if running in any non-web-resource mode (legacy compatibility)
 * Maps new deployment modes to legacy standalone concept
 */
export function isLegacyStandaloneMode(): boolean {
  const mode = getDeploymentConfig().mode;
  return mode === DeploymentMode.STANDALONE || mode === DeploymentMode.MICROFRONTEND;
}



/**
 * Convenience function to check if using CRM theme
 */
export function isCRMTheme(): boolean {
  return getDeploymentConfig().theme.mode === ThemeMode.CRM;
}

/**
 * Convenience function to check if using MFE theme
 */
export function isMFETheme(): boolean {
  return getDeploymentConfig().theme.mode === ThemeMode.MFE;
}

/**
 * Convenience function to get current theme configuration
 */
export function getThemeConfig(): ThemeConfig {
  return getDeploymentConfig().theme;
}

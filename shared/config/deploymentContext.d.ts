/**
 * Deployment Context Detection and Configuration Management
 *
 * This module provides runtime detection of the deployment environment
 * and manages configuration switching between web resource and standalone deployments.
 */
export declare enum DeploymentMode {
    WEB_RESOURCE = "web_resource",
    STANDALONE = "standalone",
    MICROFRONTEND = "microfrontend"
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
export declare enum ThemeMode {
    CRM = "crm",
    MFE = "mfe"
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
export declare class UniversalDeploymentDetector {
    private static instance;
    private _detectedContext;
    private constructor();
    static getInstance(): UniversalDeploymentDetector;
    /**
     * Detects complete deployment context with capabilities
     */
    detectDeploymentContext(): DeploymentContext;
    /**
     * Detects deployment capabilities based on runtime environment
     */
    private detectCapabilities;
    /**
     * Detects bundle optimization strategy
     */
    private detectOptimizationStrategy;
    /**
     * Detects theme configuration based on deployment mode
     */
    private detectThemeConfiguration;
    /**
     * Checks if Module Federation is supported in current environment
     */
    private hasModuleFederationSupport;
    /**
     * Checks if running within a shell orchestrator context
     */
    private hasShellContext;
    /**
     * Checks if shared dependencies are accessible
     */
    private hasSharedDependencyAccess;
    /**
     * Checks if navigation integration is available
     */
    private hasNavigationIntegration;
    /**
     * Detects deployment mode using enhanced detection logic
     */
    private detectDeploymentMode;
    /**
     * Gets configuration override from environment or URL
     */
    private getConfigurationOverride;
    /**
     * Detects theme mode based on deployment mode
     */
    private detectThemeMode;
    private isMicrofrontendEnvironment;
    private isDynamics365Environment;
    private getEnvironmentVariable;
}
/**
 * Legacy deployment context detector (maintained for backward compatibility)
 */
export declare class DeploymentContextDetector {
    private static _instance;
    private _detectedMode;
    private _config;
    static getInstance(): DeploymentContextDetector;
    /**
     * Detects the deployment mode based on runtime environment
     */
    detectDeploymentMode(): DeploymentMode;
    /**
     * Detects the appropriate theme mode based on deployment context
     */
    detectThemeMode(): ThemeMode;
    /**
     * Checks if running within Dynamics 365 context (web resource)
     */
    private isDynamics365Environment;
    /**
     * Checks if running as a microfrontend (Module Federation)
     */
    private isMicrofrontendEnvironment;
    /**
     * Gets configuration override from environment variables or URL parameters
     */
    private getConfigurationOverride;
    /**
     * Gets theme override from environment variables or URL parameters
     */
    private getThemeOverride;
    /**
     * Gets environment variable with fallback
     */
    private getEnvironmentVariable;
    /**
     * Gets the deployment configuration for the detected mode
     */
    getDeploymentConfig(): DeploymentConfig;
    /**
     * Creates configuration object for the specified deployment mode
     */
    private createConfigForMode;
    /**
     * Creates theme configuration for the specified theme mode
     */
    private createThemeConfig;
    /**
     * Forces a specific deployment mode (useful for testing)
     */
    forceDeploymentMode(mode: DeploymentMode): void;
    /**
     * Resets the detector state
     */
    reset(): void;
}
/**
 * Convenience function to get the current deployment configuration
 */
export declare function getDeploymentConfig(): DeploymentConfig;
/**
 * Convenience function to check if running in web resource mode
 */
export declare function isWebResourceMode(): boolean;
/**
 * Convenience function to check if running in standalone mode
 */
export declare function isStandaloneMode(): boolean;
/**
 * Legacy compatibility functions - now map to consolidated modes
 */
export declare function isEmbeddedSPAMode(): boolean;
export declare function isStandaloneMFEMode(): boolean;
/**
 * Convenience function to check if running in microfrontend mode
 */
export declare function isMicrofrontendMode(): boolean;
/**
 * Convenience function to check if running in any non-web-resource mode (legacy compatibility)
 * Maps new deployment modes to legacy standalone concept
 */
export declare function isLegacyStandaloneMode(): boolean;
/**
 * Convenience function to check if using CRM theme
 */
export declare function isCRMTheme(): boolean;
/**
 * Convenience function to check if using MFE theme
 */
export declare function isMFETheme(): boolean;
/**
 * Convenience function to get current theme configuration
 */
export declare function getThemeConfig(): ThemeConfig;
//# sourceMappingURL=deploymentContext.d.ts.map
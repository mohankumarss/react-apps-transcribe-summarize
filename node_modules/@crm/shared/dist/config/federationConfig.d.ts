/**
 * Module Federation Configuration
 *
 * Defines shared dependencies, federation settings, and cross-framework compatibility
 */
import { DeploymentMode } from './deploymentContext';
export interface FederationSharedConfig {
    [key: string]: {
        singleton?: boolean;
        strictVersion?: boolean;
        requiredVersion?: string;
        eager?: boolean;
        shareKey?: string;
        shareScope?: string;
    };
}
export interface FederationRemoteConfig {
    name: string;
    url: string;
    format?: 'esm' | 'var' | 'systemjs';
    from?: 'webpack';
}
export interface FederationExposeConfig {
    [key: string]: string;
}
export interface FederationConfig {
    name: string;
    filename?: string;
    exposes?: FederationExposeConfig;
    remotes?: Record<string, FederationRemoteConfig>;
    shared: FederationSharedConfig;
}
/**
 * Base shared dependencies configuration
 * These dependencies will be shared across all microfrontends
 */
export declare const getBaseSharedDependencies: () => FederationSharedConfig;
/**
 * Get additional shared dependencies based on deployment mode
 */
export declare const getDeploymentSpecificSharedDependencies: (deploymentMode: DeploymentMode) => FederationSharedConfig;
/**
 * Get complete shared dependencies configuration
 */
export declare const getSharedDependencies: (deploymentMode?: DeploymentMode) => FederationSharedConfig;
/**
 * Get federation configuration for a specific app
 */
export declare const getFederationConfig: (appName: string, deploymentMode?: DeploymentMode, options?: {
    exposes?: FederationExposeConfig;
    remotes?: Record<string, FederationRemoteConfig>;
    port?: number;
}) => FederationConfig;
/**
 * Default remote configurations for known microfrontends
 */
export declare const getDefaultRemotes: (deploymentMode?: DeploymentMode) => Record<string, FederationRemoteConfig>;
/**
 * Runtime configuration for Module Federation
 */
export declare const getRuntimeConfig: (deploymentMode: DeploymentMode) => {
    remotes: Record<string, FederationRemoteConfig>;
    shared: FederationSharedConfig;
};
//# sourceMappingURL=federationConfig.d.ts.map
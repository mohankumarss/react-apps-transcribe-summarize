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
export const getBaseSharedDependencies = (): FederationSharedConfig => ({
  // React ecosystem - must be singletons
  'react': {
    singleton: true,
    strictVersion: false,
    requiredVersion: '^18.0.0',
    eager: false,
  },
  'react-dom': {
    singleton: true,
    strictVersion: false,
    requiredVersion: '^18.0.0',
    eager: false,
  },
  'react/jsx-runtime': {
    singleton: true,
    strictVersion: false,
    requiredVersion: '^18.0.0',
    eager: false,
  },
  
  // Shared library - singleton to ensure consistent services
  '@crm/shared': {
    singleton: true,
    strictVersion: false,
    eager: false,
  },
  
  // Module Federation runtime
  '@module-federation/runtime': {
    singleton: true,
    strictVersion: false,
    eager: true,
  },
});

/**
 * Get additional shared dependencies based on deployment mode
 */
export const getDeploymentSpecificSharedDependencies = (
  deploymentMode: DeploymentMode
): FederationSharedConfig => {
  const baseConfig: FederationSharedConfig = {};

  switch (deploymentMode) {
    case DeploymentMode.WEB_RESOURCE:
      // In web resource mode, minimize shared dependencies
      // as they might conflict with Dynamics 365
      return {
        ...baseConfig,
        // Only share essential React dependencies
      };

    case DeploymentMode.STANDALONE:
    case DeploymentMode.MICROFRONTEND:
      // In standalone/MFE mode, share more dependencies for optimization
      return {
        ...baseConfig,
        'axios': {
          singleton: true,
          strictVersion: false,
        },
        'date-fns': {
          singleton: true,
          strictVersion: false,
        },
      };

    default:
      return baseConfig;
  }
};

/**
 * Get complete shared dependencies configuration
 */
export const getSharedDependencies = (
  deploymentMode: DeploymentMode = DeploymentMode.STANDALONE
): FederationSharedConfig => {
  const baseShared = getBaseSharedDependencies();
  const deploymentSpecific = getDeploymentSpecificSharedDependencies(deploymentMode);
  
  return {
    ...baseShared,
    ...deploymentSpecific,
  };
};

/**
 * Get federation configuration for a specific app
 */
export const getFederationConfig = (
  appName: string,
  deploymentMode: DeploymentMode = DeploymentMode.STANDALONE,
  options: {
    exposes?: FederationExposeConfig;
    remotes?: Record<string, FederationRemoteConfig>;
    port?: number;
  } = {}
): FederationConfig => {
  const { exposes, remotes, port = 5173 } = options;
  
  return {
    name: appName,
    filename: `${appName}-remote-entry.js`,
    exposes,
    remotes,
    shared: getSharedDependencies(deploymentMode),
  };
};

/**
 * Default remote configurations for known microfrontends
 */
export const getDefaultRemotes = (
  deploymentMode: DeploymentMode = DeploymentMode.STANDALONE
): Record<string, FederationRemoteConfig> => {
  const baseUrl = deploymentMode === DeploymentMode.STANDALONE
    ? 'http://localhost'
    : '';

  return {
    'transcript-and-summary': {
      name: 'transcriptAndSummary',
      url: `${baseUrl}:5176/transcriptAndSummary-remote-entry.js`,
      format: 'var',
      from: 'webpack',
    },
    'if-party-master': {
      name: 'ifPartyMaster',
      url: `${baseUrl}:5174/ifPartyMaster-remote-entry.js`,
      format: 'var',
      from: 'webpack',
    },
  };
};



/**
 * Runtime configuration for Module Federation
 */
export const getRuntimeConfig = (deploymentMode: DeploymentMode) => ({
  // Runtime configuration for @module-federation/runtime
  remotes: getDefaultRemotes(deploymentMode),
  shared: getSharedDependencies(deploymentMode),
});

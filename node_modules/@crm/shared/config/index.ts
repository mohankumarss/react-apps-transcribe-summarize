// Export deployment context utilities
export {
  DeploymentMode,
  DeploymentContextDetector,
  UniversalDeploymentDetector,
  getDeploymentConfig,
  isWebResourceMode,
  isStandaloneMode,
  isStandaloneMFEMode,
  isMicrofrontendMode,
  isEmbeddedSPAMode,
  ThemeMode,
  getThemeConfig,
  isCRMTheme,
  isMFETheme
} from './deploymentContext';

export type {
  DeploymentConfig,
  ThemeConfig,
  DeploymentCapabilities,
  DeploymentContext,
  BundleOptimization,
  ThemeConfiguration
} from './deploymentContext';

// Export federation configuration utilities
export {
  getFederationConfig,
  getSharedDependencies,
  getDefaultRemotes,
  getRuntimeConfig
} from './federationConfig';

export type {
  FederationConfig,
  FederationSharedConfig,
  FederationRemoteConfig,
  FederationExposeConfig
} from './federationConfig';

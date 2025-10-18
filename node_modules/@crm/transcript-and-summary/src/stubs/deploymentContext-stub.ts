/**
 * Stub module for @shared/config/deploymentContext
 * Used in webresource builds to prevent dynamic imports
 */

import { DeploymentContextDetector, DeploymentMode } from '@shared/config';

// Create a minimal implementation that doesn't require dynamic imports
export class UniversalDeploymentDetector {
  private static instance: UniversalDeploymentDetector;

  static getInstance(): UniversalDeploymentDetector {
    if (!UniversalDeploymentDetector.instance) {
      UniversalDeploymentDetector.instance = new UniversalDeploymentDetector();
    }
    return UniversalDeploymentDetector.instance;
  }

  detectDeploymentContext() {
    // For webresource builds, always return web resource context
    return {
      mode: DeploymentMode.WEB_RESOURCE,
      capabilities: {
        moduleLoading: 'static',
        apiAccess: 'dynamics365',
        authentication: 'dynamics365',
        storage: 'dynamics365',
        navigation: 'dynamics365'
      },
      optimization: {
        strategy: 'single-bundle',
        bundleSize: 'optimized',
        caching: 'aggressive'
      }
    };
  }
}

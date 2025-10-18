/**
 * Authentication Factory
 * 
 * Creates the appropriate authentication service based on deployment context
 */

import { IAuthService } from './authTypes';
import { Dynamics365AuthService } from './dynamics365AuthService';
import { MSALAuthService } from './msalAuthService';
import { DisabledAuthService } from './disabledAuthService';
import { getDeploymentConfig, DeploymentMode } from '../../config/deploymentContext';
import { logger } from '../../utils/logger';

/**
 * Factory class for creating authentication services
 */
export class AuthFactory {
  private static _instance: IAuthService | null = null;

  /**
   * Gets the singleton authentication service instance
   */
  public static getInstance(): IAuthService {
    if (!AuthFactory._instance) {
      AuthFactory._instance = AuthFactory.createAuthService();
    }
    return AuthFactory._instance;
  }

  /**
   * Creates the appropriate authentication service based on deployment context
   */
  private static createAuthService(): IAuthService {
    const config = getDeploymentConfig();

    // Enhanced logging for debugging deployment mode issues
    logger.info(`Creating authentication service for ${config.mode} deployment mode`, {
      deploymentMode: config.mode,
      webpackDeploymentMode: typeof process !== 'undefined' ? process.env.WEBPACK_DEPLOYMENT_MODE : 'undefined',
      windowWebpackDeploymentMode: typeof window !== 'undefined' ? (window as any).__WEBPACK_DEPLOYMENT_MODE__ : 'undefined',
      configDetails: {
        mode: config.mode,
        hasTheme: !!config.theme,
        hasFeatures: !!config.features
      }
    });

    switch (config.mode) {
      case DeploymentMode.WEB_RESOURCE:
        return new Dynamics365AuthService();

      case DeploymentMode.STANDALONE:
        if (!config.msalConfig) {
          throw new Error('MSAL configuration is required for standalone deployment mode');
        }
        return new MSALAuthService(config.msalConfig);

      case DeploymentMode.MICROFRONTEND:
        // For microfrontend mode, use disabled authentication for development
        // This allows the apps to run without authentication during development
        logger.warn('Microfrontend mode: Authentication is disabled for development');
        return new DisabledAuthService();

      default:
        throw new Error(`Unsupported deployment mode: ${config.mode}`);
    }
  }

  /**
   * Resets the singleton instance (useful for testing)
   */
  public static reset(): void {
    AuthFactory._instance = null;
  }

  /**
   * Forces creation of a specific authentication service (useful for testing)
   */
  public static forceInstance(authService: IAuthService): void {
    AuthFactory._instance = authService;
  }
}

/**
 * Convenience function to get the authentication service
 */
export function getAuthService(): IAuthService {
  return AuthFactory.getInstance();
}

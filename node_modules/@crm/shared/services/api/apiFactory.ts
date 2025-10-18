/**
 * API Factory
 * 
 * Creates the appropriate API client based on deployment context
 */

import { IApiClient } from './apiTypes';
import { Dynamics365ApiClient } from './dynamics365ApiClient';
import { ExternalApiClient } from '../apiClient';
import { getDeploymentConfig, DeploymentMode } from '../../config/deploymentContext';
import { logger } from '../../utils/logger';

/**
 * Factory class for creating API clients
 */
export class ApiFactory {
  private static _instance: IApiClient | null = null;

  /**
   * Gets the singleton API client instance
   */
  public static async getInstance(): Promise<IApiClient> {
    if (!ApiFactory._instance) {
      ApiFactory._instance = await ApiFactory.createApiClient();
    }
    return ApiFactory._instance;
  }

  /**
   * Creates the appropriate API client based on deployment context
   */
  private static async createApiClient(): Promise<IApiClient> {
    const config = getDeploymentConfig();
    
    logger.info(`Creating API client for ${config.mode} deployment mode`);

    let apiClient: IApiClient;

    switch (config.mode) {
      case DeploymentMode.WEB_RESOURCE:
        apiClient = new Dynamics365ApiClient({
          baseURL: config.apiBaseUrl,
          timeout: 30000,
          headers: {
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Prefer': 'return=representation'
          }
        });
        break;

      case DeploymentMode.STANDALONE:
        apiClient = new ExternalApiClient({
          baseURL: config.apiBaseUrl,
          timeout: 30000,
          headers: {
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Prefer': 'return=representation'
          }
        });
        break;

      default:
        throw new Error(`Unsupported deployment mode: ${config.mode}`);
    }

    // Initialize the API client
    await apiClient.initialize();
    
    return apiClient;
  }

  /**
   * Resets the singleton instance (useful for testing)
   */
  public static reset(): void {
    ApiFactory._instance = null;
  }

  /**
   * Forces creation of a specific API client (useful for testing)
   */
  public static forceInstance(apiClient: IApiClient): void {
    ApiFactory._instance = apiClient;
  }
}

/**
 * Convenience function to get the API client
 */
export async function getApiClient(): Promise<IApiClient> {
  return ApiFactory.getInstance();
}

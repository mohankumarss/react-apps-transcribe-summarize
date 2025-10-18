/**
 * API Factory
 *
 * Creates the appropriate API client based on deployment context
 */
import { IApiClient } from './apiTypes';
/**
 * Factory class for creating API clients
 */
export declare class ApiFactory {
    private static _instance;
    /**
     * Gets the singleton API client instance
     */
    static getInstance(): Promise<IApiClient>;
    /**
     * Creates the appropriate API client based on deployment context
     */
    private static createApiClient;
    /**
     * Resets the singleton instance (useful for testing)
     */
    static reset(): void;
    /**
     * Forces creation of a specific API client (useful for testing)
     */
    static forceInstance(apiClient: IApiClient): void;
}
/**
 * Convenience function to get the API client
 */
export declare function getApiClient(): Promise<IApiClient>;
//# sourceMappingURL=apiFactory.d.ts.map
/**
 * Authentication Factory
 *
 * Creates the appropriate authentication service based on deployment context
 */
import { IAuthService } from './authTypes';
/**
 * Factory class for creating authentication services
 */
export declare class AuthFactory {
    private static _instance;
    /**
     * Gets the singleton authentication service instance
     */
    static getInstance(): IAuthService;
    /**
     * Creates the appropriate authentication service based on deployment context
     */
    private static createAuthService;
    /**
     * Resets the singleton instance (useful for testing)
     */
    static reset(): void;
    /**
     * Forces creation of a specific authentication service (useful for testing)
     */
    static forceInstance(authService: IAuthService): void;
}
/**
 * Convenience function to get the authentication service
 */
export declare function getAuthService(): IAuthService;
//# sourceMappingURL=authFactory.d.ts.map
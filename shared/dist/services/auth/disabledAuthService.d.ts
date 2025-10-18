/**
 * Disabled Authentication Service
 *
 * A no-op authentication service for development and testing scenarios
 * where authentication is not required or should be bypassed.
 */
import { IAuthService, AuthResult, AuthUser, AuthState, LoginCredentials } from './authTypes';
/**
 * Disabled authentication service that bypasses all authentication
 * This is useful for development and testing scenarios
 */
export declare class DisabledAuthService implements IAuthService {
    private _isInitialized;
    private _mockUser;
    private _mockToken;
    private _authState;
    private _stateChangeCallbacks;
    /**
     * Initialize the disabled auth service
     */
    initialize(): Promise<void>;
    /**
     * Get current authentication state
     */
    getAuthState(): AuthState;
    /**
     * Always returns true (user is considered authenticated)
     */
    isAuthenticated(): boolean;
    /**
     * Mock login that always succeeds
     */
    login(_credentials?: LoginCredentials): Promise<AuthResult>;
    /**
     * Mock logout that always succeeds
     */
    logout(): Promise<void>;
    /**
     * Returns mock user info
     */
    getCurrentUser(): Promise<AuthUser | null>;
    /**
     * Returns mock access token
     */
    getAccessToken(): Promise<string | null>;
    /**
     * Mock token refresh that always succeeds
     */
    refreshToken(): Promise<boolean>;
    /**
     * No-op for handling redirects
     */
    handleRedirectPromise(): Promise<AuthResult | null>;
    /**
     * Always returns empty array (no scopes required)
     */
    getRequiredScopes(): string[];
    /**
     * Always returns true (all permissions granted)
     */
    hasPermission(_permission: string): Promise<boolean>;
    /**
     * Always returns all requested permissions
     */
    hasPermissions(permissions: string[]): Promise<boolean[]>;
    /**
     * Subscribe to authentication state changes
     */
    onAuthStateChanged(callback: (state: AuthState) => void): () => void;
    /**
     * Notify all subscribers of state changes
     */
    private _notifyStateChange;
    /**
     * No-op cleanup
     */
    cleanup(): void;
}
//# sourceMappingURL=disabledAuthService.d.ts.map
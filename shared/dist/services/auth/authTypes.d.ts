/**
 * Authentication Types and Interfaces
 *
 * Defines the common interfaces for authentication across different deployment modes
 */
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    roles: string[];
    tenantId?: string;
    organizationId?: string;
}
export interface AuthToken {
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
    scopes: string[];
}
export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    token: AuthToken | null;
}
export interface LoginCredentials {
    email?: string;
    password?: string;
    interactive?: boolean;
}
export interface AuthResult {
    success: boolean;
    user?: AuthUser;
    token?: AuthToken;
    error?: string;
}
/**
 * Abstract authentication service interface
 */
export interface IAuthService {
    /**
     * Initialize the authentication service
     */
    initialize(): Promise<void>;
    /**
     * Get current authentication state
     */
    getAuthState(): AuthState;
    /**
     * Login user
     */
    login(credentials?: LoginCredentials): Promise<AuthResult>;
    /**
     * Logout user
     */
    logout(): Promise<void>;
    /**
     * Get current user
     */
    getCurrentUser(): Promise<AuthUser | null>;
    /**
     * Get valid access token
     */
    getAccessToken(): Promise<string | null>;
    /**
     * Refresh authentication token
     */
    refreshToken(): Promise<boolean>;
    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean;
    /**
     * Subscribe to authentication state changes
     */
    onAuthStateChanged(callback: (state: AuthState) => void): () => void;
}
/**
 * Dynamics 365 specific context information
 */
export interface Dynamics365Context {
    userId: string;
    userRoles: string[];
    organizationId: string;
    organizationName: string;
    serverUrl: string;
    version: string;
}
/**
 * MSAL specific configuration
 */
export interface MSALConfiguration {
    clientId: string;
    authority: string;
    redirectUri: string;
    scopes: string[];
    cacheLocation?: 'localStorage' | 'sessionStorage';
}
/**
 * Authentication events
 */
export declare enum AuthEvent {
    LOGIN_START = "login_start",
    LOGIN_SUCCESS = "login_success",
    LOGIN_FAILURE = "login_failure",
    LOGOUT = "logout",
    TOKEN_REFRESH = "token_refresh",
    TOKEN_EXPIRED = "token_expired",
    AUTH_ERROR = "auth_error"
}
export interface AuthEventData {
    event: AuthEvent;
    user?: AuthUser;
    error?: string;
    timestamp: Date;
}
//# sourceMappingURL=authTypes.d.ts.map
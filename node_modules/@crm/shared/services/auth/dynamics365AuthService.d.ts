/**
 * Dynamics 365 Authentication Service
 *
 * Handles authentication within Dynamics 365 web resource context
 * Uses the implicit authentication provided by the Dynamics 365 platform
 */
import { IAuthService, AuthState, AuthUser, LoginCredentials, AuthResult, Dynamics365Context } from './authTypes';
export declare class Dynamics365AuthService implements IAuthService {
    private authState;
    private listeners;
    private d365Context;
    initialize(): Promise<void>;
    getAuthState(): AuthState;
    login(credentials?: LoginCredentials): Promise<AuthResult>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<AuthUser | null>;
    getAccessToken(): Promise<string | null>;
    refreshToken(): Promise<boolean>;
    isAuthenticated(): boolean;
    onAuthStateChanged(callback: (state: AuthState) => void): () => void;
    private waitForDynamicsContext;
    private isDynamicsContextAvailable;
    private getDynamicsUser;
    private setLoading;
    private notifyListeners;
    private emitAuthEvent;
    /**
     * Get Dynamics 365 specific context information
     */
    getDynamics365Context(): Dynamics365Context | null;
}
//# sourceMappingURL=dynamics365AuthService.d.ts.map
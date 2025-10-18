/**
 * MSAL Authentication Service
 *
 * Handles authentication for standalone SPA deployment using Microsoft Authentication Library
 * Supports OAuth 2.0 flows with Azure AD/Entra ID
 */
import { IAuthService, AuthState, AuthUser, LoginCredentials, AuthResult, MSALConfiguration } from './authTypes';
export declare class MSALAuthService implements IAuthService {
    private authState;
    private listeners;
    private msalInstance;
    private config;
    private tokenRefreshTimer;
    constructor(config: MSALConfiguration);
    initialize(): Promise<void>;
    getAuthState(): AuthState;
    login(credentials?: LoginCredentials): Promise<AuthResult>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<AuthUser | null>;
    getAccessToken(): Promise<string | null>;
    refreshToken(): Promise<boolean>;
    isAuthenticated(): boolean;
    onAuthStateChanged(callback: (state: AuthState) => void): () => void;
    private initializeMSAL;
    private checkExistingAuth;
    private processAuthResult;
    private createUserFromAccount;
    private createTokenFromAuthResult;
    private startTokenRefreshTimer;
    private setLoading;
    private notifyListeners;
    private emitAuthEvent;
    private createMockMSALInstance;
}
//# sourceMappingURL=msalAuthService.d.ts.map
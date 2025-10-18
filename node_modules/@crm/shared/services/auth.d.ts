/**
 * Legacy Auth Service - Refactored to use new abstraction layer
 *
 * This maintains backward compatibility while using the new deployment-aware authentication
 */
import { AuthUser as User, LoginCredentials, AuthState, AuthResult, IAuthService as AuthService } from './auth/authTypes';
export type { User, LoginCredentials, AuthState, AuthResult, AuthService };
export interface UseAuthReturn extends AuthState {
    login: (credentials?: LoginCredentials) => Promise<AuthResult>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<boolean>;
    getCurrentUser: () => Promise<User | null>;
    getAccessToken: () => Promise<string | null>;
    checkAuthenticated: () => boolean;
    onAuthStateChanged: (callback: (state: AuthState) => void) => () => void;
    getAuthState: () => AuthState;
    initialize: () => Promise<void>;
}
declare class LegacyAuthServiceAdapter implements AuthService {
    private authService;
    initialize(): Promise<void>;
    getAuthState(): AuthState;
    login(credentials?: LoginCredentials): Promise<AuthResult>;
    logout(): Promise<void>;
    refreshToken(): Promise<boolean>;
    getCurrentUser(): Promise<User | null>;
    getAccessToken(): Promise<string | null>;
    isAuthenticated(): boolean;
    onAuthStateChanged(callback: (state: AuthState) => void): () => void;
}
export declare const authService: LegacyAuthServiceAdapter;
/**
 * Custom hook for authentication - Refactored to use new abstraction layer
 */
export declare const useAuth: () => UseAuthReturn;
//# sourceMappingURL=auth.d.ts.map
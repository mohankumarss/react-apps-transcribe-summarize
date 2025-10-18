/**
 * Disabled Authentication Service
 * 
 * A no-op authentication service for development and testing scenarios
 * where authentication is not required or should be bypassed.
 */

import { IAuthService, AuthResult, AuthUser, AuthState, AuthToken, LoginCredentials } from './authTypes';
import { logger } from '../../utils/logger';

/**
 * Disabled authentication service that bypasses all authentication
 * This is useful for development and testing scenarios
 */
export class DisabledAuthService implements IAuthService {
  private _isInitialized = false;
  private _mockUser: AuthUser = {
    id: 'dev-user-001',
    name: 'Development User',
    email: 'dev.user@example.com',
    roles: ['user', 'developer'],
  };

  private _mockToken: AuthToken = {
    accessToken: 'mock-access-token',
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    scopes: ['user.read', 'openid', 'profile'],
  };

  private _authState: AuthState = {
    user: this._mockUser,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    token: this._mockToken,
  };

  private _stateChangeCallbacks: ((state: AuthState) => void)[] = [];

  /**
   * Initialize the disabled auth service
   */
  async initialize(): Promise<void> {
    logger.info('DisabledAuthService: Initializing (authentication disabled)');
    this._isInitialized = true;
  }

  /**
   * Get current authentication state
   */
  getAuthState(): AuthState {
    return { ...this._authState };
  }

  /**
   * Always returns true (user is considered authenticated)
   */
  isAuthenticated(): boolean {
    return this._authState.isAuthenticated;
  }

  /**
   * Mock login that always succeeds
   */
  async login(_credentials?: LoginCredentials): Promise<AuthResult> {
    logger.info('DisabledAuthService: Mock login successful');
    this._authState.isLoading = false;
    this._authState.error = null;
    this._notifyStateChange();

    return {
      success: true,
      user: this._mockUser,
      token: this._mockToken,
    };
  }

  /**
   * Mock logout that always succeeds
   */
  async logout(): Promise<void> {
    logger.info('DisabledAuthService: Mock logout successful');
  }

  /**
   * Returns mock user info
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    return this._mockUser;
  }

  /**
   * Returns mock access token
   */
  async getAccessToken(): Promise<string | null> {
    return 'mock-access-token';
  }

  /**
   * Mock token refresh that always succeeds
   */
  async refreshToken(): Promise<boolean> {
    logger.info('DisabledAuthService: Mock token refresh successful');
    // Update the mock token expiry
    this._mockToken.expiresAt = new Date(Date.now() + 3600000);
    this._authState.token = this._mockToken;
    this._notifyStateChange();
    return true;
  }

  /**
   * No-op for handling redirects
   */
  async handleRedirectPromise(): Promise<AuthResult | null> {
    return null;
  }

  /**
   * Always returns empty array (no scopes required)
   */
  getRequiredScopes(): string[] {
    return [];
  }

  /**
   * Always returns true (all permissions granted)
   */
  async hasPermission(_permission: string): Promise<boolean> {
    return true;
  }

  /**
   * Always returns all requested permissions
   */
  async hasPermissions(permissions: string[]): Promise<boolean[]> {
    return permissions.map(() => true);
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChanged(callback: (state: AuthState) => void): () => void {
    this._stateChangeCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this._stateChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this._stateChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers of state changes
   */
  private _notifyStateChange(): void {
    this._stateChangeCallbacks.forEach(callback => {
      try {
        callback({ ...this._authState });
      } catch (error) {
        logger.error('DisabledAuthService: Error in state change callback', error);
      }
    });
  }

  /**
   * No-op cleanup
   */
  cleanup(): void {
    logger.info('DisabledAuthService: Cleanup completed');
    this._isInitialized = false;
    this._stateChangeCallbacks = [];
  }
}

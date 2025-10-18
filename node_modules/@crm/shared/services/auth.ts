/**
 * Legacy Auth Service - Refactored to use new abstraction layer
 *
 * This maintains backward compatibility while using the new deployment-aware authentication
 */

import { useState, useEffect, useCallback } from 'react';
import { getAuthService } from './auth/authFactory';
import {
  AuthUser as User,
  LoginCredentials,
  AuthState,
  AuthResult,
  IAuthService as AuthService
} from './auth/authTypes';
import { logger } from '@shared/utils/logger';

// Re-export types for backward compatibility
export type { User, LoginCredentials, AuthState, AuthResult, AuthService };

// Hook return type that combines state and service methods
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

// Legacy implementation - now delegates to the new abstraction layer
class LegacyAuthServiceAdapter implements AuthService {
  private authService = getAuthService();

  async initialize(): Promise<void> {
    return this.authService.initialize();
  }

  getAuthState(): AuthState {
    return this.authService.getAuthState();
  }

  async login(credentials?: LoginCredentials): Promise<AuthResult> {
    return await this.authService.login(credentials);
  }

  async logout(): Promise<void> {
    return this.authService.logout();
  }

  async refreshToken(): Promise<boolean> {
    return this.authService.refreshToken();
  }

  async getCurrentUser(): Promise<User | null> {
    return this.authService.getCurrentUser();
  }

  async getAccessToken(): Promise<string | null> {
    return this.authService.getAccessToken();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  onAuthStateChanged(callback: (state: AuthState) => void): () => void {
    return this.authService.onAuthStateChanged(callback);
  }
}

export const authService = new LegacyAuthServiceAdapter();

/**
 * Custom hook for authentication - Refactored to use new abstraction layer
 */
export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    token: null
  });

  const authServiceInstance = getAuthService();

  // Initialize auth service and subscribe to state changes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await authServiceInstance.initialize();

        // Subscribe to auth state changes
        const unsubscribe = authServiceInstance.onAuthStateChanged((newState) => {
          setState(newState);
        });

        // Set initial state
        setState(authServiceInstance.getAuthState());

        return unsubscribe;
      } catch (error) {
        logger.error('Auth initialization error:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Authentication initialization failed',
          isLoading: false
        }));
      }
    };

    const unsubscribePromise = initializeAuth();

    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, [authServiceInstance]);

  const login = useCallback(async (credentials?: LoginCredentials): Promise<AuthResult> => {
    return await authServiceInstance.login(credentials);
  }, [authServiceInstance]);

  const logout = useCallback(async (): Promise<void> => {
    await authServiceInstance.logout();
  }, [authServiceInstance]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    return await authServiceInstance.refreshToken();
  }, [authServiceInstance]);

  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    return await authServiceInstance.getCurrentUser();
  }, [authServiceInstance]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    return await authServiceInstance.getAccessToken();
  }, [authServiceInstance]);

  const checkAuthenticated = useCallback((): boolean => {
    return authServiceInstance.isAuthenticated();
  }, [authServiceInstance]);

  const onAuthStateChanged = useCallback((callback: (state: AuthState) => void): () => void => {
    return authServiceInstance.onAuthStateChanged(callback);
  }, [authServiceInstance]);

  const getAuthState = useCallback((): AuthState => {
    return authServiceInstance.getAuthState();
  }, [authServiceInstance]);

  const initialize = useCallback(async (): Promise<void> => {
    return authServiceInstance.initialize();
  }, [authServiceInstance]);

  return {
    ...state,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    getAccessToken,
    checkAuthenticated,
    onAuthStateChanged,
    getAuthState,
    initialize
  };
};

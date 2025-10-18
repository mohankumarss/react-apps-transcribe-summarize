/**
 * MSAL Authentication Service
 * 
 * Handles authentication for standalone SPA deployment using Microsoft Authentication Library
 * Supports OAuth 2.0 flows with Azure AD/Entra ID
 */

import { 
  IAuthService, 
  AuthState, 
  AuthUser, 
  AuthToken, 
  LoginCredentials, 
  AuthResult,
  MSALConfiguration,
  AuthEvent,
  AuthEventData
} from './authTypes';
import { logger } from '../../utils/logger';

// MSAL types (will be available when @azure/msal-browser is installed)
interface MSALInstance {
  initialize(): Promise<void>;
  loginPopup(request?: any): Promise<any>;
  loginRedirect(request?: any): Promise<void>;
  logout(request?: any): Promise<void>;
  acquireTokenSilent(request: any): Promise<any>;
  acquireTokenPopup(request: any): Promise<any>;
  getAllAccounts(): any[];
  getActiveAccount(): any;
  setActiveAccount(account: any): void;
}

export class MSALAuthService implements IAuthService {
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    token: null
  };

  private listeners: Array<(state: AuthState) => void> = [];
  private msalInstance: MSALInstance | null = null;
  private config: MSALConfiguration;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  constructor(config: MSALConfiguration) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    this.setLoading(true);
    
    try {
      // Initialize MSAL instance
      await this.initializeMSAL();
      
      // Check for existing authentication
      await this.checkExistingAuth();
      
      logger.info('MSAL authentication initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'MSAL initialization failed';
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
        token: null
      };
      
      this.emitAuthEvent(AuthEvent.AUTH_ERROR, { error: errorMessage });
      logger.error('MSAL authentication initialization failed:', error);
    }
    
    this.notifyListeners();
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  async login(credentials?: LoginCredentials): Promise<AuthResult> {
    this.setLoading(true);
    this.emitAuthEvent(AuthEvent.LOGIN_START);
    
    try {
      if (!this.msalInstance) {
        throw new Error('MSAL not initialized');
      }

      const loginRequest = {
        scopes: this.config.scopes,
        prompt: credentials?.interactive ? 'select_account' : undefined
      };

      // Try silent login first
      let authResult;
      try {
        authResult = await this.msalInstance.acquireTokenSilent(loginRequest);
      } catch (silentError) {
        // Silent login failed, try interactive login
        authResult = await this.msalInstance.loginPopup(loginRequest);
      }

      // Process authentication result
      const user = await this.processAuthResult(authResult);
      
      if (user) {
        this.authState = {
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          token: this.createTokenFromAuthResult(authResult)
        };
        
        this.startTokenRefreshTimer();
        this.emitAuthEvent(AuthEvent.LOGIN_SUCCESS, { user });
        
        return {
          success: true,
          user,
          token: this.authState.token || undefined
        };
      } else {
        throw new Error('Failed to process authentication result');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
        token: null
      };
      
      this.emitAuthEvent(AuthEvent.LOGIN_FAILURE, { error: errorMessage });
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      this.notifyListeners();
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.tokenRefreshTimer) {
        clearTimeout(this.tokenRefreshTimer);
        this.tokenRefreshTimer = null;
      }

      if (this.msalInstance) {
        await this.msalInstance.logout({
          postLogoutRedirectUri: this.config.redirectUri
        });
      }
    } catch (error) {
      logger.error('Logout error:', error);
    }

    this.authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null
    };
    
    this.emitAuthEvent(AuthEvent.LOGOUT);
    this.notifyListeners();
    logger.info('User logged out successfully');
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.authState.user) {
      return this.authState.user;
    }

    try {
      if (!this.msalInstance) {
        return null;
      }

      const account = this.msalInstance.getActiveAccount();
      if (account) {
        return this.createUserFromAccount(account);
      }

      return null;
    } catch (error) {
      logger.error('Failed to get current user:', error);
      return null;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      if (!this.msalInstance) {
        return null;
      }

      // Check if current token is still valid
      if (this.authState.token && this.authState.token.expiresAt > new Date()) {
        return this.authState.token.accessToken;
      }

      // Try to get a new token silently
      const tokenRequest = {
        scopes: this.config.scopes,
        account: this.msalInstance.getActiveAccount()
      };

      const authResult = await this.msalInstance.acquireTokenSilent(tokenRequest);
      
      if (authResult) {
        this.authState.token = this.createTokenFromAuthResult(authResult);
        this.notifyListeners();
        return authResult.accessToken;
      }

      return null;
    } catch (error) {
      logger.error('Failed to get access token:', error);
      
      // Token might be expired, emit event
      this.emitAuthEvent(AuthEvent.TOKEN_EXPIRED);
      return null;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      
      if (token) {
        this.emitAuthEvent(AuthEvent.TOKEN_REFRESH);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Token refresh failed:', error);
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  onAuthStateChanged(callback: (state: AuthState) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private async initializeMSAL(): Promise<void> {
    try {
      // Dynamic import of MSAL (will be available when package is installed)
      const { PublicClientApplication } = await import('@azure/msal-browser');
      
      const msalConfig = {
        auth: {
          clientId: this.config.clientId,
          authority: this.config.authority,
          redirectUri: this.config.redirectUri
        },
        cache: {
          cacheLocation: this.config.cacheLocation || 'localStorage',
          storeAuthStateInCookie: false
        }
      };

      this.msalInstance = new PublicClientApplication(msalConfig) as any;
      await this.msalInstance!.initialize();
    } catch (error) {
      // If MSAL is not available, create a mock instance for development
      if (error instanceof Error && error.message.includes('Failed to resolve module')) {
        logger.warn('MSAL library not available, using mock implementation');
        this.msalInstance = this.createMockMSALInstance();
      } else {
        throw error;
      }
    }
  }

  private async checkExistingAuth(): Promise<void> {
    if (!this.msalInstance) {
      return;
    }

    try {
      const accounts = this.msalInstance.getAllAccounts();
      
      if (accounts.length > 0) {
        this.msalInstance.setActiveAccount(accounts[0]);
        
        // Try to get a token silently to verify the account is still valid
        const tokenRequest = {
          scopes: this.config.scopes,
          account: accounts[0]
        };

        const authResult = await this.msalInstance.acquireTokenSilent(tokenRequest);
        
        if (authResult) {
          const user = this.createUserFromAccount(accounts[0]);
          
          this.authState = {
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            token: this.createTokenFromAuthResult(authResult)
          };
          
          this.startTokenRefreshTimer();
        }
      }
    } catch (error) {
      logger.debug('No existing valid authentication found:', error);
    }
  }

  private async processAuthResult(authResult: any): Promise<AuthUser | null> {
    if (!authResult || !authResult.account) {
      return null;
    }

    this.msalInstance?.setActiveAccount(authResult.account);
    return this.createUserFromAccount(authResult.account);
  }

  private createUserFromAccount(account: any): AuthUser {
    return {
      id: account.homeAccountId || account.localAccountId,
      email: account.username,
      name: account.name || account.username,
      roles: [], // Roles would need to be fetched from additional API calls
      tenantId: account.tenantId
    };
  }

  private createTokenFromAuthResult(authResult: any): AuthToken {
    return {
      accessToken: authResult.accessToken,
      expiresAt: new Date(authResult.expiresOn),
      scopes: authResult.scopes || this.config.scopes
    };
  }

  private startTokenRefreshTimer(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    if (this.authState.token) {
      // Refresh token 5 minutes before expiry
      const refreshTime = this.authState.token.expiresAt.getTime() - Date.now() - (5 * 60 * 1000);
      
      if (refreshTime > 0) {
        this.tokenRefreshTimer = setTimeout(() => {
          this.refreshToken();
        }, refreshTime);
      }
    }
  }

  private setLoading(loading: boolean): void {
    this.authState.isLoading = loading;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getAuthState());
      } catch (error) {
        logger.error('Error in auth state listener:', error);
      }
    });
  }

  private emitAuthEvent(event: AuthEvent, data?: { user?: AuthUser; error?: string }): void {
    const eventData: AuthEventData = {
      event,
      timestamp: new Date(),
      ...data
    };
    
    logger.debug('Auth event emitted:', eventData);
  }

  private createMockMSALInstance(): MSALInstance {
    // Mock implementation for development when MSAL is not available
    return {
      initialize: async () => {},
      loginPopup: async () => ({ account: { username: 'mock@example.com', name: 'Mock User' }, accessToken: 'mock-token', expiresOn: new Date(Date.now() + 3600000) }),
      loginRedirect: async () => {},
      logout: async () => {},
      acquireTokenSilent: async () => ({ accessToken: 'mock-token', expiresOn: new Date(Date.now() + 3600000) }),
      acquireTokenPopup: async () => ({ accessToken: 'mock-token', expiresOn: new Date(Date.now() + 3600000) }),
      getAllAccounts: () => [],
      getActiveAccount: () => null,
      setActiveAccount: () => {}
    };
  }
}

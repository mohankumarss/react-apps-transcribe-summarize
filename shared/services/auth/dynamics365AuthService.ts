/**
 * Dynamics 365 Authentication Service
 * 
 * Handles authentication within Dynamics 365 web resource context
 * Uses the implicit authentication provided by the Dynamics 365 platform
 */

import { 
  IAuthService, 
  AuthState, 
  AuthUser, 
  AuthToken, 
  LoginCredentials, 
  AuthResult,
  Dynamics365Context,
  AuthEvent,
  AuthEventData
} from './authTypes';
import { logger } from '../../utils/logger';

export class Dynamics365AuthService implements IAuthService {
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    token: null
  };

  private listeners: Array<(state: AuthState) => void> = [];
  private d365Context: Dynamics365Context | null = null;

  async initialize(): Promise<void> {
    this.setLoading(true);
    
    try {
      // Wait for Dynamics 365 context to be available
      await this.waitForDynamicsContext();
      
      // Get user information from Dynamics 365
      const user = await this.getDynamicsUser();
      
      if (user) {
        this.authState = {
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          token: null // D365 handles tokens internally
        };
        
        this.emitAuthEvent(AuthEvent.LOGIN_SUCCESS, { user });
        logger.info('Dynamics 365 authentication initialized successfully');
      } else {
        throw new Error('Failed to get user information from Dynamics 365');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
        token: null
      };
      
      this.emitAuthEvent(AuthEvent.AUTH_ERROR, { error: errorMessage });
      logger.error('Dynamics 365 authentication initialization failed:', error);
    }
    
    this.notifyListeners();
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  async login(credentials?: LoginCredentials): Promise<AuthResult> {
    // In Dynamics 365 context, login is implicit
    // Just verify that we have a valid context
    try {
      if (this.authState.isAuthenticated && this.authState.user) {
        return {
          success: true,
          user: this.authState.user,
          token: this.authState.token || undefined
        };
      }

      // Re-initialize if not authenticated
      await this.initialize();
      
      return {
        success: this.authState.isAuthenticated,
        user: this.authState.user || undefined,
        error: this.authState.error || undefined
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async logout(): Promise<void> {
    // In Dynamics 365 context, we can't really log out
    // Just clear our local state
    this.authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null
    };
    
    this.emitAuthEvent(AuthEvent.LOGOUT);
    this.notifyListeners();
    logger.info('Dynamics 365 authentication state cleared');
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.authState.user) {
      return this.authState.user;
    }

    try {
      return await this.getDynamicsUser();
    } catch (error) {
      logger.error('Failed to get current user:', error);
      return null;
    }
  }

  async getAccessToken(): Promise<string | null> {
    // In Dynamics 365 context, we don't need explicit tokens
    // The platform handles authentication automatically
    return null;
  }

  async refreshToken(): Promise<boolean> {
    // No explicit token refresh needed in D365 context
    return this.authState.isAuthenticated;
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

  private async waitForDynamicsContext(timeout: number = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkContext = () => {
        if (this.isDynamicsContextAvailable()) {
          resolve();
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for Dynamics 365 context'));
          return;
        }
        
        setTimeout(checkContext, 100);
      };
      
      checkContext();
    });
  }

  private isDynamicsContextAvailable(): boolean {
    try {
      return !!(window as any).Xrm && !!(window as any).Xrm.WebApi;
    } catch {
      return false;
    }
  }

  private async getDynamicsUser(): Promise<AuthUser | null> {
    try {
      const xrm = (window as any).Xrm;
      
      if (!xrm || !xrm.WebApi) {
        throw new Error('Dynamics 365 context not available');
      }

      // Get current user information
      const userQuery = await xrm.WebApi.retrieveRecord('systemuser', xrm.Utility.getGlobalContext().getUserId(), '?$select=systemuserid,fullname,internalemailaddress');
      
      // Get user roles
      const rolesQuery = await xrm.WebApi.retrieveMultipleRecords('role', `?$filter=_parentroleid_value eq null&$select=name`);
      
      // Get organization info
      const orgContext = xrm.Utility.getGlobalContext().getOrganizationSettings();
      
      this.d365Context = {
        userId: userQuery.systemuserid,
        userRoles: rolesQuery.entities.map((role: any) => role.name),
        organizationId: orgContext.organizationId,
        organizationName: orgContext.uniqueName,
        serverUrl: xrm.Utility.getGlobalContext().getClientUrl(),
        version: xrm.Utility.getGlobalContext().getVersion()
      };

      return {
        id: userQuery.systemuserid,
        email: userQuery.internalemailaddress,
        name: userQuery.fullname,
        roles: this.d365Context.userRoles,
        organizationId: this.d365Context.organizationId
      };
    } catch (error) {
      logger.error('Failed to get Dynamics 365 user information:', error);
      throw error;
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

  /**
   * Get Dynamics 365 specific context information
   */
  public getDynamics365Context(): Dynamics365Context | null {
    return this.d365Context;
  }
}

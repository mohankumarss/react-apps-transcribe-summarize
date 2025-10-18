// Export legacy API client (for backward compatibility)
export { ExternalApiClient as ApiClient, configureApiClient } from './apiClient';
export type { ApiClientConfig } from './apiClient';

// Export new API abstraction
export { getApiClient } from './api/apiFactory';
export type {
  IApiClient,
  ApiResponse,
  PaginatedResponse,
  QueryOptions,
  BatchRequest,
  BatchResponse
} from './api/apiTypes';

// Export auth services (legacy compatibility maintained)
export { authService, useAuth } from './auth';
export type { User, AuthService } from './auth';

// Export new auth abstraction
export { getAuthService, AuthFactory } from './auth/authFactory';
export { DisabledAuthService } from './auth/disabledAuthService';
export type {
  IAuthService,
  AuthUser,
  AuthToken,
  AuthResult,
  AuthState,
  LoginCredentials
} from './auth/authTypes';

// Export theme services
export * from './theme';

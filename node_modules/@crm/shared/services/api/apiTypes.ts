/**
 * API Types and Interfaces
 * 
 * Defines common interfaces for API operations across different deployment modes
 */

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  statusCode?: number;
}

export interface ApiRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

export interface QueryOptions {
  select?: string[];
  filter?: string;
  orderBy?: string;
  expand?: string[];
  top?: number;
  skip?: number;
}

/**
 * Abstract API client interface
 */
export interface IApiClient {
  /**
   * Initialize the API client
   */
  initialize(): Promise<void>;

  /**
   * GET request
   */
  get<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>;

  /**
   * POST request
   */
  post<T>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>>;

  /**
   * PUT request
   */
  put<T>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>>;

  /**
   * PATCH request
   */
  patch<T>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>>;

  /**
   * DELETE request
   */
  delete<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>;

  /**
   * Retrieve a single record
   */
  retrieveRecord<T>(entityName: string, id: string, options?: QueryOptions): Promise<ApiResponse<T>>;

  /**
   * Retrieve multiple records
   */
  retrieveMultipleRecords<T>(entityName: string, options?: QueryOptions): Promise<PaginatedResponse<T>>;

  /**
   * Create a new record
   */
  createRecord<T>(entityName: string, data: any): Promise<ApiResponse<T>>;

  /**
   * Update an existing record
   */
  updateRecord<T>(entityName: string, id: string, data: any): Promise<ApiResponse<T>>;

  /**
   * Delete a record
   */
  deleteRecord(entityName: string, id: string): Promise<ApiResponse<void>>;

  /**
   * Execute a function or action
   */
  executeFunction<T>(functionName: string, parameters?: any): Promise<ApiResponse<T>>;

  /**
   * Execute a batch request
   */
  executeBatch(requests: BatchRequest[]): Promise<BatchResponse>;
}

export interface BatchRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  headers?: Record<string, string>;
}

export interface BatchResponse {
  responses: ApiResponse[];
  success: boolean;
  errors?: string[];
}

/**
 * Dynamics 365 specific types
 */
export interface D365EntityMetadata {
  entityName: string;
  primaryKey: string;
  displayName: string;
  attributes: D365AttributeMetadata[];
}

export interface D365AttributeMetadata {
  name: string;
  type: string;
  displayName: string;
  required: boolean;
}

/**
 * Error types
 */
export class ApiError extends Error {
  public statusCode: number;
  public response?: any;

  constructor(message: string, statusCode: number, response?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network error') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}

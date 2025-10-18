/**
 * External API Client
 *
 * Handles API operations for standalone SPA deployment using HTTP requests
 * Supports authentication with MSAL tokens and external Dataverse API calls
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosRequestHeaders } from 'axios';
import { logger } from '@shared/utils/logger';
import {
  IApiClient,
  ApiResponse,
  PaginatedResponse,
  ApiRequestConfig,
  QueryOptions,
  BatchRequest,
  BatchResponse,
  ApiError,
  AuthenticationError,
  NetworkError
} from './api/apiTypes';
import { getAuthService } from './auth/authFactory';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ExternalApiClient implements IApiClient {
  private client: AxiosInstance;
  private authService = getAuthService();

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Prefer': 'return=representation',
        ...config.headers,
      },
    });

    this.setupInterceptors();
  }

  async initialize(): Promise<void> {
    try {
      await this.authService.initialize();
      logger.info('External API client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize external API client:', error);
      throw error;
    }
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        logger.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

        // Add auth token if available
        const token = await this.getAuthToken();
        if (token) {
          if (!config.headers) {
            config.headers = {} as AxiosRequestHeaders;
          }
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(this.createApiError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.info(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        logger.error('API Response Error:', error);

        if (error.response?.status === 401) {
          // Try to refresh token and retry
          const tokenRefreshed = await this.handleUnauthorized();
          if (tokenRefreshed && error.config) {
            // Retry the original request with new token
            const token = await this.getAuthToken();
            if (token) {
              error.config.headers.Authorization = `Bearer ${token}`;
              return this.client.request(error.config);
            }
          }
        }

        return Promise.reject(this.createApiError(error));
      }
    );
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await this.authService.getAccessToken();
    } catch (error) {
      logger.error('Failed to get auth token:', error);
      return null;
    }
  }

  private async handleUnauthorized(): Promise<boolean> {
    try {
      // Try to refresh the token
      const refreshed = await this.authService.refreshToken();
      if (refreshed) {
        logger.info('Token refreshed successfully');
        return true;
      }

      // If refresh fails, trigger re-authentication
      logger.warn('Token refresh failed, triggering re-authentication');
      await this.authService.login({ interactive: true });
      return true;
    } catch (error) {
      logger.error('Failed to handle unauthorized access:', error);
      return false;
    }
  }

  async get<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    try {
      const axiosConfig = this.convertConfig(config);
      const response = await this.client.get<T>(url, axiosConfig);
      return {
        data: response.data,
        success: true,
        statusCode: response.status
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async post<T>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    try {
      const axiosConfig = this.convertConfig(config);
      const response = await this.client.post<T>(url, data, axiosConfig);
      return {
        data: response.data,
        success: true,
        statusCode: response.status
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async put<T>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    try {
      const axiosConfig = this.convertConfig(config);
      const response = await this.client.put<T>(url, data, axiosConfig);
      return {
        data: response.data,
        success: true,
        statusCode: response.status
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async patch<T>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    try {
      const axiosConfig = this.convertConfig(config);
      const response = await this.client.patch<T>(url, data, axiosConfig);
      return {
        data: response.data,
        success: true,
        statusCode: response.status
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async delete<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    try {
      const axiosConfig = this.convertConfig(config);
      const response = await this.client.delete<T>(url, axiosConfig);
      return {
        data: response.data,
        success: true,
        statusCode: response.status
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  // Dataverse-specific methods
  async retrieveRecord<T>(entityName: string, id: string, options?: QueryOptions): Promise<ApiResponse<T>> {
    const queryString = this.buildQueryString(options);
    const url = `${entityName}(${id})${queryString}`;
    return this.get<T>(url);
  }

  async retrieveMultipleRecords<T>(entityName: string, options?: QueryOptions): Promise<PaginatedResponse<T>> {
    try {
      const queryString = this.buildQueryString(options);
      const url = `${entityName}${queryString}`;

      const response = await this.get<{ value: T[]; '@odata.nextLink'?: string; '@odata.count'?: number }>(url);

      if (response.success && response.data) {
        return {
          data: response.data.value,
          success: true,
          statusCode: response.statusCode,
          pagination: {
            page: Math.floor((options?.skip || 0) / (options?.top || 50)) + 1,
            pageSize: response.data.value.length,
            totalCount: response.data['@odata.count'] || response.data.value.length,
            hasNext: !!response.data['@odata.nextLink'],
            hasPrevious: (options?.skip || 0) > 0
          }
        };
      }

      return this.handleErrorPaginated<T>(new Error('Invalid response format'));
    } catch (error) {
      return this.handleErrorPaginated<T>(error);
    }
  }

  async createRecord<T>(entityName: string, data: any): Promise<ApiResponse<T>> {
    return this.post<T>(entityName, data);
  }

  async updateRecord<T>(entityName: string, id: string, data: any): Promise<ApiResponse<T>> {
    const url = `${entityName}(${id})`;
    return this.patch<T>(url, data);
  }

  async deleteRecord(entityName: string, id: string): Promise<ApiResponse<void>> {
    const url = `${entityName}(${id})`;
    return this.delete<void>(url);
  }

  async executeFunction<T>(functionName: string, parameters?: any): Promise<ApiResponse<T>> {
    let url = functionName;

    if (parameters) {
      const paramString = Object.keys(parameters)
        .map(key => `${key}=${encodeURIComponent(parameters[key])}`)
        .join(',');
      url += `(${paramString})`;
    }

    return this.get<T>(url);
  }

  async executeBatch(requests: BatchRequest[]): Promise<BatchResponse> {
    try {
      // Dataverse batch operations implementation
      const batchId = this.generateBatchId();
      const changesetId = this.generateChangesetId();

      const batchBody = this.buildBatchBody(requests, batchId, changesetId);

      const response = await this.client.post('$batch', batchBody, {
        headers: {
          'Content-Type': `multipart/mixed; boundary=batch_${batchId}`,
        }
      });

      const responses = this.parseBatchResponse(response.data);

      return {
        responses,
        success: responses.every(r => r.success)
      };
    } catch (error) {
      logger.error('Batch execution failed:', error);
      return {
        responses: [],
        success: false,
        errors: [error instanceof Error ? error.message : 'Batch execution failed']
      };
    }
  }

  private convertConfig(config?: ApiRequestConfig): AxiosRequestConfig {
    if (!config) return {};

    return {
      headers: config.headers,
      timeout: config.timeout
    };
  }

  private buildQueryString(options?: QueryOptions): string {
    if (!options) return '';

    const params: string[] = [];

    if (options.select) {
      params.push(`$select=${options.select.join(',')}`);
    }

    if (options.filter) {
      params.push(`$filter=${encodeURIComponent(options.filter)}`);
    }

    if (options.orderBy) {
      params.push(`$orderby=${encodeURIComponent(options.orderBy)}`);
    }

    if (options.expand) {
      params.push(`$expand=${options.expand.join(',')}`);
    }

    if (options.top) {
      params.push(`$top=${options.top}`);
    }

    if (options.skip) {
      params.push(`$skip=${options.skip}`);
    }

    return params.length > 0 ? `?${params.join('&')}` : '';
  }

  private generateBatchId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private generateChangesetId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private buildBatchBody(requests: BatchRequest[], batchId: string, changesetId: string): string {
    // Simplified batch body construction
    // In practice, this would be more sophisticated
    return requests.map(req => `--batch_${batchId}\nContent-Type: application/http\n\n${req.method} ${req.url} HTTP/1.1\n\n`).join('');
  }

  private parseBatchResponse(responseData: string): ApiResponse[] {
    // Simplified batch response parsing
    // In practice, this would properly parse the multipart response
    return [];
  }

  private createApiError(error: any): ApiError {
    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
      return new NetworkError(error.message);
    }

    if (error.response?.status === 401) {
      return new AuthenticationError(error.response.data?.message || 'Authentication failed');
    }

    return new ApiError(
      error.response?.data?.message || error.message || 'An error occurred',
      error.response?.status || 500,
      error.response?.data
    );
  }

  private handleError<T>(error: any): ApiResponse<T> {
    const apiError = this.createApiError(error);

    return {
      data: null as T,
      success: false,
      message: apiError.message,
      statusCode: apiError.statusCode,
      errors: [apiError.message],
    };
  }

  private handleErrorPaginated<T>(error: any): PaginatedResponse<T> {
    const baseError = this.handleError<T[]>(error);

    return {
      ...baseError,
      data: [],
      pagination: {
        page: 1,
        pageSize: 0,
        totalCount: 0,
        hasNext: false,
        hasPrevious: false
      }
    };
  }
}

// Configuration that can be set by the consuming application
let apiConfig = {
  baseUrl: 'http://localhost:3001/api'
};

// Function to configure the API client from the consuming application
export const configureApiClient = (config: { baseUrl?: string }) => {
  if (config.baseUrl) {
    apiConfig.baseUrl = config.baseUrl;
  }
};

// Get API base URL from configuration
const getApiBaseUrl = (): string => {
  return apiConfig.baseUrl;
};

// Default API client instance (for backward compatibility)
export const apiClient = new ExternalApiClient({
  baseURL: getApiBaseUrl(),
});

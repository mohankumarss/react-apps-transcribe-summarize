/**
 * Dynamics 365 API Client
 *
 * Handles API operations using standard HTTP requests to Dynamics 365 Web API endpoints
 * Can be used from any context (web resources, standalone apps, etc.)
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosRequestHeaders } from 'axios';
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
} from './apiTypes';
import { logger } from '../../utils/logger';
import { getAuthService } from '../auth/authFactory';

export interface Dynamics365ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class Dynamics365ApiClient implements IApiClient {
  private client: AxiosInstance;
  private authService = getAuthService();
  private initialized = false;

  constructor(config: Dynamics365ApiClientConfig) {
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
      this.initialized = true;
      logger.info('Dynamics 365 API client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Dynamics 365 API client:', error);
      throw error;
    }
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        logger.info(`Dynamics 365 API Request: ${config.method?.toUpperCase()} ${config.url}`);

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
        logger.error('Dynamics 365 API Request Error:', error);
        return Promise.reject(this.createApiError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`Dynamics 365 API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('Dynamics 365 API Response Error:', error);
        return Promise.reject(this.createApiError(error));
      }
    );
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await this.authService.getAccessToken();
    } catch (error) {
      logger.warn('Failed to get auth token:', error);
      return null;
    }
  }

  async get<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    try {
      this.ensureInitialized();
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
      this.ensureInitialized();
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
      this.ensureInitialized();
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
      this.ensureInitialized();
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
      this.ensureInitialized();
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

  async retrieveRecord<T>(entityName: string, id: string, options?: QueryOptions): Promise<ApiResponse<T>> {
    try {
      this.ensureInitialized();

      const queryString = this.buildQueryString(options);
      const url = `${entityName}(${id})${queryString}`;
      const response = await this.client.get<T>(url);

      return {
        data: response.data,
        success: true,
        statusCode: response.status
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async retrieveMultipleRecords<T>(entityName: string, options?: QueryOptions): Promise<PaginatedResponse<T>> {
    try {
      this.ensureInitialized();

      const queryString = this.buildQueryString(options);
      const url = `${entityName}${queryString}`;
      const response = await this.client.get<any>(url);

      const data = response.data;
      const entities = data.value || [];

      return {
        data: entities,
        success: true,
        pagination: {
          page: this.calculateCurrentPage(options),
          pageSize: entities.length,
          totalCount: this.extractTotalCount(data, entities.length),
          hasNext: !!data['@odata.nextLink'],
          hasPrevious: this.calculateCurrentPage(options) > 1
        }
      };
    } catch (error) {
      return this.handleErrorPaginated<T>(error);
    }
  }

  async createRecord<T>(entityName: string, data: any): Promise<ApiResponse<T>> {
    try {
      this.ensureInitialized();

      const response = await this.client.post<T>(entityName, data);

      return {
        data: response.data,
        success: true,
        statusCode: response.status
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async updateRecord<T>(entityName: string, id: string, data: any): Promise<ApiResponse<T>> {
    try {
      this.ensureInitialized();

      const url = `${entityName}(${id})`;
      const response = await this.client.patch<T>(url, data);

      return {
        data: response.data,
        success: true,
        statusCode: response.status
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async deleteRecord(entityName: string, id: string): Promise<ApiResponse<void>> {
    try {
      this.ensureInitialized();

      const url = `${entityName}(${id})`;
      const response = await this.client.delete<void>(url);

      return {
        data: undefined,
        success: true,
        statusCode: response.status
      };
    } catch (error) {
      return this.handleError<void>(error);
    }
  }

  async executeFunction<T>(functionName: string, parameters?: any): Promise<ApiResponse<T>> {
    try {
      this.ensureInitialized();

      // Build function URL with parameters
      let functionUrl = functionName;
      if (parameters) {
        const paramString = Object.keys(parameters)
          .map(key => `${key}=${encodeURIComponent(parameters[key])}`)
          .join(',');
        functionUrl += `(${paramString})`;
      }

      const response = await this.client.get<T>(functionUrl);

      return {
        data: response.data,
        success: true,
        statusCode: response.status
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async executeBatch(requests: BatchRequest[]): Promise<BatchResponse> {
    try {
      this.ensureInitialized();

      // For HTTP-based implementation, execute requests sequentially
      // In a production environment, you might want to implement proper OData batch requests
      const responses: ApiResponse[] = [];

      for (const request of requests) {
        try {
          let response: ApiResponse;

          switch (request.method) {
            case 'GET':
              response = await this.get(request.url);
              break;
            case 'POST':
              response = await this.post(request.url, request.data);
              break;
            case 'PUT':
              response = await this.put(request.url, request.data);
              break;
            case 'PATCH':
              response = await this.patch(request.url, request.data);
              break;
            case 'DELETE':
              response = await this.delete(request.url);
              break;
            default:
              throw new Error(`Unsupported method: ${request.method}`);
          }

          responses.push(response);
        } catch (error) {
          responses.push(this.handleError(error));
        }
      }

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

  private async waitForXrmContext(timeout: number = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkContext = () => {
        if ((window as any).Xrm && (window as any).Xrm.WebApi) {
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

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new AuthenticationError('Dynamics 365 API client not initialized');
    }
  }

  private convertConfig(config?: ApiRequestConfig): AxiosRequestConfig {
    if (!config) return {};

    return {
      headers: config.headers,
      timeout: config.timeout,
    };
  }

  private calculateCurrentPage(options?: QueryOptions): number {
    if (!options?.skip || !options?.top) return 1;
    return Math.floor(options.skip / options.top) + 1;
  }

  private extractTotalCount(data: any, fallbackCount: number): number {
    // Try to get count from OData response
    if (data['@odata.count'] !== undefined) {
      return parseInt(data['@odata.count'], 10);
    }
    // Fallback to current page size if no count available
    return fallbackCount;
  }

  private createApiError(error: any): ApiError | AuthenticationError | NetworkError {
    if (error.response) {
      // HTTP error response
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.message || 'API request failed';

      if (status === 401) {
        return new AuthenticationError(message);
      }

      return new ApiError(message, status);
    } else if (error.request) {
      // Network error
      return new NetworkError('Network request failed');
    } else {
      // Other error
      return new ApiError(error.message || 'Unknown error occurred', 500);
    }
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



  private handleError<T>(error: any): ApiResponse<T> {
    const apiError = this.createApiError(error);
    logger.error('Dynamics 365 API error:', apiError);

    return {
      data: null as T,
      success: false,
      message: apiError.message,
      errors: [apiError.message],
      statusCode: error.response?.status || 500
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

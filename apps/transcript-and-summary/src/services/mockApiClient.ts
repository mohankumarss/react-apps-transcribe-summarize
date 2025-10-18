/**
 * Mock API Client for Development and Testing
 * 
 * Provides a mock implementation of IApiClient that uses local mock data
 * instead of making real API calls. This enables development and testing
 * without requiring a live Dynamics 365 connection.
 */

import { IApiClient, ApiResponse, PaginatedResponse, QueryOptions, BatchRequest, BatchResponse } from '@shared/services/api/apiTypes';
import { generateMockCallRecords, CallRecord, simulateApiDelay } from './mockDataService';
import { logger } from '@shared/utils';

/**
 * Mock API Client implementation for development
 */
export class MockApiClient implements IApiClient {
  private mockRecords: CallRecord[] = [];
  private initialized = false;

  constructor() {
    // Generate mock data on initialization
    this.mockRecords = generateMockCallRecords(50);
  }

  async initialize(): Promise<void> {
    try {
      // Simulate initialization delay
      await simulateApiDelay(300);
      this.initialized = true;
      logger.info(`Mock API client initialized with ${this.mockRecords.length} records`);
    } catch (error) {
      logger.error('Failed to initialize mock API client:', error);
      throw error;
    }
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    this.ensureInitialized();
    await simulateApiDelay(200);
    
    logger.info('Mock GET request:', url);
    
    return {
      data: {} as T,
      success: true,
      statusCode: 200
    };
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    this.ensureInitialized();
    await simulateApiDelay(300);

    logger.info(`Mock POST request: ${url}`);

    return {
      data: data as T,
      success: true,
      statusCode: 201
    };
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    this.ensureInitialized();
    await simulateApiDelay(300);

    logger.info(`Mock PUT request: ${url}`);

    return {
      data: data as T,
      success: true,
      statusCode: 200
    };
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    this.ensureInitialized();
    await simulateApiDelay(300);

    logger.info(`Mock PATCH request: ${url}`);

    return {
      data: data as T,
      success: true,
      statusCode: 200
    };
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    this.ensureInitialized();
    await simulateApiDelay(200);
    
    logger.info('Mock DELETE request:', url);
    
    return {
      data: undefined as T,
      success: true,
      statusCode: 204
    };
  }

  async retrieveRecord<T>(entityName: string, id: string, options?: QueryOptions): Promise<ApiResponse<T>> {
    this.ensureInitialized();
    await simulateApiDelay(300);
    
    logger.info(`Mock retrieveRecord: ${entityName}(${id})`);
    
    if (entityName === 'phonecall') {
      const record = this.mockRecords.find(r => r.id === id);
      if (record) {
        return {
          data: record as T,
          success: true,
          statusCode: 200
        };
      }
    }
    
    return {
      data: null as T,
      success: false,
      statusCode: 404,
      message: 'Record not found',
      errors: ['Record not found']
    };
  }

  async retrieveMultipleRecords<T>(entityName: string, options?: QueryOptions): Promise<PaginatedResponse<T>> {
    this.ensureInitialized();
    await simulateApiDelay(400);
    
    logger.info(`Mock retrieveMultipleRecords: ${entityName}`, options);
    
    if (entityName === 'phonecall') {
      let filtered = [...this.mockRecords];
      
      // Apply filter if provided
      if (options?.filter) {
        filtered = this.applyFilter(filtered, options.filter);
      }
      
      // Apply ordering
      if (options?.orderBy) {
        filtered = this.applySorting(filtered, options.orderBy);
      }
      
      // Apply pagination
      const skip = options?.skip || 0;
      const top = options?.top || 20;
      const paginatedRecords = filtered.slice(skip, skip + top);
      
      return {
        data: paginatedRecords as T[],
        success: true,
        pagination: {
          page: Math.floor(skip / top) + 1,
          pageSize: paginatedRecords.length,
          totalCount: filtered.length,
          hasNext: skip + top < filtered.length,
          hasPrevious: skip > 0
        }
      };
    }
    
    return {
      data: [],
      success: false,
      pagination: {
        page: 1,
        pageSize: 0,
        totalCount: 0,
        hasNext: false,
        hasPrevious: false
      }
    };
  }

  async createRecord<T>(entityName: string, data: any): Promise<ApiResponse<T>> {
    this.ensureInitialized();
    await simulateApiDelay(400);
    
    logger.info(`Mock createRecord: ${entityName}`, data);
    
    if (entityName === 'phonecall') {
      const newRecord: CallRecord = {
        id: `call-${Date.now()}`,
        dateOfCall: new Date().toISOString().split('T')[0],
        timeOfCall: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        callLength: '00:00',
        name: data.name || 'Unknown',
        inboundOutbound: data.inboundOutbound || 'Inbound',
        phoneNumber: data.phoneNumber || '+44 000 000000',
        callId: `CALL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        callType: data.callType || 'General',
        userName: data.userName || 'Agent',
        callDirection: data.inboundOutbound || 'Inbound',
        transcript: data.transcript || '',
        summary: data.summary || '',
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.mockRecords.push(newRecord);
      return {
        data: newRecord as T,
        success: true,
        statusCode: 201
      };
    }
    
    return {
      data: null as T,
      success: false,
      statusCode: 400,
      message: 'Invalid entity',
      errors: ['Invalid entity']
    };
  }

  async updateRecord<T>(entityName: string, id: string, data: any): Promise<ApiResponse<T>> {
    this.ensureInitialized();
    await simulateApiDelay(300);
    
    logger.info(`Mock updateRecord: ${entityName}(${id})`, data);
    
    if (entityName === 'phonecall') {
      const index = this.mockRecords.findIndex(r => r.id === id);
      if (index !== -1) {
        this.mockRecords[index] = {
          ...this.mockRecords[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
        return {
          data: this.mockRecords[index] as T,
          success: true,
          statusCode: 200
        };
      }
    }
    
    return {
      data: null as T,
      success: false,
      statusCode: 404,
      message: 'Record not found',
      errors: ['Record not found']
    };
  }

  async deleteRecord(entityName: string, id: string): Promise<ApiResponse<void>> {
    this.ensureInitialized();
    await simulateApiDelay(200);
    
    logger.info(`Mock deleteRecord: ${entityName}(${id})`);
    
    if (entityName === 'phonecall') {
      const index = this.mockRecords.findIndex(r => r.id === id);
      if (index !== -1) {
        this.mockRecords.splice(index, 1);
        return {
          data: undefined,
          success: true,
          statusCode: 204
        };
      }
    }
    
    return {
      data: undefined,
      success: false,
      statusCode: 404,
      message: 'Record not found',
      errors: ['Record not found']
    };
  }

  async executeFunction<T>(functionName: string, parameters?: any): Promise<ApiResponse<T>> {
    this.ensureInitialized();
    await simulateApiDelay(300);
    
    logger.info(`Mock executeFunction: ${functionName}`, parameters);
    
    return {
      data: {} as T,
      success: true,
      statusCode: 200
    };
  }

  async executeBatch(requests: BatchRequest[]): Promise<BatchResponse> {
    this.ensureInitialized();
    await simulateApiDelay(500);

    logger.info(`Mock executeBatch: ${requests.length} requests`);
    
    const responses = requests.map(req => ({
      data: null,
      success: true,
      statusCode: 200
    }));
    
    return {
      responses,
      success: true
    };
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Mock API client not initialized');
    }
  }

  private applyFilter(records: CallRecord[], filter: string): CallRecord[] {
    // Simple filter implementation for common patterns
    // Example: "contains(subject,'billing')"
    const containsMatch = filter.match(/contains\((\w+),'([^']+)'\)/i);
    if (containsMatch) {
      const field = containsMatch[1];
      const value = containsMatch[2].toLowerCase();
      
      return records.filter(record => {
        const fieldValue = (record as any)[field];
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(value);
        }
        return false;
      });
    }
    
    return records;
  }

  private applySorting(records: CallRecord[], orderBy: string): CallRecord[] {
    // Parse orderBy expression: "field asc" or "field desc"
    const parts = orderBy.split(' ');
    const field = parts[0];
    const direction = parts[1]?.toLowerCase() === 'desc' ? 'desc' : 'asc';
    
    return records.sort((a, b) => {
      const aVal = (a as any)[field];
      const bVal = (b as any)[field];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

/**
 * Singleton instance of mock API client
 */
let mockApiClientInstance: MockApiClient | null = null;

/**
 * Get or create mock API client instance
 */
export function getMockApiClient(): MockApiClient {
  if (!mockApiClientInstance) {
    mockApiClientInstance = new MockApiClient();
  }
  return mockApiClientInstance;
}

/**
 * Reset mock API client (useful for testing)
 */
export function resetMockApiClient(): void {
  mockApiClientInstance = null;
}

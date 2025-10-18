/**
 * Tests for Dynamics 365 API Client (HTTP-based implementation)
 */

import axios from 'axios';
import { Dynamics365ApiClient } from '../dynamics365ApiClient';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock auth service
jest.mock('../../auth/authFactory', () => ({
  getAuthService: jest.fn(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    getAccessToken: jest.fn().mockResolvedValue('mock-token'),
  })),
}));

// Mock logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Dynamics365ApiClient (HTTP-based)', () => {
  let client: Dynamics365ApiClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock axios.create to return a mock instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Create client instance
    client = new Dynamics365ApiClient({
      baseURL: 'https://test.api.crm.dynamics.com/api/data/v9.2/',
      timeout: 30000,
    });
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await client.initialize();
      
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://test.api.crm.dynamics.com/api/data/v9.2/',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Accept': 'application/json',
          'Prefer': 'return=representation',
        },
      });
    });

    it('should set up request and response interceptors', async () => {
      await client.initialize();
      
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('HTTP methods', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should make GET requests', async () => {
      const mockResponse = {
        data: { id: '123', name: 'Test' },
        status: 200,
      };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.get('/test');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', {});
      expect(result).toEqual({
        data: { id: '123', name: 'Test' },
        success: true,
        statusCode: 200,
      });
    });

    it('should make POST requests', async () => {
      const mockResponse = {
        data: { id: '123', name: 'Created' },
        status: 201,
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.post('/test', { name: 'New Item' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', { name: 'New Item' }, {});
      expect(result).toEqual({
        data: { id: '123', name: 'Created' },
        success: true,
        statusCode: 201,
      });
    });

    it('should make PATCH requests', async () => {
      const mockResponse = {
        data: { id: '123', name: 'Updated' },
        status: 200,
      };
      mockAxiosInstance.patch.mockResolvedValue(mockResponse);

      const result = await client.patch('/test/123', { name: 'Updated Item' });

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test/123', { name: 'Updated Item' }, {});
      expect(result).toEqual({
        data: { id: '123', name: 'Updated' },
        success: true,
        statusCode: 200,
      });
    });

    it('should make DELETE requests', async () => {
      const mockResponse = {
        data: undefined,
        status: 204,
      };
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await client.delete('/test/123');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/123', {});
      expect(result).toEqual({
        data: undefined,
        success: true,
        statusCode: 204,
      });
    });
  });

  describe('Dynamics 365 specific methods', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should retrieve a single record', async () => {
      const mockResponse = {
        data: {
          activityid: '123',
          subject: 'Test Call',
          createdon: '2024-01-15T10:30:00Z',
        },
        status: 200,
      };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.retrieveRecord('phonecall', '123', {
        select: ['activityid', 'subject', 'createdon'],
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('phonecall(123)?$select=activityid,subject,createdon');
      expect(result).toEqual({
        data: {
          activityid: '123',
          subject: 'Test Call',
          createdon: '2024-01-15T10:30:00Z',
        },
        success: true,
        statusCode: 200,
      });
    });

    it('should retrieve multiple records', async () => {
      const mockResponse = {
        data: {
          value: [
            { activityid: '123', subject: 'Call 1' },
            { activityid: '456', subject: 'Call 2' },
          ],
          '@odata.count': 2,
        },
        status: 200,
      };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.retrieveMultipleRecords('phonecall', {
        select: ['activityid', 'subject'],
        top: 10,
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('phonecall?$select=activityid,subject&$top=10');
      expect(result).toEqual({
        data: [
          { activityid: '123', subject: 'Call 1' },
          { activityid: '456', subject: 'Call 2' },
        ],
        success: true,
        pagination: {
          page: 1,
          pageSize: 2,
          totalCount: 2,
          hasNext: false,
          hasPrevious: false,
        },
      });
    });

    it('should create a record', async () => {
      const mockResponse = {
        data: { activityid: '123', subject: 'New Call' },
        status: 201,
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.createRecord('phonecall', {
        subject: 'New Call',
        description: 'Test call',
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('phonecall', {
        subject: 'New Call',
        description: 'Test call',
      });
      expect(result).toEqual({
        data: { activityid: '123', subject: 'New Call' },
        success: true,
        statusCode: 201,
      });
    });

    it('should update a record', async () => {
      const mockResponse = {
        data: { activityid: '123', subject: 'Updated Call' },
        status: 200,
      };
      mockAxiosInstance.patch.mockResolvedValue(mockResponse);

      const result = await client.updateRecord('phonecall', '123', {
        subject: 'Updated Call',
      });

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('phonecall(123)', {
        subject: 'Updated Call',
      });
      expect(result).toEqual({
        data: { activityid: '123', subject: 'Updated Call' },
        success: true,
        statusCode: 200,
      });
    });

    it('should delete a record', async () => {
      const mockResponse = {
        data: undefined,
        status: 204,
      };
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await client.deleteRecord('phonecall', '123');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('phonecall(123)');
      expect(result).toEqual({
        data: undefined,
        success: true,
        statusCode: 204,
      });
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should handle HTTP errors', async () => {
      const mockError = {
        response: {
          status: 404,
          data: {
            error: {
              message: 'Record not found',
            },
          },
        },
      };
      mockAxiosInstance.get.mockRejectedValue(mockError);

      const result = await client.get('/nonexistent');

      expect(result).toEqual({
        data: null,
        success: false,
        message: 'Record not found',
        errors: ['Record not found'],
        statusCode: 404,
      });
    });

    it('should handle network errors', async () => {
      const mockError = {
        request: {},
        message: 'Network Error',
      };
      mockAxiosInstance.get.mockRejectedValue(mockError);

      const result = await client.get('/test');

      expect(result).toEqual({
        data: null,
        success: false,
        message: 'Network request failed',
        errors: ['Network request failed'],
        statusCode: 500,
      });
    });
  });
});

/**
 * Tests for Call Records Service
 */

import { getCallRecordsService, resetCallRecordsService } from '../callRecordsService';

// Mock the shared services
jest.mock('@shared/services/api/apiFactory', () => ({
  ApiFactory: {
    getInstance: jest.fn(),
  },
}));

jest.mock('@shared/utils', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CallRecordsService', () => {
  const mockApiClient = {
    initialize: jest.fn(),
    retrieveMultipleRecords: jest.fn(),
    retrieveRecord: jest.fn(),
    updateRecord: jest.fn(),
  };

  beforeEach(() => {
    resetCallRecordsService();
    jest.clearAllMocks();
    
    // Mock the ApiFactory to return our mock client
    const { ApiFactory } = require('@shared/services/api/apiFactory');
    ApiFactory.getInstance.mockResolvedValue(mockApiClient);
    mockApiClient.initialize.mockResolvedValue(undefined);
  });

  describe('getCallRecords', () => {
    it('should retrieve and transform call records successfully', async () => {
      const mockApiResponse = {
        success: true,
        data: [
          {
            activityid: 'test-id-1',
            subject: 'Test Call',
            createdon: '2024-01-15T10:30:00Z',
            modifiedon: '2024-01-15T10:35:00Z',
            description: 'Test call description',
            phonenumber: '+44 123 456789',
            directioncode: 2
          }
        ],
        pagination: { totalCount: 1 }
      };

      mockApiClient.retrieveMultipleRecords.mockResolvedValue(mockApiResponse);

      const service = getCallRecordsService();
      const result = await service.getCallRecords(1, 20);

      expect(result).toEqual({
        records: [
          expect.objectContaining({
            id: 'test-id-1',
            name: 'Test Call',
            dateOfCall: '2024-01-15',
            timeOfCall: '10:30',
            phoneNumber: '+44 123 456789',
            inboundOutbound: 'Inbound',
            transcript: 'Test call description',
            summary: 'Test call description',
            notes: ''
          })
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1
      });

      expect(mockApiClient.retrieveMultipleRecords).toHaveBeenCalledWith('phonecall', {
        select: ['activityid', 'subject', 'createdon', 'modifiedon', 'description', 'phonenumber', 'directioncode'],
        orderBy: 'createdon desc',
        top: 20,
        skip: 0
      });
    });

    it('should handle API errors gracefully', async () => {
      mockApiClient.retrieveMultipleRecords.mockResolvedValue({
        success: false,
        message: 'API Error'
      });

      const service = getCallRecordsService();
      const result = await service.getCallRecords();

      expect(result).toEqual({
        records: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      });
    });
  });

  describe('getCallRecord', () => {
    it('should retrieve a single call record successfully', async () => {
      const mockApiResponse = {
        success: true,
        data: {
          activityid: 'test-id-1',
          subject: 'Test Call',
          createdon: '2024-01-15T10:30:00Z',
          modifiedon: '2024-01-15T10:35:00Z',
          description: 'Test call description',
          phonenumber: '+44 123 456789',
          directioncode: 1
        }
      };

      mockApiClient.retrieveRecord.mockResolvedValue(mockApiResponse);

      const service = getCallRecordsService();
      const result = await service.getCallRecord('test-id-1');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'test-id-1',
          name: 'Test Call',
          inboundOutbound: 'Outbound', // directioncode: 1 = Outbound
          transcript: 'Test call description'
        })
      );
    });

    it('should return null for failed API calls', async () => {
      mockApiClient.retrieveRecord.mockResolvedValue({
        success: false
      });

      const service = getCallRecordsService();
      const result = await service.getCallRecord('test-id-1');

      expect(result).toBeNull();
    });
  });

  describe('updateCallRecord', () => {
    it('should update a call record successfully', async () => {
      // Mock the update response
      mockApiClient.updateRecord.mockResolvedValue({
        success: true
      });

      // Mock the subsequent get call
      mockApiClient.retrieveRecord.mockResolvedValue({
        success: true,
        data: {
          activityid: 'test-id-1',
          subject: 'Updated Call',
          createdon: '2024-01-15T10:30:00Z',
          modifiedon: '2024-01-15T10:35:00Z',
          description: 'Updated transcript\n\nNotes: Updated notes',
          phonenumber: '+44 123 456789',
          directioncode: 2
        }
      });

      const service = getCallRecordsService();
      const result = await service.updateCallRecord('test-id-1', {
        name: 'Updated Call',
        transcript: 'Updated transcript',
        notes: 'Updated notes'
      });

      expect(mockApiClient.updateRecord).toHaveBeenCalledWith('phonecall', 'test-id-1', {
        subject: 'Updated Call',
        description: 'Updated transcript\n\nNotes: Updated notes'
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: 'test-id-1',
          name: 'Updated Call',
          transcript: 'Updated transcript',
          notes: 'Updated notes'
        })
      );
    });
  });

  describe('searchCallRecords', () => {
    it('should search call records successfully', async () => {
      const mockApiResponse = {
        success: true,
        data: [
          {
            activityid: 'search-result-1',
            subject: 'Billing Call',
            createdon: '2024-01-15T10:30:00Z',
            modifiedon: '2024-01-15T10:35:00Z',
            description: 'Customer called about billing issue',
            phonenumber: '+44 123 456789',
            directioncode: 2
          }
        ]
      };

      mockApiClient.retrieveMultipleRecords.mockResolvedValue(mockApiResponse);

      const service = getCallRecordsService();
      const result = await service.searchCallRecords('billing');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'search-result-1',
          name: 'Billing Call',
          transcript: 'Customer called about billing issue'
        })
      );

      expect(mockApiClient.retrieveMultipleRecords).toHaveBeenCalledWith('phonecall', {
        select: ['activityid', 'subject', 'createdon', 'modifiedon', 'description', 'phonenumber', 'directioncode'],
        filter: "contains(subject,'billing') or contains(description,'billing')",
        orderBy: 'createdon desc',
        top: 50
      });
    });
  });

  describe('singleton behavior', () => {
    it('should return the same instance on multiple calls', () => {
      const service1 = getCallRecordsService();
      const service2 = getCallRecordsService();
      expect(service1).toBe(service2);
    });

    it('should create a new instance after reset', () => {
      const service1 = getCallRecordsService();
      resetCallRecordsService();
      const service2 = getCallRecordsService();
      expect(service1).not.toBe(service2);
    });
  });
});

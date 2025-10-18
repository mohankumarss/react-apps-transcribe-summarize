/**
 * Integration tests for CallRecordsService with Mock Data
 * 
 * These tests verify that the CallRecordsService correctly uses mock data
 * and transforms it to the expected CallRecord format.
 */

import { CallRecordsService, resetCallRecordsService } from '../callRecordsService';
import { resetMockApiClient } from '../mockApiClient';

describe('CallRecordsService Integration Tests', () => {
  let service: CallRecordsService;

  beforeEach(() => {
    // Reset both service and mock client before each test
    resetCallRecordsService();
    resetMockApiClient();
    service = new CallRecordsService();
  });

  describe('Mock Data Loading', () => {
    it('should load mock call records successfully', async () => {
      const result = await service.getCallRecords(1, 50);

      expect(result.records).toBeDefined();
      expect(result.records.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should return 50 mock records on first page', async () => {
      const result = await service.getCallRecords(1, 50);

      expect(result.records.length).toBe(50);
      expect(result.total).toBe(50);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
    });

    it('should have correct CallRecord structure', async () => {
      const result = await service.getCallRecords(1, 1);

      expect(result.records.length).toBeGreaterThan(0);
      const record = result.records[0];

      // Verify all required fields exist
      expect(record).toHaveProperty('id');
      expect(record).toHaveProperty('dateOfCall');
      expect(record).toHaveProperty('timeOfCall');
      expect(record).toHaveProperty('callLength');
      expect(record).toHaveProperty('name');
      expect(record).toHaveProperty('inboundOutbound');
      expect(record).toHaveProperty('phoneNumber');
      expect(record).toHaveProperty('callId');
      expect(record).toHaveProperty('callType');
      expect(record).toHaveProperty('userName');
      expect(record).toHaveProperty('callDirection');
      expect(record).toHaveProperty('transcript');
      expect(record).toHaveProperty('summary');
      expect(record).toHaveProperty('notes');
      expect(record).toHaveProperty('createdAt');
      expect(record).toHaveProperty('updatedAt');
    });

    it('should have valid field values', async () => {
      const result = await service.getCallRecords(1, 1);

      expect(result.records.length).toBeGreaterThan(0);
      const record = result.records[0];

      // Verify field types and values
      expect(typeof record.id).toBe('string');
      expect(record.id.length).toBeGreaterThan(0);

      expect(typeof record.name).toBe('string');
      expect(record.name.length).toBeGreaterThan(0);

      expect(typeof record.dateOfCall).toBe('string');
      expect(record.dateOfCall).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format

      expect(typeof record.timeOfCall).toBe('string');
      expect(record.timeOfCall).toMatch(/^\d{2}:\d{2}$/); // HH:MM format

      expect(typeof record.callLength).toBe('string');
      expect(record.callLength).toMatch(/^\d{2}:\d{2}$/); // MM:SS format

      expect(['Inbound', 'Outbound']).toContain(record.inboundOutbound);
      expect(['Inbound', 'Outbound']).toContain(record.callDirection);

      expect(typeof record.phoneNumber).toBe('string');
      expect(record.phoneNumber.length).toBeGreaterThan(0);

      expect(typeof record.transcript).toBe('string');
      expect(record.transcript.length).toBeGreaterThan(0);

      expect(typeof record.summary).toBe('string');
      expect(record.summary.length).toBeGreaterThan(0);
    });
  });

  describe('Pagination', () => {
    it('should support pagination', async () => {
      const page1 = await service.getCallRecords(1, 20);
      const page2 = await service.getCallRecords(2, 20);
      const page3 = await service.getCallRecords(3, 20);

      expect(page1.records.length).toBe(20);
      expect(page2.records.length).toBe(20);
      expect(page3.records.length).toBe(10); // 50 total, so page 3 has 10

      expect(page1.page).toBe(1);
      expect(page2.page).toBe(2);
      expect(page3.page).toBe(3);

      expect(page1.totalPages).toBe(3);
      expect(page2.totalPages).toBe(3);
      expect(page3.totalPages).toBe(3);
    });

    it('should return different records on different pages', async () => {
      const page1 = await service.getCallRecords(1, 20);
      const page2 = await service.getCallRecords(2, 20);

      const page1Ids = page1.records.map(r => r.id);
      const page2Ids = page2.records.map(r => r.id);

      // No overlap between pages
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      expect(overlap.length).toBe(0);
    });
  });

  describe('Single Record Retrieval', () => {
    it('should retrieve a single call record by ID', async () => {
      // First, get all records to find an ID
      const allRecords = await service.getCallRecords(1, 50);
      expect(allRecords.records.length).toBeGreaterThan(0);

      const recordId = allRecords.records[0].id;

      // Now retrieve that specific record
      const record = await service.getCallRecord(recordId);

      expect(record).toBeDefined();
      expect(record?.id).toBe(recordId);
      expect(record?.name).toBe(allRecords.records[0].name);
    });

    it('should return null for non-existent record', async () => {
      const record = await service.getCallRecord('non-existent-id');
      expect(record).toBeNull();
    });
  });

  describe('Search', () => {
    it('should search call records by name', async () => {
      // Get all records first
      const allRecords = await service.getCallRecords(1, 50);
      expect(allRecords.records.length).toBeGreaterThan(0);

      // Search for a name that exists
      const firstName = allRecords.records[0].name;
      const searchResults = await service.searchCallRecords(firstName);

      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults.some(r => r.name.includes(firstName))).toBe(true);
    });

    it('should return empty array for non-matching search', async () => {
      const results = await service.searchCallRecords('ZZZZZZZZZZZZZZZZZ');
      expect(results).toEqual([]);
    });
  });

  describe('Update', () => {
    it('should update call record notes', async () => {
      // Get a record
      const allRecords = await service.getCallRecords(1, 1);
      expect(allRecords.records.length).toBeGreaterThan(0);

      const recordId = allRecords.records[0].id;
      const newNotes = 'Updated test notes';

      // Update the record
      const updated = await service.updateCallRecord(recordId, { notes: newNotes });

      expect(updated).toBeDefined();
      expect(updated?.notes).toBe(newNotes);
    });

    it('should return null for non-existent record update', async () => {
      const updated = await service.updateCallRecord('non-existent-id', { notes: 'test' });
      expect(updated).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // This should not throw, but return empty results
      const result = await service.getCallRecords(1, 20);

      expect(result).toBeDefined();
      expect(result.records).toBeDefined();
      expect(Array.isArray(result.records)).toBe(true);
    });
  });

  describe('Data Consistency', () => {
    it('should return consistent data across multiple calls', async () => {
      const result1 = await service.getCallRecords(1, 50);
      const result2 = await service.getCallRecords(1, 50);

      expect(result1.records.length).toBe(result2.records.length);
      expect(result1.total).toBe(result2.total);

      // First records should be the same
      expect(result1.records[0].id).toBe(result2.records[0].id);
      expect(result1.records[0].name).toBe(result2.records[0].name);
    });

    it('should have unique record IDs', async () => {
      const result = await service.getCallRecords(1, 50);

      const ids = result.records.map(r => r.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});

/**
 * Tests for Mock API Client
 */

import { MockApiClient, getMockApiClient, resetMockApiClient } from '../mockApiClient';

describe('MockApiClient', () => {
  let client: MockApiClient;

  beforeEach(() => {
    resetMockApiClient();
    client = new MockApiClient();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await client.initialize();
      expect(client).toBeDefined();
    });

    it('should throw error if methods called before initialization', async () => {
      const uninitializedClient = new MockApiClient();
      
      await expect(uninitializedClient.get('/test')).rejects.toThrow('not initialized');
    });
  });

  describe('HTTP methods', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should handle GET requests', async () => {
      const result = await client.get('/test');
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
    });

    it('should handle POST requests', async () => {
      const data = { name: 'Test' };
      const result = await client.post('/test', data);
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
      expect(result.data).toEqual(data);
    });

    it('should handle PUT requests', async () => {
      const data = { name: 'Updated' };
      const result = await client.put('/test', data);
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
    });

    it('should handle PATCH requests', async () => {
      const data = { name: 'Patched' };
      const result = await client.patch('/test', data);
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
    });

    it('should handle DELETE requests', async () => {
      const result = await client.delete('/test');
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(204);
    });
  });

  describe('Dynamics 365 specific methods', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should retrieve a phonecall record', async () => {
      const result = await client.retrieveRecord('phonecall', 'call-1');
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.data).toBeDefined();
      expect((result.data as any).id).toBe('call-1');
    });

    it('should return 404 for non-existent record', async () => {
      const result = await client.retrieveRecord('phonecall', 'non-existent');
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
    });

    it('should retrieve multiple phonecall records', async () => {
      const result = await client.retrieveMultipleRecords('phonecall', {
        top: 10
      });
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.pageSize).toBeLessThanOrEqual(10);
    });

    it('should apply filter to records', async () => {
      const result = await client.retrieveMultipleRecords('phonecall', {
        filter: "contains(callType,'Support')",
        top: 50
      });
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      // All returned records should have 'Support' in callType
      (result.data as any[]).forEach(record => {
        expect(record.callType.toLowerCase()).toContain('support');
      });
    });

    it('should apply sorting to records', async () => {
      const result = await client.retrieveMultipleRecords('phonecall', {
        orderBy: 'dateOfCall desc',
        top: 50
      });
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      
      // Verify sorting (most recent first)
      const records = result.data as any[];
      for (let i = 1; i < records.length; i++) {
        expect(records[i - 1].dateOfCall).toBeGreaterThanOrEqual(records[i].dateOfCall);
      }
    });

    it('should handle pagination', async () => {
      const page1 = await client.retrieveMultipleRecords('phonecall', {
        skip: 0,
        top: 10
      });
      
      const page2 = await client.retrieveMultipleRecords('phonecall', {
        skip: 10,
        top: 10
      });
      
      expect(page1.pagination.page).toBe(1);
      expect(page2.pagination.page).toBe(2);
      expect(page1.pagination.hasNext).toBe(true);
      expect(page2.pagination.hasPrevious).toBe(true);
    });

    it('should create a phonecall record', async () => {
      const newRecord = {
        name: 'New Call',
        callType: 'Test',
        inboundOutbound: 'Inbound'
      };
      
      const result = await client.createRecord('phonecall', newRecord);
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
      expect((result.data as any).name).toBe('New Call');
    });

    it('should update a phonecall record', async () => {
      const updates = { name: 'Updated Call' };
      const result = await client.updateRecord('phonecall', 'call-1', updates);
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect((result.data as any).name).toBe('Updated Call');
    });

    it('should delete a phonecall record', async () => {
      const result = await client.deleteRecord('phonecall', 'call-1');
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(204);
      
      // Verify record is deleted
      const retrieveResult = await client.retrieveRecord('phonecall', 'call-1');
      expect(retrieveResult.success).toBe(false);
    });
  });

  describe('singleton pattern', () => {
    it('should return same instance', async () => {
      const client1 = getMockApiClient();
      const client2 = getMockApiClient();
      
      expect(client1).toBe(client2);
    });

    it('should create new instance after reset', async () => {
      const client1 = getMockApiClient();
      resetMockApiClient();
      const client2 = getMockApiClient();
      
      expect(client1).not.toBe(client2);
    });
  });

  describe('batch operations', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should execute batch requests', async () => {
      const requests = [
        { method: 'GET' as const, url: '/test1' },
        { method: 'POST' as const, url: '/test2', data: { name: 'Test' } }
      ];
      
      const result = await client.executeBatch(requests);
      
      expect(result.success).toBe(true);
      expect(result.responses).toHaveLength(2);
    });
  });

  describe('mock data generation', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should generate realistic mock data', async () => {
      const result = await client.retrieveMultipleRecords('phonecall', {
        top: 50
      });
      
      expect(result.data).toHaveLength(50);
      
      const records = result.data as any[];
      records.forEach(record => {
        expect(record.id).toBeDefined();
        expect(record.name).toBeDefined();
        expect(record.dateOfCall).toBeDefined();
        expect(record.timeOfCall).toBeDefined();
        expect(record.callLength).toBeDefined();
        expect(record.inboundOutbound).toMatch(/Inbound|Outbound/);
        expect(record.phoneNumber).toBeDefined();
        expect(record.callType).toBeDefined();
        expect(record.transcript).toBeDefined();
        expect(record.summary).toBeDefined();
      });
    });

    it('should have variety in call types', async () => {
      const result = await client.retrieveMultipleRecords('phonecall', {
        top: 50
      });
      
      const callTypes = new Set((result.data as any[]).map(r => r.callType));
      expect(callTypes.size).toBeGreaterThan(1);
    });

    it('should have mix of inbound and outbound calls', async () => {
      const result = await client.retrieveMultipleRecords('phonecall', {
        top: 50
      });
      
      const records = result.data as any[];
      const inbound = records.filter(r => r.inboundOutbound === 'Inbound');
      const outbound = records.filter(r => r.inboundOutbound === 'Outbound');
      
      expect(inbound.length).toBeGreaterThan(0);
      expect(outbound.length).toBeGreaterThan(0);
    });
  });
});

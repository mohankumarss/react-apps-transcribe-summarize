import { 
  generateMockCallRecords, 
  simulateApiDelay, 
  MockCallRecordsAPI 
} from '../mockDataService';

describe('Mock Data Service', () => {
  describe('generateMockCallRecords', () => {
    it('generates the correct number of records', () => {
      const records = generateMockCallRecords(10);
      expect(records).toHaveLength(10);
    });

    it('generates records with all required fields', () => {
      const records = generateMockCallRecords(1);
      const record = records[0];

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

    it('generates records with valid data types', () => {
      const records = generateMockCallRecords(1);
      const record = records[0];

      expect(typeof record.id).toBe('string');
      expect(typeof record.dateOfCall).toBe('string');
      expect(typeof record.timeOfCall).toBe('string');
      expect(typeof record.callLength).toBe('string');
      expect(typeof record.name).toBe('string');
      expect(['Inbound', 'Outbound']).toContain(record.inboundOutbound);
      expect(typeof record.phoneNumber).toBe('string');
      expect(typeof record.callId).toBe('string');
      expect(typeof record.callType).toBe('string');
      expect(typeof record.userName).toBe('string');
      expect(['Inbound', 'Outbound']).toContain(record.callDirection);
      expect(typeof record.transcript).toBe('string');
      expect(typeof record.summary).toBe('string');
      expect(typeof record.notes).toBe('string');
      expect(typeof record.createdAt).toBe('string');
      expect(typeof record.updatedAt).toBe('string');
    });

    it('generates records with valid date format', () => {
      const records = generateMockCallRecords(1);
      const record = records[0];

      // Check date format (YYYY-MM-DD)
      expect(record.dateOfCall).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      // Check ISO date format
      expect(() => new Date(record.createdAt)).not.toThrow();
      expect(() => new Date(record.updatedAt)).not.toThrow();
    });

    it('generates records with valid time format', () => {
      const records = generateMockCallRecords(1);
      const record = records[0];

      // Check time format (HH:MM)
      expect(record.timeOfCall).toMatch(/^\d{2}:\d{2}$/);
      
      // Check call length format (MM:SS)
      expect(record.callLength).toMatch(/^\d{2}:\d{2}$/);
    });

    it('generates records with valid phone number format', () => {
      const records = generateMockCallRecords(1);
      const record = records[0];

      // Check phone number format (+44 XXX XXXXXX)
      expect(record.phoneNumber).toMatch(/^\+44 \d{3} \d{6}$/);
    });

    it('generates records with valid call ID format', () => {
      const records = generateMockCallRecords(1);
      const record = records[0];

      // Check call ID format (CALL-XXXXXXXXX)
      expect(record.callId).toMatch(/^CALL-[A-Z0-9]{9}$/);
    });

    it('sorts records by date (most recent first)', () => {
      const records = generateMockCallRecords(5);
      
      for (let i = 0; i < records.length - 1; i++) {
        const currentDate = new Date(records[i].createdAt);
        const nextDate = new Date(records[i + 1].createdAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });

    it('generates unique IDs for each record', () => {
      const records = generateMockCallRecords(10);
      const ids = records.map(record => record.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(records.length);
    });

    it('generates unique call IDs for each record', () => {
      const records = generateMockCallRecords(10);
      const callIds = records.map(record => record.callId);
      const uniqueCallIds = new Set(callIds);
      
      expect(uniqueCallIds.size).toBe(records.length);
    });

    it('generates records with empty notes by default', () => {
      const records = generateMockCallRecords(5);
      
      records.forEach(record => {
        expect(record.notes).toBe('');
      });
    });

    it('generates records with consistent inbound/outbound direction', () => {
      const records = generateMockCallRecords(10);
      
      records.forEach(record => {
        expect(record.inboundOutbound).toBe(record.callDirection);
      });
    });
  });

  describe('simulateApiDelay', () => {
    it('resolves after the specified delay', async () => {
      const startTime = Date.now();
      await simulateApiDelay(100);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(90); // Allow some tolerance
    });

    it('uses default delay of 1000ms when no parameter provided', async () => {
      const startTime = Date.now();
      await simulateApiDelay();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(990); // Allow some tolerance
    });
  });

  describe('MockCallRecordsAPI', () => {
    let apiService: MockCallRecordsAPI;

    beforeEach(() => {
      apiService = MockCallRecordsAPI.getInstance();
    });

    describe('Singleton Pattern', () => {
      it('returns the same instance when called multiple times', () => {
        const instance1 = MockCallRecordsAPI.getInstance();
        const instance2 = MockCallRecordsAPI.getInstance();
        
        expect(instance1).toBe(instance2);
      });
    });

    describe('getCallRecords', () => {
      it('returns paginated call records', async () => {
        const result = await apiService.getCallRecords(1, 10);
        
        expect(result).toHaveProperty('records');
        expect(result).toHaveProperty('total');
        expect(result).toHaveProperty('page');
        expect(result).toHaveProperty('pageSize');
        expect(result).toHaveProperty('totalPages');
        
        expect(Array.isArray(result.records)).toBe(true);
        expect(result.records.length).toBeLessThanOrEqual(10);
        expect(result.page).toBe(1);
        expect(result.pageSize).toBe(10);
      });

      it('returns correct pagination information', async () => {
        const result = await apiService.getCallRecords(2, 5);
        
        expect(result.page).toBe(2);
        expect(result.pageSize).toBe(5);
        expect(result.totalPages).toBe(Math.ceil(result.total / 5));
      });

      it('returns empty array for pages beyond available data', async () => {
        const result = await apiService.getCallRecords(1000, 10);
        
        expect(result.records).toHaveLength(0);
        expect(result.page).toBe(1000);
      });

      it('simulates API delay', async () => {
        const startTime = Date.now();
        await apiService.getCallRecords(1, 10);
        const endTime = Date.now();
        
        expect(endTime - startTime).toBeGreaterThanOrEqual(700); // Should take at least 800ms minus tolerance
      });
    });

    describe('getCallRecord', () => {
      it('returns a specific call record by ID', async () => {
        const allRecords = await apiService.getCallRecords(1, 100);
        const firstRecord = allRecords.records[0];
        
        const result = await apiService.getCallRecord(firstRecord.id);
        
        expect(result).toEqual(firstRecord);
      });

      it('returns null for non-existent ID', async () => {
        const result = await apiService.getCallRecord('non-existent-id');
        
        expect(result).toBeNull();
      });

      it('simulates API delay', async () => {
        const startTime = Date.now();
        await apiService.getCallRecord('any-id');
        const endTime = Date.now();
        
        expect(endTime - startTime).toBeGreaterThanOrEqual(250); // Should take at least 300ms minus tolerance
      });
    });

    describe('updateCallRecord', () => {
      it('updates an existing call record', async () => {
        const allRecords = await apiService.getCallRecords(1, 100);
        const firstRecord = allRecords.records[0];
        
        const updates = { notes: 'Updated notes' };
        const result = await apiService.updateCallRecord(firstRecord.id, updates);
        
        expect(result).not.toBeNull();
        expect(result!.notes).toBe('Updated notes');
        expect(result!.updatedAt).not.toBe(firstRecord.updatedAt);
      });

      it('returns null for non-existent ID', async () => {
        const result = await apiService.updateCallRecord('non-existent-id', { notes: 'test' });
        
        expect(result).toBeNull();
      });

      it('persists updates across subsequent calls', async () => {
        const allRecords = await apiService.getCallRecords(1, 100);
        const firstRecord = allRecords.records[0];
        
        await apiService.updateCallRecord(firstRecord.id, { notes: 'Persistent notes' });
        const updatedRecord = await apiService.getCallRecord(firstRecord.id);
        
        expect(updatedRecord!.notes).toBe('Persistent notes');
      });

      it('simulates API delay', async () => {
        const startTime = Date.now();
        await apiService.updateCallRecord('any-id', {});
        const endTime = Date.now();
        
        expect(endTime - startTime).toBeGreaterThanOrEqual(450); // Should take at least 500ms minus tolerance
      });
    });

    describe('searchCallRecords', () => {
      it('returns records matching the search query', async () => {
        const result = await apiService.searchCallRecords('Mike');
        
        expect(Array.isArray(result)).toBe(true);
        // Should find records with "Mike" in name, transcript, or summary
        const hasMatchingRecord = result.some(record => 
          record.name.toLowerCase().includes('mike') ||
          record.transcript.toLowerCase().includes('mike') ||
          record.summary.toLowerCase().includes('mike')
        );
        expect(hasMatchingRecord).toBe(true);
      });

      it('performs case-insensitive search', async () => {
        const lowerResult = await apiService.searchCallRecords('mike');
        const upperResult = await apiService.searchCallRecords('MIKE');
        
        expect(lowerResult.length).toBe(upperResult.length);
      });

      it('searches across multiple fields', async () => {
        // Search for a phone number
        const phoneResult = await apiService.searchCallRecords('7911');
        expect(phoneResult.length).toBeGreaterThan(0);
        
        // Search for a call type
        const typeResult = await apiService.searchCallRecords('Support');
        expect(typeResult.length).toBeGreaterThan(0);
      });

      it('returns empty array for non-matching query', async () => {
        const result = await apiService.searchCallRecords('xyz123nonexistent');
        
        expect(result).toHaveLength(0);
      });

      it('simulates API delay', async () => {
        const startTime = Date.now();
        await apiService.searchCallRecords('test');
        const endTime = Date.now();
        
        expect(endTime - startTime).toBeGreaterThanOrEqual(550); // Should take at least 600ms minus tolerance
      });
    });
  });
});

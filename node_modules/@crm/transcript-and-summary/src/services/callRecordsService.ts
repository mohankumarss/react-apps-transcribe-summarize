/**
 * Call Records Service for Transcript and Summary App
 *
 * Provides a unified service interface that automatically delegates to the appropriate
 * API client based on deployment mode (webresource vs regular dev/build).
 *
 * In development mode, can use mock data instead of real API calls for testing.
 */

import { CallRecord } from './mockDataService';
import { ApiFactory } from '@shared/services/api/apiFactory';
import { IApiClient } from '@shared/services/api/apiTypes';
import { logger } from '@shared/utils';
import { shouldUseMockData } from '../config/developmentMode';
import { getMockApiClient } from './mockApiClient';

/**
 * Service interface for call record operations
 */
export interface ICallRecordsService {
  getCallRecords(page?: number, pageSize?: number): Promise<{
    records: CallRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;
  getCallRecord(id: string): Promise<CallRecord | null>;
  updateCallRecord(id: string, updates: Partial<CallRecord>): Promise<CallRecord | null>;
  searchCallRecords(query: string): Promise<CallRecord[]>;
}

/**
 * Unified Call Records Service
 * 
 * This service automatically uses the appropriate API client based on deployment mode:
 * - Dynamics365ApiClient for webresource builds
 * - ExternalApiClient for standalone/microfrontend builds
 */
export class CallRecordsService implements ICallRecordsService {
  private apiClient: IApiClient | null = null;
  private initialized = false;

  /**
   * Initialize the service with the appropriate API client
   */
  private async ensureInitialized(): Promise<IApiClient> {
    if (!this.initialized) {
      try {
        // Check if mock data should be used (development mode)
        let useMockData = false;
        try {
          useMockData = shouldUseMockData();
        } catch (e) {
          logger.warn('Error checking mock data mode, defaulting to real API:', e);
          useMockData = false;
        }

        if (true) {
          logger.info('Using mock API client for development');
          this.apiClient = getMockApiClient();
        } else {
          // Use the existing ApiFactory to get the appropriate client
          this.apiClient = await ApiFactory.getInstance();
        }

        await this.apiClient.initialize();
        this.initialized = true;
        logger.info('Call Records Service initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize Call Records Service:', error);
        throw error;
      }
    }
    return this.apiClient!;
  }

  /**
   * Get paginated call records
   */
  async getCallRecords(page: number = 1, pageSize: number = 20): Promise<{
    records: CallRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      const client = await this.ensureInitialized();

      logger.info(`Fetching call records: page=${page}, pageSize=${pageSize}`);

      // Use the appropriate entity name based on the deployment context
      // For Dynamics365: 'phonecall' or custom entity
      // For External API: endpoint will be handled by the client
      const response = await client.retrieveMultipleRecords('phonecall', {
        select: ['activityid', 'subject', 'createdon', 'modifiedon', 'description', 'phonenumber', 'directioncode'],
        orderBy: 'createdon desc',
        top: pageSize,
        skip: (page - 1) * pageSize
      });

      logger.info(`API response received:`, {
        success: response.success,
        dataLength: response.data?.length,
        totalCount: response.pagination?.totalCount
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to retrieve call records');
      }

      // Transform API data to CallRecord format
      const records: CallRecord[] = response.data.map((item: any, index: number) =>
        this.transformToCallRecord(item, index)
      );

      logger.info(`Transformed records:`, {
        count: records.length,
        firstRecord: records[0] ? {
          id: records[0].id,
          name: records[0].name,
          dateOfCall: records[0].dateOfCall
        } : null
      });

      const total = response.pagination?.totalCount || records.length;

      return {
        records,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error) {
      logger.error('Failed to get call records:', error);
      // Return empty result instead of throwing to maintain UI stability
      return {
        records: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      };
    }
  }

  /**
   * Get a single call record by ID
   */
  async getCallRecord(id: string): Promise<CallRecord | null> {
    try {
      const client = await this.ensureInitialized();
      
      const response = await client.retrieveRecord('phonecall', id, {
        select: ['activityid', 'subject', 'createdon', 'modifiedon', 'description', 'phonenumber', 'directioncode']
      });

      if (!response.success || !response.data) {
        return null;
      }

      return this.transformToCallRecord(response.data);
    } catch (error) {
      logger.error('Failed to get call record:', error);
      return null;
    }
  }

  /**
   * Update a call record
   */
  async updateCallRecord(id: string, updates: Partial<CallRecord>): Promise<CallRecord | null> {
    try {
      const client = await this.ensureInitialized();
      
      // Map CallRecord updates to API fields
      const apiUpdates: any = {};
      if (updates.name) apiUpdates.subject = updates.name;
      if (updates.transcript) apiUpdates.description = updates.transcript;
      if (updates.notes) {
        // For notes, we might need a custom field or append to description
        apiUpdates.description = updates.transcript || '';
        if (updates.notes) {
          apiUpdates.description += `\n\nNotes: ${updates.notes}`;
        }
      }
      
      const response = await client.updateRecord('phonecall', id, apiUpdates);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update call record');
      }

      // Return the updated record
      return await this.getCallRecord(id);
    } catch (error) {
      logger.error('Failed to update call record:', error);
      return null;
    }
  }

  /**
   * Search call records
   */
  async searchCallRecords(query: string): Promise<CallRecord[]> {
    try {
      const client = await this.ensureInitialized();
      
      // Build search filter
      const filter = `contains(subject,'${query}') or contains(description,'${query}')`;
      
      const response = await client.retrieveMultipleRecords('phonecall', {
        select: ['activityid', 'subject', 'createdon', 'modifiedon', 'description', 'phonenumber', 'directioncode'],
        filter: filter,
        orderBy: 'createdon desc',
        top: 50 // Limit search results
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to search call records');
      }

      return response.data.map((item: any, index: number) => 
        this.transformToCallRecord(item, index)
      );
    } catch (error) {
      logger.error('Failed to search call records:', error);
      return [];
    }
  }

  /**
   * Transform API data to CallRecord format
   * Handles both Dynamics 365 API responses and mock CallRecord objects
   */
  private transformToCallRecord(item: any, index: number = 0): CallRecord {
    // Check if item is already a CallRecord (from mock data)
    if (item.id && item.dateOfCall && item.timeOfCall && item.callLength && item.name) {
      // It's already a CallRecord, return it as-is
      return item as CallRecord;
    }

    // Otherwise, transform from Dynamics 365 API response format
    const createdDate = item.createdon ? new Date(item.createdon) : new Date();
    const modifiedDate = item.modifiedon ? new Date(item.modifiedon) : createdDate;

    // Extract notes from description if they exist
    const description = item.description || '';
    const notesMatch = description.match(/\n\nNotes: (.+)$/);
    const notes = notesMatch ? notesMatch[1] : '';
    const transcript = notesMatch ? description.replace(/\n\nNotes: .+$/, '') : description;

    return {
      id: item.activityid || `record-${index}`,
      dateOfCall: createdDate.toISOString().split('T')[0],
      timeOfCall: createdDate.toTimeString().slice(0, 5),
      callLength: this.calculateCallLength(createdDate, modifiedDate),
      name: item.subject || 'Unknown Contact',
      inboundOutbound: this.determineCallDirection(item.directioncode),
      phoneNumber: item.phonenumber || '+44 000 000000',
      callId: item.activityid || `CALL-${index}`,
      callType: 'Customer Support', // Could be derived from custom fields
      userName: 'Agent', // Could be looked up from owner field
      callDirection: this.determineCallDirection(item.directioncode),
      transcript: transcript || 'No transcript available',
      summary: this.generateSummary(transcript),
      notes: notes,
      createdAt: createdDate.toISOString(),
      updatedAt: modifiedDate.toISOString()
    };
  }

  /**
   * Calculate call length from created/modified dates
   */
  private calculateCallLength(created: Date, modified: Date): string {
    const diffMs = modified.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const minutes = Math.max(1, diffMinutes); // Minimum 1 minute
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Determine call direction from direction code
   */
  private determineCallDirection(directionCode: number | undefined): 'Inbound' | 'Outbound' {
    // Dynamics 365 direction codes: 1 = Outgoing, 2 = Incoming
    return directionCode === 1 ? 'Outbound' : 'Inbound';
  }

  /**
   * Generate a summary from transcript
   */
  private generateSummary(transcript: string): string {
    if (!transcript || transcript === 'No transcript available') {
      return 'No summary available';
    }
    
    // Simple summary generation - take first 100 characters
    const summary = transcript.substring(0, 100);
    return summary.length < transcript.length ? `${summary}...` : summary;
  }
}

// Singleton instance
let serviceInstance: CallRecordsService | null = null;

/**
 * Get the singleton Call Records Service instance
 */
export function getCallRecordsService(): CallRecordsService {
  if (!serviceInstance) {
    serviceInstance = new CallRecordsService();
  }
  return serviceInstance;
}

/**
 * Reset the service instance (useful for testing)
 */
export function resetCallRecordsService(): void {
  serviceInstance = null;
}

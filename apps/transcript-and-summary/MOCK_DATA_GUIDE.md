# Mock Data Service Guide

## Overview

The mock data service provides realistic dummy call records for local development and testing without requiring a live Dynamics 365 connection. This enables rapid development iteration and testing of the transcript and summary application.

## Features

### 🎯 **Realistic Mock Data**
- **50+ Sample Call Records**: Generated with realistic data spanning the last 30 days
- **Varied Call Types**: Customer Support, Sales, Billing, Technical Support, etc.
- **Mixed Directions**: Both inbound and outbound calls with realistic distribution
- **Realistic Durations**: Call lengths ranging from 1 minute to 60 minutes
- **Sample Transcripts**: Pre-written conversation examples
- **AI Summaries**: Realistic call summaries
- **Metadata**: Call IDs, agent names, customer names, phone numbers

### 🔄 **Automatic Mode Detection**
- Automatically uses mock data in development mode
- Can be toggled at runtime via development toolbar
- Never included in production builds
- Seamless fallback to real API when needed

### 🛠️ **Development Toolbar**
- Floating toolbar for easy access
- Toggle between mock and real data
- View current data source status
- Development tips and information

## Getting Started

### 1. **Enable Mock Data Mode**

Mock data is automatically enabled in development mode. To verify:

```bash
npm run dev
```

The application will use mock data by default in development.

### 2. **Using the Development Toolbar**

1. Look for the ⚙️ button in the bottom-right corner
2. Click to open the development toolbar
3. Toggle between "Use Mock Data" and "Use Real API"
4. Changes take effect after page reload

### 3. **Environment Variables**

To explicitly control mock data mode:

```bash
# Enable mock data
REACT_APP_USE_MOCK_DATA=true npm run dev

# Disable mock data (use real API)
REACT_APP_USE_MOCK_DATA=false npm run dev
```

### 4. **Runtime Toggle**

In browser console:

```javascript
// Enable mock data
localStorage.setItem('USE_MOCK_DATA', 'true');
window.location.reload();

// Disable mock data
localStorage.setItem('USE_MOCK_DATA', 'false');
window.location.reload();

// Check current status
localStorage.getItem('USE_MOCK_DATA');
```

## Mock Data Structure

### Call Record Interface

```typescript
interface CallRecord {
  id: string;                          // Unique identifier
  dateOfCall: string;                  // YYYY-MM-DD format
  timeOfCall: string;                  // HH:MM format
  callLength: string;                  // MM:SS format
  name: string;                        // Customer name
  inboundOutbound: 'Inbound' | 'Outbound';
  phoneNumber: string;                 // +44 format
  callId: string;                      // CALL-XXXXX format
  callType: string;                    // Type of call
  userName: string;                    // Agent name
  callDirection: 'Inbound' | 'Outbound';
  transcript: string;                  // Full conversation
  summary: string;                     // AI-generated summary
  notes: string;                       // User notes
  createdAt: string;                   // ISO timestamp
  updatedAt: string;                   // ISO timestamp
}
```

### Sample Data Characteristics

**Call Types:**
- Customer Support
- Sales Inquiry
- Technical Support
- Billing Question
- Product Demo
- Follow-up Call
- Complaint Resolution
- Account Setup
- And 24+ more...

**Call Durations:**
- 30% short calls (1-5 minutes)
- 40% medium calls (6-20 minutes)
- 30% long calls (21-60 minutes)

**Call Directions:**
- ~50% Inbound calls
- ~50% Outbound calls
- Includes missed calls and voicemails

**Time Range:**
- Calls spanning the last 30 days
- Business hours (8 AM - 7 PM)
- Realistic distribution throughout the day

## API Integration

### Using Mock Data with CallRecordsService

The `CallRecordsService` automatically detects and uses mock data:

```typescript
import { getCallRecordsService } from './services/callRecordsService';

const service = getCallRecordsService();

// In development with mock data enabled:
// - Uses MockApiClient
// - Returns mock data instantly (with simulated delay)
// - All operations work identically to real API

// In production or with mock data disabled:
// - Uses real Dynamics 365 API client
// - Makes actual HTTP requests
// - Requires authentication
```

### Mock API Client Features

```typescript
import { getMockApiClient } from './services/mockApiClient';

const mockClient = getMockApiClient();
await mockClient.initialize();

// All standard operations supported:
await mockClient.retrieveMultipleRecords('phonecall', {
  select: ['name', 'subject'],
  filter: "contains(subject,'billing')",
  orderBy: 'createdon desc',
  top: 20,
  skip: 0
});

// Filtering works with OData syntax
// Sorting works with field names and asc/desc
// Pagination works with skip/top
```

## Testing with Mock Data

### Unit Tests

```typescript
import { getMockApiClient, resetMockApiClient } from './mockApiClient';

describe('My Component', () => {
  beforeEach(() => {
    resetMockApiClient();
  });

  it('should display mock call records', async () => {
    const client = getMockApiClient();
    await client.initialize();
    
    const result = await client.retrieveMultipleRecords('phonecall');
    expect(result.data).toHaveLength(50);
  });
});
```

### Integration Tests

```typescript
// Mock data is automatically used in development mode
// No special configuration needed
// Just run tests normally

npm test
```

### E2E Tests

```typescript
// Enable mock data for E2E tests
REACT_APP_USE_MOCK_DATA=true npm run e2e
```

## Pagination Testing

Mock data includes 50 records by default, perfect for testing pagination:

```typescript
// Test page 1
const page1 = await service.getCallRecords(1, 20);
expect(page1.records).toHaveLength(20);
expect(page1.totalPages).toBe(3);

// Test page 2
const page2 = await service.getCallRecords(2, 20);
expect(page2.records).toHaveLength(20);

// Test page 3
const page3 = await service.getCallRecords(3, 20);
expect(page3.records).toHaveLength(10);
```

## Simulated API Delays

Mock data includes realistic API delays:

```typescript
// Default delays:
// - GET: 200ms
// - POST: 300ms
// - PATCH: 300ms
// - DELETE: 200ms
// - retrieveMultipleRecords: 400ms

// Customize in mockApiClient.ts if needed
```

## Switching to Real API

### For Development

1. Open development toolbar (⚙️ button)
2. Click "Use Real API"
3. Page will reload with real API enabled

### For Production

Mock data is automatically disabled in production builds:

```bash
npm run build
# Mock data is never included in production
```

## Troubleshooting

### Mock Data Not Loading

1. Check browser console for errors
2. Verify `NODE_ENV === 'development'`
3. Check localStorage: `localStorage.getItem('USE_MOCK_DATA')`
4. Clear browser cache and reload

### Data Not Persisting

Mock data is reset on page reload - this is by design. To persist changes:

1. Use real API instead
2. Or implement localStorage persistence in mock client

### Performance Issues

If mock data operations are slow:

1. Reduce number of records: `generateMockCallRecords(25)`
2. Reduce simulated delays in `mockApiClient.ts`
3. Check browser DevTools for bottlenecks

## Best Practices

### ✅ **Do**
- Use mock data for rapid development iteration
- Test pagination and filtering with mock data
- Use development toolbar to toggle modes
- Reset mock client between tests
- Include mock data in version control

### ❌ **Don't**
- Rely on mock data persisting across reloads
- Use mock data in production
- Modify mock data generation for production
- Forget to test with real API before deployment

## Advanced Usage

### Custom Mock Data

To generate different amounts of mock data:

```typescript
import { generateMockCallRecords } from './mockDataService';

// Generate 100 records instead of 50
const records = generateMockCallRecords(100);
```

### Extending Mock Data

Add more realistic data:

```typescript
// In mockDataService.ts
const SAMPLE_NAMES = [
  // Add more names...
];

const SAMPLE_TRANSCRIPTS = [
  // Add more transcripts...
];
```

## Performance Metrics

- **Initialization**: ~300ms
- **Retrieve Multiple**: ~400ms (with simulated delay)
- **Retrieve Single**: ~300ms
- **Create/Update**: ~300-400ms
- **Delete**: ~200ms

## Support

For issues or questions:

1. Check this guide
2. Review mock data service code
3. Check browser console for errors
4. Review test files for usage examples

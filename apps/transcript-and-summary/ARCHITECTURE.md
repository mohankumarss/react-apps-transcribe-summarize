# Simplified API Architecture for Transcript and Summary App

## Overview

The transcript-and-summary app now uses a clean, unified service layer that automatically adapts to the deployment context without requiring manual configuration or complex mock services.

## Architecture Components

### 1. Unified Service Layer
- **File**: `src/services/callRecordsService.ts`
- **Purpose**: Single service interface that provides all call record operations
- **Key Features**:
  - Automatic API client selection based on deployment mode
  - Consistent interface regardless of underlying API client
  - Built-in error handling and data transformation
  - Singleton pattern for efficient resource usage

### 2. Automatic API Client Selection

The service automatically chooses the appropriate API client:

```typescript
// Uses existing shared infrastructure
const client = await ApiFactory.getInstance();
```

**Deployment Mode Detection**:
- **Webresource builds**: Uses `Dynamics365ApiClient` (Xrm.WebApi)
- **Regular dev/build**: Uses `ExternalApiClient` (HTTP/MSAL)

**Detection Methods**:
1. Build-time constants (`__WEBRESOURCE_BUILD__`)
2. Runtime environment variables (`WEBPACK_DEPLOYMENT_MODE`)
3. Deployment context detection from shared config

### 3. Data Transformation

The service handles automatic transformation between:
- Dynamics 365 entities (`phonecall` records)
- Application data models (`CallRecord` interface)

**Key Transformations**:
- Entity fields → CallRecord properties
- Direction codes → Human-readable directions
- Timestamps → Formatted dates/times
- Notes extraction from description fields

## Component Integration

### Before (Complex)
```typescript
// Components directly used MockCallRecordsAPI
import { MockCallRecordsAPI } from '../services/mockDataService';
const apiService = MockCallRecordsAPI.getInstance();
```

### After (Simplified)
```typescript
// Components use unified service
import { getCallRecordsService } from '../services/callRecordsService';
const apiService = getCallRecordsService();
```

## Benefits

### 1. **Simplified Architecture**
- Single service interface for all deployment modes
- No mock services cluttering the codebase
- Clear separation of concerns

### 2. **Automatic Adaptation**
- No manual configuration required
- Leverages existing webpack build constants
- Uses proven deployment detection patterns

### 3. **Maintainable Code**
- Easy to understand and debug
- Follows existing codebase patterns
- Comprehensive error handling

### 4. **Testable Design**
- Service can be easily mocked for testing
- Clear interfaces for unit testing
- Singleton pattern allows for test isolation

## Usage Examples

### Getting Call Records
```typescript
const service = getCallRecordsService();
const result = await service.getCallRecords(1, 20);
// Returns: { records: CallRecord[], total: number, page: number, ... }
```

### Updating a Call Record
```typescript
const service = getCallRecordsService();
const updated = await service.updateCallRecord('call-id', {
  notes: 'Updated notes',
  transcript: 'Updated transcript'
});
```

### Searching Call Records
```typescript
const service = getCallRecordsService();
const results = await service.searchCallRecords('billing');
// Returns: CallRecord[]
```

## Deployment Modes

### Webresource Mode
- **Trigger**: `WEBPACK_DEPLOYMENT_MODE=web_resource` or `__WEBRESOURCE_BUILD__=true`
- **API Client**: `Dynamics365ApiClient`
- **Data Source**: Dynamics 365 `phonecall` entities via Xrm.WebApi
- **Authentication**: Dynamics 365 context (automatic)

### Regular Dev/Build Mode
- **Trigger**: Other deployment modes
- **API Client**: `ExternalApiClient`
- **Data Source**: External Dataverse API via HTTP
- **Authentication**: MSAL tokens

## File Structure

```
apps/transcript-and-summary/src/services/
├── callRecordsService.ts          # Main unified service
├── mockDataService.ts             # CallRecord interface only
└── __tests__/
    └── callRecordsService.test.ts # Service tests
```

## Migration Summary

### Removed
- ❌ `MockCallRecordsAPI` usage in components
- ❌ Complex API service factory with multiple implementations
- ❌ Mock data generation and management
- ❌ Manual deployment mode configuration

### Added
- ✅ Single `CallRecordsService` class
- ✅ Automatic API client selection
- ✅ Built-in data transformation
- ✅ Comprehensive error handling
- ✅ Clean service interface

### Preserved
- ✅ Existing component interfaces and props
- ✅ `CallRecord` data structure
- ✅ Build-time constants and deployment detection
- ✅ Shared API infrastructure
- ✅ No breaking changes to UI components

## Testing

The service includes comprehensive tests covering:
- API client initialization
- Data retrieval and transformation
- Error handling scenarios
- Singleton behavior
- Search functionality

Run tests with:
```bash
npm test -- callRecordsService.test.ts
```

## Future Enhancements

1. **Custom Entity Support**: Easy to extend for custom Dynamics 365 entities
2. **Caching Layer**: Can add caching without changing component interfaces
3. **Offline Support**: Service layer can handle offline scenarios
4. **Real-time Updates**: WebSocket support can be added to the service layer

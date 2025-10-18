# Dynamics 365 HTTP API Client

## Overview

The `Dynamics365ApiClient` has been updated to use standard HTTP requests instead of the Xrm.WebApi approach. This makes it work from any context (not just within Dynamics 365 web resources) while maintaining the same interface and functionality.

## Key Changes

### ✅ **Removed Xrm.WebApi Dependency**
- Eliminated all references to `(window as any).Xrm.WebApi`
- Removed `waitForXrmContext()` method
- No longer requires Dynamics 365 web resource context

### ✅ **HTTP Client Pattern**
- Uses axios for HTTP requests
- Implements request/response interceptor pattern
- Follows same error handling approach as `ExternalApiClient`

### ✅ **Direct API Calls**
- Makes direct HTTP calls to Dynamics 365 Web API endpoints
- Base URL format: `https://[org-name].api.crm.dynamics.com/api/data/v9.2/`
- Entity endpoints: `https://[org-name].api.crm.dynamics.com/api/data/v9.2/[entity-name]`

### ✅ **Interface Compatibility**
- Still implements the `IApiClient` interface
- Maintains all existing method signatures and return types
- No breaking changes for consumers like `CallRecordsService`

## Architecture

### Configuration
```typescript
export interface Dynamics365ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}
```

### Constructor
```typescript
const client = new Dynamics365ApiClient({
  baseURL: 'https://myorg.api.crm.dynamics.com/api/data/v9.2/',
  timeout: 30000,
  headers: {
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
    'Accept': 'application/json',
    'Prefer': 'return=representation'
  }
});
```

### Authentication
- Uses `getAuthService()` from auth factory
- Automatically adds Bearer tokens to requests
- Handles token refresh and authentication errors

### Request Interceptors
- Adds authentication headers automatically
- Logs all requests for debugging
- Handles request errors gracefully

### Response Interceptors
- Logs all responses for debugging
- Transforms errors into consistent format
- Handles network and HTTP errors

## API Methods

### Standard HTTP Methods
```typescript
// GET request
const response = await client.get<T>('/accounts');

// POST request
const response = await client.post<T>('/accounts', data);

// PATCH request
const response = await client.patch<T>('/accounts(id)', data);

// DELETE request
const response = await client.delete<T>('/accounts(id)');
```

### Dynamics 365 Specific Methods
```typescript
// Retrieve single record
const response = await client.retrieveRecord('account', 'id', {
  select: ['name', 'accountnumber'],
  expand: ['primarycontactid']
});

// Retrieve multiple records
const response = await client.retrieveMultipleRecords('account', {
  select: ['name', 'accountnumber'],
  filter: "statecode eq 0",
  orderBy: 'name asc',
  top: 50
});

// Create record
const response = await client.createRecord('account', {
  name: 'New Account',
  accountnumber: 'ACC001'
});

// Update record
const response = await client.updateRecord('account', 'id', {
  name: 'Updated Account'
});

// Delete record
const response = await client.deleteRecord('account', 'id');
```

### Query Options
```typescript
interface QueryOptions {
  select?: string[];      // Fields to retrieve
  filter?: string;        // OData filter expression
  orderBy?: string;       // Sort expression
  expand?: string[];      // Related entities to expand
  top?: number;          // Maximum records to return
  skip?: number;         // Records to skip (pagination)
}
```

## Error Handling

### Error Types
- **AuthenticationError**: 401 responses, token issues
- **ApiError**: HTTP errors with status codes
- **NetworkError**: Network connectivity issues

### Error Response Format
```typescript
{
  data: null,
  success: false,
  message: "Error description",
  errors: ["Error description"],
  statusCode: 404
}
```

## Usage in ApiFactory

The factory automatically creates the client with proper configuration:

```typescript
case DeploymentMode.WEB_RESOURCE:
  apiClient = new Dynamics365ApiClient({
    baseURL: config.apiBaseUrl,
    timeout: 30000,
    headers: {
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Accept': 'application/json',
      'Prefer': 'return=representation'
    }
  });
  break;
```

## Benefits

### 🌐 **Universal Compatibility**
- Works from any context (web resources, standalone apps, Node.js)
- No dependency on Dynamics 365 client-side context
- Can be used in server-side applications

### 🔧 **Standard HTTP Pattern**
- Uses familiar axios patterns
- Consistent with other HTTP clients in the codebase
- Easy to debug and monitor

### 🔐 **Robust Authentication**
- Automatic token management
- Handles token refresh
- Graceful authentication error handling

### 📊 **Better Observability**
- Request/response logging
- Error tracking and reporting
- Performance monitoring capabilities

### 🧪 **Testable**
- Easy to mock for unit tests
- Comprehensive test coverage
- Predictable behavior

## Migration Impact

### ✅ **No Breaking Changes**
- All existing consumers continue to work
- Same interface and method signatures
- Same response formats

### ✅ **Improved Reliability**
- More predictable error handling
- Better timeout management
- Consistent behavior across environments

### ✅ **Enhanced Debugging**
- Better error messages
- Request/response logging
- Network-level debugging support

## Testing

Comprehensive test suite covers:
- Client initialization
- HTTP method operations
- Dynamics 365 specific methods
- Error handling scenarios
- Authentication integration

Run tests:
```bash
npm test -- --testPathPatterns=dynamics365ApiClient.test.ts
```

## Future Enhancements

1. **Batch Operations**: Implement OData batch requests for better performance
2. **Caching**: Add response caching for frequently accessed data
3. **Retry Logic**: Implement automatic retry for transient failures
4. **Rate Limiting**: Add request throttling to respect API limits
5. **Offline Support**: Cache responses for offline scenarios

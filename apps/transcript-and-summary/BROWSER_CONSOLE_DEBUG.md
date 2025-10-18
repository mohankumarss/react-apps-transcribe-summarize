# Browser Console Debugging Guide

## Step 1: Open Browser Console
Press `F12` or `Ctrl+Shift+I` to open DevTools, then click the "Console" tab.

## Step 2: Run These Commands in Order

### Command 1: Check Development Mode
```javascript
// Check if development mode is enabled
import { getDevelopmentModeConfig } from './config/developmentMode';
const config = getDevelopmentModeConfig();
console.log('Development Mode Config:', config);
```

**Expected Output:**
```
Development Mode Config: {
  enabled: true,
  useMockData: true,
  mockDataDelay: 300
}
```

**If `enabled` is false:** You're not in development mode
**If `useMockData` is false:** Mock data is disabled

---

### Command 2: Check Mock Data Generation
```javascript
// Check if mock data can be generated
import { generateMockCallRecords } from './services/mockDataService';
const records = generateMockCallRecords(50);
console.log('Generated records:', records.length);
console.log('First record:', records[0]);
```

**Expected Output:**
```
Generated records: 50
First record: {
  id: "call-1",
  dateOfCall: "2024-10-18",
  timeOfCall: "14:30",
  callLength: "05:23",
  name: "John Smith",
  ...
}
```

**If records.length is 0:** Mock data generation is broken
**If first record is undefined:** Mock data structure is wrong

---

### Command 3: Check Mock API Client
```javascript
// Check if mock API client works
import { getMockApiClient } from './services/mockApiClient';
const client = getMockApiClient();
console.log('Mock API client created:', client);

// Initialize it
await client.initialize();
console.log('Mock API client initialized');

// Try to retrieve records
const result = await client.retrieveMultipleRecords('phonecall', { top: 50 });
console.log('Mock API result:', result);
console.log('Records from API:', result.data.length);
```

**Expected Output:**
```
Mock API client created: MockApiClient { ... }
Mock API client initialized
Mock API result: {
  data: [...50 records...],
  success: true,
  pagination: { ... }
}
Records from API: 50
```

**If records from API is 0:** Mock API client is not returning data
**If error occurs:** Mock API client initialization failed

---

### Command 4: Check Call Records Service
```javascript
// Check if call records service works
import { getCallRecordsService } from './services/callRecordsService';
const service = getCallRecordsService();
console.log('Call Records Service created:', service);

// Try to get records
const result = await service.getCallRecords(1, 50);
console.log('Service result:', result);
console.log('Records from service:', result.records.length);
console.log('First record from service:', result.records[0]);
```

**Expected Output:**
```
Call Records Service created: CallRecordsService { ... }
Service result: {
  records: [...50 records...],
  total: 50,
  page: 1,
  pageSize: 50,
  totalPages: 1
}
Records from service: 50
First record from service: {
  id: "call-1",
  name: "John Smith",
  ...
}
```

**If records from service is 0:** Service is not returning data
**If error occurs:** Service initialization failed

---

### Command 5: Check shouldUseMockData Function
```javascript
// Check if shouldUseMockData returns true
import { shouldUseMockData } from './config/developmentMode';
const useMock = shouldUseMockData();
console.log('Should use mock data:', useMock);
```

**Expected Output:**
```
Should use mock data: true
```

**If false:** Mock data is disabled

---

### Command 6: Check localStorage
```javascript
// Check localStorage settings
console.log('USE_MOCK_DATA:', localStorage.getItem('USE_MOCK_DATA'));
console.log('All localStorage keys:', Object.keys(localStorage));
```

**Expected Output:**
```
USE_MOCK_DATA: null  (or "true")
All localStorage keys: [...]
```

**If USE_MOCK_DATA is "false":** Mock data is explicitly disabled

---

### Command 7: Check NODE_ENV
```javascript
// Check NODE_ENV
console.log('NODE_ENV:', process?.env?.NODE_ENV);
```

**Expected Output:**
```
NODE_ENV: development
```

**If "production":** You're in production mode
**If undefined:** process.env is not available

---

## Troubleshooting Based on Results

### If Command 1 shows `enabled: false`
**Problem:** Not in development mode
**Solution:**
1. Make sure you're running `npm run dev:transcript-and-summary`
2. Check that NODE_ENV is set to 'development'
3. Restart dev server

### If Command 1 shows `useMockData: false`
**Problem:** Mock data is disabled
**Solution:**
1. Check localStorage: `localStorage.getItem('USE_MOCK_DATA')`
2. If it's 'false', enable it: `localStorage.setItem('USE_MOCK_DATA', 'true'); window.location.reload();`
3. Check REACT_APP_USE_MOCK_DATA environment variable

### If Command 2 shows `records.length: 0`
**Problem:** Mock data generation is broken
**Solution:**
1. Check mockDataService.ts for errors
2. Verify generateMockCallRecords function exists
3. Check for any errors in mock data generation logic

### If Command 3 shows `Records from API: 0`
**Problem:** Mock API client is not returning data
**Solution:**
1. Check if mock data was generated (Command 2)
2. Verify MockApiClient.retrieveMultipleRecords method
3. Check for errors in the method

### If Command 4 shows `Records from service: 0`
**Problem:** Service is not returning data
**Solution:**
1. Check if mock API client works (Command 3)
2. Verify shouldUseMockData returns true (Command 5)
3. Check transformation logic in transformToCallRecord

### If Command 5 shows `false`
**Problem:** shouldUseMockData returns false
**Solution:**
1. Check development mode (Command 1)
2. Check localStorage (Command 6)
3. Check NODE_ENV (Command 7)

---

## Complete Debugging Sequence

Run these commands in order to identify the issue:

```javascript
// 1. Check development mode
import { getDevelopmentModeConfig } from './config/developmentMode';
console.log('1. Config:', getDevelopmentModeConfig());

// 2. Check mock data generation
import { generateMockCallRecords } from './services/mockDataService';
console.log('2. Generated records:', generateMockCallRecords(50).length);

// 3. Check mock API client
import { getMockApiClient } from './services/mockApiClient';
const client = getMockApiClient();
await client.initialize();
const apiResult = await client.retrieveMultipleRecords('phonecall', { top: 50 });
console.log('3. API records:', apiResult.data.length);

// 4. Check call records service
import { getCallRecordsService } from './services/callRecordsService';
const service = getCallRecordsService();
const serviceResult = await service.getCallRecords(1, 50);
console.log('4. Service records:', serviceResult.records.length);

// 5. Check shouldUseMockData
import { shouldUseMockData } from './config/developmentMode';
console.log('5. Should use mock:', shouldUseMockData());

// 6. Check localStorage
console.log('6. localStorage USE_MOCK_DATA:', localStorage.getItem('USE_MOCK_DATA'));

// 7. Check NODE_ENV
console.log('7. NODE_ENV:', process?.env?.NODE_ENV);
```

---

## If All Commands Pass But UI Still Shows No Data

1. **Check if CallLogPage is receiving data:**
   ```javascript
   // Add this to CallLogPage component temporarily
   console.log('CallLogPage received records:', callRecords.length);
   ```

2. **Check if Grid component is rendering:**
   - Open DevTools Elements tab
   - Look for the Grid component
   - Check if it has any rows

3. **Check for JavaScript errors:**
   - Look for red error messages in console
   - Check for warnings

4. **Check Network tab:**
   - Look for any failed requests
   - Check for API calls to Dynamics 365

5. **Hard refresh browser:**
   ```
   Ctrl+Shift+R
   ```

6. **Clear cache and restart:**
   ```bash
   npm run clean
   npm run dev:transcript-and-summary
   ```

---

## Quick Copy-Paste Debug Script

Copy and paste this entire script into the browser console:

```javascript
(async () => {
  console.log('=== MOCK DATA DEBUG SCRIPT ===\n');
  
  try {
    // 1. Check development mode
    const { getDevelopmentModeConfig } = await import('./config/developmentMode');
    const config = getDevelopmentModeConfig();
    console.log('✓ Development Mode Config:', config);
    
    // 2. Check mock data generation
    const { generateMockCallRecords } = await import('./services/mockDataService');
    const records = generateMockCallRecords(50);
    console.log('✓ Generated records:', records.length);
    
    // 3. Check mock API client
    const { getMockApiClient } = await import('./services/mockApiClient');
    const client = getMockApiClient();
    await client.initialize();
    const apiResult = await client.retrieveMultipleRecords('phonecall', { top: 50 });
    console.log('✓ API records:', apiResult.data.length);
    
    // 4. Check call records service
    const { getCallRecordsService } = await import('./services/callRecordsService');
    const service = getCallRecordsService();
    const serviceResult = await service.getCallRecords(1, 50);
    console.log('✓ Service records:', serviceResult.records.length);
    
    // 5. Check shouldUseMockData
    const { shouldUseMockData } = await import('./config/developmentMode');
    console.log('✓ Should use mock:', shouldUseMockData());
    
    // 6. Check localStorage
    console.log('✓ localStorage USE_MOCK_DATA:', localStorage.getItem('USE_MOCK_DATA'));
    
    // 7. Check NODE_ENV
    console.log('✓ NODE_ENV:', process?.env?.NODE_ENV);
    
    console.log('\n=== DEBUG COMPLETE ===');
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
})();
```

---

## Support

If you're still having issues after running these commands:

1. Share the output of the debug script
2. Share any error messages from the console
3. Check the documentation files for more help
4. Review the code comments for implementation details

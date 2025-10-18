# Test Mock Data Flow - Step by Step

## Issue
CallLogPage is showing "No call records available" even though mock data should be loaded.

## Root Cause Analysis

The issue is likely one of these:
1. `shouldUseMockData()` returns `false` (mock data disabled)
2. `generateMockCallRecords()` returns empty array
3. `MockApiClient.retrieveMultipleRecords()` returns empty data
4. `CallRecordsService.getCallRecords()` returns empty records
5. `CallLogPage` is not receiving the data

## Step-by-Step Testing

### Step 1: Verify Development Mode
Open browser console and run:
```javascript
import { getDevelopmentModeConfig } from './config/developmentMode';
const config = getDevelopmentModeConfig();
console.log('Development Mode Config:', config);
```

**Expected:**
```
{
  enabled: true,
  useMockData: true,
  mockDataDelay: 300
}
```

**If `enabled` is false:**
- You're not in development mode
- Make sure you're running `npm run dev:transcript-and-summary`

**If `useMockData` is false:**
- Mock data is disabled
- Check localStorage: `localStorage.getItem('USE_MOCK_DATA')`
- If it's 'false', enable it: `localStorage.setItem('USE_MOCK_DATA', 'true'); window.location.reload();`

---

### Step 2: Verify Mock Data Generation
```javascript
import { generateMockCallRecords } from './services/mockDataService';
const records = generateMockCallRecords(50);
console.log('Generated records count:', records.length);
console.log('First record:', records[0]);
```

**Expected:**
```
Generated records count: 50
First record: {
  id: "call-1",
  dateOfCall: "2024-10-18",
  timeOfCall: "14:30",
  callLength: "05:23",
  name: "John Smith",
  ...
}
```

**If count is 0:**
- Mock data generation is broken
- Check mockDataService.ts for errors

**If first record is undefined:**
- Mock data structure is wrong
- Check CallRecord interface

---

### Step 3: Verify Mock API Client Initialization
```javascript
import { getMockApiClient } from './services/mockApiClient';
const client = getMockApiClient();
console.log('Mock API client created:', !!client);

await client.initialize();
console.log('Mock API client initialized');
```

**Expected:**
```
Mock API client created: true
Mock API client initialized
```

**If error occurs:**
- Check MockApiClient.initialize() method
- Check browser console for error messages

---

### Step 4: Verify Mock API Client Data Retrieval
```javascript
import { getMockApiClient } from './services/mockApiClient';
const client = getMockApiClient();
await client.initialize();

const result = await client.retrieveMultipleRecords('phonecall', { top: 50 });
console.log('API response:', result);
console.log('Data count:', result.data?.length);
console.log('Success:', result.success);
```

**Expected:**
```
API response: {
  data: [...50 records...],
  success: true,
  pagination: { ... }
}
Data count: 50
Success: true
```

**If data count is 0:**
- Mock API client is not returning data
- Check MockApiClient.retrieveMultipleRecords() method

**If success is false:**
- API response indicates failure
- Check error message in response

---

### Step 5: Verify Call Records Service
```javascript
import { getCallRecordsService } from './services/callRecordsService';
const service = getCallRecordsService();

const result = await service.getCallRecords(1, 50);
console.log('Service result:', result);
console.log('Records count:', result.records.length);
console.log('Total:', result.total);
console.log('First record:', result.records[0]);
```

**Expected:**
```
Service result: {
  records: [...50 records...],
  total: 50,
  page: 1,
  pageSize: 50,
  totalPages: 1
}
Records count: 50
Total: 50
First record: {
  id: "call-1",
  name: "John Smith",
  ...
}
```

**If records count is 0:**
- Service is not returning data
- Check CallRecordsService.getCallRecords() method
- Check transformation logic

**If error occurs:**
- Check service initialization
- Check error message in console

---

### Step 6: Verify shouldUseMockData Function
```javascript
import { shouldUseMockData } from './config/developmentMode';
const useMock = shouldUseMockData();
console.log('Should use mock data:', useMock);
```

**Expected:**
```
Should use mock data: true
```

**If false:**
- Mock data is disabled
- Check development mode config
- Check localStorage settings

---

### Step 7: Verify localStorage
```javascript
console.log('USE_MOCK_DATA:', localStorage.getItem('USE_MOCK_DATA'));
console.log('NODE_ENV:', process?.env?.NODE_ENV);
```

**Expected:**
```
USE_MOCK_DATA: null  (or "true")
NODE_ENV: development
```

**If USE_MOCK_DATA is "false":**
- Mock data is explicitly disabled
- Enable it: `localStorage.setItem('USE_MOCK_DATA', 'true'); window.location.reload();`

**If NODE_ENV is not "development":**
- You're not in development mode
- Restart dev server

---

## Complete Debug Script

Copy and paste this entire script into the browser console:

```javascript
(async () => {
  console.log('=== COMPLETE MOCK DATA DEBUG ===\n');
  
  try {
    // Step 1: Check development mode
    console.log('STEP 1: Development Mode');
    const { getDevelopmentModeConfig, shouldUseMockData } = await import('./config/developmentMode');
    const config = getDevelopmentModeConfig();
    console.log('✓ Config:', config);
    console.log('✓ Should use mock:', shouldUseMockData());
    
    if (!config.enabled) {
      console.error('❌ NOT IN DEVELOPMENT MODE');
      return;
    }
    
    if (!config.useMockData) {
      console.error('❌ MOCK DATA DISABLED');
      return;
    }
    
    // Step 2: Check mock data generation
    console.log('\nSTEP 2: Mock Data Generation');
    const { generateMockCallRecords } = await import('./services/mockDataService');
    const records = generateMockCallRecords(50);
    console.log('✓ Generated records:', records.length);
    if (records.length > 0) {
      console.log('✓ First record:', records[0]);
    } else {
      console.error('❌ NO RECORDS GENERATED');
      return;
    }
    
    // Step 3: Check mock API client
    console.log('\nSTEP 3: Mock API Client');
    const { getMockApiClient } = await import('./services/mockApiClient');
    const client = getMockApiClient();
    console.log('✓ Client created');
    
    await client.initialize();
    console.log('✓ Client initialized');
    
    // Step 4: Check API data retrieval
    console.log('\nSTEP 4: API Data Retrieval');
    const apiResult = await client.retrieveMultipleRecords('phonecall', { top: 50 });
    console.log('✓ API response:', apiResult);
    console.log('✓ Data count:', apiResult.data?.length);
    console.log('✓ Success:', apiResult.success);
    
    if (!apiResult.success || apiResult.data?.length === 0) {
      console.error('❌ API RETURNED NO DATA');
      return;
    }
    
    // Step 5: Check call records service
    console.log('\nSTEP 5: Call Records Service');
    const { getCallRecordsService } = await import('./services/callRecordsService');
    const service = getCallRecordsService();
    console.log('✓ Service created');
    
    const serviceResult = await service.getCallRecords(1, 50);
    console.log('✓ Service result:', serviceResult);
    console.log('✓ Records count:', serviceResult.records.length);
    console.log('✓ Total:', serviceResult.total);
    
    if (serviceResult.records.length === 0) {
      console.error('❌ SERVICE RETURNED NO RECORDS');
      console.log('First API record:', apiResult.data[0]);
      console.log('Checking transformation...');
      return;
    }
    
    console.log('✓ First record:', serviceResult.records[0]);
    
    // Step 6: Check localStorage
    console.log('\nSTEP 6: localStorage');
    console.log('✓ USE_MOCK_DATA:', localStorage.getItem('USE_MOCK_DATA'));
    console.log('✓ NODE_ENV:', process?.env?.NODE_ENV);
    
    console.log('\n=== ✅ ALL CHECKS PASSED ===');
    console.log('Mock data is working correctly!');
    console.log('If UI still shows no data, the issue is in the component.');
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    console.error('Stack:', error.stack);
  }
})();
```

---

## What to Do If Tests Fail

### If Step 1 Fails (Development Mode)
1. Check you're running `npm run dev:transcript-and-summary`
2. Check NODE_ENV is 'development'
3. Restart dev server

### If Step 2 Fails (Mock Data Generation)
1. Check mockDataService.ts for errors
2. Verify generateMockCallRecords function
3. Check for any errors in mock data generation logic

### If Step 3 Fails (Mock API Client)
1. Check MockApiClient.initialize() method
2. Check for errors in browser console
3. Verify MockApiClient is properly exported

### If Step 4 Fails (API Data Retrieval)
1. Check MockApiClient.retrieveMultipleRecords() method
2. Verify mock data was generated (Step 2)
3. Check for errors in the method

### If Step 5 Fails (Call Records Service)
1. Check CallRecordsService.getCallRecords() method
2. Check transformation logic in transformToCallRecord()
3. Verify shouldUseMockData() returns true

### If All Steps Pass But UI Shows No Data
1. The issue is in the CallLogPage component
2. Check if component is receiving the data
3. Check if Grid component is rendering correctly
4. Look for JavaScript errors in console

---

## Next Steps

1. Run the complete debug script
2. Share the output
3. Identify which step fails
4. Follow the troubleshooting for that step
5. If all steps pass, check the component rendering

# Debugging Empty Call Records List

## Issue
The CallLogPage is displaying an empty call records list even though mock data should be automatically loaded in development mode.

## Quick Diagnosis Steps

### Step 1: Check Browser Console
Open DevTools: `F12` or `Ctrl+Shift+I`

Look for these log messages:
```
✅ Should see:
- "Mock API client initialized with 50 records"
- "Using mock API client for development"
- "Call Records Service initialized successfully"
- "Call records loaded" with total count

❌ Should NOT see:
- "process is not defined"
- "Cannot set properties of undefined"
- Any TypeScript compilation errors
```

### Step 2: Check Development Toolbar
1. Look for ⚙️ button in bottom-right corner
2. Click it to open the development toolbar
3. Check the status:
   - Should show "Development Mode: Enabled"
   - Should show "Mock Data: Enabled"
   - Should show "Data Source: Mock API"

### Step 3: Check Network Tab
1. Open DevTools Network tab
2. Reload page: `Ctrl+R`
3. Look for API calls:
   - ❌ Should NOT see calls to `/api/phonecall` or Dynamics 365 endpoints
   - ✅ Should see mock data loaded instantly (no network requests)

### Step 4: Check Application Tab
1. Open DevTools Application tab
2. Go to Local Storage
3. Look for `USE_MOCK_DATA` key:
   - Value should be `"true"` or not present (defaults to true in dev)
   - If value is `"false"`, mock data is disabled

### Step 5: Check Console Commands
Run these in browser console:

```javascript
// Check if mock data is enabled
console.log('Mock data enabled:', localStorage.getItem('USE_MOCK_DATA'));

// Check development mode
console.log('NODE_ENV:', process?.env?.NODE_ENV);

// Check if mock API client exists
console.log('Mock API client:', window.__mockApiClient);

// Check call records service
console.log('Call records service:', window.__callRecordsService);
```

## Common Issues and Solutions

### Issue 1: "process is not defined" Error
**Symptoms:**
- Error in browser console
- Development toolbar not visible
- Mock data not loading

**Solution:**
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Stop dev server: `Ctrl+C`
3. Restart dev server: `npm run dev`
4. Hard refresh: `Ctrl+Shift+R`

**Root Cause:** The `process` object is not available in browser. This should be fixed in the code with try-catch blocks.

### Issue 2: Mock Data Disabled
**Symptoms:**
- Development toolbar shows "Mock Data: Disabled"
- Network tab shows API calls to Dynamics 365
- Empty records list (API returns no data)

**Solution:**
1. Check localStorage: `localStorage.getItem('USE_MOCK_DATA')`
2. If value is `"false"`, enable mock data:
   ```javascript
   localStorage.setItem('USE_MOCK_DATA', 'true');
   window.location.reload();
   ```

### Issue 3: Mock Records Not Generated
**Symptoms:**
- Console shows "Mock API client initialized with 0 records"
- Empty call records list
- No errors in console

**Solution:**
1. Check if `generateMockCallRecords()` is working:
   ```javascript
   // In browser console
   import { generateMockCallRecords } from './services/mockDataService';
   const records = generateMockCallRecords(50);
   console.log('Generated records:', records.length);
   ```

2. If 0 records, check `mockDataService.ts`:
   - Verify `generateMockCallRecords()` function exists
   - Verify it's being called in MockApiClient constructor
   - Check for any errors in mock data generation

### Issue 4: Data Transformation Error
**Symptoms:**
- Console shows "Call records loaded" with 0 total
- No error messages
- Empty records list

**Solution:**
1. Check if data transformation is working:
   ```javascript
   // In browser console
   const service = getCallRecordsService();
   const result = await service.getCallRecords(1, 50);
   console.log('Result:', result);
   console.log('Records:', result.records);
   ```

2. If records are empty, check `transformToCallRecord()` method:
   - Verify it handles both CallRecord and Dynamics 365 formats
   - Check for any errors in transformation logic

### Issue 5: Service Not Initialized
**Symptoms:**
- Console shows no initialization messages
- Empty records list
- No errors

**Solution:**
1. Check if service is being initialized:
   ```javascript
   // In browser console
   const service = getCallRecordsService();
   console.log('Service initialized:', service);
   ```

2. Manually trigger initialization:
   ```javascript
   const service = getCallRecordsService();
   await service.getCallRecords(1, 50);
   ```

## Advanced Debugging

### Enable Verbose Logging
Add this to `developmentMode.ts`:
```typescript
export function enableVerboseLogging(): void {
  localStorage.setItem('VERBOSE_LOGGING', 'true');
  window.location.reload();
}
```

Then in components, check for verbose logging:
```typescript
const isVerbose = localStorage.getItem('VERBOSE_LOGGING') === 'true';
if (isVerbose) {
  console.log('Detailed debug info...');
}
```

### Check Mock Data Generation
In browser console:
```javascript
// Check if mock data service is working
import { generateMockCallRecords } from './services/mockDataService';

const records = generateMockCallRecords(50);
console.log('Generated records:', records);
console.log('First record:', records[0]);
console.log('Record count:', records.length);

// Check record structure
if (records.length > 0) {
  const record = records[0];
  console.log('Record keys:', Object.keys(record));
  console.log('Has required fields:', {
    id: !!record.id,
    dateOfCall: !!record.dateOfCall,
    name: !!record.name,
    transcript: !!record.transcript,
    summary: !!record.summary
  });
}
```

### Check Mock API Client
In browser console:
```javascript
// Check if mock API client is working
import { getMockApiClient } from './services/mockApiClient';

const client = getMockApiClient();
await client.initialize();

const result = await client.retrieveMultipleRecords('phonecall', {
  top: 50
});

console.log('Mock API result:', result);
console.log('Data count:', result.data?.length);
console.log('First record:', result.data?.[0]);
```

### Check Call Records Service
In browser console:
```javascript
// Check if service is working
import { getCallRecordsService } from './services/callRecordsService';

const service = getCallRecordsService();
const result = await service.getCallRecords(1, 50);

console.log('Service result:', result);
console.log('Records count:', result.records.length);
console.log('First record:', result.records[0]);
```

## Verification Checklist

- [ ] Browser console shows no errors
- [ ] Development toolbar (⚙️) is visible
- [ ] Development toolbar shows "Mock Data: Enabled"
- [ ] Console shows "Mock API client initialized with 50 records"
- [ ] Console shows "Call records loaded" with total > 0
- [ ] Network tab shows no API calls to Dynamics 365
- [ ] CallLogPage displays 50 records in grid
- [ ] Grid pagination shows correct page count
- [ ] Can click "View" button to open call detail

## If Still Not Working

1. **Check dev server output:**
   - Look for any compilation errors
   - Look for any warnings
   - Check if webpack is rebuilding

2. **Restart everything:**
   ```bash
   # Stop dev server
   Ctrl+C
   
   # Clear cache
   npm run clean
   
   # Restart dev server
   npm run dev
   
   # Hard refresh browser
   Ctrl+Shift+R
   ```

3. **Check file changes:**
   - Verify `callRecordsService.ts` has the transformation fix
   - Verify `developmentMode.ts` has safe process.env handling
   - Verify `mockApiClient.ts` is generating 50 records

4. **Check imports:**
   - Verify all imports are correct
   - Verify no circular dependencies
   - Verify all exports are present

## Support

If you're still having issues:
1. Check the documentation files
2. Review the code comments
3. Run the test suite: `npm test`
4. Check the git history for recent changes
5. Try reverting recent changes and rebuilding

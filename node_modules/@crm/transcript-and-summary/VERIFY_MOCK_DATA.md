# Verify Mock Data is Working

## Quick Verification Steps

### Step 1: Start the Dev Server
```bash
npm run dev
```

Wait for the dev server to start and show:
```
  ➜  Local:   http://localhost:5176/
```

### Step 2: Open the Application
Navigate to: `http://localhost:5176/`

### Step 3: Open Browser DevTools
Press `F12` or `Ctrl+Shift+I`

### Step 4: Check Console for Success Messages

Look for these messages in the Console tab:

```
✅ SUCCESS INDICATORS:
- "Mock API client initialized with 50 records"
- "Using mock API client for development"
- "Call Records Service initialized successfully"
- "Fetching call records: page=1, pageSize=1000"
- "API response received: {success: true, dataLength: 50, totalCount: 50}"
- "Transformed records: {count: 50, firstRecord: {...}}"
- "Call records loaded: {total: 50}"
```

### Step 5: Verify Development Toolbar

1. Look for ⚙️ button in bottom-right corner
2. Click it to open the development toolbar
3. Verify it shows:
   - "Development Mode: Enabled"
   - "Mock Data: Enabled"
   - "Data Source: Mock API"

### Step 6: Verify Call Records Display

1. The CallLogPage should display a grid with call records
2. You should see 50 records total
3. Grid should show pagination (e.g., "Page 1 of 3" for 20 records per page)
4. Each row should have:
   - Date of Call
   - Time of Call
   - Call Length
   - Name
   - Inbound/Outbound
   - Phone Number
   - Notes field
   - View button

### Step 7: Test Interactions

1. **Click View Button**: Should navigate to CallDetailPage
2. **Click Refresh Button**: Should reload the records
3. **Toggle Development Toolbar**: Should switch between mock and real data
4. **Edit Notes**: Should save notes (with debounce)

## Browser Console Commands

Run these commands in the browser console to verify mock data:

### Check Mock Data Mode
```javascript
// Should return 'true' or null (null means default to true in dev)
localStorage.getItem('USE_MOCK_DATA');
```

### Check Development Mode
```javascript
// Should return 'development'
console.log(process?.env?.NODE_ENV);
```

### Check Mock Data Generation
```javascript
// Import and test mock data generation
import { generateMockCallRecords } from './services/mockDataService';
const records = generateMockCallRecords(50);
console.log('Generated records:', records.length);
console.log('First record:', records[0]);
```

### Check Mock API Client
```javascript
// Import and test mock API client
import { getMockApiClient } from './services/mockApiClient';
const client = getMockApiClient();
await client.initialize();
const result = await client.retrieveMultipleRecords('phonecall', { top: 50 });
console.log('Mock API result:', result);
console.log('Records:', result.data.length);
```

### Check Call Records Service
```javascript
// Import and test call records service
import { getCallRecordsService } from './services/callRecordsService';
const service = getCallRecordsService();
const result = await service.getCallRecords(1, 50);
console.log('Service result:', result);
console.log('Records:', result.records.length);
console.log('First record:', result.records[0]);
```

## Expected Output

### Console Messages
```
[INFO] Mock API client initialized with 50 records
[INFO] Using mock API client for development
[INFO] Call Records Service initialized successfully
[INFO] Fetching call records: page=1, pageSize=1000
[INFO] API response received: {success: true, dataLength: 50, totalCount: 50}
[INFO] Transformed records: {count: 50, firstRecord: {id: "...", name: "...", dateOfCall: "..."}}
[INFO] Call records loaded: {total: 50}
```

### Mock Data Structure
```javascript
{
  id: "call-1",
  dateOfCall: "2024-10-18",
  timeOfCall: "14:30",
  callLength: "05:23",
  name: "John Smith",
  inboundOutbound: "Inbound",
  phoneNumber: "+44 123 456789",
  callId: "CALL-00001",
  callType: "Customer Support",
  userName: "Agent Name",
  callDirection: "Inbound",
  transcript: "Customer called about billing issue...",
  summary: "Customer called about billing issue...",
  notes: "",
  createdAt: "2024-10-18T14:30:00.000Z",
  updatedAt: "2024-10-18T14:30:00.000Z"
}
```

### Grid Display
```
Date of Call | Time | Length | Name | Direction | Phone | Notes | Action
2024-10-18   | 14:30| 05:23  | John | Inbound   | +44.. | [text]| View
2024-10-17   | 10:15| 12:45  | Jane | Outbound  | +44.. | [text]| View
...
```

## Troubleshooting

### No Records Displayed
1. Check console for errors
2. Verify development toolbar shows "Mock Data: Enabled"
3. Check if `shouldUseMockData()` returns true
4. Verify mock data generation works (see console commands above)

### Development Toolbar Not Visible
1. Check if in development mode: `process?.env?.NODE_ENV === 'development'`
2. Check browser console for errors
3. Clear cache: `Ctrl+Shift+Delete`
4. Hard refresh: `Ctrl+Shift+R`

### Wrong Data Source
1. Check localStorage: `localStorage.getItem('USE_MOCK_DATA')`
2. If value is 'false', enable mock data:
   ```javascript
   localStorage.setItem('USE_MOCK_DATA', 'true');
   window.location.reload();
   ```

### Performance Issues
1. Check browser DevTools Performance tab
2. Look for slow operations
3. Check for memory leaks
4. Reduce mock record count if needed

## Success Checklist

- [ ] Dev server started successfully
- [ ] Application loads at http://localhost:5176/
- [ ] Browser console shows no errors
- [ ] Development toolbar (⚙️) is visible
- [ ] Development toolbar shows "Mock Data: Enabled"
- [ ] Console shows "Mock API client initialized with 50 records"
- [ ] CallLogPage displays grid with records
- [ ] Grid shows 50 records total
- [ ] Pagination works correctly
- [ ] Can click View button to open detail page
- [ ] Can edit notes and save
- [ ] Can toggle between mock and real data
- [ ] No network calls to Dynamics 365 API

## If Everything Works

Congratulations! The mock data service is working correctly. You can now:

1. **Develop Offline**: Work without internet connection
2. **Test Features**: Test all features with consistent mock data
3. **Debug Easily**: Instant responses, no network delays
4. **Switch to Real API**: Click the development toolbar to switch to real API when needed

## If Something Doesn't Work

1. Check the `DEBUG_EMPTY_RECORDS.md` file for detailed troubleshooting
2. Review the console messages and error logs
3. Check the browser DevTools Network tab
4. Verify all files were created correctly
5. Restart the dev server
6. Clear browser cache and hard refresh

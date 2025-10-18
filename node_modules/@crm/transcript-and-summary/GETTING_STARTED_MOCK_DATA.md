# Getting Started with Mock Data Service

## Quick Start

### 1. **Start Development Server**

```bash
npm run dev
```

Mock data is automatically enabled in development mode.

### 2. **Access the Application**

Open your browser and navigate to the application. You'll see:
- Call list with 50 mock call records
- Development toolbar (⚙️ button) in the bottom-right corner

### 3. **Toggle Between Mock and Real Data**

Click the ⚙️ button to open the development toolbar:
- **Use Mock Data**: Switch to mock data (instant, no API calls)
- **Use Real API**: Switch to real Dynamics 365 API (requires authentication)

Changes take effect after page reload.

## What You Get

### 50 Realistic Mock Call Records
- **Date Range**: Last 30 days
- **Call Types**: 32 different types (Support, Sales, Billing, etc.)
- **Directions**: Mix of inbound and outbound calls
- **Durations**: 1 minute to 60 minutes
- **Transcripts**: Realistic conversation examples
- **Summaries**: AI-generated summaries
- **Metadata**: Customer names, phone numbers, agent names

### Development Toolbar Features
- Toggle between mock and real data
- View current data source status
- Development tips and information
- Only visible in development mode

### Automatic Mode Detection
- Detects development environment automatically
- No configuration needed
- Works out of the box

## Features

✅ **Realistic Data**: 50+ sample call records with varied characteristics
✅ **Instant Loading**: No API calls, instant response times
✅ **Pagination Support**: Test pagination with 50 records
✅ **Filtering & Sorting**: Full OData filter and sort support
✅ **Easy Toggle**: Switch between mock and real data with one click
✅ **Production Safe**: Never included in production builds
✅ **Fully Tested**: 24+ test cases covering all functionality
✅ **Well Documented**: Comprehensive guides and examples

## Common Tasks

### Test Pagination
1. Open the application with mock data enabled
2. Navigate through pages (20 records per page)
3. Verify pagination controls work correctly

### Test Filtering
1. Use the search functionality
2. Filter by call type, date, or customer name
3. Verify results are filtered correctly

### Test Sorting
1. Click column headers to sort
2. Verify records are sorted correctly
3. Test ascending and descending order

### Switch to Real API
1. Click ⚙️ button
2. Click "Use Real API"
3. Page reloads with real API enabled
4. Requires Dynamics 365 authentication

### Run Tests
```bash
# Run all tests
npm test

# Run mock API client tests only
npm test -- --testPathPatterns=mockApiClient.test.ts --watchAll=false

# Run with coverage
npm test -- --coverage
```

### Type Check
```bash
npm run type-check
```

## Environment Variables

### Enable/Disable Mock Data
```bash
# Enable mock data (default in development)
REACT_APP_USE_MOCK_DATA=true npm run dev

# Disable mock data (use real API)
REACT_APP_USE_MOCK_DATA=false npm run dev
```

## Browser Console Commands

### Check Current Status
```javascript
localStorage.getItem('USE_MOCK_DATA');
```

### Enable Mock Data
```javascript
localStorage.setItem('USE_MOCK_DATA', 'true');
window.location.reload();
```

### Disable Mock Data
```javascript
localStorage.setItem('USE_MOCK_DATA', 'false');
window.location.reload();
```

## Troubleshooting

### Mock Data Not Loading
1. Check browser console for errors
2. Verify `NODE_ENV === 'development'`
3. Clear browser cache: `Ctrl+Shift+Delete`
4. Restart dev server: `npm run dev`

### Webpack Hot Update Error
If you see "Cannot set properties of undefined" error:
1. Stop dev server: `Ctrl+C`
2. Clear node_modules cache: `npm run clean` (if available)
3. Restart dev server: `npm run dev`

### Data Not Persisting
Mock data resets on page reload - this is by design. To persist changes:
1. Use real API instead
2. Or implement localStorage persistence

### Performance Issues
1. Reduce mock record count in `mockDataService.ts`
2. Reduce simulated delays in `mockApiClient.ts`
3. Check browser DevTools for bottlenecks

## File Structure

```
apps/transcript-and-summary/
├── src/
│   ├── config/
│   │   └── developmentMode.ts          # Development mode detection
│   ├── services/
│   │   ├── mockApiClient.ts            # Mock API client
│   │   ├── callRecordsService.ts       # Unified service
│   │   └── mockDataService.ts          # Mock data generation
│   ├── components/
│   │   ├── DevelopmentToolbar.tsx      # Development toolbar UI
│   │   ├── DevelopmentToolbar.css      # Toolbar styles
│   │   ├── CallLogPage.tsx             # Call list
│   │   └── CallDetailPage.tsx          # Call detail
│   └── App.tsx                         # Main app
├── MOCK_DATA_GUIDE.md                  # Detailed user guide
├── MOCK_DATA_IMPLEMENTATION.md         # Implementation details
└── GETTING_STARTED_MOCK_DATA.md        # This file
```

## Next Steps

1. **Explore Mock Data**: Open the app and browse the 50 mock call records
2. **Test Features**: Test pagination, filtering, and sorting
3. **Toggle Modes**: Switch between mock and real data
4. **Run Tests**: Execute the test suite to verify everything works
5. **Read Documentation**: Check `MOCK_DATA_GUIDE.md` for detailed information

## Support

- **Quick Guide**: This file (GETTING_STARTED_MOCK_DATA.md)
- **Detailed Guide**: `MOCK_DATA_GUIDE.md`
- **Implementation Details**: `MOCK_DATA_IMPLEMENTATION.md`
- **Code Comments**: Inline documentation in all files
- **Tests**: Usage examples in test files

## Key Points

✅ Mock data is **automatically enabled** in development
✅ Mock data is **never included** in production builds
✅ Mock data **works transparently** with existing components
✅ Mock data **can be toggled** at runtime via development toolbar
✅ Mock data **includes realistic** call records for testing
✅ Mock data **supports all** filtering, sorting, and pagination

Enjoy rapid development with mock data! 🚀

# Troubleshooting Guide

## Common Issues and Solutions

### 1. "process is not defined" Error

**Error Message:**
```
ReferenceError: process is not defined
    at getDevelopmentModeConfig (webpack-internal:///./src/config/developmentMode.ts:34:24)
```

**Cause:** The `process` object is not available in the browser at runtime.

**Solution:** ✅ Already fixed in the codebase
- The code now safely checks if `process` is available before accessing it
- Uses try-catch blocks to handle missing process object
- Falls back to production mode if process is not available

**If you still see this error:**
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Stop dev server: `Ctrl+C`
3. Restart dev server: `npm run dev`
4. Hard refresh browser: `Ctrl+Shift+R`

---

### 2. "Cannot set properties of undefined" Error

**Error Message:**
```
TypeError: Cannot set properties of undefined (setting './src/services/mockApiClient.ts')
    at self.webpackHotUpdate_crm_transcript_and_summary
```

**Cause:** Webpack hot module replacement issue when files are changed during development.

**Solution:**
1. Stop dev server: `Ctrl+C`
2. Clear webpack cache: `npm run clean` (if available)
3. Restart dev server: `npm run dev`
4. Hard refresh browser: `Ctrl+Shift+R`

**Prevention:**
- Avoid making multiple file changes simultaneously
- Wait for dev server to finish recompiling before making more changes
- Use a stable version of Node.js

---

### 3. Mock Data Not Loading

**Symptoms:**
- Development toolbar not visible
- Mock data not appearing in call list
- Real API being used instead of mock data

**Troubleshooting Steps:**

1. **Check Development Mode:**
   ```javascript
   // In browser console
   localStorage.getItem('USE_MOCK_DATA');
   // Should return 'true' or null (null means use default)
   ```

2. **Check Environment:**
   ```javascript
   // In browser console
   console.log(process?.env?.NODE_ENV);
   // Should return 'development'
   ```

3. **Check localStorage:**
   ```javascript
   // Clear and reset
   localStorage.removeItem('USE_MOCK_DATA');
   window.location.reload();
   ```

4. **Check Browser Console:**
   - Look for any error messages
   - Check Network tab for API calls
   - Check Application tab for localStorage

5. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

---

### 4. Development Toolbar Not Visible

**Symptoms:**
- ⚙️ button not appearing in bottom-right corner
- Cannot toggle between mock and real data

**Troubleshooting:**

1. **Check if in Development Mode:**
   ```javascript
   // In browser console
   console.log(process?.env?.NODE_ENV);
   // Should be 'development'
   ```

2. **Check CSS Loading:**
   - Open DevTools: `F12`
   - Check Elements tab for `.dev-toolbar-toggle` element
   - Check Styles tab for CSS rules

3. **Check Component Rendering:**
   ```javascript
   // In browser console
   document.querySelector('.dev-toolbar-toggle');
   // Should return the button element
   ```

4. **Clear Cache:**
   ```bash
   # Stop dev server
   Ctrl+C
   
   # Clear cache
   npm run clean
   
   # Restart
   npm run dev
   ```

---

### 5. Mock Data Not Persisting

**Symptoms:**
- Changes to mock data disappear on page reload
- Mock records reset to original state

**Cause:** This is by design - mock data is generated fresh on each page load.

**Solution:**
- Use real API if you need data persistence
- Or implement localStorage persistence in `mockApiClient.ts`

**To Implement Persistence:**
```typescript
// In mockApiClient.ts
private saveMockData(): void {
  localStorage.setItem('MOCK_DATA', JSON.stringify(this.mockRecords));
}

private loadMockData(): void {
  const saved = localStorage.getItem('MOCK_DATA');
  if (saved) {
    this.mockRecords = JSON.parse(saved);
  }
}
```

---

### 6. Performance Issues

**Symptoms:**
- Slow response times with mock data
- UI freezing when loading records
- High CPU usage

**Solutions:**

1. **Reduce Mock Record Count:**
   ```typescript
   // In mockDataService.ts
   // Change from 50 to 25
   this.mockRecords = generateMockCallRecords(25);
   ```

2. **Reduce Simulated Delays:**
   ```typescript
   // In mockApiClient.ts
   // Change from 400ms to 100ms
   await simulateApiDelay(100);
   ```

3. **Check Browser DevTools:**
   - Open Performance tab
   - Record a session
   - Look for bottlenecks
   - Check for memory leaks

4. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

---

### 7. Tests Failing

**Symptoms:**
- Test suite fails to run
- Individual tests fail
- Type errors in tests

**Solutions:**

1. **Run Type Check:**
   ```bash
   npm run type-check
   ```

2. **Run Tests:**
   ```bash
   npm test
   ```

3. **Run Specific Test:**
   ```bash
   npm test -- --testPathPatterns=mockApiClient.test.ts --watchAll=false
   ```

4. **Clear Jest Cache:**
   ```bash
   npm test -- --clearCache
   ```

5. **Check Test Output:**
   - Look for specific error messages
   - Check test file for issues
   - Verify mock data is available

---

### 8. Switching Between Mock and Real API

**Issue:** Changes don't take effect immediately

**Solution:**
- Page reload is required to apply changes
- This is by design to ensure clean state
- Development toolbar automatically reloads page

**Manual Toggle:**
```javascript
// Enable mock data
localStorage.setItem('USE_MOCK_DATA', 'true');
window.location.reload();

// Disable mock data
localStorage.setItem('USE_MOCK_DATA', 'false');
window.location.reload();
```

---

### 9. Environment Variables Not Working

**Issue:** `REACT_APP_USE_MOCK_DATA` environment variable not being recognized

**Solution:**

1. **For npm run dev:**
   ```bash
   REACT_APP_USE_MOCK_DATA=true npm run dev
   ```

2. **For Windows PowerShell:**
   ```powershell
   $env:REACT_APP_USE_MOCK_DATA='true'; npm run dev
   ```

3. **Create .env file:**
   ```
   REACT_APP_USE_MOCK_DATA=true
   ```

4. **Restart Dev Server:**
   - Stop: `Ctrl+C`
   - Start: `npm run dev`

---

### 10. Type Errors

**Symptoms:**
- TypeScript compilation errors
- Type checking fails
- IDE shows red squiggles

**Solutions:**

1. **Run Type Check:**
   ```bash
   npm run type-check
   ```

2. **Check Error Messages:**
   - Look for specific line numbers
   - Check the error description
   - Review the code at that location

3. **Common Fixes:**
   - Add type annotations
   - Import missing types
   - Fix interface implementations
   - Update function signatures

4. **Restart IDE:**
   - Close and reopen IDE
   - Restart TypeScript server
   - Clear IDE cache

---

## Getting Help

### Resources
1. **Quick Start**: `GETTING_STARTED_MOCK_DATA.md`
2. **User Guide**: `MOCK_DATA_GUIDE.md`
3. **Implementation**: `MOCK_DATA_IMPLEMENTATION.md`
4. **Code Comments**: Inline documentation in all files

### Debug Steps
1. Check browser console for errors
2. Check Network tab for API calls
3. Check Application tab for localStorage
4. Check DevTools Elements for DOM structure
5. Check DevTools Performance for bottlenecks

### Common Commands
```bash
# Start development
npm run dev

# Run tests
npm test

# Type check
npm run type-check

# Clean cache
npm run clean

# Build
npm run build
```

---

## Still Having Issues?

1. **Check the documentation:**
   - `GETTING_STARTED_MOCK_DATA.md` - Quick start
   - `MOCK_DATA_GUIDE.md` - Detailed guide
   - `MOCK_DATA_IMPLEMENTATION.md` - Technical details

2. **Review the code:**
   - Check inline comments
   - Review test files for usage examples
   - Look at component implementations

3. **Try the basics:**
   - Clear cache: `Ctrl+Shift+Delete`
   - Restart dev server: `Ctrl+C` then `npm run dev`
   - Hard refresh: `Ctrl+Shift+R`
   - Restart IDE

4. **Check logs:**
   - Browser console: `F12`
   - Dev server output
   - Test output

---

## Prevention Tips

✅ **Do**
- Restart dev server after major changes
- Clear cache regularly
- Use hard refresh when needed
- Check browser console for errors
- Run type-check before committing

❌ **Don't**
- Make multiple file changes simultaneously
- Ignore error messages
- Assume cache is cleared
- Use old browser tabs
- Skip type checking

---

## Quick Reference

| Issue | Solution |
|-------|----------|
| process not defined | Already fixed, clear cache and restart |
| Mock data not loading | Check localStorage, restart dev server |
| Toolbar not visible | Check NODE_ENV, clear cache |
| Performance issues | Reduce record count, reduce delays |
| Tests failing | Run type-check, clear Jest cache |
| Environment variables | Restart dev server after setting |
| Type errors | Run type-check, fix errors |
| Hot update error | Restart dev server |

---

## Support

For additional help:
1. Review the documentation files
2. Check the code comments
3. Run the test suite
4. Check browser console
5. Restart dev server

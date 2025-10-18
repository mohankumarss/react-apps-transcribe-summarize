# Troubleshooting Guide

Comprehensive troubleshooting guide for common issues in the React microfrontend project.

## 🚨 Build Issues

### Webresource Build Problems

#### Multiple JavaScript Files Generated
**Problem**: Webresource build generates more than 3 files (app.js, app.css, index.html)

**Symptoms**:
```
dist/webresource/
├── app.js
├── app.css
├── index.html
├── 342.js          # ❌ Extra chunk
├── 567.js          # ❌ Extra chunk
└── 342.css         # ❌ Extra CSS chunk
```

**Solution**:
1. Check for dynamic imports in the application code
2. Ensure webresource-specific bootstrap is being used
3. Verify webpack module replacement plugin is configured:

```javascript
// webpack.config.js
new webpack.NormalModuleReplacementPlugin(
  /^\.\/bootstrap$/,
  './bootstrap.webresource'
)
```

4. Create webresource-specific bootstrap without dynamic imports:
```typescript
// bootstrap.webresource.tsx - NO dynamic imports
export { default as PartyList } from './components/PartyList';
export { default as PartyDetails } from './components/PartyDetails';
// Instead of: () => import('./components/PartyList')
```

#### Process is Not Defined Error
**Problem**: Runtime error "ReferenceError: process is not defined" in browser

**Symptoms**:
```
main.tsx:15  Failed to bootstrap app: ReferenceError: process is not defined
    at bootstrap.webresource.tsx:35:14
```

**Solution**:
1. Add process polyfill to webpack DefinePlugin:
```javascript
new webpack.DefinePlugin({
  'process.env.REACT_APP_API_BASE_URL': JSON.stringify('/api'),
  'process': `{
    env: {
      WEBPACK_DEPLOYMENT_MODE: "web_resource",
      NODE_ENV: "production",
      REACT_APP_API_BASE_URL: "/api"
    }
  }`,
})
```

2. Verify all environment variables are defined in webpack config
3. Check for dynamic process.env access in code

#### TypeScript Compilation Errors
**Problem**: TypeScript errors preventing build

**Symptoms**:
```
ERROR in ./src/components/Component.tsx
TS2322: Type 'string | undefined' is not assignable to type 'string'
```

**Solution**:
1. Fix type errors in source code:
```typescript
// ❌ Problematic
const value: string = process.env.REACT_APP_VALUE;

// ✅ Fixed
const value: string = process.env.REACT_APP_VALUE || 'default';
```

2. Update TypeScript configuration if needed
3. Use type assertions carefully:
```typescript
const value = process.env.REACT_APP_VALUE as string;
```

### Module Federation Issues

#### Remote Loading Failures
**Problem**: Remote modules fail to load in shell application

**Symptoms**:
```
ChunkLoadError: Loading chunk remoteEntry failed
```

**Solution**:
1. Verify remote URLs are accessible:
```javascript
// Check network tab for 404 errors on remoteEntry.js
```

2. Ensure CORS headers are properly configured:
```nginx
# nginx.conf
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
```

3. Check Module Federation configuration:
```javascript
// Verify remote configuration matches exposed modules
remotes: {
  transcriptAndSummary: 'transcriptAndSummary@http://localhost:5176/remoteEntry.js',
}
```

#### Shared Dependency Version Conflicts
**Problem**: Different versions of shared dependencies causing runtime errors

**Symptoms**:
```
Warning: Invalid hook call. Hooks can only be called inside the body of a function component
```

**Solution**:
1. Ensure singleton configuration for React:
```javascript
shared: {
  react: {
    singleton: true,
    requiredVersion: deps.react,
    strictVersion: false,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: deps['react-dom'],
    strictVersion: false,
  },
}
```

2. Verify package.json versions are compatible
3. Use `strictVersion: false` for development

## 🎨 Theme and Styling Issues

### Theme Not Applied
**Problem**: Application doesn't show correct theme styling

**Symptoms**:
- Default browser styling instead of custom theme
- Missing brand colors and fonts

**Solution**:
1. Check data-theme attribute on document:
```javascript
// Should be set automatically
console.log(document.documentElement.getAttribute('data-theme'));
// Expected: 'crm' for webresource, 'zb-champion' for others
```

2. Verify CSS custom properties are loaded:
```css
/* Check in browser dev tools */
:root {
  --primary-color: #0078d4; /* Should be defined */
}
```

3. Ensure theme CSS is imported:
```typescript
// In bootstrap files
import '@shared/styles/webresource.css'; // For webresource
import '@shared/styles/themes.css';      // For others
```

### CSS Not Loading in CRM
**Problem**: Styles not applied when deployed to CRM

**Symptoms**:
- Unstyled components in CRM environment
- CSS file not found errors

**Solution**:
1. Verify CSS file is included in webresource upload
2. Check relative paths in CSS:
```css
/* ❌ Absolute paths won't work in CRM */
background-image: url('/assets/image.png');

/* ✅ Relative paths work */
background-image: url('./assets/image.png');
```

3. Ensure CSS is extracted properly:
```javascript
// webpack.config.js
new MiniCssExtractPlugin({
  filename: 'app.css', // Single CSS file for webresource
})
```

## 🔧 Runtime Issues

### API Connection Problems
**Problem**: API calls failing in different environments

**Symptoms**:
```
Failed to fetch: TypeError: Failed to fetch
CORS error: Access to fetch blocked by CORS policy
```

**Solution**:
1. Check API base URL configuration:
```typescript
// Verify correct API URL for environment
const apiUrl = process.env.REACT_APP_API_BASE_URL || '/api';
console.log('API URL:', apiUrl);
```

2. Configure CORS on API server:
```javascript
// Express.js example
app.use(cors({
  origin: ['https://yourcrm.dynamics.com', 'http://localhost:3000'],
  credentials: true,
}));
```

3. For CRM environment, use Xrm.WebApi when available:
```typescript
if (window.Xrm?.WebApi) {
  // Use CRM Web API
  const result = await window.Xrm.WebApi.retrieveMultipleRecords('contact');
} else {
  // Use external API
  const result = await fetch('/api/contacts');
}
```

### Authentication Issues
**Problem**: Authentication failures in different deployment modes

**Symptoms**:
- 401 Unauthorized errors
- User context not available

**Solution**:
1. For CRM deployment, verify Xrm context:
```typescript
if (typeof window.Xrm === 'undefined') {
  console.error('CRM context not available');
  // Fallback or error handling
}
```

2. For standalone/microfrontend, implement proper auth:
```typescript
// Check authentication state
const isAuthenticated = await authService.isAuthenticated();
if (!isAuthenticated) {
  await authService.login();
}
```

### Memory Leaks
**Problem**: Application consuming excessive memory over time

**Symptoms**:
- Browser tab becoming unresponsive
- Increasing memory usage in dev tools

**Solution**:
1. Clean up event listeners:
```typescript
useEffect(() => {
  const handleResize = () => { /* handler */ };
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

2. Cancel pending requests:
```typescript
useEffect(() => {
  const abortController = new AbortController();
  
  fetch('/api/data', { signal: abortController.signal })
    .then(response => response.json())
    .then(data => setData(data));
  
  return () => {
    abortController.abort();
  };
}, []);
```

## 🔍 Debugging Tools

### Webpack Bundle Analysis
```bash
# Analyze bundle composition
npm run build -- --analyze

# Check bundle sizes
npm run build && ls -lah dist/
```

### Module Federation Debugging
```javascript
// Check loaded remotes
console.log(__webpack_require__.federation);

// Verify shared modules
console.log(__webpack_require__.cache);
```

### Performance Profiling
```javascript
// React DevTools Profiler
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component:', id, 'Phase:', phase, 'Duration:', actualDuration);
}

<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

## 📋 Diagnostic Checklist

### Before Reporting Issues
- [ ] Clear browser cache and hard refresh
- [ ] Check browser console for errors
- [ ] Verify network requests in dev tools
- [ ] Test in incognito/private browsing mode
- [ ] Check if issue occurs in all deployment modes
- [ ] Verify environment variables are set correctly
- [ ] Ensure all dependencies are installed (`npm ci`)
- [ ] Check if issue occurs with clean build (`npm run clean && npm run build`)

### Information to Include in Bug Reports
1. **Environment**: Browser, OS, Node.js version
2. **Deployment Mode**: webresource, microfrontend, or standalone
3. **Build Output**: Console output from build command
4. **Error Messages**: Complete error stack traces
5. **Steps to Reproduce**: Detailed reproduction steps
6. **Expected vs Actual**: What should happen vs what actually happens

---

**Quick Fixes:**
- **Build fails**: `npm run clean && npm ci && npm run build`
- **Types errors**: `npm run type-check` to identify issues
- **Runtime errors**: Check browser console and network tab
- **Performance issues**: Use React DevTools Profiler
- **Module Federation**: Verify remote URLs and shared dependencies

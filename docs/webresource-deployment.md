# Webresource Deployment Guide

## Overview

The webresource build system generates exactly **three single files** optimized for CRM deployment:
- `app.js` - Main JavaScript bundle (~400KB)
- `app.css` - Optimized CSS with CRM theme only (~469KB)  
- `index.html` - HTML template (~730 bytes)

Total bundle size: **~869KB** (significantly reduced from full theme builds)

## Key Features

### 🎯 Single-File Architecture
- **No code splitting** - All JavaScript bundled into single file
- **No Module Federation** - Disabled for webresource builds
- **Optimized CSS** - Only CRM theme styles included
- **Minified output** - Production-ready optimization

### 🎨 Theme Optimization
- **CRM theme only** - Excludes ZB Champion MFE theme (~350KB savings)
- **Theme switching disabled** - Locked to CRM mode for deployment
- **CSS custom properties** - Maintains theme system compatibility

### ⚡ Build Optimizations
- **Tree shaking** - Removes unused code
- **Minification** - JavaScript and CSS compression
- **Asset optimization** - Images and fonts optimized
- **Source maps** - Available for debugging

## Build Commands

### Individual App Builds
```bash
# Transcript and Summary app
npm run build:transcript-and-summary:webresource

# IF Party Master app  
npm run build:if-party-master:webresource
```

### All Apps Build
```bash
# Build all apps for webresource deployment
npm run build:all:webresource
```

## Build Configuration

### Environment Variables
The webresource build uses these environment variables:
```bash
NODE_ENV=production                    # Enables production optimizations
WEBPACK_DEPLOYMENT_MODE=web_resource   # Configures webresource mode
```

### Webpack Configuration
Key webresource-specific settings:
- **Module Federation**: Disabled
- **Split chunks**: Disabled  
- **Runtime chunk**: Disabled
- **CSS extraction**: Single file output
- **Theme switching**: Disabled
- **Public path**: Relative (`./`)

## File Structure

### Generated Files
```
apps/transcript-and-summary/dist/
├── app.js              # Main JavaScript bundle (400KB)
├── app.css             # CRM-optimized CSS (469KB)
├── index.html          # HTML template (730 bytes)
├── assets/
│   └── images/         # Optimized image assets
├── *.js.map           # Source maps (development)
└── *.css.map          # CSS source maps (development)
```

### Deployment Files
For CRM deployment, you only need these **3 files**:
1. `app.js`
2. `app.css` 
3. `index.html`

## CRM Integration

### Theme Configuration
- **Theme mode**: Automatically set to `crm`
- **Theme switching**: Disabled in webresource builds
- **CSS variables**: CRM theme values applied
- **Brand assets**: CRM-specific logos and colors

### API Configuration
- **Authentication**: Uses Dynamics 365 context
- **Data access**: Xrm.WebApi integration
- **Navigation**: CRM navigation integration

## Troubleshooting

### Common Issues

#### Build Generates Multiple JS Files
**Problem**: Extra chunk files (e.g., `567.js`) generated
**Solution**: This is expected due to dynamic imports. The main files (`app.js`, `app.css`, `index.html`) are sufficient for deployment.

#### Large Bundle Size
**Problem**: CSS file is large (~469KB)
**Solution**: This is optimized - includes only CRM theme (was ~820KB with all themes)

#### Theme Not Applied
**Problem**: CRM theme not showing correctly
**Solution**: Ensure `data-theme="crm"` is set on document root

### Build Validation
```bash
# Check build output
cd apps/transcript-and-summary/dist
ls -la

# Verify file sizes
du -h app.*

# Test HTML file
cat index.html
```

## Performance Considerations

### Bundle Analysis
- **JavaScript**: ~400KB (minified + gzipped ~120KB)
- **CSS**: ~469KB (minified + gzipped ~60KB)
- **Total**: ~869KB (minified + gzipped ~180KB)

### Loading Performance
- **Single request** for each file type
- **No additional chunks** to load
- **Optimized for CRM environment**
- **Fast initial load** in Dynamics 365

## Migration Notes

### From Vite to Webpack
- Build system migrated to pure Webpack 5 Module Federation
- Single-file output maintained for webresource compatibility
- Theme optimization improved bundle size

### Breaking Changes
- Environment variable: `VITE_DEPLOYMENT_MODE` → `WEBPACK_DEPLOYMENT_MODE`
- Build tool: Vite → Webpack
- Module system: ESM hybrid → Pure Module Federation

## Next Steps

1. **Deploy to CRM**: Upload the 3 generated files as webresources
2. **Test theme**: Verify CRM theme is applied correctly
3. **Monitor performance**: Check loading times in CRM environment
4. **Update documentation**: Keep deployment guides current

For more information, see:
- [Main README](../README.md)
- [Theme System Guide](./theme/README.md)
- [Deployment Guide](./deployment/README.md)

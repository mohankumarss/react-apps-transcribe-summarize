# Architecture Overview

Comprehensive guide to the React microfrontend architecture built with Webpack 5 Module Federation.

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    CRM/Dynamics 365                        │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   Webresource   │  │   Webresource   │                 │
│  │ transcript-and- │  │  if-party-      │                 │
│  │    summary      │  │    master       │                 │
│  │   (3 files)     │  │   (3 files)     │                 │
│  └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                Module Federation Shell                     │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │     Remote      │  │     Remote      │                 │
│  │ transcript-and- │  │  if-party-      │                 │
│  │    summary      │  │    master       │                 │
│  │ (remoteEntry.js)│  │ (remoteEntry.js)│                 │
│  └─────────────────┘  └─────────────────┘                 │
│              │                  │                         │
│              └──────────────────┼─────────────────────────│
│                                 │                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Shared Library                         │   │
│  │        (Components, Services, Utils)                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 Standalone SPAs                             │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   Independent   │  │   Independent   │                 │
│  │     SPA         │  │     SPA         │                 │
│  │ (Full Bundle)   │  │ (Full Bundle)   │                 │
│  └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Project Structure

### Monorepo Organization
```
react-apps-webpack/
├── apps/                          # Microfrontend applications
│   ├── transcript-and-summary/    # Call transcript management
│   │   ├── src/
│   │   │   ├── components/        # App-specific components
│   │   │   ├── bootstrap.tsx      # Universal bootstrap
│   │   │   ├── bootstrap.webresource.tsx  # Webresource-specific
│   │   │   ├── main.tsx          # Entry point
│   │   │   └── App.tsx           # Root component
│   │   ├── webpack.config.js     # App-specific webpack config
│   │   └── package.json          # App dependencies
│   │
│   └── if-party-master/          # Party management interface
│       ├── src/
│       ├── webpack.config.js
│       └── package.json
│
├── shared/                       # Shared component library
│   ├── components/              # Reusable UI components
│   ├── services/               # API clients and business logic
│   ├── utils/                  # Utility functions
│   ├── config/                 # Configuration and constants
│   ├── styles/                 # Theme system and CSS
│   └── assets/                 # Images, fonts, icons
│
├── shell/                      # Module Federation shell (optional)
│   ├── src/
│   ├── webpack.config.js
│   └── package.json
│
├── docs/                       # Documentation
├── package.json               # Root package.json with workspaces
└── README.md                  # Main documentation
```

## 🔧 Webpack 5 Module Federation

### Federation Configuration

#### Remote Application (transcript-and-summary)
```javascript
new ModuleFederationPlugin({
  name: 'transcriptAndSummary',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/bootstrap',
  },
  shared: {
    react: {
      singleton: true,
      requiredVersion: deps.react,
    },
    'react-dom': {
      singleton: true,
      requiredVersion: deps['react-dom'],
    },
  },
})
```

#### Shell Application
```javascript
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    transcriptAndSummary: 'transcriptAndSummary@http://localhost:5176/remoteEntry.js',
    ifPartyMaster: 'ifPartyMaster@http://localhost:5174/remoteEntry.js',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
})
```

### Dynamic Remote Loading
```typescript
// Dynamic import of remote modules
const TranscriptApp = React.lazy(() => import('transcriptAndSummary/App'));
const PartyApp = React.lazy(() => import('ifPartyMaster/App'));

// Error boundary for remote loading
<ErrorBoundary fallback={<RemoteErrorFallback />}>
  <Suspense fallback={<RemoteLoadingSpinner />}>
    <TranscriptApp />
  </Suspense>
</ErrorBoundary>
```

## 🎨 Theme System Architecture

### CSS Custom Properties Strategy
```css
/* Base theme variables */
:root {
  --primary-color: #0078d4;
  --secondary-color: #106ebe;
  --background-color: #ffffff;
  --text-color: #323130;
}

/* CRM theme overrides */
[data-theme="crm"] {
  --primary-color: #0078d4;
  --secondary-color: #106ebe;
  --background-color: #f8f9fa;
}

/* ZB Champion theme overrides */
[data-theme="zb-champion"] {
  --primary-color: #663399;
  --secondary-color: #8a4baf;
  --background-color: #ffffff;
}
```

### Theme Detection and Application
```typescript
// Automatic theme detection
export class DeploymentContextDetector {
  detectDeploymentMode(): DeploymentMode {
    // CRM environment detection
    if (typeof window !== 'undefined' && window.Xrm) {
      return DeploymentMode.WEB_RESOURCE;
    }
    
    // Module Federation detection
    if (typeof __webpack_require__ !== 'undefined' && 
        __webpack_require__.federation) {
      return DeploymentMode.MICROFRONTEND;
    }
    
    return DeploymentMode.STANDALONE;
  }
}
```

## 🚀 Deployment Modes

### 1. Webresource Mode (CRM Integration)

#### Purpose
- Deploy to Dynamics 365 CRM as webresources
- Integrate with CRM forms, dashboards, and workflows
- Leverage CRM authentication and data context

#### Technical Characteristics
```javascript
// Webpack configuration for webresource
{
  mode: 'production',
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist/webresource'),
    filename: 'app.js',  // Single JS file
    publicPath: './',
  },
  optimization: {
    splitChunks: false,  // No code splitting
    runtimeChunk: false,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'app.css',  // Single CSS file
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',  // Single HTML file
    }),
  ],
}
```

#### Output Structure
```
dist/webresource/
├── app.js          # Single JavaScript bundle (2.18 MiB)
├── app.css         # Optimized CSS (469 KiB, CRM theme only)
└── index.html      # HTML template (730 bytes)
```

### 2. Microfrontend Mode (Module Federation)

#### Purpose
- Integrate with shell application via Module Federation
- Enable runtime composition of multiple applications
- Share dependencies and reduce overall bundle size

#### Technical Characteristics
```javascript
// Module Federation configuration
{
  plugins: [
    new ModuleFederationPlugin({
      name: 'transcriptAndSummary',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/bootstrap',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
}
```

#### Output Structure
```
dist/
├── remoteEntry.js                    # Module Federation entry
├── mf-manifest.json                  # Federation manifest
├── __federation_expose_App.*.js      # Exposed components
├── *.js                             # Application chunks
└── *.css                            # Stylesheets
```

### 3. Standalone Mode (Independent SPA)

#### Purpose
- Deploy as independent single-page applications
- Full feature set with all dependencies bundled
- Traditional SPA deployment to CDN or web server

#### Technical Characteristics
```javascript
// Standard webpack SPA configuration
{
  mode: 'production',
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
}
```

## 🔄 Build System Flow

### Universal Bootstrap Pattern
```typescript
// Universal bootstrap that adapts to deployment context
export const universalBootstrap = async (options: BootstrapOptions = {}) => {
  // Detect deployment context
  const detector = DeploymentContextDetector.getInstance();
  const context = detector.detectDeploymentContext();
  
  // Route to appropriate bootstrap method
  switch (context.mode) {
    case DeploymentMode.MICROFRONTEND:
      return await bootstrapMicrofrontend(options);
    case DeploymentMode.WEB_RESOURCE:
      return await bootstrapStandalone(options);
    case DeploymentMode.STANDALONE:
    default:
      return await bootstrapStandalone(options);
  }
};
```

### Build-Time Optimization
```javascript
// Webpack DefinePlugin for build-time constants
new webpack.DefinePlugin({
  'process.env.WEBPACK_DEPLOYMENT_MODE': JSON.stringify(deploymentMode),
  '__WEBRESOURCE_BUILD__': JSON.stringify(isWebResource),
  '__MICROFRONTEND_BUILD__': JSON.stringify(isMicrofrontend),
  '__STANDALONE_BUILD__': JSON.stringify(isStandalone),
})
```

## 📊 Performance Characteristics

### Bundle Size Comparison
| Mode | JavaScript | CSS | Total | Files |
|------|------------|-----|-------|-------|
| Webresource | 2.18 MiB | 469 KiB | 2.64 MiB | 3 |
| Microfrontend | ~400 KiB | ~100 KiB | ~500 KiB | Multiple |
| Standalone | ~800 KiB | ~500 KiB | ~1.3 MiB | Multiple |

### Optimization Strategies
- **Tree Shaking**: Remove unused code across all modes
- **Code Splitting**: Enabled for microfrontend and standalone modes
- **CSS Optimization**: Theme-specific bundling for webresource
- **Asset Optimization**: Image and font optimization
- **Minification**: JavaScript and CSS compression

## 🔐 Security Architecture

### Authentication Integration
```typescript
// CRM authentication integration
export class CrmAuthService {
  async getCurrentUser(): Promise<User> {
    if (window.Xrm?.WebApi) {
      return await window.Xrm.WebApi.retrieveRecord('systemuser', 'current');
    }
    throw new Error('CRM context not available');
  }
}

// Module Federation authentication
export class FederationAuthService {
  async getSharedAuthToken(): Promise<string> {
    // Get token from shell application
    return await window.shellAuth.getToken();
  }
}
```

### Data Security
- **Input Validation**: All user inputs validated and sanitized
- **API Security**: Secure API communication with proper headers
- **Content Security Policy**: CSP headers for XSS protection
- **CORS Configuration**: Proper CORS setup for cross-origin requests

---

**Key Benefits:**
1. **Flexibility**: Three deployment modes for different use cases
2. **Performance**: Optimized bundles for each deployment target
3. **Maintainability**: Shared component library reduces duplication
4. **Scalability**: Module Federation enables independent development
5. **Security**: Proper authentication and data protection

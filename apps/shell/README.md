# CRM Shell Application

The shell application serves as the orchestrator for the CRM microfrontend architecture, providing a unified workspace that loads and manages multiple microfrontend applications. **Enhanced with universal build system** for automatic deployment context detection and optimized microfrontend orchestration.

## 🚀 Features

### Core Functionality
- **Universal Build System**: Automatic deployment context detection with optimized microfrontend loading
- **Microfrontend Orchestration**: Loads and manages multiple microfrontend applications using Module Federation
- **Dual Application Dashboard**: Live display of both Transcript & Summary and IF Party Master applications
- **Enhanced Error Handling**: Production-ready error handling with user-friendly messages and retry mechanisms
- **Responsive Design**: Mobile-first responsive design following MFE theme guidelines
- **Theme Management**: Deployment-aware theme switching (enabled for microfrontend/standalone, locked for web-resource)
- **Authentication Integration**: Shared authentication service integration

### Production Features
- **Universal Bootstrap**: Automatic deployment context detection and routing
- **Structured Logging**: Uses `@shared/utils/logger` for comprehensive logging
- **Health Monitoring**: Real-time status indicators for each microfrontend
- **Performance Tracking**: Load time metrics and operational status
- **Webpack-Based Architecture**: Pure webpack implementation with Module Federation
- **Smart Bundle Optimization**: Context-aware bundle loading and shared dependency management

## 🏗️ Architecture

### Webpack Build System Integration
The shell uses webpack with Module Federation for automatic deployment context detection:

```typescript
🔧 Universal Build Context for shell: {
  deploymentMode: 'microfrontend',     // Auto-detected
  enableFederation: true,              // Module Federation enabled
  optimizeForStandalone: false,        // MFE-optimized bundles
  enableSharedDependencies: true,      // Shared React, Router
  buildTarget: 'production'            // Build target
}
```

### Deployment Modes (Consolidated)
The shell supports **3 deployment modes** with automatic detection:

1. **Microfrontend Mode**: Shell orchestration with Module Federation enabled
2. **Standalone Mode**: Independent deployment (consolidates embedded-spa and standalone-mfe)
3. **Web-Resource Mode**: SharePoint/Dynamics 365 deployment with CRM theme locked

### Module Federation Setup
```typescript
// Microfrontend configuration
const MICROFRONTEND_CONFIGS = [
  {
    name: 'transcriptAndSummary',
    displayName: 'Transcript & Summary',
    url: 'http://localhost:5176/remoteEntry.js',
    module: './App',
    route: '/transcript'
  },
  {
    name: 'ifPartyMaster', 
    displayName: 'IF Party Master',
    url: 'http://localhost:5177/remoteEntry.js',
    module: './App',
    route: '/party-master'
  }
];
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Running microfrontend applications on correct ports (auto-detected by universal config)

### Universal Development Setup
```bash
# Install dependencies
npm install

# Start all applications with universal build system
npm run dev:all:microfrontend    # Shell + microfrontends with Module Federation
npm run dev:all:universal        # Shell + microfrontends in standalone mode

# Start individual applications
npm run dev                      # Shell only (universal config)
npm run dev:microfrontend        # Shell with explicit microfrontend mode
```

### Development URLs (Universal Config)
- Shell Application: http://localhost:5175
- Transcript App: http://localhost:5173 (corrected port)
- Party Master App: http://localhost:5174 (corrected port)

### Universal Bootstrap Integration
The shell uses universal bootstrap for automatic deployment context detection:

```typescript
// Automatic deployment context detection
export const universalBootstrap = async (options = {}) => {
  const detector = UniversalDeploymentDetector.getInstance();
  const context = detector.detectDeploymentContext();

  // Routes to appropriate bootstrap based on detected context
  switch (context.mode) {
    case DeploymentMode.MICROFRONTEND:
      return await bootstrapMicrofrontend(options);
    case DeploymentMode.STANDALONE:
    case DeploymentMode.WEB_RESOURCE:
    default:
      return await bootstrapStandalone(options);
  }
};
```

## 📦 Build & Deployment

### Universal Build Commands
```bash
# Universal build (auto-detects deployment mode)
npm run build

# Explicit deployment mode builds
npm run build:microfrontend      # Module Federation enabled
npm run build:standalone         # Standalone deployment
npm run build:webresource        # SharePoint/Dynamics 365

# Development builds
npm run build:legacy             # Fallback to original config

# Type checking
npm run type-check
```

### Universal Build Context Detection
The build system automatically detects and optimizes for deployment context:

```bash
# Example build output
🔧 Universal Build Context for shell: {
  deploymentMode: 'microfrontend',
  enableFederation: true,
  optimizeForStandalone: false,
  enableSharedDependencies: true,
  buildTarget: 'production'
}
```

### Environment Configuration
```bash
# Override deployment mode detection
WEBPACK_DEPLOYMENT_MODE=microfrontend

# Configure remote entry URLs for different environments
TRANSCRIPT_URL=https://transcript.example.com/transcriptAndSummary-remote-entry.js
PARTY_MASTER_URL=https://party-master.example.com/ifPartyMaster-remote-entry.js

# Enable/disable Module Federation
ENABLE_FEDERATION=true
```

## 🎨 Dashboard Features

### Live Microfrontend Display
The enhanced dashboard provides:
- **Split-screen layout** on desktop (≥1024px)
- **Stacked layout** on tablet (768px-1023px)  
- **Single column** with collapsible panels on mobile (<768px)
- **Individual loading states** for each microfrontend
- **Status indicators** showing operational health
- **Full-screen navigation** to dedicated microfrontend pages

### Status Monitoring
- Real-time load status (loading, loaded, error)
- Response time metrics
- Error tracking and reporting
- Health indicators with color-coded status

## 🔧 Component Architecture

### MicrofrontendContainer
The core component for loading and mounting microfrontends:
- **Race condition prevention** with proper ref callback patterns
- **DOM conflict resolution** through separated overlay architecture
- **Retry mechanisms** with exponential backoff
- **Production error handling** with user-friendly messages

### Shared Components
Uses `@shared/components` for consistency:
- ErrorBoundary with enhanced error reporting
- LoadingSpinner with theme integration
- Button components with variant support
- Grid components for data display

## 🚨 Error Handling

### Production-Ready Error Messages
- Network connection errors
- Application not found (404)
- Cross-origin request issues (CORS)
- Timeout handling
- Bootstrap/startup failures

### Recovery Options
- **Try Again**: Resets error state and retries loading
- **Reload Page**: Full page refresh for persistent issues
- **Fallback Components**: Graceful degradation when available

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# Type checking
npm run type-check

# Build verification
npm run build
```

### Test Coverage
- MicrofrontendContainer mounting/unmounting
- Dashboard responsive layout
- Error boundary behavior
- Module Federation loading scenarios

## 🔍 Troubleshooting

### Common Issues

**Microfrontend fails to load:**
- Check if microfrontend apps are running on correct ports
- Verify remote entry URLs in configuration
- Check browser console for CORS or network errors

**Dashboard shows loading indefinitely:**
- Ensure microfrontend bootstrap functions are properly exported
- Check Module Federation configuration
- Verify shared dependencies compatibility

**Theme not applying correctly:**
- Check deployment mode detection
- Verify theme CSS files are loaded
- Ensure theme context is properly initialized

### Debug Mode
Set `NODE_ENV=development` for additional debugging:
- Detailed error stack traces
- Component lifecycle logging
- Module Federation loading details

## 📚 Adding New Microfrontends

1. **Update Configuration**:
```typescript
// apps/shell/src/config/shellConfig.ts
export const MICROFRONTEND_CONFIGS = [
  // existing configs...
  {
    name: 'newApp',
    displayName: 'New Application',
    url: 'http://localhost:5178/remoteEntry.js',
    module: './App',
    route: '/new-app',
    icon: '🆕',
    description: 'Description of new app'
  }
];
```

2. **Add Navigation**:
```typescript
// Add to NAVIGATION_ITEMS
{
  id: 'new-app',
  label: 'New Application', 
  route: '/new-app',
  icon: '🆕',
  microfrontend: 'newApp'
}
```

3. **Update Dashboard** (optional):
Add to dashboard microfrontend display if needed.

## 🤝 Contributing

1. Follow established patterns for component structure
2. Use TypeScript interfaces from `src/types/`
3. Implement proper error handling
4. Add responsive design considerations
5. Update documentation for new features

## 📄 License

This project is part of the CRM microfrontend architecture.

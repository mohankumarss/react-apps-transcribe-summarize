# CRM React Apps Documentation

Complete documentation for the CRM React Apps monorepo built with Webpack 5 Module Federation.

## 📚 Documentation Index

### 🚀 Getting Started
- **[Main README](../README.md)** - Project overview and quick start
- **[Webresource Deployment](./webresource-deployment.md)** - Single-file CRM deployment guide

### 🏗️ Build System
- **[Webresource Builds](./webresource-deployment.md)** - CRM-optimized single-file builds
- **Module Federation** - Pure Webpack 5 Module Federation architecture
- **Theme Optimization** - CRM-specific CSS bundling

### 🎨 Theme System
- **CSS Custom Properties** - Runtime theme switching
- **CRM Theme** - Dynamics 365 integration
- **ZB Champion Theme** - Microfrontend theme system

### 🚀 Deployment Modes

#### 1. Webresource Mode (`web_resource`)
- **Purpose**: CRM/SharePoint deployment
- **Output**: 3 single files (JS, CSS, HTML)
- **Bundle Size**: ~869KB total
- **Theme**: CRM only (optimized)
- **Module Federation**: Disabled
- **Documentation**: [Webresource Deployment Guide](./webresource-deployment.md)

#### 2. Microfrontend Mode (`microfrontend`)
- **Purpose**: Module Federation orchestration
- **Output**: Remote entry + chunks
- **Bundle Size**: ~400KB per app
- **Theme**: All themes included
- **Module Federation**: Enabled
- **Shell**: Required for orchestration

#### 3. Standalone Mode (`standalone`)
- **Purpose**: Independent web application
- **Output**: Complete application bundle
- **Bundle Size**: ~1.2MB total
- **Theme**: All themes included
- **Module Federation**: Disabled
- **Dependencies**: All bundled

### 📦 Build Commands

#### Individual Apps
```bash
# Webresource builds (CRM deployment)
npm run build:transcript-and-summary:webresource
npm run build:if-party-master:webresource

# Microfrontend builds (Module Federation)
npm run build:transcript-and-summary:microfrontend
npm run build:if-party-master:microfrontend
npm run build:shell:microfrontend

# Standalone builds (Independent apps)
npm run build:transcript-and-summary:standalone
npm run build:if-party-master:standalone
npm run build:shell:standalone
```

#### Batch Builds
```bash
# All apps - webresource mode
npm run build:all:webresource

# All apps - microfrontend mode  
npm run build:all:microfrontend

# All apps - standalone mode (default)
npm run build:all
```

### 🔧 Development

#### Development Servers
```bash
# Individual apps (universal mode)
npm run dev:transcript-and-summary
npm run dev:if-party-master
npm run dev:shell

# All apps (standalone mode)
npm run dev:all

# All apps (microfrontend mode)
npm run dev:all:microfrontend
```

#### Testing
```bash
# Run all tests
npm test

# Type checking
npm run type-check
```

### 🎯 Key Features

#### Webpack 5 Module Federation
- **Pure Module Federation** - No hybrid ESM/UMD approaches
- **Shared Dependencies** - React, ReactDOM shared across remotes
- **TypeScript Support** - Full type safety in federation
- **Development Mode** - Hot reload with federation

#### Single-File Webresource Builds
- **3-File Output** - Exactly what CRM requires
- **Optimized CSS** - CRM theme only (~43% size reduction)
- **No Code Splitting** - Single JavaScript bundle
- **Production Ready** - Minified and optimized

#### Theme System
- **CSS Custom Properties** - Runtime switching capability
- **Deployment Optimization** - CRM builds exclude unnecessary themes
- **Brand Integration** - CRM and ZB Champion themes
- **Context Detection** - Automatic theme selection

### 🚨 Troubleshooting

#### Build Issues
- **Multiple JS files in webresource build**: Expected due to dynamic imports, main files sufficient
- **Large CSS bundle**: Optimized for deployment mode (CRM builds exclude MFE themes)
- **TypeScript errors**: Ensure all interfaces are properly exported

#### Runtime Issues
- **Theme not applied**: Check `data-theme` attribute on document root
- **Module Federation errors**: Verify shared dependency versions
- **CRM integration**: Ensure Xrm.WebApi is available

### 📈 Performance

#### Bundle Sizes by Mode
- **Webresource**: ~869KB (3 files, CRM-optimized)
- **Microfrontend**: ~400KB per app + shared deps
- **Standalone**: ~1.2MB (all dependencies included)

#### Optimization Features
- **Tree Shaking** - Removes unused code
- **Minification** - JavaScript and CSS compression
- **CSS Optimization** - Theme-specific bundling
- **Asset Optimization** - Images and fonts optimized

### 🔄 Migration Notes

#### From Vite to Webpack
- **Build System**: Migrated to pure Webpack 5 Module Federation
- **Environment Variables**: `VITE_DEPLOYMENT_MODE` → `WEBPACK_DEPLOYMENT_MODE`
- **Configuration**: Single webpack config with mode detection
- **Performance**: Improved webresource build optimization

### 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [Webresource Deployment Guide](./webresource-deployment.md)
3. Examine the build output and webpack configuration
4. Test with different deployment modes

---

## 📋 Complete Documentation Index

### 🚀 Getting Started
- **[Main README](../README.md)** - Project overview and 15-minute setup
- **[Production Readiness Report](./production-readiness-report.md)** - Comprehensive audit results

### 🏗️ Architecture & Development
- **[Architecture Overview](./architecture-overview.md)** - Complete system architecture
- **[Troubleshooting Guide](./troubleshooting.md)** - Common issues and solutions

### 🚀 Deployment & DevOps
- **[Webresource Deployment](./webresource-deployment.md)** - CRM deployment guide
- **[CI/CD Pipeline Setup](./cicd-pipeline-setup.md)** - DevOps integration guide

### 📊 Performance & Monitoring
- **[Bundle Analysis](./production-readiness-report.md#performance-optimization)** - Bundle size optimization
- **[Performance Metrics](./cicd-pipeline-setup.md#monitoring-and-logging)** - Monitoring setup

---

**Quick Links:**
- [Main README](../README.md) - Start here for 15-minute setup
- [Webresource Deployment](./webresource-deployment.md) - Deploy to CRM
- [Production Readiness](./production-readiness-report.md) - Audit results
- [Architecture Guide](./architecture-overview.md) - System design
- [CI/CD Setup](./cicd-pipeline-setup.md) - DevOps integration

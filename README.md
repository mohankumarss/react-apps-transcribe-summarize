# CRM React Apps Monorepo

A modern multi-app React monorepo built with Webpack 5 Module Federation, TypeScript, and shared packages. Features pure Webpack Module Federation architecture, runtime theme switching, deployment context detection, and optimized single-file webresource builds for CRM deployment.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev:all

# Or start individual applications
npm run dev:transcript-and-summary  # http://localhost:5176
npm run dev:if-party-master         # http://localhost:5174

# Build for CRM deployment (exactly 3 files each)
npm run build:all:webresource
```

**👉 New to the project?** Start with the [Quick Start Guide](./docs/quick-start.md)

## 🏗️ Architecture

This monorepo contains:

- **Modern React Apps** (`apps/`) - Independent React 18 applications with Webpack 5 Module Federation
- **Shared Packages** (`shared/`) - Reusable components, services, and utilities
- **PCF Components** (`pcf/`) - Dynamics 365 Power Platform Components (React 16)
- **Comprehensive Documentation** (`docs/`) - Organized guides and references

### 🔄 Key Features

- **🎨 Runtime Theme Switching** - Switch between Dynamics 365 and ZB Champion themes without page refresh
- **🔐 Authentication Abstraction** - Unified auth layer supporting D365 implicit auth and Azure AD MSAL
- **🌐 Deployment Context Detection** - Automatically adapts to web resource, embedded SPA, or standalone MFE modes
- **📊 Advanced Grid System** - Responsive, theme-aware data grids with selection and pagination
- **🎯 Centralized Color System** - Single source of truth for theme colors and styling

## 📁 Project Structure

```
crm-react-apps/
├── apps/                          # React Applications
│   ├── transcript-and-summary/    # Call transcript and summary app
│   └── if-party-master/          # IF Party Master app
├── shared/                        # Shared Library
│   ├── components/               # Reusable UI components (Grid, Button, etc.)
│   ├── services/                 # Authentication, API clients, theme management
│   ├── styles/                   # Centralized theme system and global styles
│   └── utils/                    # Pure utility functions
├── pcf/                          # Power Platform Components (Legacy)
│   ├── contact-timeline-control/ # Dynamics 365 PCF control
│   └── shared/                   # PCF-specific shared components
├── docs/                         # Comprehensive Documentation
│   ├── theme/                    # Theme system guides
│   ├── auth/                     # Authentication documentation
│   ├── development/              # Development guides
│   ├── deployment/               # Deployment instructions
│   ├── architecture/             # Architecture documentation
│   └── troubleshooting/          # Troubleshooting guides
└── config/                       # Configuration files
```

## 📚 Documentation

### 🎯 Quick Navigation

| I want to... | Go to |
|--------------|-------|
| **Get started immediately** | [Main README](./README.md) - Quick start section |
| **Deploy to CRM/SharePoint** | [Webresource Deployment Guide](./docs/webresource-deployment.md) |
| **Understand the build system** | [Documentation Index](./docs/README.md) |
| **Use build commands** | [Build Commands](./docs/README.md#-build-commands) |
| **Learn Module Federation** | [Documentation Index](./docs/README.md#webpack-5-module-federation) |
| **Optimize bundle size** | [Webresource Deployment](./docs/webresource-deployment.md#performance-considerations) |
| **Fix build issues** | [Troubleshooting](./docs/README.md#-troubleshooting) |
| **Browse all documentation** | [Complete Documentation](./docs/README.md) |

### 📖 Documentation Categories

#### **Getting Started**
- [Main README](./README.md) - Project overview and quick start
- [Complete Documentation](./docs/README.md) - Full documentation index

#### **Deployment**
- [Webresource Deployment](./docs/webresource-deployment.md) - CRM single-file builds
- [Module Federation](./docs/README.md#webpack-5-module-federation) - Microfrontend architecture
- [Build Commands](./docs/README.md#-build-commands) - All build options

#### **Core Systems**
- [Theme System](./docs/README.md#theme-system) - CSS custom properties and CRM integration
- [Build Optimization](./docs/webresource-deployment.md#build-optimizations) - Performance tuning

#### **Troubleshooting**
- [Build Issues](./docs/README.md#-troubleshooting) - Common problems and solutions
- [Performance](./docs/webresource-deployment.md#performance-considerations) - Bundle analysis

## ⚡ Quick Commands

```bash
# Development
npm run dev:transcript-and-summary   # Start development server
npm run dev:all                     # Start all applications
npm test                            # Run all tests
npm run type-check                  # TypeScript validation

# Production Builds (Separate Builds for Each Deployment Mode)
npm run build:transcript-and-summary:standalone     # Standalone web application (~1.2MB)
npm run build:transcript-and-summary:microfrontend  # Microfrontend with Module Federation (~400KB)
npm run build:transcript-and-summary:webresource    # CRM webresource deployment (3 files: ~869KB total)

# Alternative commands (same functionality)
npm run build:all                   # Build all apps in standalone mode
npm run build:all:webresource      # Build all apps in webresource mode

# Webresource builds generate exactly 3 files for CRM deployment:
# - app.js (main JavaScript bundle)
# - app.css (optimized CSS with CRM theme only)
# - index.html (HTML template)

# For detailed build system documentation, see docs/build/README.md
```

## 🏗️ Key Technologies

- **React 18** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Webpack 5 Module Federation** - Pure Module Federation architecture for microfrontends
- **Single-File Webresource Builds** - Optimized 3-file output (CSS, JS, HTML) for CRM deployment
- **CSS Custom Properties** - Runtime theme switching with CRM-optimized builds
- **Azure AD MSAL** - Authentication for standalone deployments
- **Dynamics 365 Integration** - Xrm.WebApi for web resource mode

## 🤝 Contributing

1. **Read the documentation** - Start with [Quick Start Guide](./docs/quick-start.md)
2. **Follow the guidelines** - See [Development Setup](./docs/development/setup.md)
3. **Write tests** - Follow [Testing Guide](./docs/development/testing.md)
4. **Use theme system** - Follow [CSS Guidelines](./docs/development/css-guidelines.md)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.





---

**Ready to get started?** Check out the [Quick Start Guide](./docs/quick-start.md) or explore the [complete documentation](./docs/README.md).

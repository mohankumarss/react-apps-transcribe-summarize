# CI/CD Pipeline Setup Guide

Complete guide for setting up CI/CD pipelines for the React microfrontend project with Webpack 5 Module Federation.

## 🏗️ Pipeline Architecture

### Build Matrix Strategy
The project supports three deployment modes that require different pipeline configurations:

| Mode | Purpose | Output | Pipeline Stage |
|------|---------|--------|----------------|
| **Webresource** | CRM/Dynamics 365 | 3 files (JS, CSS, HTML) | Production |
| **Microfrontend** | Module Federation | Remote entries + chunks | Staging/Production |
| **Standalone** | Independent SPA | Complete bundles | Development/Testing |

## 🔧 Environment Configuration

### Required Environment Variables

#### Build Configuration
```bash
# Deployment mode selection
WEBPACK_DEPLOYMENT_MODE=web_resource|microfrontend|standalone

# Node.js environment
NODE_ENV=production|development

# API configuration
REACT_APP_API_BASE_URL=/api
API_BASE_URL=http://localhost:3001/api

# Feature flags
ENABLE_LOGGING=true
ENABLE_OFFLINE=false
ENABLE_TELEMETRY=false
ENABLE_THEME_SWITCHING=false  # Auto-disabled for webresource
THEME_MODE=crm|mfe            # Auto-set based on deployment mode
```

#### Infrastructure Variables
```bash
# Container registry
CONTAINER_REGISTRY=your-registry.azurecr.io
IMAGE_TAG=${BUILD_NUMBER}

# Deployment targets
CRM_ENVIRONMENT=dev|staging|prod
SHELL_HOST_URL=https://shell.yourcompany.com
CDN_BASE_URL=https://cdn.yourcompany.com
```

## 🚀 Azure DevOps Pipeline

### Pipeline Template (`azure-pipelines.yml`)
```yaml
trigger:
  branches:
    include:
      - main
      - develop
      - feature/*

variables:
  - group: 'CRM-React-Apps-Variables'
  - name: 'buildConfiguration'
    value: 'production'

stages:
  - stage: 'Build'
    displayName: 'Build Applications'
    jobs:
      - job: 'BuildWebresource'
        displayName: 'Build Webresource (CRM)'
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - template: templates/build-webresource.yml
      
      - job: 'BuildMicrofrontend'
        displayName: 'Build Microfrontend (Module Federation)'
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - template: templates/build-microfrontend.yml
      
      - job: 'BuildStandalone'
        displayName: 'Build Standalone (SPA)'
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - template: templates/build-standalone.yml

  - stage: 'Test'
    displayName: 'Run Tests'
    dependsOn: 'Build'
    jobs:
      - job: 'UnitTests'
        displayName: 'Unit Tests'
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - template: templates/run-tests.yml

  - stage: 'Deploy'
    displayName: 'Deploy Applications'
    dependsOn: ['Build', 'Test']
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: 'DeployWebresource'
        displayName: 'Deploy to CRM'
        environment: 'CRM-Production'
        strategy:
          runOnce:
            deploy:
              steps:
                - template: templates/deploy-webresource.yml
      
      - deployment: 'DeployMicrofrontend'
        displayName: 'Deploy to CDN'
        environment: 'CDN-Production'
        strategy:
          runOnce:
            deploy:
              steps:
                - template: templates/deploy-microfrontend.yml
```

### Build Templates

#### Webresource Build (`templates/build-webresource.yml`)
```yaml
steps:
  - task: NodeTool@0
    displayName: 'Install Node.js'
    inputs:
      versionSpec: '18.x'

  - task: Cache@2
    displayName: 'Cache npm dependencies'
    inputs:
      key: 'npm | "$(Agent.OS)" | package-lock.json'
      restoreKeys: |
        npm | "$(Agent.OS)"
      path: '~/.npm'

  - script: |
      npm ci
    displayName: 'Install dependencies'

  - script: |
      npm run type-check
    displayName: 'TypeScript type checking'

  - script: |
      npm run build:all:webresource
    displayName: 'Build webresource bundles'
    env:
      NODE_ENV: production
      WEBPACK_DEPLOYMENT_MODE: web_resource
      REACT_APP_API_BASE_URL: $(REACT_APP_API_BASE_URL)

  - task: PublishBuildArtifacts@1
    displayName: 'Publish webresource artifacts'
    inputs:
      pathToPublish: 'apps/transcript-and-summary/dist/webresource'
      artifactName: 'transcript-and-summary-webresource'

  - task: PublishBuildArtifacts@1
    displayName: 'Publish webresource artifacts'
    inputs:
      pathToPublish: 'apps/if-party-master/dist/webresource'
      artifactName: 'if-party-master-webresource'
```

#### Microfrontend Build (`templates/build-microfrontend.yml`)
```yaml
steps:
  - task: NodeTool@0
    displayName: 'Install Node.js'
    inputs:
      versionSpec: '18.x'

  - script: |
      npm ci
    displayName: 'Install dependencies'

  - script: |
      npm run build:transcript-and-summary:microfrontend
      npm run build:if-party-master:microfrontend
      npm run build:shell:microfrontend
    displayName: 'Build microfrontend bundles'
    env:
      NODE_ENV: production
      WEBPACK_DEPLOYMENT_MODE: microfrontend

  - task: PublishBuildArtifacts@1
    displayName: 'Publish microfrontend artifacts'
    inputs:
      pathToPublish: 'apps/*/dist'
      artifactName: 'microfrontend-bundles'
```

## 🐳 Docker Configuration

### Multi-stage Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
ARG DEPLOYMENT_MODE=standalone
ENV WEBPACK_DEPLOYMENT_MODE=${DEPLOYMENT_MODE}

RUN npm run build:all

# Production stage
FROM nginx:alpine AS production

# Copy built applications
COPY --from=builder /app/apps/*/dist /usr/share/nginx/html/apps/
COPY --from=builder /app/shell/dist /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration (`nginx.conf`)
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;
        server_name localhost;

        # Shell application
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }

        # Microfrontend remotes
        location /apps/ {
            root /usr/share/nginx/html;
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## 🔐 Security Considerations

### CRM Webresource Security
- **Content Security Policy**: Configure CSP headers for CRM environment
- **CORS Configuration**: Ensure proper CORS for API calls
- **Authentication**: Integrate with Dynamics 365 authentication
- **Data Validation**: Validate all inputs and API responses

### Module Federation Security
- **Remote Validation**: Verify remote entry integrity
- **Shared Dependencies**: Ensure consistent versions across remotes
- **Runtime Security**: Implement proper error boundaries
- **Network Security**: Use HTTPS for all remote entries

## 📊 Monitoring and Logging

### Application Insights Integration
```typescript
// Application Insights configuration
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: process.env.REACT_APP_APPINSIGHTS_KEY,
    enableAutoRouteTracking: true,
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
  }
});

appInsights.loadAppInsights();
```

### Performance Monitoring
- **Bundle Size Tracking**: Monitor bundle sizes across deployments
- **Load Time Metrics**: Track application load times
- **Error Tracking**: Capture and analyze runtime errors
- **User Analytics**: Track user interactions and flows

## 🚨 Troubleshooting

### Common Pipeline Issues

#### Build Failures
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

#### Deployment Issues
```bash
# Verify environment variables
echo $WEBPACK_DEPLOYMENT_MODE
echo $NODE_ENV

# Check build outputs
ls -la apps/*/dist/

# Validate webpack configuration
npm run build -- --analyze
```

### Performance Optimization
- **Parallel Builds**: Use build matrix for parallel execution
- **Caching Strategy**: Implement aggressive caching for dependencies
- **Artifact Management**: Optimize artifact storage and retrieval
- **Resource Allocation**: Right-size build agents for workload

---

**Next Steps:**
1. Set up environment-specific variable groups
2. Configure deployment environments
3. Implement monitoring and alerting
4. Test pipeline with feature branches
5. Set up automated testing integration

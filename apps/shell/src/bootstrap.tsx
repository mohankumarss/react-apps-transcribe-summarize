import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { DeploymentContextDetector, DeploymentMode, getThemeConfig } from '@shared/config';
import { getAuthService, configureApiClient } from '@shared/services';
import { ThemeProvider } from '@shared/services/theme';
import '@shared/styles/index.css';
import './index.css';

// Get deployment mode from webpack environment variables
const getDeploymentMode = (): DeploymentMode => {
  // Check webpack environment variable
  const webpackMode = process.env.WEBPACK_DEPLOYMENT_MODE;
  
  if (webpackMode === 'microfrontend') {
    return DeploymentMode.MICROFRONTEND;
  } else if (webpackMode === 'web_resource') {
    return DeploymentMode.WEB_RESOURCE;
  }
  
  return DeploymentMode.STANDALONE;
};

// Configure API client with environment variables
configureApiClient({
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3001/api'
});

// Initialize deployment context for shell application
const detector = DeploymentContextDetector.getInstance();
const deploymentMode = getDeploymentMode();

// Force the deployment mode if specified
if (deploymentMode === DeploymentMode.MICROFRONTEND) {
  detector.forceDeploymentMode(DeploymentMode.MICROFRONTEND);
  console.log('Shell: Running in microfrontend mode');
} else if (deploymentMode === DeploymentMode.WEB_RESOURCE) {
  detector.forceDeploymentMode(DeploymentMode.WEB_RESOURCE);
  console.log('Shell: Running in web resource mode');
} else {
  console.log('Shell: Running in standalone mode');
}

// Initialize theme for microfrontend mode (use MFE theme)
const themeConfig = getThemeConfig();
if (deploymentMode === DeploymentMode.MICROFRONTEND && themeConfig.mode === 'mfe') {
  // Apply MFE theme CSS custom properties
  Object.entries(themeConfig.customProperties).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });

  // Set theme data attribute for CSS targeting
  document.documentElement.setAttribute('data-theme', 'mfe');
  document.documentElement.setAttribute('data-deployment-mode', 'microfrontend');
}

// Initialize authentication service
const initializeAuth = async () => {
  try {
    const authService = getAuthService();
    await authService.initialize();
    console.log('Shell: Authentication service initialized');
  } catch (error) {
    console.warn('Shell: Authentication initialization failed (expected in development):', error);
  }
};

// Initialize auth service
initializeAuth();

// Initialize the shell application
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider enableAutoDetection={true} enablePersistence={true}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

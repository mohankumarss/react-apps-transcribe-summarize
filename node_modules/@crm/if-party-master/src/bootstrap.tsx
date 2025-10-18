/**
 * Bootstrap logic for IF Party Master App
 * 
 * Handles initialization for both standalone and microfrontend modes
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import {
  DeploymentContextDetector,
  DeploymentMode
} from '@shared/config';
import { ThemeProvider } from '@shared/services/theme';
import { configureApiClient } from '@shared/services';

// Import appropriate CSS based on build-time deployment mode
if (typeof __WEBRESOURCE_BUILD__ !== 'undefined' && __WEBRESOURCE_BUILD__) {
  // Webresource builds: CRM theme only
  require('@shared/styles/webresource.css');
} else {
  // Development/Microfrontend/Standalone builds: All themes
  require('@shared/styles/index.css');
}

export interface BootstrapOptions {
  container?: HTMLElement | string;
  props?: Record<string, any>;
  mode?: DeploymentMode;
}

/**
 * Bootstrap function for standalone mode
 */
export const bootstrapStandalone = async (options: BootstrapOptions = {}) => {
  const { container = 'root', props = {} } = options;
  
  // Get container element
  const containerElement = typeof container === 'string' 
    ? document.getElementById(container)
    : container;
    
  if (!containerElement) {
    throw new Error(`Container element not found: ${container}`);
  }

  // Configure API client with environment variables
  configureApiClient({
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001/api'
  });

  // Initialize deployment context
  const detector = DeploymentContextDetector.getInstance();
  if (options.mode) {
    detector.forceDeploymentMode(options.mode);
  }

  // Create React root and render app
  const root = createRoot(containerElement);
  
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <App {...props} />
      </ThemeProvider>
    </React.StrictMode>
  );

  return {
    unmount: () => {
      root.unmount();
    },
    update: (newProps: Record<string, any>) => {
      root.render(
        <React.StrictMode>
          <ThemeProvider>
            <App {...props} {...newProps} />
          </ThemeProvider>
        </React.StrictMode>
      );
    }
  };
};

/**
 * Bootstrap function for microfrontend mode
 */
export const bootstrapMicrofrontend = async (options: BootstrapOptions = {}) => {
  const { container, props = {} } = options;
  
  if (!container) {
    throw new Error('Container element is required for microfrontend mode');
  }

  // Force microfrontend mode
  const detector = DeploymentContextDetector.getInstance();
  detector.forceDeploymentMode('microfrontend' as DeploymentMode);

  // Get container element
  const containerElement = typeof container === 'string' 
    ? document.getElementById(container)
    : container;
    
  if (!containerElement) {
    throw new Error(`Container element not found: ${container}`);
  }

  // Create React root and render app
  const root = createRoot(containerElement);
  
  root.render(
    <ThemeProvider>
      <App {...props} />
    </ThemeProvider>
  );

  return {
    unmount: () => {
      root.unmount();
    },
    update: (newProps: Record<string, any>) => {
      root.render(
        <ThemeProvider>
          <App {...props} {...newProps} />
        </ThemeProvider>
      );
    }
  };
};

/**
 * Auto-bootstrap based on deployment context
 */
export const bootstrap = async (options: BootstrapOptions = {}) => {
  const detector = DeploymentContextDetector.getInstance();
  const deploymentMode = options.mode || detector.detectDeploymentMode();

  switch (deploymentMode) {
    case 'microfrontend':
      return bootstrapMicrofrontend(options);

    case DeploymentMode.WEB_RESOURCE:
    case DeploymentMode.STANDALONE:
    default:
      return bootstrapStandalone(options);
  }
};

/**
 * Export individual components for microfrontend consumption
 */
export { default as App } from './App';
export { default as PartyList } from './components/PartyList';
export { default as PartyDetails } from './components/PartyDetails';
export { default as PartyForm } from './components/PartyForm';

/**
 * Universal bootstrap function that automatically detects deployment context
 */
export const universalBootstrap = async (options: BootstrapOptions = {}) => {
  try {
    // Import the universal detector (dynamic import to avoid compilation issues)
    const { UniversalDeploymentDetector } = await import('@shared/config/deploymentContext');

    // Detect deployment context
    const detector = UniversalDeploymentDetector.getInstance();
    const context = detector.detectDeploymentContext();

    console.log('🚀 Universal Bootstrap - IF Party Master:', {
      mode: context.mode,
      capabilities: context.capabilities,
      optimization: context.optimization.strategy
    });

    // Route to appropriate bootstrap method
    switch (context.mode) {
      case DeploymentMode.MICROFRONTEND:
        return await bootstrapMicrofrontend(options);
      case DeploymentMode.WEB_RESOURCE:
      case DeploymentMode.STANDALONE:
      default:
        return await bootstrapStandalone(options);
    }
  } catch (error) {
    console.error('❌ Universal bootstrap failed:', error);
    throw new Error(`Universal bootstrap failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Default export for Module Federation
 */
export default {
  bootstrap,
  bootstrapStandalone,
  bootstrapMicrofrontend,
  universalBootstrap, // Add universal bootstrap
  App,
  PartyList: () => import('./components/PartyList'),
  PartyDetails: () => import('./components/PartyDetails'),
  PartyForm: () => import('./components/PartyForm'),
};

/**
 * Bootstrap logic for Transcript and Summary App
 *
 * Enhanced with universal bootstrap system for automatic deployment mode detection
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

import './styles/app-theme.css';


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

  // Clear any existing content to prevent DOM conflicts
  containerElement.innerHTML = '';

  // Create React root and render app
  const root = createRoot(containerElement);
  root.render(<App {...props} />);

  return {
    unmount: () => {
      try {
        root.unmount();
      } catch (error) {
        // Fallback: clear container manually
        containerElement.innerHTML = '';
      }
    },
    update: (newProps: Record<string, any>) => {
      try {
        root.render(<App {...props} {...newProps} />);
      } catch (error) {
        console.warn('Error updating transcript app:', error);
      }
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
export { default as CallLogPage } from './components/CallLogPage';
export { default as CallDetailPage } from './components/CallDetailPage';
export { default as CallDetailNewTabPage } from './components/CallDetailNewTabPage';
export { ConversationTranscript } from './components/ConversationTranscript';
export { default as SummaryPanel } from './components/SummaryPanel';

/**
 * Universal bootstrap function that automatically detects deployment context
 */
export const universalBootstrap = async (options: BootstrapOptions = {}) => {
  try {
    // Use build-time constants to eliminate dead code paths
    // @ts-ignore - Build-time constant defined by webpack
    if (typeof __WEBRESOURCE_BUILD__ !== 'undefined' && __WEBRESOURCE_BUILD__) {
      // For webresource builds, use static detection to avoid dynamic imports
      const detector = DeploymentContextDetector.getInstance();
      detector.forceDeploymentMode('web_resource' as DeploymentMode);
      return bootstrapStandalone(options);
    } else {
      // For non-webresource builds, we can safely use dynamic imports
      // This code path will be completely eliminated in webresource builds
      const { UniversalDeploymentDetector } = await import('@shared/config/deploymentContext');

      // Use universal detector
      const detector = UniversalDeploymentDetector.getInstance();
      const context = detector.detectDeploymentContext();

      console.log('🚀 Universal Bootstrap - Transcript & Summary:', {
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
    }
  } catch (error) {
    console.error('❌ Universal bootstrap failed:', error);
    throw new Error(`Universal bootstrap failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Import components for webresource builds (avoid dynamic imports)
import CallLogPage from './components/CallLogPage';
import CallDetailPage from './components/CallDetailPage';
import CallDetailNewTabPage from './components/CallDetailNewTabPage';
import { ConversationTranscript } from './components/ConversationTranscript';
import SummaryPanel from './components/SummaryPanel';

/**
 * Dynamic export creation based on deployment mode
 * Uses build-time constants to eliminate dead code paths
 */

// Base export object with static components
const baseExport = {
  bootstrap,
  bootstrapStandalone,
  bootstrapMicrofrontend,
  universalBootstrap,
  App,
  CallLogPage,
  CallDetailPage,
  CallDetailNewTabPage,
  ConversationTranscript,
  SummaryPanel,
};

// Use build-time constants to conditionally create exports
// @ts-ignore - Build-time constant defined by webpack
const dynamicExport = (typeof __MICROFRONTEND_BUILD__ !== 'undefined' && __MICROFRONTEND_BUILD__) ? {
  ...baseExport,
  // Override with dynamic imports for microfrontend builds only
  CallLogPage: () => import('./components/CallLogPage'),
  CallDetailPage: () => import('./components/CallDetailPage'),
  ConversationTranscript: () => import('./components/ConversationTranscript'),
  SummaryPanel: () => import('./components/SummaryPanel'),
} : baseExport;

export default dynamicExport;

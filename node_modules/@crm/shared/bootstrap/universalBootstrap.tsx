/**
 * Universal Bootstrap System
 * 
 * Provides a unified bootstrap function that automatically detects deployment context
 * and routes to the appropriate bootstrap method (standalone, microfrontend, web-resource)
 */

import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { 
  UniversalDeploymentDetector, 
  DeploymentMode, 
  DeploymentContext,
  DeploymentContextDetector 
} from '../config/deploymentContext';
import { ThemeProvider } from '../services/theme';

export interface UniversalBootstrapOptions {
  container?: HTMLElement | string;
  props?: Record<string, any>;
  mode?: DeploymentMode;
  enableThemeSwitching?: boolean;
  onModeDetected?: (context: DeploymentContext) => void;
  onError?: (error: Error) => void;
}

export interface BootstrapResult {
  unmount: () => void;
  update: (newProps: Record<string, any>) => void;
  getContext: () => DeploymentContext;
  getMode: () => DeploymentMode;
}

/**
 * Universal bootstrap function that adapts to deployment context
 */
export const universalBootstrap = async (
  AppComponent: React.ComponentType<any>,
  options: UniversalBootstrapOptions = {}
): Promise<BootstrapResult> => {
  try {
    // Detect deployment context
    const detector = UniversalDeploymentDetector.getInstance();
    const context = detector.detectDeploymentContext();
    
    // Override mode if specified
    if (options.mode) {
      const legacyDetector = DeploymentContextDetector.getInstance();
      legacyDetector.forceDeploymentMode(options.mode);
      // Re-detect context with forced mode
      context.mode = options.mode;
    }

    // Notify about detected mode
    if (options.onModeDetected) {
      options.onModeDetected(context);
    }

    console.log('🚀 Universal Bootstrap Context:', {
      mode: context.mode,
      capabilities: context.capabilities,
      optimization: context.optimization.strategy,
      themeSwitching: context.theme.switchingEnabled
    });

    // Route to appropriate bootstrap method
    switch (context.mode) {
      case DeploymentMode.MICROFRONTEND:
        return await bootstrapMicrofrontend(AppComponent, options, context);
      case DeploymentMode.WEB_RESOURCE:
        return await bootstrapWebResource(AppComponent, options, context);
      case DeploymentMode.STANDALONE:
      default:
        return await bootstrapStandalone(AppComponent, options, context);
    }
  } catch (error) {
    const bootstrapError = new Error(`Universal bootstrap failed: ${error.message}`);
    if (options.onError) {
      options.onError(bootstrapError);
    }
    throw bootstrapError;
  }
};

/**
 * Bootstrap for standalone deployment mode
 */
async function bootstrapStandalone(
  AppComponent: React.ComponentType<any>,
  options: UniversalBootstrapOptions,
  context: DeploymentContext
): Promise<BootstrapResult> {
  const { container = 'root', props = {} } = options;
  
  // Get container element
  const containerElement = getContainerElement(container);
  
  // Create React root
  const root = createRoot(containerElement);
  
  // Render app with theme provider
  const renderApp = (appProps: Record<string, any>) => {
    root.render(
      <React.StrictMode>
        <ThemeProvider
          defaultTheme={context.theme.mode}
          enableAutoDetection={context.theme.runtimeDetection}
          enablePersistence={context.theme.switchingEnabled}
        >
          <AppComponent {...appProps} />
        </ThemeProvider>
      </React.StrictMode>
    );
  };

  renderApp(props);

  return {
    unmount: () => {
      root.unmount();
    },
    update: (newProps: Record<string, any>) => {
      renderApp({ ...props, ...newProps });
    },
    getContext: () => context,
    getMode: () => context.mode
  };
}

/**
 * Bootstrap for microfrontend deployment mode
 */
async function bootstrapMicrofrontend(
  AppComponent: React.ComponentType<any>,
  options: UniversalBootstrapOptions,
  context: DeploymentContext
): Promise<BootstrapResult> {
  const { container, props = {} } = options;

  if (!container) {
    throw new Error('Container element is required for microfrontend mode');
  }

  // Get container element
  const containerElement = getContainerElement(container);
  
  // Create React root
  const root = createRoot(containerElement);
  
  // Render app with microfrontend-optimized theme provider
  const renderApp = (appProps: Record<string, any>) => {
    root.render(
      <React.StrictMode>
        <ThemeProvider
          defaultTheme={context.theme.mode}
          enableAutoDetection={context.theme.runtimeDetection}
          enablePersistence={context.theme.switchingEnabled}
        >
          <AppComponent {...appProps} />
        </ThemeProvider>
      </React.StrictMode>
    );
  };

  renderApp(props);

  return {
    unmount: () => {
      root.unmount();
    },
    update: (newProps: Record<string, any>) => {
      renderApp({ ...props, ...newProps });
    },
    getContext: () => context,
    getMode: () => context.mode
  };
}

/**
 * Bootstrap for web resource deployment mode
 */
async function bootstrapWebResource(
  AppComponent: React.ComponentType<any>,
  options: UniversalBootstrapOptions,
  context: DeploymentContext
): Promise<BootstrapResult> {
  const { container = 'root', props = {} } = options;
  
  // Get container element
  const containerElement = getContainerElement(container);
  
  // Create React root
  const root = createRoot(containerElement);
  
  // Render app with CRM theme locked
  const renderApp = (appProps: Record<string, any>) => {
    root.render(
      <React.StrictMode>
        <ThemeProvider
          defaultTheme={context.theme.mode}
          enableAutoDetection={false} // Disabled for web resource
          enablePersistence={false} // Always disabled for web resource
        >
          <AppComponent {...appProps} />
        </ThemeProvider>
      </React.StrictMode>
    );
  };

  renderApp(props);

  return {
    unmount: () => {
      root.unmount();
    },
    update: (newProps: Record<string, any>) => {
      renderApp({ ...props, ...newProps });
    },
    getContext: () => context,
    getMode: () => context.mode
  };
}

/**
 * Helper function to get container element
 */
function getContainerElement(container: HTMLElement | string): HTMLElement {
  const containerElement = typeof container === 'string' 
    ? document.getElementById(container)
    : container;
    
  if (!containerElement) {
    throw new Error(`Container element not found: ${container}`);
  }

  return containerElement;
}

/**
 * Creates a universal bootstrap function for a specific app
 */
export function createUniversalBootstrap(AppComponent: React.ComponentType<any>) {
  return (options: UniversalBootstrapOptions = {}) => {
    return universalBootstrap(AppComponent, options);
  };
}

export default universalBootstrap;

/**
 * Minimal bootstrap for webresource builds - NO DYNAMIC IMPORTS
 * This file is used only for webresource builds to ensure single-file output
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import {
  DeploymentContextDetector,
  DeploymentMode
} from '@shared/config';
import { configureApiClient } from '@shared/services';
import '@shared/styles/webresource.css';

export interface BootstrapOptions {
  container?: HTMLElement | string;
  props?: Record<string, any>;
  mode?: DeploymentMode;
}

/**
 * Bootstrap function for webresource mode - simplified, no dynamic imports
 */
export const bootstrap = async (options: BootstrapOptions = {}) => {
  const { container = 'root', props = {} } = options;

  // Force webresource mode
  const detector = DeploymentContextDetector.getInstance();
  detector.forceDeploymentMode('web_resource' as DeploymentMode);

  // Configure API client
  configureApiClient({
    baseUrl: process.env.REACT_APP_API_BASE_URL || '/api'
  });

  // Get container element
  const containerElement = typeof container === 'string'
    ? document.getElementById(container)
    : container;

  if (!containerElement) {
    throw new Error(`Container element not found: ${container}`);
  }

  // Ensure CRM theme is applied
  document.documentElement.setAttribute('data-theme', 'crm');
  document.body.setAttribute('data-theme', 'crm');

  // Clear any existing content
  containerElement.innerHTML = '';

  // Create React root and render app
  const root = createRoot(containerElement);
  root.render(<App {...props} />);

  return {
    unmount: () => {
      try {
        root.unmount();
      } catch (error) {
        containerElement.innerHTML = '';
      }
    },
    update: (newProps: Record<string, any>) => {
      try {
        root.render(<App {...props} {...newProps} />);
      } catch (error) {
        console.error('Failed to update app:', error);
      }
    }
  };
};

// Alias for compatibility
export const bootstrapStandalone = bootstrap;
export const bootstrapMicrofrontend = bootstrap;
export const universalBootstrap = bootstrap;

// Export components statically (no dynamic imports)
export { default as App } from './App';
export { default as PartyList } from './components/PartyList';
export { default as PartyDetails } from './components/PartyDetails';
export { default as PartyForm } from './components/PartyForm';

// Default export for webresource builds - static only
export default {
  bootstrap,
  bootstrapStandalone,
  bootstrapMicrofrontend,
  universalBootstrap,
  App: require('./App').default,
  PartyList: require('./components/PartyList').default,
  PartyDetails: require('./components/PartyDetails').default,
  PartyForm: require('./components/PartyForm').default,
};

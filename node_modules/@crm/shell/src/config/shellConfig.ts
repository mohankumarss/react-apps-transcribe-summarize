/**
 * Shell Configuration
 * 
 * Defines the microfrontends and shell behavior
 */

import { ShellConfig, MicrofrontendConfig, NavigationItem } from '../types/microfrontend';

/**
 * Microfrontend configurations
 */
export const MICROFRONTEND_CONFIGS: MicrofrontendConfig[] = [
  {
    name: 'transcriptAndSummary',
    displayName: 'Transcript & Summary',
    description: 'Call transcript analysis and summary generation',
    url: 'http://localhost:5176/remoteEntry.js',
    scope: 'transcriptAndSummary',
    module: 'App',
    route: '/transcript',
    icon: '📞',
  },
  {
    name: 'ifPartyMaster',
    displayName: 'IF Party Master',
    description: 'Party management and data administration',
    url: 'http://localhost:5174/remoteEntry.js',
    scope: 'ifPartyMaster',
    module: './App',
    route: '/party-master',
    icon: '👥',
  },
];

/**
 * Navigation configuration
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'home',
    label: 'Dashboard',
    route: '/',
    icon: '🏠',
  },
  {
    id: 'transcript',
    label: 'Transcript & Summary',
    route: '/transcript',
    icon: '📞',
    microfrontend: 'transcriptAndSummary',
  },
  {
    id: 'party-master',
    label: 'IF Party Master',
    route: '/party-master',
    icon: '👥',
    microfrontend: 'ifPartyMaster',
  },
  {
    id: 'settings',
    label: 'Settings',
    route: '/settings',
    icon: '⚙️',
  },
];

/**
 * Shell configuration
 */
export const SHELL_CONFIG: ShellConfig = {
  microfrontends: MICROFRONTEND_CONFIGS,
  theme: {
    defaultTheme: 'mfe',
    allowThemeSwitching: true,
  },
  navigation: {
    showSidebar: true,
    showHeader: true,
    defaultRoute: '/',
  },
  errorHandling: {
    showErrorBoundary: true,
  },
};

/**
 * Get microfrontend config by name
 */
export const getMicrofrontendConfig = (name: string): MicrofrontendConfig | undefined => {
  return MICROFRONTEND_CONFIGS.find(config => config.name === name);
};

/**
 * Get microfrontend config by route
 */
export const getMicrofrontendByRoute = (route: string): MicrofrontendConfig | undefined => {
  return MICROFRONTEND_CONFIGS.find(config => config.route === route);
};

/**
 * Get navigation item by route
 */
export const getNavigationItemByRoute = (route: string): NavigationItem | undefined => {
  return NAVIGATION_ITEMS.find(item => item.route === route);
};

/**
 * Environment-specific configuration overrides
 */
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const baseUrl = isDevelopment ? 'http://localhost' : '';

  return {
    microfrontends: MICROFRONTEND_CONFIGS.map(config => ({
      ...config,
      url: config.url.replace('http://localhost', baseUrl),
    })),
  };
};

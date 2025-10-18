/**
 * Microfrontend type definitions for the shell application
 */

export type MicrofrontendFramework = 'webpack' | 'auto';

export interface MicrofrontendConfig {
  name: string;
  url: string;
  scope: string;
  module: string;
  displayName: string;
  description?: string;
  icon?: string;
  route: string;
  framework?: MicrofrontendFramework; // Framework type for cross-compatibility
  remoteEntryUrl?: string; // Separate remote entry URL for Webpack MFs
  fallbackComponent?: React.ComponentType;
  errorBoundary?: React.ComponentType<{ error: Error; children: React.ReactNode }>;
}

export interface MicrofrontendBootstrapResult {
  unmount: () => void;
  update: (props: Record<string, any>) => void;
}

export interface MicrofrontendBootstrapFunction {
  (options: {
    container: HTMLElement;
    props?: Record<string, any>;
    mode?: string;
  }): Promise<MicrofrontendBootstrapResult>;
}

export interface MicrofrontendInstance {
  config: MicrofrontendConfig;
  component: React.ComponentType<any> | null;
  bootstrap?: MicrofrontendBootstrapFunction;
  mount?: (container: HTMLElement, props?: Record<string, any>) => Promise<MicrofrontendBootstrapResult>;
  isLoaded: boolean;
  isLoading: boolean;
  error?: Error;
  mountedAt?: HTMLElement;
}

export interface MicrofrontendLoadOptions {
  container?: HTMLElement | string;
  props?: Record<string, any>;
  onLoad?: (instance: MicrofrontendInstance) => void;
  onError?: (error: Error) => void;
  timeout?: number;
}

export interface MicrofrontendStatus {
  name: string;
  status: 'loading' | 'loaded' | 'error';
  loadTime?: number;
  error?: string;
}

export interface DashboardMicrofrontendProps {
  dashboardMode?: boolean;
  [key: string]: any;
}

export interface ShellConfig {
  microfrontends: MicrofrontendConfig[];
  theme: {
    defaultTheme: string;
    allowThemeSwitching: boolean;
  };
  navigation: {
    showSidebar: boolean;
    showHeader: boolean;
    defaultRoute: string;
  };
  errorHandling: {
    showErrorBoundary: boolean;
    fallbackComponent?: React.ComponentType;
  };
}

export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
  microfrontend?: string;
  children?: NavigationItem[];
  isActive?: boolean;
  isDisabled?: boolean;
}

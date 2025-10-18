/**
 * Microfrontend Loader Service
 *
 * Pure Webpack 5 Module Federation loader service for dynamic loading and management
 * of microfrontends with proper error handling and TypeScript support.
 */

import { MicrofrontendConfig, MicrofrontendInstance, MicrofrontendLoadOptions } from '../types/microfrontend';
import { logger } from '@shared/utils/logger';

/**
 * Type definitions for Webpack Module Federation
 */
declare global {
  interface Window {
    __webpack_require__: any;
    __webpack_share_scopes__: any;
  }
}

/**
 * Pure Webpack 5 Module Federation Loader
 *
 * This service uses Webpack's native Module Federation capabilities to load
 * remote microfrontends without custom script injection or ESM compatibility layers.
 */
export class MicrofrontendLoader {
  private static instance: MicrofrontendLoader;
  private loadedMicrofrontends: Map<string, MicrofrontendInstance> = new Map();
  private loadingPromises: Map<string, Promise<MicrofrontendInstance>> = new Map();
  private performanceMetrics: Map<string, { loadTime: number; size?: number }> = new Map();

  public static getInstance(): MicrofrontendLoader {
    if (!MicrofrontendLoader.instance) {
      MicrofrontendLoader.instance = new MicrofrontendLoader();
    }
    return MicrofrontendLoader.instance;
  }

  /**
   * Load a microfrontend using pure Webpack 5 Module Federation
   *
   * @param config - Microfrontend configuration
   * @param options - Loading options with callbacks
   * @returns Promise resolving to the loaded microfrontend instance
   */
  public async loadMicrofrontend(
    config: MicrofrontendConfig,
    options: MicrofrontendLoadOptions = {}
  ): Promise<MicrofrontendInstance> {
    const { name } = config;

    // Return existing instance if already loaded
    const existingInstance = this.loadedMicrofrontends.get(name);
    if (existingInstance && existingInstance.isLoaded) {
      logger.info(`Microfrontend already loaded: ${name}`);
      return existingInstance;
    }

    // Return existing loading promise if already loading
    const existingPromise = this.loadingPromises.get(name);
    if (existingPromise) {
      logger.info(`Microfrontend already loading: ${name}`);
      return existingPromise;
    }

    // Create new loading promise
    const loadingPromise = this.performLoad(config, options);
    this.loadingPromises.set(name, loadingPromise);

    try {
      const instance = await loadingPromise;
      this.loadedMicrofrontends.set(name, instance);
      this.loadingPromises.delete(name);

      if (options.onLoad) {
        options.onLoad(instance);
      }

      return instance;
    } catch (error) {
      this.loadingPromises.delete(name);

      if (options.onError) {
        options.onError(error as Error);
      }

      throw error;
    }
  }

  /**
   * Perform the actual loading of a microfrontend using pure Webpack Module Federation
   *
   * @param config - Microfrontend configuration
   * @param options - Loading options
   * @returns Promise resolving to the loaded microfrontend instance
   */
  private async performLoad(
    config: MicrofrontendConfig,
    options: MicrofrontendLoadOptions
  ): Promise<MicrofrontendInstance> {
    const instance: MicrofrontendInstance = {
      config,
      component: null,
      isLoaded: false,
      isLoading: true,
      error: undefined,
    };

    try {
      // Record start time for performance tracking
      const startTime = performance.now();

      // Set timeout if specified
      const timeout = options.timeout || 30000; // 30 seconds default
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Timeout loading microfrontend: ${config.name}`)), timeout);
      });

      // Load the microfrontend module using Webpack Module Federation
      const loadPromise = this.loadRemoteModule(config);
      const module = await Promise.race([loadPromise, timeoutPromise]);

      // Extract React component from the loaded module
      const component = this.extractComponent(module, config.name);

      // Create mount function for the component
      const mountFunction = this.createMountFunction(component, config.name);

      instance.component = component;
      instance.mount = mountFunction;
      instance.isLoaded = true;
      instance.isLoading = false;

      // Record performance metrics
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      this.performanceMetrics.set(config.name, { loadTime });

      logger.info(`Successfully loaded microfrontend: ${config.name} (${loadTime.toFixed(2)}ms)`);
      return instance;

    } catch (error) {
      instance.error = error as Error;
      instance.isLoading = false;

      logger.error(`Failed to load microfrontend: ${config.name}`, error);
      throw error;
    }
  }

  /**
   * Load remote module using pure Webpack 5 Module Federation
   *
   * @param config - Microfrontend configuration
   * @returns Promise resolving to the loaded module
   */
  private async loadRemoteModule(config: MicrofrontendConfig): Promise<any> {
    try {
      logger.info(`Loading remote module: ${config.name}`);

      if (!config.name || !config.module) {
        throw new Error(`Invalid configuration for microfrontend: ${config.name}`);
      }

      // Map remote names to their static imports for Webpack Module Federation
      // Webpack needs to know about these imports at build time
      let module: any;

      switch (config.name) {
        case 'transcriptAndSummary':
          module = await import('transcriptAndSummary/App');
          break;
        case 'ifPartyMaster':
          module = await import('ifPartyMaster/App');
          break;
        default:
          throw new Error(`Unknown remote module: ${config.name}`);
      }

      logger.info(`Successfully loaded remote module: ${config.name}`, {
        keys: Object.keys(module || {}),
        hasDefault: !!(module && module.default),
        defaultType: module && typeof module.default
      });

      return module;

    } catch (error) {
      logger.error(`Failed to load remote module for ${config.name}:`, error);
      throw new Error(`Failed to load remote module ${config.name}: ${(error as Error).message}`);
    }
  }

  /**
   * Extract React component from the loaded module
   *
   * @param module - The loaded module
   * @param name - Microfrontend name for logging
   * @returns The React component
   */
  private extractComponent(module: any, name: string): React.ComponentType<any> {
    logger.info(`Extracting component from module: ${name}`, {
      moduleType: typeof module,
      hasDefault: !!(module && module.default),
      defaultType: module && typeof module.default,
      keys: module ? Object.keys(module) : []
    });

    // Standard ES6 default export (most common case)
    if (module && module.default && typeof module.default === 'function') {
      logger.info(`Found component via default export for ${name}`);
      return module.default;
    }

    // Direct function export (less common)
    if (typeof module === 'function') {
      logger.info(`Found component via direct function export for ${name}`);
      return module;
    }

    // Look for named exports
    if (module && typeof module === 'object') {
      const componentKeys = ['App', 'Component', 'default'];
      for (const key of componentKeys) {
        if (module[key] && typeof module[key] === 'function') {
          logger.info(`Found component via named export '${key}' for ${name}`);
          return module[key];
        }
      }
    }

    logger.error(`No valid React component found in module ${name}`, {
      module,
      moduleType: typeof module,
      keys: module ? Object.keys(module) : []
    });

    throw new Error(`No valid React component found in module ${name}`);
  }

  /**
   * Create a mount function for the React component
   *
   * @param component - The React component to mount
   * @param name - Microfrontend name for logging
   * @returns Mount function that handles React rendering
   */
  private createMountFunction(
    component: React.ComponentType<any>,
    name: string
  ): (container: HTMLElement, props?: Record<string, any>) => Promise<{ unmount: () => void; update: (newProps: any) => void }> {
    return async (container: HTMLElement, props: Record<string, any> = {}) => {
      logger.info(`Mounting microfrontend: ${name}`, {
        containerTag: container.tagName,
        containerId: container.id,
        propsKeys: Object.keys(props)
      });

      // Dynamic import of React and ReactDOM to avoid bundling issues
      const [React, { createRoot }] = await Promise.all([
        import('react'),
        import('react-dom/client')
      ]);

      // Check if container already has a React root
      const existingRoot = (container as any)._reactRoot;
      let root;

      if (existingRoot) {
        logger.debug(`Reusing existing React root for ${name}`);
        root = existingRoot;
      } else {
        logger.debug(`Creating new React root for ${name}`);
        root = createRoot(container);
        (container as any)._reactRoot = root;
      }

      // Create React element and render
      const element = React.createElement(component, props);
      root.render(element);

      logger.info(`Successfully mounted microfrontend: ${name}`);

      return {
        unmount: () => {
          logger.debug(`Unmounting microfrontend: ${name}`);
          setTimeout(() => {
            try {
              root.unmount();
              delete (container as any)._reactRoot;
              logger.debug(`Successfully unmounted microfrontend: ${name}`);
            } catch (error) {
              logger.warn(`Error during unmount for ${name}:`, error);
            }
          }, 0);
        },
        update: (newProps: any) => {
          logger.debug(`Updating props for microfrontend: ${name}`, {
            newPropsKeys: Object.keys(newProps || {})
          });
          try {
            const updatedElement = React.createElement(component, newProps);
            root.render(updatedElement);
          } catch (error) {
            logger.error(`Error updating props for ${name}:`, error);
          }
        }
      };
    };
  }



  /**
   * Mount a microfrontend to a DOM element
   *
   * @param name - Name of the microfrontend to mount
   * @param container - DOM element or element ID to mount to
   * @param props - Props to pass to the microfrontend
   * @returns Promise resolving to mount controls
   */
  public async mountMicrofrontend(
    name: string,
    container: HTMLElement | string,
    props: Record<string, any> = {}
  ): Promise<{ unmount: () => void; update: (newProps: any) => void } | null> {
    const instance = this.loadedMicrofrontends.get(name);
    if (!instance || !instance.isLoaded) {
      throw new Error(`Microfrontend not loaded: ${name}`);
    }

    const containerElement = typeof container === 'string'
      ? document.getElementById(container)
      : container;

    if (!containerElement) {
      throw new Error(`Container not found: ${container}`);
    }

    if (!instance.mount) {
      throw new Error(`Microfrontend ${name} does not have a mount function`);
    }

    try {
      const result = await instance.mount(containerElement, props);
      instance.mountedAt = containerElement;
      logger.info(`Successfully mounted microfrontend: ${name}`);
      return result;
    } catch (error) {
      logger.error(`Failed to mount microfrontend ${name}:`, error);
      throw error;
    }
  }

  /**
   * Unmount a microfrontend
   */
  public unmountMicrofrontend(name: string): void {
    const instance = this.loadedMicrofrontends.get(name);
    if (instance && instance.mountedAt) {
      // Clear the container
      instance.mountedAt.innerHTML = '';
      instance.mountedAt = undefined;
    }
  }

  /**
   * Get loaded microfrontend instance
   */
  public getMicrofrontend(name: string): MicrofrontendInstance | undefined {
    return this.loadedMicrofrontends.get(name);
  }

  /**
   * Get all loaded microfrontends
   */
  public getAllMicrofrontends(): MicrofrontendInstance[] {
    return Array.from(this.loadedMicrofrontends.values());
  }

  /**
   * Check if a microfrontend is loaded
   */
  public isLoaded(name: string): boolean {
    const instance = this.loadedMicrofrontends.get(name);
    return instance ? instance.isLoaded : false;
  }

  /**
   * Check if a microfrontend is loading
   */
  public isLoading(name: string): boolean {
    const instance = this.loadedMicrofrontends.get(name);
    return instance ? instance.isLoading : this.loadingPromises.has(name);
  }

  /**
   * Preload microfrontends
   */
  public async preloadMicrofrontends(configs: MicrofrontendConfig[]): Promise<void> {
    const loadPromises = configs.map(config => 
      this.loadMicrofrontend(config).catch(error => {
        console.warn(`Failed to preload microfrontend ${config.name}:`, error);
        return null;
      })
    );

    await Promise.allSettled(loadPromises);
    console.log(`Preloaded ${configs.length} microfrontends`);
  }

  /**
   * Clear all loaded microfrontends
   */
  public clearAll(): void {
    // Unmount all microfrontends
    this.loadedMicrofrontends.forEach((_, name) => {
      this.unmountMicrofrontend(name);
    });

    this.loadedMicrofrontends.clear();
    this.loadingPromises.clear();
    this.performanceMetrics.clear();
  }

  /**
   * Get performance metrics for loaded microfrontends
   */
  public getPerformanceMetrics(): Map<string, { loadTime: number; size?: number }> {
    return new Map(this.performanceMetrics);
  }



  /**
   * Health check for loaded microfrontends
   */
  public healthCheck(): { healthy: string[]; unhealthy: string[]; loading: string[] } {
    const healthy: string[] = [];
    const unhealthy: string[] = [];
    const loading: string[] = [];

    this.loadedMicrofrontends.forEach((instance, name) => {
      if (instance.isLoading) {
        loading.push(name);
      } else if (instance.error) {
        unhealthy.push(name);
      } else if (instance.isLoaded) {
        healthy.push(name);
      }
    });

    return { healthy, unhealthy, loading };
  }
}

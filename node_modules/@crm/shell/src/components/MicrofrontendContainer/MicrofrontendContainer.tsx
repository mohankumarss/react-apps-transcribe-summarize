/**
 * Microfrontend Container Component
 * 
 * Pure Webpack 5 Module Federation container for loading and mounting microfrontends
 * with simplified error handling and clean React integration.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MicrofrontendConfig, MicrofrontendInstance } from '../../types/microfrontend';
import { ErrorBoundary, LoadingSpinner } from '@shared/components';
import { logger } from '@shared/utils';
import { MicrofrontendLoader } from '../../services/microfrontendLoader';
import './MicrofrontendContainer.css';

export interface MicrofrontendContainerProps {
  config: MicrofrontendConfig;
  props?: Record<string, any>;
  onLoad?: (instance: MicrofrontendInstance) => void;
  onError?: (error: Error) => void;
  fallback?: React.ComponentType;
}

export const MicrofrontendContainer: React.FC<MicrofrontendContainerProps> = ({
  config,
  props = {},
  onLoad,
  onError,
  fallback: FallbackComponent,
}) => {
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [loadedInstance, setLoadedInstance] = useState<MicrofrontendInstance | null>(null);
  const mountRef = useRef<{ unmount: () => void; update: (props: any) => void } | null>(null);
  const loaderRef = useRef(MicrofrontendLoader.getInstance());

  const containerRefCallback = useCallback((element: HTMLDivElement | null) => {
    if (element) {
      logger.debug(`Container element attached for ${config.name}`);
    }
    setContainerElement(element);
  }, [config.name]);

  // Helper function to get user-friendly error messages
  const getErrorMessage = (error: Error): string => {
    if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
      return 'Network connection error. Please check your internet connection and try again.';
    }
    if (error.message.includes('404') || error.message.includes('not found')) {
      return 'Application not found. The microfrontend may be temporarily unavailable.';
    }
    if (error.message.includes('CORS')) {
      return 'Cross-origin request blocked. Please contact your system administrator.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. The application is taking too long to load.';
    }
    if (error.message.includes('component')) {
      return 'Application startup failed. The microfrontend may have a configuration issue.';
    }
    return 'An unexpected error occurred while loading the application.';
  };

  // Handle retry with error reset
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setLoadedInstance(null);
  };

  // Effect 1: Load the microfrontend using the new loader service
  useEffect(() => {
    let isMounted = true;

    const loadMicrofrontend = async () => {
      try {
        logger.info(`Loading microfrontend: ${config.name}`);
        setIsLoading(true);
        setError(null);
        setLoadedInstance(null);

        // Use the new MicrofrontendLoader service
        const instance = await loaderRef.current.loadMicrofrontend(config, {
          onLoad: (loadedInstance) => {
            if (isMounted) {
              logger.info(`Microfrontend loaded successfully: ${config.name}`);
              onLoad?.(loadedInstance);
            }
          },
          onError: (error) => {
            if (isMounted) {
              logger.error(`Failed to load microfrontend: ${config.name}`, error);
              onError?.(error);
            }
          },
          timeout: 30000
        });

        if (isMounted) {
          setLoadedInstance(instance);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          logger.error(`Microfrontend loading error: ${config.name}`, error);
          setError(error as Error);
          setIsLoading(false);
          onError?.(error as Error);
        }
      }
    };

    loadMicrofrontend();

    return () => {
      isMounted = false;

      // Cleanup: unmount the microfrontend
      if (mountRef.current) {
        const currentMount = mountRef.current;
        mountRef.current = null;

        try {
          logger.debug(`Cleaning up microfrontend: ${config.name}`);
          currentMount.unmount();
        } catch (error) {
          logger.warn(`Error during microfrontend cleanup ${config.name}:`, error);
        }
      }
    };
  }, [config.name, config.url, onLoad, onError]);

  // Effect 2: Mount the microfrontend when both container and loaded instance are available
  useEffect(() => {
    if (!containerElement || !loadedInstance || !loadedInstance.isLoaded) {
      return; // Wait for all prerequisites
    }

    if (mountRef.current) {
      return; // Skip if already mounted
    }

    let isMounted = true;

    const mountMicrofrontend = async () => {
      try {
        if (!containerElement) {
          throw new Error('Container element is null');
        }

        if (!loadedInstance.mount) {
          throw new Error('Microfrontend instance does not have a mount method');
        }

        const mountResult = await loadedInstance.mount(containerElement, props);

        if (!isMounted) return;

        if (mountResult) {
          mountRef.current = mountResult;
          setIsLoading(false);
          logger.info(`Microfrontend mounted successfully: ${config.name}`);
        } else {
          throw new Error('Mount result is null');
        }

      } catch (error) {
        if (isMounted) {
          setError(error as Error);
          setIsLoading(false);
          logger.error(`Failed to mount microfrontend: ${config.name}`, error);
        }
      }
    };

    mountMicrofrontend();

    return () => {
      isMounted = false;
    };
  }, [containerElement, loadedInstance, config.name, props]);

  // Effect 3: Update props when they change
  useEffect(() => {
    if (mountRef.current && !isLoading && !error) {
      try {
        logger.debug(`Updating props for microfrontend: ${config.name}`);
        mountRef.current.update(props);
      } catch (error) {
        logger.warn(`Error updating props for microfrontend: ${config.name}`, error);
      }
    }
  }, [props, isLoading, error, config.name]);

  // Render the container with loading and error states
  return (
    <ErrorBoundary
      fallback={
        <div className="microfrontend-container microfrontend-container--error">
          <div className="microfrontend-error">
            <h3>Error in {config.displayName}</h3>
            <p>An unexpected error occurred while loading this application.</p>
            <button
              onClick={() => window.location.reload()}
              className="microfrontend-error__retry"
            >
              Reload
            </button>
          </div>
        </div>
      }
    >
      <div className="microfrontend-wrapper">
        {/* Loading overlay */}
        {isLoading && (
          <div className="microfrontend-overlay microfrontend-overlay--loading">
            <LoadingSpinner message={`Loading ${config.displayName}...`} />
          </div>
        )}

        {/* Error overlay */}
        {error && !isLoading && (
          <div className="microfrontend-overlay microfrontend-overlay--error">
            {FallbackComponent ? (
              <FallbackComponent />
            ) : (
              <div className="microfrontend-error">
                <h3>Unable to load {config.displayName}</h3>
                <p className="microfrontend-error__message">
                  {getErrorMessage(error)}
                </p>
                <div className="microfrontend-error__actions">
                  <button
                    onClick={handleRetry}
                    className="microfrontend-error__retry"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Retrying...' : 'Try Again'}
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="microfrontend-error__reload"
                  >
                    Reload Page
                  </button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <details className="microfrontend-error__details">
                    <summary>Technical Details</summary>
                    <pre className="microfrontend-error__stack">
                      {error.stack || error.message}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        )}

        {/* Container for microfrontend */}
        <div
          ref={containerRefCallback}
          className={`microfrontend-container ${
            isLoading
              ? 'microfrontend-container--loading'
              : error
                ? 'microfrontend-container--error'
                : 'microfrontend-container--loaded'
          }`}
          data-microfrontend={config.name}
          style={{
            display: isLoading || error ? 'none' : 'block'
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

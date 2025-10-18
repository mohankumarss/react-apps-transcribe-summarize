/**
 * Theme Context and Provider
 * 
 * React context for theme management with hooks
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ThemeManager } from './themeManager';
import { 
  ThemeMode, 
  ThemeConfig, 
  ThemeContextValue, 
  ThemeProviderProps,
  ThemeEvent,
  ThemeEventData 
} from './themeTypes';
import { logger } from '../../utils/logger';

// Create theme context
const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Theme Provider Component
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = ThemeMode.CRM,
  enableAutoDetection = true,
  enablePersistence = true,
  storageKey = 'crm-app-theme'
}) => {
  const [themeManager] = useState(() => new ThemeManager({
    defaultTheme,
    enableAutoDetection,
    enablePersistence,
    storageKey
  }));

  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(defaultTheme);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(themeManager.getThemeConfig());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize theme manager
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await themeManager.initialize();
        
        setCurrentTheme(themeManager.getCurrentTheme());
        setThemeConfig(themeManager.getThemeConfig());
        setIsLoading(false);
        
        logger.info('Theme provider initialized', { 
          theme: themeManager.getCurrentTheme() 
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Theme initialization failed';
        setError(errorMessage);
        setIsLoading(false);
        logger.error('Theme provider initialization failed:', err);
      }
    };

    initializeTheme();
  }, [themeManager]);

  // Subscribe to theme events
  useEffect(() => {
    const unsubscribe = themeManager.onThemeChange((eventData: ThemeEventData) => {
      switch (eventData.event) {
        case ThemeEvent.THEME_LOADING:
          setIsLoading(true);
          setError(null);
          break;
          
        case ThemeEvent.THEME_CHANGED:
        case ThemeEvent.THEME_LOADED:
        case ThemeEvent.THEME_RESET:
          setCurrentTheme(eventData.theme);
          setThemeConfig(themeManager.getThemeConfig());
          setIsLoading(false);
          setError(null);
          break;
          
        case ThemeEvent.THEME_ERROR:
          setIsLoading(false);
          setError(eventData.error || 'Theme error occurred');
          break;
      }
    });

    return unsubscribe;
  }, [themeManager]);

  // Theme switching function
  const switchTheme = useCallback(async (theme: ThemeMode) => {
    try {
      await themeManager.switchTheme(theme);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Theme switch failed';
      setError(errorMessage);
      logger.error('Theme switch failed:', err);
    }
  }, [themeManager]);

  // Reset theme function
  const resetTheme = useCallback(async () => {
    try {
      await themeManager.resetTheme();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Theme reset failed';
      setError(errorMessage);
      logger.error('Theme reset failed:', err);
    }
  }, [themeManager]);

  // Apply theme function (for manual theme application)
  const applyTheme = useCallback(async (theme: ThemeMode) => {
    try {
      await themeManager.switchTheme(theme);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Theme application failed';
      setError(errorMessage);
      logger.error('Theme application failed:', err);
    }
  }, [themeManager]);

  const contextValue: ThemeContextValue = {
    currentTheme,
    themeConfig,
    isLoading,
    error,
    switchTheme,
    resetTheme,
    applyTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Hook to get current theme mode
 */
export const useCurrentTheme = (): ThemeMode => {
  const { currentTheme } = useTheme();
  return currentTheme;
};

/**
 * Hook to get theme configuration
 */
export const useThemeConfig = (): ThemeConfig => {
  const { themeConfig } = useTheme();
  return themeConfig;
};

/**
 * Hook to check if a specific theme is active
 */
export const useIsTheme = (theme: ThemeMode): boolean => {
  const { currentTheme } = useTheme();
  return currentTheme === theme;
};

/**
 * Hook to get theme CSS variables
 */
export const useThemeVariables = () => {
  const { themeConfig } = useTheme();
  
  return {
    primary: themeConfig.primaryColor,
    secondary: themeConfig.secondaryColor,
    background: themeConfig.backgroundColor,
    text: themeConfig.textColor,
    border: themeConfig.borderColor,
    fontFamily: themeConfig.fontFamily,
    ...themeConfig.customProperties
  };
};

/**
 * Hook for theme-aware styling
 */
export const useThemeStyles = () => {
  const { currentTheme, themeConfig } = useTheme();
  
  const getThemeClass = (baseClass: string): string => {
    return `${baseClass} theme-${currentTheme}`;
  };
  
  const getThemeStyle = (styles: Record<ThemeMode, React.CSSProperties>): React.CSSProperties => {
    return styles[currentTheme] || {};
  };
  
  const getCSSVariable = (property: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(property);
  };
  
  return {
    currentTheme,
    themeConfig,
    getThemeClass,
    getThemeStyle,
    getCSSVariable
  };
};

/**
 * Higher-order component for theme-aware components
 */
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: ThemeContextValue }>
) => {
  const ThemedComponent = (props: P) => {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
  
  ThemedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  
  return ThemedComponent;
};

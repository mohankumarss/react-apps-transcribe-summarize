/**
 * Theme Context and Provider
 *
 * React context for theme management with hooks
 */
import React from 'react';
import { ThemeMode, ThemeConfig, ThemeContextValue, ThemeProviderProps } from './themeTypes';
/**
 * Theme Provider Component
 */
export declare const ThemeProvider: React.FC<ThemeProviderProps>;
/**
 * Hook to use theme context
 */
export declare const useTheme: () => ThemeContextValue;
/**
 * Hook to get current theme mode
 */
export declare const useCurrentTheme: () => ThemeMode;
/**
 * Hook to get theme configuration
 */
export declare const useThemeConfig: () => ThemeConfig;
/**
 * Hook to check if a specific theme is active
 */
export declare const useIsTheme: (theme: ThemeMode) => boolean;
/**
 * Hook to get theme CSS variables
 */
export declare const useThemeVariables: () => {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
    fontFamily: string;
};
/**
 * Hook for theme-aware styling
 */
export declare const useThemeStyles: () => {
    currentTheme: ThemeMode;
    themeConfig: ThemeConfig;
    getThemeClass: (baseClass: string) => string;
    getThemeStyle: (styles: Record<ThemeMode, React.CSSProperties>) => React.CSSProperties;
    getCSSVariable: (property: string) => string;
};
/**
 * Higher-order component for theme-aware components
 */
export declare const withTheme: <P extends object>(Component: React.ComponentType<P & {
    theme: ThemeContextValue;
}>) => {
    (props: P): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
//# sourceMappingURL=themeContext.d.ts.map
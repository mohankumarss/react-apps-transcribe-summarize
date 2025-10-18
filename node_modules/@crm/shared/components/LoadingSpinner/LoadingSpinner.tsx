import React from 'react';
import { ThemeMode, ThemeConfig } from '../../services/theme/themeTypes';

// Fallback theme styles when theme context is not available
const defaultThemeStyles = {
  getThemeClass: (baseClass: string) => baseClass,
  getThemeStyle: (styles: Record<ThemeMode, React.CSSProperties>): React.CSSProperties => ({}),
  getCSSVariable: (property: string) => '',
  currentTheme: ThemeMode.CRM, // Using CRM as default theme mode
  themeConfig: {
    mode: ThemeMode.CRM,
    primaryColor: '#0078d4',
    secondaryColor: '#106ebe',
    backgroundColor: '#ffffff',
    textColor: '#323130',
    borderColor: '#8a8886',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    customProperties: {
      '--crm-header-bg': '#0078d4',
      '--crm-sidebar-bg': '#f3f2f1',
      '--crm-card-bg': '#ffffff',
      '--crm-border-radius': '2px',
      '--crm-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
      '--crm-spacing-xs': '4px',
      '--crm-spacing-sm': '8px',
      '--crm-spacing-md': '16px',
      '--crm-spacing-lg': '24px',
      '--crm-spacing-xl': '32px',
    }
  } as ThemeConfig
};

// Dynamically import useThemeStyles to handle cases where it might not be available
let useThemeStyles: typeof import('../../services/theme/themeContext').useThemeStyles;

try {
  // This will throw if the module doesn't exist
  useThemeStyles = require('../../services/theme/themeContext').useThemeStyles;
} catch (e) {
  // Fallback if the theme context isn't available
  useThemeStyles = () => defaultThemeStyles;
}

export interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Loading message to display
   */
  message?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Loading spinner component with theme support
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  className = '',
}) => {
  // Safely get theme styles with fallback
  let themeStyles;
  try {
    themeStyles = useThemeStyles();
  } catch (e) {
    // Fallback if theme context is not available
    themeStyles = defaultThemeStyles;
  }
  
  const { getThemeClass } = themeStyles;

  const classes = [
    'loading-spinner',
    `loading-spinner-${size}`,
    getThemeClass('loading-spinner'),
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className="loading-spinner-container"
      data-testid="loading-spinner"
      role="status"
      aria-label="Loading"
    >
      <div className={classes}>
        <div className="loading-spinner-circle" />
      </div>
      {message && (
        <div className="loading-spinner-message">
          {message}
        </div>
      )}
    </div>
  );
};

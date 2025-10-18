import React from 'react';
import { useThemeStyles } from '../../services/theme/themeContext';

// Fallback theme styles when theme context is not available
const defaultThemeStyles = {
  getThemeClass: (baseClass: string) => baseClass,
  getThemeStyle: () => ({}),
  getCSSVariable: () => '',
  currentTheme: 'light',
  themeConfig: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    backgroundColor: '#ffffff',
    textColor: '#212529',
    borderColor: '#dee2e6',
    fontFamily: 'Arial, sans-serif',
    customProperties: {}
  }
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button contents
   */
  children: React.ReactNode;
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  /**
   * Button size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Loading state
   */
  loading?: boolean;
}

/**
 * Primary UI component for user interaction
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
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
    'button',
    `button-${variant}`,
    `button-${size}`,
    loading && 'button-loading',
    getThemeClass('button'),
    className,
  ].filter(Boolean).join(' ');

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <span className="button-spinner" aria-hidden="true">
          ⟳
        </span>
      ) : null}
      <span className={loading ? 'button-text-loading' : 'button-text'}>
        {children}
      </span>
    </button>
  );
};

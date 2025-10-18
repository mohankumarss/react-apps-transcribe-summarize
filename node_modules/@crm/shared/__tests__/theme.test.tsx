/**
 * Theme System Tests
 * 
 * Comprehensive tests for the theme switching system
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme, useThemeStyles, ThemeMode } from '../services/theme';

// Test component that uses theme hooks
const TestThemeComponent: React.FC = () => {
  const { currentTheme, switchTheme, isLoading, error } = useTheme();
  const { getThemeClass, getCSSVariable } = useThemeStyles();

  const handleSwitchTheme = () => {
    switchTheme(currentTheme === ThemeMode.CRM ? ThemeMode.MFE : ThemeMode.CRM);
  };

  return (
    <div data-testid="theme-component" className={getThemeClass('test-component')}>
      <span data-testid="current-theme">{currentTheme}</span>
      <span data-testid="primary-color">{getCSSVariable('--theme-primary')}</span>
      <button data-testid="switch-theme" onClick={handleSwitchTheme}>
        Switch Theme
      </button>
      {isLoading && <span data-testid="loading">Loading...</span>}
      {error && <span data-testid="error">{error}</span>}
    </div>
  );
};

// Helper function to render with theme provider
const renderWithTheme = (
  component: React.ReactElement,
  options: {
    defaultTheme?: ThemeMode;
    enableAutoDetection?: boolean;
    enablePersistence?: boolean;
  } = {}
) => {
  const {
    defaultTheme = ThemeMode.CRM,
    enableAutoDetection = false,
    enablePersistence = false,
  } = options;

  return render(
    <ThemeProvider
      defaultTheme={defaultTheme}
      enableAutoDetection={enableAutoDetection}
      enablePersistence={enablePersistence}
    >
      {component}
    </ThemeProvider>
  );
};

describe('Theme System', () => {
  beforeEach(() => {
    // Reset DOM attributes
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
    
    // Clear localStorage
    localStorage.clear();
  });

  describe('ThemeProvider', () => {
    test('renders with default CRM theme', () => {
      renderWithTheme(<TestThemeComponent />);
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('crm');
      expect(document.documentElement).toHaveAttribute('data-theme', 'crm');
      expect(document.body).toHaveAttribute('data-theme', 'crm');
    });

    test('renders with specified default theme', () => {
      renderWithTheme(<TestThemeComponent />, { defaultTheme: ThemeMode.MFE });
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('mfe');
      expect(document.documentElement).toHaveAttribute('data-theme', 'mfe');
      expect(document.body).toHaveAttribute('data-theme', 'mfe');
    });

    test('applies theme classes correctly', () => {
      renderWithTheme(<TestThemeComponent />);
      
      const component = screen.getByTestId('theme-component');
      expect(component).toHaveClass('test-component', 'theme-crm');
    });
  });

  describe('Theme Switching', () => {
    test('switches from CRM to MFE theme', async () => {
      renderWithTheme(<TestThemeComponent />);
      
      // Initial state should be CRM
      expect(screen.getByTestId('current-theme')).toHaveTextContent('crm');
      
      // Switch theme
      fireEvent.click(screen.getByTestId('switch-theme'));
      
      // Wait for theme change
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('mfe');
      });
      
      expect(document.documentElement).toHaveAttribute('data-theme', 'mfe');
      expect(document.body).toHaveAttribute('data-theme', 'mfe');
    });

    test('switches from MFE to CRM theme', async () => {
      renderWithTheme(<TestThemeComponent />, { defaultTheme: ThemeMode.MFE });
      
      // Initial state should be MFE
      expect(screen.getByTestId('current-theme')).toHaveTextContent('mfe');
      
      // Switch theme
      fireEvent.click(screen.getByTestId('switch-theme'));
      
      // Wait for theme change
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('crm');
      });
      
      expect(document.documentElement).toHaveAttribute('data-theme', 'crm');
      expect(document.body).toHaveAttribute('data-theme', 'crm');
    });
  });

  describe('Theme Persistence', () => {
    test('persists theme preference when enabled', async () => {
      const { rerender } = renderWithTheme(<TestThemeComponent />, { 
        enablePersistence: true 
      });
      
      // Switch to MFE theme
      fireEvent.click(screen.getByTestId('switch-theme'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('mfe');
      });
      
      // Verify localStorage was called
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'crm-app-theme',
        expect.stringContaining('mfe')
      );
      
      // Simulate page reload by re-rendering with fresh provider
      rerender(
        <ThemeProvider enablePersistence={true}>
          <TestThemeComponent />
        </ThemeProvider>
      );
      
      // Should restore persisted theme
      expect(localStorage.getItem).toHaveBeenCalledWith('crm-app-theme');
    });

    test('does not persist theme when disabled', async () => {
      renderWithTheme(<TestThemeComponent />, { enablePersistence: false });
      
      // Switch theme
      fireEvent.click(screen.getByTestId('switch-theme'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('mfe');
      });
      
      // Verify localStorage was not called
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('useThemeStyles Hook', () => {
    test('returns CSS variables correctly', () => {
      renderWithTheme(<TestThemeComponent />);
      
      const primaryColor = screen.getByTestId('primary-color');
      expect(primaryColor).toHaveTextContent('#0078d4');
    });

    test('generates theme-aware class names', () => {
      renderWithTheme(<TestThemeComponent />);
      
      const component = screen.getByTestId('theme-component');
      expect(component).toHaveClass('test-component', 'theme-crm');
    });
  });

  describe('Error Handling', () => {
    test('handles theme switching errors gracefully', async () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      renderWithTheme(<TestThemeComponent />);
      
      // This should not cause the component to crash
      fireEvent.click(screen.getByTestId('switch-theme'));
      
      // Component should still be rendered
      expect(screen.getByTestId('theme-component')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Auto Detection', () => {
    test('detects theme from environment variables', () => {
      // Mock environment variable
      process.env.VITE_THEME_MODE = 'mfe';
      
      renderWithTheme(<TestThemeComponent />, { enableAutoDetection: true });
      
      // Should use environment-detected theme
      expect(screen.getByTestId('current-theme')).toHaveTextContent('mfe');
      
      // Cleanup
      delete process.env.VITE_THEME_MODE;
    });
  });
});

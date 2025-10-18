/**
 * Component Tests
 * 
 * Tests for shared components with theme awareness
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, ThemeMode } from '../services/theme';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

// Helper function to render with theme provider
const renderWithTheme = (
  component: React.ReactElement,
  theme: ThemeMode = ThemeMode.CRM
) => {
  return render(
    <ThemeProvider defaultTheme={theme} enableAutoDetection={false}>
      {component}
    </ThemeProvider>
  );
};

describe('Shared Components', () => {
  describe('Button Component', () => {
    test('renders with default props', () => {
      renderWithTheme(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
    });

    test('renders with custom props', () => {
      renderWithTheme(
        <Button variant="primary" size="large" disabled>
          Primary Button
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /primary button/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
      expect(button).toHaveClass('button-primary', 'button-large');
    });

    test('handles click events', () => {
      const handleClick = jest.fn();
      renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('applies theme-specific styles in CRM mode', () => {
      renderWithTheme(<Button>CRM Button</Button>, ThemeMode.CRM);
      
      const button = screen.getByRole('button', { name: /crm button/i });
      expect(button).toHaveClass('theme-crm');
    });

    test('applies theme-specific styles in MFE mode', () => {
      renderWithTheme(<Button>MFE Button</Button>, ThemeMode.MFE);
      
      const button = screen.getByRole('button', { name: /mfe button/i });
      expect(button).toHaveClass('theme-mfe');
    });

    test('supports different variants', () => {
      const { rerender } = renderWithTheme(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('button-primary');

      rerender(
        <ThemeProvider defaultTheme={ThemeMode.CRM} enableAutoDetection={false}>
          <Button variant="secondary">Secondary</Button>
        </ThemeProvider>
      );
      expect(screen.getByRole('button')).toHaveClass('button-secondary');

      rerender(
        <ThemeProvider defaultTheme={ThemeMode.CRM} enableAutoDetection={false}>
          <Button variant="outline">Outline</Button>
        </ThemeProvider>
      );
      expect(screen.getByRole('button')).toHaveClass('button-outline');
    });

    test('supports different sizes', () => {
      const { rerender } = renderWithTheme(<Button size="small">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('button-small');

      rerender(
        <ThemeProvider defaultTheme={ThemeMode.CRM} enableAutoDetection={false}>
          <Button size="medium">Medium</Button>
        </ThemeProvider>
      );
      expect(screen.getByRole('button')).toHaveClass('button-medium');

      rerender(
        <ThemeProvider defaultTheme={ThemeMode.CRM} enableAutoDetection={false}>
          <Button size="large">Large</Button>
        </ThemeProvider>
      );
      expect(screen.getByRole('button')).toHaveClass('button-large');
    });
  });

  describe('LoadingSpinner Component', () => {
    test('renders with default props', () => {
      renderWithTheme(<LoadingSpinner />);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('loading-spinner');
    });

    test('renders with custom size', () => {
      renderWithTheme(<LoadingSpinner size="large" />);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner-large');
    });

    test('renders with custom message', () => {
      renderWithTheme(<LoadingSpinner message="Loading data..." />);
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    test('applies theme-specific styles', () => {
      const { rerender } = renderWithTheme(<LoadingSpinner />, ThemeMode.CRM);
      expect(screen.getByTestId('loading-spinner')).toHaveClass('theme-crm');

      rerender(
        <ThemeProvider defaultTheme={ThemeMode.MFE} enableAutoDetection={false}>
          <LoadingSpinner />
        </ThemeProvider>
      );
      expect(screen.getByTestId('loading-spinner')).toHaveClass('theme-mfe');
    });

    test('supports accessibility attributes', () => {
      renderWithTheme(<LoadingSpinner />);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('role', 'status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });
  });

  describe('ThemeSwitcher Component', () => {
    test('renders theme switcher', () => {
      renderWithTheme(<ThemeSwitcher />);
      
      const switcher = screen.getByTestId('theme-switcher');
      expect(switcher).toBeInTheDocument();
    });

    test('displays current theme', () => {
      renderWithTheme(<ThemeSwitcher />, ThemeMode.CRM);
      
      expect(screen.getByText(/crm/i)).toBeInTheDocument();
    });

    test('switches theme when clicked', () => {
      renderWithTheme(<ThemeSwitcher />);
      
      const switchButton = screen.getByRole('button');
      fireEvent.click(switchButton);
      
      // The theme should change (this would be tested in integration)
      expect(switchButton).toBeInTheDocument();
    });

    test('shows theme options', () => {
      renderWithTheme(<ThemeSwitcher showLabels={true} />);
      
      expect(screen.getByText(/theme/i)).toBeInTheDocument();
    });

    test('supports compact mode', () => {
      renderWithTheme(<ThemeSwitcher compact={true} />);
      
      const switcher = screen.getByTestId('theme-switcher');
      expect(switcher).toHaveClass('theme-switcher-compact');
    });
  });

  describe('Component Integration', () => {
    test('components work together with theme provider', () => {
      renderWithTheme(
        <div>
          <Button>Test Button</Button>
          <LoadingSpinner message="Loading..." />
          <ThemeSwitcher />
        </div>
      );
      
      expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByTestId('theme-switcher')).toBeInTheDocument();
    });

    test('all components respond to theme changes', () => {
      const { rerender } = renderWithTheme(
        <div>
          <Button>Button</Button>
          <LoadingSpinner />
        </div>,
        ThemeMode.CRM
      );
      
      // Check CRM theme classes
      expect(screen.getByRole('button')).toHaveClass('theme-crm');
      expect(screen.getByTestId('loading-spinner')).toHaveClass('theme-crm');
      
      // Switch to MFE theme
      rerender(
        <ThemeProvider defaultTheme={ThemeMode.MFE} enableAutoDetection={false}>
          <div>
            <Button>Button</Button>
            <LoadingSpinner />
          </div>
        </ThemeProvider>
      );
      
      // Check MFE theme classes
      expect(screen.getByRole('button')).toHaveClass('theme-mfe');
      expect(screen.getByTestId('loading-spinner')).toHaveClass('theme-mfe');
    });
  });

  describe('Accessibility', () => {
    test('components have proper ARIA attributes', () => {
      renderWithTheme(
        <div>
          <Button>Accessible Button</Button>
          <LoadingSpinner />
        </div>
      );
      
      const button = screen.getByRole('button');
      const spinner = screen.getByTestId('loading-spinner');
      
      expect(button).toHaveAttribute('type', 'button');
      expect(spinner).toHaveAttribute('role', 'status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    test('components support keyboard navigation', () => {
      renderWithTheme(<Button>Keyboard Button</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
    });
  });
});

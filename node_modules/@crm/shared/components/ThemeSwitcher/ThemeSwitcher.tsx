/**
 * Theme Switcher Component
 * 
 * Provides UI for switching between themes
 */

import React, { useState } from 'react';
import { useTheme, useCurrentTheme } from '../../services/theme/themeContext';
import { ThemeMode } from '../../services/theme/themeTypes';
import { getDeploymentConfig } from '../../config/deploymentContext';

export interface ThemeSwitcherProps {
  /**
   * Display style for the switcher
   */
  variant?: 'dropdown' | 'toggle' | 'buttons';
  
  /**
   * Size of the switcher
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Show theme labels
   */
  showLabels?: boolean;
  
  /**
   * Show theme icons
   */
  showIcons?: boolean;
  
  /**
   * Custom class name
   */
  className?: string;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Only show if theme switching is enabled
   */
  hideIfDisabled?: boolean;
}

const themeLabels: Record<ThemeMode, string> = {
  [ThemeMode.CRM]: 'Dynamics CRM',
  [ThemeMode.MFE]: 'ZB Champion'
};

const themeIcons: Record<ThemeMode, string> = {
  [ThemeMode.CRM]: '🏢',
  [ThemeMode.MFE]: '🎯'
};

const themeDescriptions: Record<ThemeMode, string> = {
  [ThemeMode.CRM]: 'Dynamics 365 enterprise styling',
  [ThemeMode.MFE]: 'ZB Champion standard theme'
};

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'dropdown',
  size = 'md',
  showLabels = true,
  showIcons = true,
  className = '',
  disabled = false,
  hideIfDisabled = true
}) => {
  const { switchTheme, isLoading, error } = useTheme();
  const currentTheme = useCurrentTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  // Check if theme switching is enabled
  const deploymentConfig = getDeploymentConfig();
  const isThemeSwitchingEnabled = deploymentConfig.features.enableThemeSwitching;
  
  // Hide if theme switching is disabled and hideIfDisabled is true
  if (!isThemeSwitchingEnabled && hideIfDisabled) {
    return null;
  }
  
  const isDisabled = disabled || !isThemeSwitchingEnabled || isLoading;
  
  const handleThemeChange = async (theme: ThemeMode) => {
    if (isDisabled || theme === currentTheme) return;
    
    try {
      await switchTheme(theme);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to switch theme:', err);
    }
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'theme-switcher-sm';
      case 'lg': return 'theme-switcher-lg';
      default: return 'theme-switcher-md';
    }
  };
  
  const baseClasses = `theme-switcher ${getSizeClasses()} ${className}`;
  
  if (variant === 'toggle') {
    return (
      <div className={`${baseClasses} theme-switcher-toggle`}>
        <button
          className={`theme-toggle-button ${isDisabled ? 'disabled' : ''}`}
          onClick={() => handleThemeChange(currentTheme === ThemeMode.CRM ? ThemeMode.MFE : ThemeMode.CRM)}
          disabled={isDisabled}
          title={`Switch to ${currentTheme === ThemeMode.CRM ? themeLabels[ThemeMode.MFE] : themeLabels[ThemeMode.CRM]}`}
        >
          {showIcons && (
            <span className="theme-icon">
              {themeIcons[currentTheme === ThemeMode.CRM ? ThemeMode.MFE : ThemeMode.CRM]}
            </span>
          )}
          {showLabels && (
            <span className="theme-label">
              {currentTheme === ThemeMode.CRM ? 'Switch to MFE' : 'Switch to CRM'}
            </span>
          )}
        </button>
        
        {error && (
          <div className="theme-error" title={error}>
            ⚠️
          </div>
        )}
      </div>
    );
  }
  
  if (variant === 'buttons') {
    return (
      <div className={`${baseClasses} theme-switcher-buttons`}>
        {Object.values(ThemeMode).map(theme => (
          <button
            key={theme}
            className={`theme-button ${currentTheme === theme ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
            onClick={() => handleThemeChange(theme)}
            disabled={isDisabled}
            title={themeDescriptions[theme]}
          >
            {showIcons && (
              <span className="theme-icon">{themeIcons[theme]}</span>
            )}
            {showLabels && (
              <span className="theme-label">{themeLabels[theme]}</span>
            )}
          </button>
        ))}
        
        {error && (
          <div className="theme-error" title={error}>
            ⚠️
          </div>
        )}
      </div>
    );
  }
  
  // Default dropdown variant
  return (
    <div className={`${baseClasses} theme-switcher-dropdown`}>
      <button
        className={`theme-dropdown-trigger ${isOpen ? 'open' : ''} ${isDisabled ? 'disabled' : ''}`}
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {showIcons && (
          <span className="theme-icon">{themeIcons[currentTheme]}</span>
        )}
        {showLabels && (
          <span className="theme-label">{themeLabels[currentTheme]}</span>
        )}
        <span className="theme-dropdown-arrow">▼</span>
      </button>
      
      {isOpen && (
        <div className="theme-dropdown-menu">
          {Object.values(ThemeMode).map(theme => (
            <button
              key={theme}
              className={`theme-dropdown-item ${currentTheme === theme ? 'active' : ''}`}
              onClick={() => handleThemeChange(theme)}
              role="option"
              aria-selected={currentTheme === theme}
            >
              {showIcons && (
                <span className="theme-icon">{themeIcons[theme]}</span>
              )}
              <div className="theme-info">
                {showLabels && (
                  <span className="theme-label">{themeLabels[theme]}</span>
                )}
                <span className="theme-description">{themeDescriptions[theme]}</span>
              </div>
              {currentTheme === theme && (
                <span className="theme-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
      
      {error && (
        <div className="theme-error" title={error}>
          ⚠️
        </div>
      )}
      
      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="theme-dropdown-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// CSS styles (would typically be in a separate CSS file)
const styles = `
.theme-switcher {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.theme-switcher-sm {
  font-size: 0.875rem;
}

.theme-switcher-md {
  font-size: 1rem;
}

.theme-switcher-lg {
  font-size: 1.125rem;
}

/* Toggle variant */
.theme-toggle-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--theme-border-primary);
  border-radius: var(--theme-radius-base);
  background-color: var(--theme-bg-primary);
  color: var(--theme-text-primary);
  cursor: pointer;
  transition: all var(--theme-transition-base);
}

.theme-toggle-button:hover:not(.disabled) {
  background-color: var(--theme-bg-secondary);
  border-color: var(--theme-border-secondary);
}

/* Buttons variant */
.theme-switcher-buttons {
  display: flex;
  gap: 4px;
  padding: 2px;
  background-color: var(--theme-bg-tertiary);
  border-radius: var(--theme-radius-lg);
}

.theme-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: var(--theme-radius-base);
  background-color: transparent;
  color: var(--theme-text-secondary);
  cursor: pointer;
  transition: all var(--theme-transition-base);
}

.theme-button:hover:not(.disabled) {
  background-color: var(--theme-bg-primary);
  color: var(--theme-text-primary);
}

.theme-button.active {
  background-color: var(--theme-primary);
  color: var(--theme-text-inverse);
}

/* Dropdown variant */
.theme-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--theme-border-primary);
  border-radius: var(--theme-radius-base);
  background-color: var(--theme-bg-primary);
  color: var(--theme-text-primary);
  cursor: pointer;
  transition: all var(--theme-transition-base);
}

.theme-dropdown-trigger:hover:not(.disabled) {
  background-color: var(--theme-bg-secondary);
  border-color: var(--theme-border-secondary);
}

.theme-dropdown-arrow {
  font-size: 0.75em;
  transition: transform var(--theme-transition-base);
}

.theme-dropdown-trigger.open .theme-dropdown-arrow {
  transform: rotate(180deg);
}

.theme-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background-color: var(--theme-bg-primary);
  border: 1px solid var(--theme-border-primary);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-lg);
  z-index: var(--theme-z-dropdown);
  overflow: hidden;
}

.theme-dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background-color: transparent;
  color: var(--theme-text-primary);
  cursor: pointer;
  transition: all var(--theme-transition-base);
  text-align: left;
}

.theme-dropdown-item:hover {
  background-color: var(--theme-bg-secondary);
}

.theme-dropdown-item.active {
  background-color: var(--theme-primary-light);
  color: var(--theme-primary);
}

.theme-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.theme-description {
  font-size: 0.875em;
  color: var(--theme-text-secondary);
}

.theme-check {
  color: var(--theme-primary);
  font-weight: bold;
}

.theme-dropdown-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: calc(var(--theme-z-dropdown) - 1);
}

/* Disabled state */
.disabled {
  opacity: 0.6;
  cursor: not-allowed !important;
  pointer-events: none;
}

/* Error indicator */
.theme-error {
  color: var(--theme-error);
  font-size: 1.2em;
  cursor: help;
}
`;

// Inject styles (in a real app, this would be in a CSS file)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

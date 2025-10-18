/**
 * Settings Page
 * 
 * Shell application settings and configuration
 */

import React from 'react';
import { useTheme } from '@shared/services/theme';
import { Button, ThemeSwitcher } from '@shared/components';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const { currentTheme } = useTheme();

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <h1 className="settings-page__title">Settings</h1>
        <p className="settings-page__description">
          Configure your shell application preferences
        </p>
      </div>

      <div className="settings-page__content">
        <div className="settings-section">
          <h2 className="settings-section__title">Theme</h2>
          <p className="settings-section__description">
            Choose your preferred theme for the application
          </p>
          <div className="settings-section__content">
            <ThemeSwitcher />
            <p className="settings-current-theme">
              Current theme: <strong>{currentTheme}</strong>
            </p>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="settings-section__title">Microfrontends</h2>
          <p className="settings-section__description">
            Manage microfrontend applications
          </p>
          <div className="settings-section__content">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Reload All Microfrontends
            </Button>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="settings-section__title">System Information</h2>
          <div className="settings-section__content">
            <div className="settings-info-grid">
              <div className="settings-info-item">
                <span className="settings-info-label">Version:</span>
                <span className="settings-info-value">1.0.0</span>
              </div>
              <div className="settings-info-item">
                <span className="settings-info-label">Build:</span>
                <span className="settings-info-value">Development</span>
              </div>
              <div className="settings-info-item">
                <span className="settings-info-label">Environment:</span>
                <span className="settings-info-value">{process.env.NODE_ENV || 'development'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

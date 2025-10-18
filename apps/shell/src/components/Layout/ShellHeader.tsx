/**
 * Shell Header Component
 *
 * Modern, responsive top navigation bar for the shell application
 */

import React from 'react';
import { useTheme } from '@shared/services/theme';
// import { ThemeSwitcher } from '@shared/components';
import './ShellHeader.css';

export interface ShellHeaderProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  isMobile?: boolean;
}

export const ShellHeader: React.FC<ShellHeaderProps> = ({
  onToggleSidebar,
  sidebarCollapsed = false,
  isMobile = false,
}) => {
  const { currentTheme } = useTheme();

  return (
    <header className={`shell-header shell-header--${currentTheme} ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className="shell-header__content">
        <div className="shell-header__left">
          {onToggleSidebar && (
            <button
              className="shell-header__menu-toggle"
              onClick={onToggleSidebar}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <span className="shell-header__menu-icon">
                {sidebarCollapsed ? '☰' : '✕'}
              </span>
            </button>
          )}

          <div className="shell-header__logo">
            <span className="shell-header__logo-icon">🏢</span>
            <h1 className="shell-header__title">CRM Microfrontend Shell</h1>
          </div>
        </div>

        <div className="shell-header__center">
          <nav className="shell-header__nav">
            <div className="shell-header__breadcrumb">
              <span className="shell-header__breadcrumb-item">Dashboard</span>
            </div>
          </nav>
        </div>

        <div className="shell-header__right">
          <div className="shell-header__actions">
            {/* <ThemeSwitcher /> */}

            <button className="shell-header__notification-btn" title="Notifications">
              <span className="shell-header__notification-icon">🔔</span>
              <span className="shell-header__notification-badge">3</span>
            </button>

            <div className="shell-header__user">
              <span className="shell-header__user-icon">👤</span>
              {!isMobile && <span className="shell-header__user-name">Development User</span>}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

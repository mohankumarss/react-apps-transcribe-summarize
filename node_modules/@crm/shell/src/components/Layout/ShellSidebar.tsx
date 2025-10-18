/**
 * Shell Sidebar Component
 *
 * Modern, responsive side navigation for the shell application
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '@shared/services/theme';
import { NAVIGATION_ITEMS } from '../../config/shellConfig';
import './ShellSidebar.css';

export interface ShellSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

export const ShellSidebar: React.FC<ShellSidebarProps> = ({
  collapsed = false,
  onToggle,
  isMobile = false,
}) => {
  const { currentTheme } = useTheme();
  const location = useLocation();

  const handleLinkClick = () => {
    // Auto-close sidebar on mobile when navigating
    if (isMobile && onToggle) {
      onToggle();
    }
  };

  return (
    <aside className={`shell-sidebar shell-sidebar--${currentTheme} ${collapsed ? 'collapsed' : 'expanded'} ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className="shell-sidebar__header">
        <div className="shell-sidebar__brand">
          <span className="shell-sidebar__brand-icon">🚀</span>
          {!collapsed && <span className="shell-sidebar__brand-text">Microfrontends</span>}
        </div>

        {!isMobile && onToggle && (
          <button
            className="shell-sidebar__toggle"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="shell-sidebar__toggle-icon">
              {collapsed ? '▶' : '◀'}
            </span>
          </button>
        )}
      </div>

      <nav className="shell-sidebar__nav">
        <ul className="shell-sidebar__list">
          {NAVIGATION_ITEMS.map((item) => (
            <li key={item.id} className="shell-sidebar__item">
              <NavLink
                to={item.route}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `shell-sidebar__link ${
                    isActive || location.pathname === item.route
                      ? 'shell-sidebar__link--active'
                      : ''
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <span className="shell-sidebar__icon">{item.icon}</span>
                {!collapsed && <span className="shell-sidebar__label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {!collapsed && (
          <div className="shell-sidebar__footer">
            <div className="shell-sidebar__status">
              <div className="shell-sidebar__status-indicator online"></div>
              <span className="shell-sidebar__status-text">All systems operational</span>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
};

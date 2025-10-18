/**
 * Shell Layout Component
 *
 * Modern, responsive layout wrapper for the shell application with MFE theme support
 */

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ShellHeader } from './ShellHeader';
import { ShellSidebar } from './ShellSidebar';
import { useTheme } from '@shared/services/theme';
import './ShellLayout.css';

export interface ShellLayoutProps {
  showSidebar?: boolean;
  showHeader?: boolean;
}

export const ShellLayout: React.FC<ShellLayoutProps> = ({
  showSidebar = true,
  showHeader = true,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { currentTheme } = useTheme();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-collapse sidebar on mobile
      if (mobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`shell-layout shell-layout--${currentTheme} ${isMobile ? 'mobile' : 'desktop'}`} data-theme={currentTheme}>
      {showHeader && (
        <ShellHeader
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
          isMobile={isMobile}
        />
      )}

      <div className="shell-layout__body">
        {showSidebar && (
          <ShellSidebar
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            isMobile={isMobile}
          />
        )}

        <main className={`shell-layout__main ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
          <div className="shell-layout__content">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile overlay when sidebar is open */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="mobile-overlay"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

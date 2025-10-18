/**
 * Shell Application Main Component
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@shared/services/theme';
import { ShellLayout } from './components/Layout/ShellLayout';
import { Dashboard } from './pages/Dashboard';
import { MicrofrontendPage } from './pages/MicrofrontendPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from '@shared/components';
import { SHELL_CONFIG } from './config/shellConfig';
import './App.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Shell application error:', error, errorInfo);
      }}
    >
      <ThemeProvider>
        <Router>
          <div className="shell-app">
            <Routes>
              <Route
                path="/"
                element={
                  <ShellLayout
                    showHeader={SHELL_CONFIG.navigation.showHeader}
                    showSidebar={SHELL_CONFIG.navigation.showSidebar}
                  />
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="transcript/*" element={<MicrofrontendPage />} />
                <Route path="party-master/*" element={<MicrofrontendPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};



export default App;

/**
 * Development Toolbar Component
 * 
 * Provides development utilities for toggling between mock and real data,
 * and other debugging features. Only visible in development mode.
 */

import React, { useState, useEffect } from 'react';
import {
  getMockDataModeStatus,
  toggleMockDataMode,
  enableMockDataMode,
  disableMockDataMode
} from '../config/developmentMode';
import './DevelopmentToolbar.css';

export const DevelopmentToolbar: React.FC = () => {
  const [status, setStatus] = useState(getMockDataModeStatus());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Update status when component mounts
    setStatus(getMockDataModeStatus());
  }, []);

  // Only render in development mode
  if (!status.isDevelopment) {
    return null;
  }

  const handleToggleMockData = () => {
    toggleMockDataMode();
  };

  const handleEnableMockData = () => {
    enableMockDataMode();
  };

  const handleDisableMockData = () => {
    disableMockDataMode();
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        className="dev-toolbar-toggle"
        onClick={() => setIsVisible(!isVisible)}
        title="Toggle development toolbar"
        aria-label="Toggle development toolbar"
      >
        ⚙️
      </button>

      {/* Development toolbar panel */}
      {isVisible && (
        <div className="dev-toolbar-panel">
          <div className="dev-toolbar-header">
            <h3>Development Tools</h3>
            <button
              className="dev-toolbar-close"
              onClick={() => setIsVisible(false)}
              aria-label="Close development toolbar"
            >
              ✕
            </button>
          </div>

          <div className="dev-toolbar-content">
            {/* Mock Data Toggle Section */}
            <div className="dev-toolbar-section">
              <h4>API Data Source</h4>
              <div className="dev-toolbar-status">
                <span className="status-label">Current Mode:</span>
                <span className={`status-value ${status.useMockData ? 'mock' : 'real'}`}>
                  {status.useMockData ? '🔵 Mock Data' : '🟢 Real API'}
                </span>
              </div>

              <div className="dev-toolbar-buttons">
                <button
                  className={`dev-btn ${status.useMockData ? 'active' : ''}`}
                  onClick={handleEnableMockData}
                  disabled={status.useMockData}
                  title="Use mock data for development"
                >
                  Use Mock Data
                </button>
                <button
                  className={`dev-btn ${!status.useMockData ? 'active' : ''}`}
                  onClick={handleDisableMockData}
                  disabled={!status.useMockData}
                  title="Use real API calls"
                >
                  Use Real API
                </button>
              </div>

              <p className="dev-toolbar-info">
                {status.useMockData
                  ? 'Using local mock data. Changes will not persist after page reload.'
                  : 'Using real API calls. Requires valid Dynamics 365 connection.'}
              </p>
            </div>

            {/* Information Section */}
            <div className="dev-toolbar-section">
              <h4>Information</h4>
              <ul className="dev-toolbar-info-list">
                <li>
                  <strong>Environment:</strong> {process.env.NODE_ENV}
                </li>
                <li>
                  <strong>Mock Data Available:</strong> Yes (50+ sample records)
                </li>
                <li>
                  <strong>Toggle Method:</strong> localStorage + page reload
                </li>
              </ul>
            </div>

            {/* Tips Section */}
            <div className="dev-toolbar-section">
              <h4>Tips</h4>
              <ul className="dev-toolbar-tips">
                <li>Mock data includes realistic call records spanning 30 days</li>
                <li>Test pagination with 50+ sample records</li>
                <li>All mock data is reset on page reload</li>
                <li>Use browser DevTools to inspect API calls</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

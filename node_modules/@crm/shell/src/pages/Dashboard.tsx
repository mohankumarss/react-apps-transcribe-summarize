/**
 * Dashboard Page
 * 
 * Main dashboard for the shell application
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MICROFRONTEND_CONFIGS } from '../config/shellConfig';
import { MicrofrontendContainer } from '../components/MicrofrontendContainer/MicrofrontendContainer';
import { MicrofrontendStatus, MicrofrontendInstance } from '../types/microfrontend';
import { Button } from '@shared/components';
import { logger } from '@shared/utils';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [microfrontendStatuses, setMicrofrontendStatuses] = useState<Record<string, MicrofrontendStatus>>({});
  const [isMobileView, setIsMobileView] = useState(false);

  // Get the two main microfrontends for display
  const transcriptConfig = MICROFRONTEND_CONFIGS.find(config => config.name === 'transcriptAndSummary');
  const partyMasterConfig = MICROFRONTEND_CONFIGS.find(config => config.name === 'ifPartyMaster');

  // Handle responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMicrofrontendLoad = (name: string) => (instance: MicrofrontendInstance) => {
    setMicrofrontendStatuses(prev => ({
      ...prev,
      [name]: {
        name,
        status: 'loaded',
        loadTime: Date.now()
      }
    }));
    logger.info(`Dashboard: Microfrontend loaded successfully: ${name}`);
  };

  const handleMicrofrontendError = (name: string) => (error: Error) => {
    setMicrofrontendStatuses(prev => ({
      ...prev,
      [name]: {
        name,
        status: 'error',
        error: error.message
      }
    }));
    logger.error(`Dashboard: Microfrontend failed to load: ${name}`, { error: error.message });
  };

  const getStatusIndicator = (name: string) => {
    const status = microfrontendStatuses[name];
    if (!status) return { color: '#6b7280', text: 'Initializing' };

    switch (status.status) {
      case 'loading':
        return { color: '#f59e0b', text: 'Loading...' };
      case 'loaded':
        return { color: '#10b981', text: 'Operational' };
      case 'error':
        return { color: '#ef4444', text: 'Error' };
      default:
        return { color: '#6b7280', text: 'Unknown' };
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">CRM Dashboard</h1>
        <p className="dashboard__subtitle">
          Unified workspace with live microfrontend applications
        </p>
      </div>

      <div className="dashboard__content">
        {/* Status Overview */}
        <div className="dashboard__section">
          <h2 className="dashboard__section-title">Application Status</h2>
          <div className="dashboard__status-grid">
            {[transcriptConfig, partyMasterConfig].filter(Boolean).map((config) => {
              const indicator = getStatusIndicator(config!.name);
              return (
                <div key={config!.name} className="dashboard__status-card">
                  <div className="dashboard__status-header">
                    <h3 className="dashboard__status-name">{config!.displayName}</h3>
                    <div
                      className="dashboard__status-indicator"
                      style={{ backgroundColor: indicator.color }}
                    />
                  </div>
                  <p className="dashboard__status-text">{indicator.text}</p>
                  <div className="dashboard__status-actions">
                    <Link to={config!.route}>
                      <Button variant="secondary" size="small">
                        Open Full View
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Microfrontend Display */}
        <div className="dashboard__section">
          <h2 className="dashboard__section-title">Live Applications</h2>
          <div className={`dashboard__microfrontends ${isMobileView ? 'dashboard__microfrontends--mobile' : 'dashboard__microfrontends--desktop'}`}>
            {transcriptConfig && (
              <div className="dashboard__microfrontend-panel">
                <div className="dashboard__panel-header">
                  <h3 className="dashboard__panel-title">{transcriptConfig.displayName}</h3>
                  <div className="dashboard__panel-controls">
                    <Link to={transcriptConfig.route}>
                      <Button variant="outline" size="small">
                        Full Screen
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="dashboard__panel-content">
                  <MicrofrontendContainer
                    config={transcriptConfig}
                    onLoad={handleMicrofrontendLoad(transcriptConfig.name)}
                    onError={handleMicrofrontendError(transcriptConfig.name)}
                    props={{ dashboardMode: true }}
                  />
                </div>
              </div>
            )}

            {partyMasterConfig && (
              <div className="dashboard__microfrontend-panel">
                <div className="dashboard__panel-header">
                  <h3 className="dashboard__panel-title">{partyMasterConfig.displayName}</h3>
                  <div className="dashboard__panel-controls">
                    <Link to={partyMasterConfig.route}>
                      <Button variant="outline" size="small">
                        Full Screen
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="dashboard__panel-content">
                  <MicrofrontendContainer
                    config={partyMasterConfig}
                    onLoad={handleMicrofrontendLoad(partyMasterConfig.name)}
                    onError={handleMicrofrontendError(partyMasterConfig.name)}
                    props={{ dashboardMode: true }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard__section">
          <h2 className="dashboard__section-title">Quick Actions</h2>
          <div className="dashboard__actions">
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              🔄 Refresh All Applications
            </Button>
            <Link to="/settings">
              <Button variant="outline">
                ⚙️ System Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
